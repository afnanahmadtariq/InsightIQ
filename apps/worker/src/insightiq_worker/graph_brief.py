from __future__ import annotations

from typing import Optional, TypedDict
from uuid import uuid4

from langgraph.graph import END, START, StateGraph
from pydantic import ValidationError

from insightiq_worker.extract import rank_evidence_for_brief
from insightiq_worker.llm import polish_brief
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


def _signal_questions(context: RunContext, evidence: list[dict]) -> list[str]:
    company = context.company_name or 'your company'
    first = context.prospect_name.split()[0]
    questions: list[str] = []
    types = {str(row.get('signal_type', 'other')) for row in evidence}

    if 'leadership' in types or 'role-context' in types:
        questions.append(f'{first}, how are you prioritizing operational scale in your current role at {company}?')
    if 'hiring' in types:
        questions.append(f'What outcomes are you expecting from the hiring motion underway at {company}?')
    if 'launch' in types or 'partnership' in types:
        questions.append(f'Which recent go-to-market moves at {company} are creating the most pressure on your team?')
    if 'funding' in types:
        questions.append(f'How is {company} translating recent funding into execution priorities this quarter?')

    questions.append(f'Where would {context.offer_name} need to prove value fastest to be worth your time?')
    questions.append(f'What would make {context.value_proposition[:100].rstrip(".")} relevant in your next planning cycle?')
    return questions[:4]


def assemble_sections(state: BriefState) -> BriefState:
    context = state['context']
    ranked = rank_evidence_for_brief(state['evidence'], context, limit=5)
    company = context.company_name or 'the prospect company'
    first = context.prospect_name.split()[0]

    if not ranked:
        sections = BriefSections(
            summary=f'Public signals for {context.prospect_name} at {company} were thin after quality filtering.',
            key_signals=[],
            talking_points=[f'No high-confidence, citable signals cleared the relevance gate for {context.prospect_name}.'],
            questions_to_ask=[
                f'{first}, what changed recently at {company} that made this conversation worth scheduling?',
                f'Where would {context.offer_name} need to prove value in the first 30 days?',
            ],
            outreach_draft=None,
            gaps=['Try richer identifiers (company domain, LinkedIn URL) or rerun discovery through Tavily.'],
        )
        return {**state, 'sections': sections, 'error': None}

    citations = [
        BriefCitation(
            evidence_id=str(item['id']),
            claim=str(item['claim']),
            source_url=str(item['source_url']),
            signal_type=item['signal_type'],  # type: ignore[arg-type]
        )
        for item in ranked
    ]
    lead = str(ranked[0]['claim'])
    summary = (
        f'{context.prospect_name} at {company}: {lead} '
        f'InsightIQ linked {len(ranked)} verified public signal(s) to {context.offer_name} for meeting prep.'
    )
    talking_points = [
        f"{row['claim']} — {row['source_title']}"
        for row in ranked[:3]
    ]
    questions = _signal_questions(context, ranked)
    outreach = None
    personalized = f'{first}, I saw that {lead.split(".")[0].lower()} — worth a quick conversation?'
    objections = [
        'If timing is tight: we can start with a 15-minute walkthrough tied to one verified signal, not a generic pitch.',
        'If you already have a research process: InsightIQ shows its work with citations, so your team can verify every claim.',
    ]
    next_steps = [
        f'Confirm which of the {len(ranked)} cited signals matter most for {company} this quarter.',
        f'Map {context.offer_name} to one live workflow (outreach or meeting prep) in the next 14 days.',
    ]
    if context.goal == 'outreach':
        outreach = (
            f'Hi {first}, I was reading about {company} and noticed: "{lead}" '
            f'We help teams like yours with {context.offer_name.lower()} — open to a short conversation?'
        )

    sections = BriefSections(
        summary=summary,
        key_signals=citations,
        talking_points=talking_points,
        questions_to_ask=questions if context.goal == 'meeting' else [],
        personalized_opener=personalized,
        objection_handling=objections,
        next_steps=next_steps,
        outreach_draft=outreach,
        gaps=[],
    )
    return {**state, 'sections': sections, 'error': None}


def polish_sections(state: BriefState) -> BriefState:
    sections = state['sections']
    if sections is None:
        return state
    ranked = rank_evidence_for_brief(state['evidence'], state['context'], limit=6)
    polished = polish_brief(state['context'], sections, ranked)
    return {**state, 'sections': polished}


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
    graph.add_node('polish', polish_sections)
    graph.add_node('gate', citation_gate)
    graph.add_edge(START, 'assemble')
    graph.add_edge('assemble', 'polish')
    graph.add_edge('polish', 'gate')
    graph.add_edge('gate', END)
    return graph.compile()


def new_id() -> str:
    return uuid4().hex[:25]
