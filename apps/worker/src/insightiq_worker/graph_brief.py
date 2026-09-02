from __future__ import annotations

from typing import Optional, TypedDict
from uuid import uuid4

from langgraph.graph import END, START, StateGraph
from pydantic import ValidationError

from insightiq_worker.models import BriefCitation, BriefSections, RunContext


class StoredEvidence(TypedDict):
    id: str
    claim: str
    signal_type: str
    confidence: float
    source_url: str
    source_title: str


class BriefState(TypedDict):
    context: RunContext
    evidence: list[StoredEvidence]
    sections: Optional[BriefSections]
    error: Optional[str]


def assemble_sections(state: BriefState) -> BriefState:
    context = state['context']
    evidence = state['evidence']
    citations = [
        BriefCitation(
            evidence_id=item['id'],
            claim=item['claim'],
            source_url=item['source_url'],
            signal_type=item['signal_type'],  # type: ignore[arg-type]
        )
        for item in evidence
    ]
    company = context.company_name or 'the prospect company'
    top = sorted(evidence, key=lambda row: row['confidence'], reverse=True)[:3]
    talking_points = [
        f"{row['claim']} (source: {row['source_title']})"
        for row in top
    ] or [f"No strong public signals were found for {context.prospect_name} yet."]
    summary = (
        f"{context.prospect_name} at {company} was researched against {context.offer_name}. "
        f"{len(evidence)} citable claim(s) were extracted from public sources."
    )
    questions = [
        f"How is {company} approaching priorities connected to {context.offer_name}?",
        f"What would make {context.value_proposition[:120]} relevant in the next quarter?",
        'Which recent changes on your team should we factor into this conversation?',
    ]
    outreach = None
    if context.goal == 'outreach' and top:
        outreach = (
            f"Hi {context.prospect_name.split()[0]}, I noticed {top[0]['claim']} "
            f"Given {context.offer_name}, I thought a short conversation could be useful."
        )
    gaps: list[str] = []
    if not evidence:
        gaps.append('No citable public claims were extracted. Consider rerunning discovery with richer identifiers.')
    sections = BriefSections(
        summary=summary,
        key_signals=citations,
        talking_points=talking_points,
        questions_to_ask=questions if context.goal == 'meeting' else [],
        outreach_draft=outreach,
        gaps=gaps,
    )
    return {**state, 'sections': sections, 'error': None}


def citation_gate(state: BriefState) -> BriefState:
    sections = state['sections']
    if sections is None:
        return {**state, 'error': 'brief sections missing'}
    allowed = {item['id'] for item in state['evidence']}
    for citation in sections.key_signals:
        if citation.evidence_id not in allowed:
            return {**state, 'error': f'unresolved evidence id: {citation.evidence_id}'}
    try:
        BriefSections.model_validate(sections.model_dump())
    except ValidationError as error:
        return {**state, 'error': str(error)}
    return state


def build_brief_graph():
    graph = StateGraph(BriefState)
    graph.add_node('assemble', assemble_sections)
    graph.add_node('gate', citation_gate)
    graph.add_edge(START, 'assemble')
    graph.add_edge('assemble', 'gate')
    graph.add_edge('gate', END)
    return graph.compile()


def new_id() -> str:
    return uuid4().hex[:25]
