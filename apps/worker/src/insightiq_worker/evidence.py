from __future__ import annotations

import re
import string
from dataclasses import dataclass

from pydantic import BaseModel, Field, field_validator

from insightiq_worker.model_gateway import ModelGatewayConfig, request_structured_output

SIGNAL_TYPES: frozenset[str] = frozenset(
    {'hiring', 'funding', 'launch', 'leadership', 'partnership', 'role-context', 'other'}
)

SAME_FACT_OVERLAP_THRESHOLD = 0.6

_TRAILING_PUNCTUATION = '.,!?'
_WHITESPACE_PATTERN = re.compile(r'\s+')


class ExtractedClaim(BaseModel):
    claim: str = Field(min_length=1)
    signalType: str
    confidence: float = Field(ge=0.0, le=1.0)
    observedAt: str | None = None

    @field_validator('signalType')
    @classmethod
    def _signal_type_must_be_known(cls, value: str) -> str:
        if value not in SIGNAL_TYPES:
            raise ValueError(f'signalType must be one of {sorted(SIGNAL_TYPES)}, got {value!r}')
        return value


class SourceClaims(BaseModel):
    claims: list[ExtractedClaim]


@dataclass(frozen=True)
class EvidenceRow:
    source_id: str
    claim: str
    signal_type: str
    confidence: float
    observed_at: str | None


def build_extraction_prompt(source: dict) -> tuple[str, str]:
    signal_type_list = ', '.join(sorted(SIGNAL_TYPES))
    system_prompt = (
        'You are an evidence extraction assistant for investment research. '
        'Extract only claims that are directly supported by the provided excerpt — '
        'never infer or assume facts not stated in the text. '
        f'Classify each claim with a signalType chosen from this closed list: {signal_type_list}. '
        'Assign a confidence between 0.0 and 1.0 reflecting how clearly the excerpt supports the claim. '
        'Respond with JSON matching exactly this shape: '
        '{"claims": [{"claim": "...", "signalType": "...", "confidence": 0.0, "observedAt": "..."}]}. '
        'If the excerpt supports no claims, return {"claims": []}.'
    )
    user_prompt = (
        f'Source title: {source["title"]}\n'
        f'Publisher: {source["publisher"]}\n'
        f'URL: {source["url"]}\n'
        f'Excerpt:\n{source["excerpt"]}'
    )
    return system_prompt, user_prompt


def extract_claims_for_source(client, config: ModelGatewayConfig, source: dict) -> list[ExtractedClaim]:
    system_prompt, user_prompt = build_extraction_prompt(source)
    result = request_structured_output(
        client,
        config,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=SourceClaims,
    )
    return result.claims


def _normalize_claim_text(text: str) -> str:
    collapsed = _WHITESPACE_PATTERN.sub(' ', text.strip()).lower()
    return collapsed.rstrip(_TRAILING_PUNCTUATION + string.whitespace)


def _is_same_fact(a: ExtractedClaim, b: ExtractedClaim) -> bool:
    if a.signalType != b.signalType:
        return False
    words_a = set(_normalize_claim_text(a.claim).split())
    words_b = set(_normalize_claim_text(b.claim).split())
    union = words_a | words_b
    if not union:
        return False
    intersection = words_a & words_b
    return (len(intersection) / len(union)) >= SAME_FACT_OVERLAP_THRESHOLD


def _boost_confidence(existing: float, new: float) -> float:
    return min(1.0, existing + new * (1.0 - existing))


def reconcile_claims(claims_by_source: list[tuple[str, list[ExtractedClaim]]]) -> list[EvidenceRow]:
    rows: list[EvidenceRow] = []
    row_claims: list[ExtractedClaim] = []
    for source_id, claims in claims_by_source:
        for claim in claims:
            matched_index = next(
                (index for index, existing_claim in enumerate(row_claims) if _is_same_fact(existing_claim, claim)),
                None,
            )
            if matched_index is None:
                rows.append(
                    EvidenceRow(
                        source_id=source_id,
                        claim=claim.claim,
                        signal_type=claim.signalType,
                        confidence=claim.confidence,
                        observed_at=claim.observedAt,
                    )
                )
                row_claims.append(claim)
                continue
            existing_row = rows[matched_index]
            rows[matched_index] = EvidenceRow(
                source_id=existing_row.source_id,
                claim=existing_row.claim,
                signal_type=existing_row.signal_type,
                confidence=_boost_confidence(existing_row.confidence, claim.confidence),
                observed_at=existing_row.observed_at,
            )
    return rows


def assemble_evidence_rows(
    claims_by_source: list[tuple[str, list[ExtractedClaim]]],
    resolvable_source_ids: set[str],
) -> list[EvidenceRow]:
    filtered = [
        (source_id, claims) for source_id, claims in claims_by_source if source_id in resolvable_source_ids
    ]
    return reconcile_claims(filtered)
