from __future__ import annotations

from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from insightiq_worker.extract import extract_claims
from insightiq_worker.fetch import fetch_page_text
from insightiq_worker.models import EvidenceDraft, RunContext, SourceBundle


class EvidenceState(TypedDict):
    context: RunContext
    sources: list[SourceBundle]
    drafts: list[EvidenceDraft]
    prefer_crawl4ai: bool


def enrich_sources(state: EvidenceState) -> EvidenceState:
    enriched: list[SourceBundle] = []
    for source in state['sources']:
        text = source.text.strip()
        if len(text) < 120:
            fetched = fetch_page_text(source.url, prefer_crawl4ai=state['prefer_crawl4ai'])
            if fetched:
                text = fetched
        enriched.append(source.model_copy(update={'text': text}))
    return {**state, 'sources': enriched}


def extract_from_sources(state: EvidenceState) -> EvidenceState:
    context = state['context']
    drafts: list[EvidenceDraft] = []
    for source in state['sources']:
        if not source.text.strip():
            continue
        for claim in extract_claims(
            source.text,
            prospect_name=context.prospect_name,
            company_name=context.company_name,
            source_score=source.score,
            limit=2,
        ):
            drafts.append(
                EvidenceDraft(
                    source_id=source.source_id,
                    claim=claim.claim,
                    signal_type=claim.signal_type,
                    confidence=claim.confidence,
                )
            )
    return {**state, 'drafts': drafts}


def build_evidence_graph():
    graph = StateGraph(EvidenceState)
    graph.add_node('enrich', enrich_sources)
    graph.add_node('extract', extract_from_sources)
    graph.add_edge(START, 'enrich')
    graph.add_edge('enrich', 'extract')
    graph.add_edge('extract', END)
    return graph.compile()
