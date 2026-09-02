from __future__ import annotations

import json
import logging
import os
from typing import Optional

from pydantic import BaseModel, Field

from insightiq_worker.extract import is_relevant_claim
from insightiq_worker.models import BriefSections, EvidenceDraft, RunContext, SignalType, SourceBundle

log = logging.getLogger('insightiq.worker.llm')

SIGNAL_TYPES = (
    'hiring',
    'funding',
    'launch',
    'leadership',
    'partnership',
    'role-context',
    'other',
)


class LlmClaim(BaseModel):
    source_id: str
    claim: str = Field(min_length=20, max_length=500)
    signal_type: SignalType
    confidence: float = Field(ge=0.0, le=1.0)


class LlmClaimBatch(BaseModel):
    claims: list[LlmClaim] = Field(default_factory=list)


class LlmBriefCopy(BaseModel):
    summary: str = Field(min_length=40, max_length=600)
    talking_points: list[str] = Field(min_length=1, max_length=4)
    questions_to_ask: list[str] = Field(default_factory=list, max_length=4)
    outreach_draft: Optional[str] = None


def llm_enabled() -> bool:
    return bool(os.environ.get('OPENAI_API_KEY', '').strip() or os.environ.get('DASHSCOPE_API_KEY', '').strip())


def _client():
    try:
        from openai import OpenAI
    except ImportError as error:
        raise RuntimeError('openai package required for LLM features; pip install insightiq-worker[llm]') from error

    api_key = os.environ.get('OPENAI_API_KEY', '').strip() or os.environ.get('DASHSCOPE_API_KEY', '').strip()
    base_url = os.environ.get('OPENAI_BASE_URL', '').strip() or None
    return OpenAI(api_key=api_key, base_url=base_url)


def _model() -> str:
    return os.environ.get('WORKER_LLM_MODEL', 'gpt-4o-mini').strip()


def _chat_json(system: str, user: str) -> dict:
    response = _client().chat.completions.create(
        model=_model(),
        temperature=0.2,
        response_format={'type': 'json_object'},
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
    )
    content = response.choices[0].message.content or '{}'
    return json.loads(content)


def refine_claims(
    context: RunContext,
    sources: list[SourceBundle],
    drafts: list[EvidenceDraft],
) -> list[EvidenceDraft]:
    if not llm_enabled() or not drafts:
        return drafts

    source_map = {source.source_id: source for source in sources}
    candidates = [
        {
            'source_id': draft.source_id,
            'url': source_map.get(draft.source_id).url if draft.source_id in source_map else '',
            'claim': draft.claim,
            'signal_type': draft.signal_type,
            'confidence': draft.confidence,
        }
        for draft in drafts
    ]
    prompt = json.dumps(
        {
            'prospect': context.prospect_name,
            'company': context.company_name,
            'offer': context.offer_name,
            'candidates': candidates,
        },
        indent=2,
    )
    system = (
        'You refine sales research claims. Return JSON {"claims":[...]} only. '
        'Drop irrelevant, duplicate, boilerplate, or off-topic claims. '
        'Keep claims tied to the named prospect/company. '
        'Every claim must reuse an existing source_id from candidates. '
        f'signal_type must be one of: {", ".join(SIGNAL_TYPES)}.'
    )
    try:
        payload = _chat_json(system, prompt)
        batch = LlmClaimBatch.model_validate(payload)
    except Exception as error:
        log.warning('llm claim refine failed: %s', error)
        return drafts

    refined: list[EvidenceDraft] = []
    for item in batch.claims:
        if item.source_id not in source_map:
            continue
        if not is_relevant_claim(item.claim, prospect_name=context.prospect_name, company_name=context.company_name):
            continue
        refined.append(
            EvidenceDraft(
                source_id=item.source_id,
                claim=item.claim,
                signal_type=item.signal_type,
                confidence=round(min(max(item.confidence, 0.0), 0.98), 2),
            )
        )
    return refined or drafts


def polish_brief(context: RunContext, sections: BriefSections, evidence: list[dict]) -> BriefSections:
    if not llm_enabled() or not evidence:
        return sections

    prompt = json.dumps(
        {
            'prospect': context.prospect_name,
            'company': context.company_name,
            'offer': context.offer_name,
            'goal': context.goal,
            'value_proposition': context.value_proposition,
            'evidence': evidence[:6],
            'draft': sections.model_dump(),
        },
        indent=2,
    )
    system = (
        'You write concise, credible B2B sales brief copy. Return JSON with summary, talking_points, '
        'questions_to_ask, outreach_draft. Use ONLY provided evidence claims; do not invent facts. '
        'Talking points must reference verified evidence. Keep tone professional and specific.'
    )
    try:
        payload = _chat_json(system, prompt)
        copy = LlmBriefCopy.model_validate(payload)
    except Exception as error:
        log.warning('llm brief polish failed: %s', error)
        return sections

    return sections.model_copy(
        update={
            'summary': copy.summary,
            'talking_points': copy.talking_points,
            'questions_to_ask': copy.questions_to_ask if context.goal == 'meeting' else [],
            'outreach_draft': copy.outreach_draft if context.goal == 'outreach' else sections.outreach_draft,
        }
    )
