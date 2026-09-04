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


THIN_EVIDENCE_CLAIM_LIMIT = 2
THIN_EVIDENCE_CONFIDENCE = 0.65
SELLER_INTENT = ('i want to sell', 'i need to get', 'buy my', 'sell my', 'get him to', 'get her to', 'get them to')


def _buyer_outcome(context: RunContext) -> tuple[str, bool]:
    value = ' '.join(context.value_proposition.split()).strip().rstrip('.')
    vague = len(value) < 25 or any(phrase in value.lower() for phrase in SELLER_INTENT)
    if vague:
        return f'the workflow {context.offer_name} is designed to improve', True
    return value, False


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
    questions.append(f'What current workflow would {context.offer_name} need to improve to earn a deeper evaluation?')
    return questions[:4]


def assemble_sections(state: BriefState) -> BriefState:
    context = state['context']
    ranked = rank_evidence_for_brief(state['evidence'], context, limit=5)
    company = context.company_name or 'the prospect company'
    first = context.prospect_name.split()[0]

    if not ranked:
        total = len(state['evidence'])
        gap = (
            f'{total} stored claim(s) failed relevance or quality filtering — none are citable in this brief.'
            if total
            else 'Try richer identifiers (company domain, LinkedIn URL) or rerun discovery through Tavily.'
        )
        sections = BriefSections(
            summary=f'Public signals for {context.prospect_name} at {company} were thin after quality filtering.',
            key_signals=[],
            talking_points=[f'No high-confidence, citable signals cleared the relevance gate for {context.prospect_name}.'],
            questions_to_ask=[
                f'{first}, what changed recently at {company} that made this conversation worth scheduling?',
                f'Where would {context.offer_name} need to prove value in the first 30 days?',
            ],
            outreach_draft=None,
            gaps=[gap],
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
    offer_outcome, vague_offer_context = _buyer_outcome(context)
    use_case = 'meeting' if context.goal == 'meeting' else 'outreach'
    summary = (
        f'{lead} This is the strongest verified reason to frame your {use_case} around {context.offer_name}. '
        f'Test whether {offer_outcome.lower()} is a current priority before pitching.'
    )
    talking_points = [
        f"Lead with the verified signal: {row['claim']}"
        for row in ranked[:3]
    ]
    questions = _signal_questions(context, ranked)
    outreach = None
    personalized = f'{first}, I saw that {lead.split(".")[0].lower()}. How is that shaping priorities at {company} right now?'
    objections = [
        f'If timing is not a priority: ask what event would make the outcome behind {context.offer_name} urgent.',
        f'If an existing approach is in place: ask where the current workflow still creates friction before positioning {context.offer_name}.',
    ]
    next_steps = (
        [
            f'Confirm which cited signal maps to an active priority at {company}.',
            f'Agree on one workflow where {context.offer_name} can prove value and identify the decision owner.',
        ]
        if context.goal == 'meeting'
        else [f'Ask for a 15-minute conversation to validate whether the cited signal is creating a priority at {company}.']
    )
    if context.goal == 'outreach':
        outreach = (
            f'Hi {first},\n\nI noticed {lead.rstrip(".").lower()}. '
            f'I am curious whether that is creating pressure around {offer_outcome.lower()}. '
            f'That is where {context.offer_name} may help.\n\nOpen to comparing notes for 15 minutes?'
        )

    gaps: list[str] = []
    if vague_offer_context:
        gaps.append('Offer context lacks a measurable buyer outcome — add the problem solved and expected result for sharper messaging.')
    if len(ranked) <= THIN_EVIDENCE_CLAIM_LIMIT:
        gaps.append(
            f'Only {len(ranked)} verified public signal(s) cleared the relevance gate — treat conclusions as preliminary.'
        )
    elif all(float(item.get('confidence', 0.0)) < THIN_EVIDENCE_CONFIDENCE for item in ranked):
        gaps.append('All cited signals are below the high-confidence threshold — verify before relying on them in outreach.')

    sections = BriefSections(
        summary=summary,
        key_signals=citations,
        talking_points=talking_points,
        questions_to_ask=questions if context.goal == 'meeting' else [],
        personalized_opener=personalized,
        objection_handling=objections,
        next_steps=next_steps,
        outreach_draft=outreach,
        gaps=gaps,
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
    evidence_by_id = {item['id']: item for item in state['evidence']}
    for citation in sections.key_signals:
        stored = evidence_by_id.get(citation.evidence_id)
        if stored is None:
            return {**state, 'error': f'unresolved evidence id: {citation.evidence_id}'}
        if str(stored.get('source_url', '')) != citation.source_url:
            return {**state, 'error': f'source_url mismatch for evidence id: {citation.evidence_id}'}
        if str(stored.get('claim', '')) != citation.claim:
            return {**state, 'error': f'claim mismatch for evidence id: {citation.evidence_id}'}
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
