from __future__ import annotations

import re
from typing import Iterable, Mapping, Optional

from insightiq_worker.models import ExtractedClaim, RunContext, SignalType

SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')
JUNK = re.compile(
    r'1[- ]?800|call us|copyright|©|all rights reserved|privacy policy|terms of use|cookie',
    re.I,
)
FRUIT_CONTEXT = re.compile(
    r'\b(apples\b|fruit|apple tree|orchard|edible fruit|genus|cultivar|mytholog)',
    re.I,
)
BUSINESS_CONTEXT = re.compile(
    r'\b(ceo|chief executive|president|company|corporation|inc\.|technology|software|revenue|founded|headquarters|operations|executive)\b',
    re.I,
)
KEYWORDS: dict[SignalType, tuple[str, ...]] = {
    'hiring': (' hiring ', ' job opening', ' careers', ' is hiring', ' open role', ' joined the team'),
    'funding': (' raised ', ' funding round', ' series a', ' series b', ' series c', ' investment', ' venture'),
    'launch': (' launched ', ' release', ' unveiled ', ' announced a new', ' introduced '),
    'leadership': (
        ' appointed ',
        ' named ceo',
        ' named cto',
        ' chief executive',
        ' joins as',
        ' promoted to',
        ' served as the',
        ' serves as',
    ),
    'partnership': (' partnership ', ' partnered with', ' collaboration with', ' strategic alliance'),
    'role-context': (' focuses on', ' responsible for', ' leads ', ' oversees ', ' based in'),
}
SIGNAL_WEIGHT = {
    'leadership': 0.25,
    'hiring': 0.2,
    'funding': 0.2,
    'launch': 0.15,
    'partnership': 0.12,
    'role-context': 0.1,
    'other': 0.0,
}


def _normalize(text: str) -> str:
    return f' {text.lower()} '


def classify_sentence(sentence: str) -> SignalType:
    lowered = _normalize(sentence)
    for signal_type, words in KEYWORDS.items():
        if any(word in lowered for word in words):
            return signal_type
    return 'other'


def prospect_tokens(prospect_name: str) -> set[str]:
    parts = [part.strip().lower() for part in re.split(r'\s+', prospect_name) if part.strip()]
    tokens = {part for part in parts if len(part) >= 3}
    if parts:
        tokens.add(parts[-1])
    return tokens


def company_tokens(company_name: Optional[str]) -> set[str]:
    if not company_name:
        return set()
    cleaned = company_name.strip().lower()
    tokens = {cleaned} if len(cleaned) >= 4 else set()
    for part in re.split(r'[\s,.]+', cleaned):
        if len(part) >= 4:
            tokens.add(part)
    return tokens


def is_junk_claim(sentence: str) -> bool:
    return bool(JUNK.search(sentence))


def is_relevant_claim(sentence: str, *, prospect_name: str, company_name: Optional[str]) -> bool:
    if is_junk_claim(sentence):
        return False
    lowered = sentence.lower()
    if FRUIT_CONTEXT.search(sentence) and not BUSINESS_CONTEXT.search(sentence):
        return False
    if re.search(r'\bapples\b', lowered) and 'apple inc' not in lowered:
        return False
    people = prospect_tokens(prospect_name)
    companies = company_tokens(company_name)
    signal_type = classify_sentence(sentence)

    if any(token in lowered for token in people):
        return True
    if any(token in lowered for token in companies):
        return True
    if signal_type != 'other':
        return True

    if company_name and ' ' not in company_name.strip():
        if FRUIT_CONTEXT.search(sentence) and not BUSINESS_CONTEXT.search(sentence):
            return False
    return False


def score_sentence(
    sentence: str,
    *,
    prospect_name: str,
    company_name: Optional[str],
    source_score: float,
    signal_type: SignalType,
) -> float:
    lowered = sentence.lower()
    people = prospect_tokens(prospect_name)
    companies = company_tokens(company_name)
    confidence = 0.35
    if any(token in lowered for token in people):
        confidence += 0.28
    if any(token in lowered for token in companies):
        confidence += 0.18
    confidence += SIGNAL_WEIGHT.get(signal_type, 0.0)
    confidence += min(max(source_score, 0.0), 1.0) * 0.12
    if 70 <= len(sentence) <= 240:
        confidence += 0.05
    if FRUIT_CONTEXT.search(sentence) and not BUSINESS_CONTEXT.search(sentence):
        confidence -= 0.35
    return round(max(0.0, min(confidence, 0.98)), 2)


def split_sentences(text: str) -> list[str]:
    cleaned = ' '.join(text.split())
    if not cleaned:
        return []
    parts = SENTENCE_SPLIT.split(cleaned)
    return [part.strip() for part in parts if 35 <= len(part.strip()) <= 420]


def extract_claims(
    text: str,
    *,
    prospect_name: str,
    company_name: Optional[str] = None,
    source_score: float = 0.0,
    limit: int = 3,
) -> list[ExtractedClaim]:
    seen: set[str] = set()
    ranked: list[ExtractedClaim] = []

    for sentence in split_sentences(text):
        if not is_relevant_claim(sentence, prospect_name=prospect_name, company_name=company_name):
            continue
        signal_type = classify_sentence(sentence)
        key = sentence.lower()[:120]
        if key in seen:
            continue
        seen.add(key)
        confidence = score_sentence(
            sentence,
            prospect_name=prospect_name,
            company_name=company_name,
            source_score=source_score,
            signal_type=signal_type,
        )
        if confidence < 0.55:
            continue
        try:
            ranked.append(
                ExtractedClaim(
                    claim=sentence,
                    signal_type=signal_type,
                    confidence=confidence,
                )
            )
        except ValueError:
            continue

    ranked.sort(key=lambda item: item.confidence, reverse=True)
    return ranked[:limit]


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
    merged.sort(key=lambda item: item.confidence, reverse=True)
    return merged[:limit]


def rank_evidence_for_brief(
    evidence: list[Mapping[str, object]],
    context: RunContext,
    *,
    limit: int = 5,
) -> list[dict]:
    ranked: list[tuple[float, dict]] = []
    for row in evidence:
        claim = str(row.get('claim', ''))
        if not claim or is_junk_claim(claim):
            continue
        if not is_relevant_claim(claim, prospect_name=context.prospect_name, company_name=context.company_name):
            continue
        signal_type = str(row.get('signal_type', 'other'))
        confidence = float(row.get('confidence', 0.0))
        score = confidence + SIGNAL_WEIGHT.get(signal_type, 0.0)  # type: ignore[arg-type]
        ranked.append((score, dict(row)))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [row for _, row in ranked[:limit]]
