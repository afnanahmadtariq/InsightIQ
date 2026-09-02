from __future__ import annotations

import re
from typing import Iterable

from insightiq_worker.models import ExtractedClaim, SignalType

SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')
KEYWORDS: dict[SignalType, tuple[str, ...]] = {
    'hiring': (' hiring ', ' job opening', ' careers', ' is hiring', ' open role', ' joined the team'),
    'funding': (' raised ', ' funding round', ' series a', ' series b', ' series c', ' investment', ' venture'),
    'launch': (' launched ', ' release', ' unveiled ', ' announced a new', ' introduced '),
    'leadership': (' appointed ', ' named ceo', ' named cto', ' chief executive', ' joins as', ' promoted to'),
    'partnership': (' partnership ', ' partnered with', ' collaboration with', ' strategic alliance'),
    'role-context': (' focuses on', ' responsible for', ' leads ', ' oversees ', ' based in'),
}


def _normalize(text: str) -> str:
    return f' {text.lower()} '


def classify_sentence(sentence: str) -> SignalType:
    lowered = _normalize(sentence)
    for signal_type, words in KEYWORDS.items():
        if any(word in lowered for word in words):
            return signal_type
    return 'other'


def _name_tokens(prospect_name: str, company_name: str | None) -> set[str]:
    tokens: set[str] = set()
    for chunk in (prospect_name, company_name or ''):
        for part in re.split(r'[\s,.]+', chunk):
            cleaned = part.strip().lower()
            if len(cleaned) >= 3:
                tokens.add(cleaned)
    return tokens


def score_sentence(sentence: str, *, names: set[str], source_score: float, signal_type: SignalType) -> float:
    lowered = sentence.lower()
    confidence = 0.45
    if any(name in lowered for name in names):
        confidence += 0.2
    if signal_type != 'other':
        confidence += 0.15
    confidence += min(max(source_score, 0.0), 1.0) * 0.15
    if 80 <= len(sentence) <= 260:
        confidence += 0.05
    return round(min(confidence, 0.95), 2)


def split_sentences(text: str) -> list[str]:
    cleaned = ' '.join(text.split())
    if not cleaned:
        return []
    parts = SENTENCE_SPLIT.split(cleaned)
    return [part.strip() for part in parts if 30 <= len(part.strip()) <= 500]


def extract_claims(
    text: str,
    *,
    prospect_name: str,
    company_name: str | None,
    source_score: float = 0.0,
    limit: int = 3,
) -> list[ExtractedClaim]:
    names = _name_tokens(prospect_name, company_name)
    seen: set[str] = set()
    claims: list[ExtractedClaim] = []

    for sentence in split_sentences(text):
        lowered = sentence.lower()
        signal_type = classify_sentence(sentence)
        relevant = signal_type != 'other' or any(name in lowered for name in names)
        if not relevant:
            continue
        key = lowered[:120]
        if key in seen:
            continue
        seen.add(key)
        confidence = score_sentence(sentence, names=names, source_score=source_score, signal_type=signal_type)
        try:
            claims.append(
                ExtractedClaim(
                    claim=sentence,
                    signal_type=signal_type,
                    confidence=confidence,
                )
            )
        except ValueError:
            continue
        if len(claims) >= limit:
            break

    if not claims and text.strip():
        fallback = ' '.join(text.split())[:400]
        if len(fallback) >= 20:
            claims.append(
                ExtractedClaim(
                    claim=fallback,
                    signal_type='role-context' if names & set(fallback.lower().split()) else 'other',
                    confidence=round(0.4 + min(source_score, 1.0) * 0.1, 2),
                )
            )
    return claims


def merge_claim_lists(groups: Iterable[list[ExtractedClaim]], *, limit: int = 12) -> list[ExtractedClaim]:
    merged: list[ExtractedClaim] = []
    seen: set[str] = set()
    for group in groups:
        for claim in group:
            key = claim.claim.lower()[:120]
            if key in seen:
                continue
            seen.add(key)
            merged.append(claim)
            if len(merged) >= limit:
                return merged
    return merged
