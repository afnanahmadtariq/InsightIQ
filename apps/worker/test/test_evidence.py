import unittest

from pydantic import ValidationError

from insightiq_worker.evidence import (
    SAME_FACT_OVERLAP_THRESHOLD,
    SIGNAL_TYPES,
    EvidenceRow,
    ExtractedClaim,
    _boost_confidence,
    _is_same_fact,
    _normalize_claim_text,
    assemble_evidence_rows,
    build_extraction_prompt,
    reconcile_claims,
)


def _claim(claim: str, signal_type: str = 'hiring', confidence: float = 0.5, observed_at=None) -> ExtractedClaim:
    return ExtractedClaim(claim=claim, signalType=signal_type, confidence=confidence, observedAt=observed_at)


class SignalTypesTest(unittest.TestCase):
    def test_signal_types_is_the_closed_spec_set(self):
        self.assertEqual(
            SIGNAL_TYPES,
            frozenset({'hiring', 'funding', 'launch', 'leadership', 'partnership', 'role-context', 'other'}),
        )


class SameFactOverlapThresholdTest(unittest.TestCase):
    def test_threshold_is_the_named_constant(self):
        self.assertEqual(SAME_FACT_OVERLAP_THRESHOLD, 0.6)


class ExtractedClaimValidationTest(unittest.TestCase):
    def test_confidence_above_one_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            ExtractedClaim(claim='Acme hired a VP of Sales', signalType='hiring', confidence=1.5)

    def test_confidence_below_zero_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            ExtractedClaim(claim='Acme hired a VP of Sales', signalType='hiring', confidence=-0.1)

    def test_unknown_signal_type_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            ExtractedClaim(claim='Acme hired a VP of Sales', signalType='not-a-real-type', confidence=0.5)

    def test_empty_claim_text_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            ExtractedClaim(claim='', signalType='hiring', confidence=0.5)

    def test_valid_claim_constructs(self):
        claim = _claim('Acme hired a VP of Sales', confidence=0.6)
        self.assertEqual(claim.claim, 'Acme hired a VP of Sales')
        self.assertEqual(claim.signalType, 'hiring')
        self.assertEqual(claim.confidence, 0.6)
        self.assertIsNone(claim.observedAt)


class BuildExtractionPromptTest(unittest.TestCase):
    def test_returns_system_and_user_prompt_mentioning_source_fields_and_signal_types(self):
        source = {
            'id': 'src-1',
            'url': 'https://example.test/article',
            'title': 'Acme raises Series B',
            'publisher': 'Example News',
            'excerpt': 'Acme announced a $20M Series B round led by Example Ventures.',
        }
        system_prompt, user_prompt = build_extraction_prompt(source)
        self.assertIsInstance(system_prompt, str)
        self.assertIsInstance(user_prompt, str)
        for signal_type in SIGNAL_TYPES:
            self.assertIn(signal_type, system_prompt)
        self.assertIn(source['excerpt'], user_prompt)
        self.assertIn(source['title'], user_prompt)


class NormalizeClaimTextTest(unittest.TestCase):
    def test_lowercases_strips_and_collapses_whitespace(self):
        self.assertEqual(_normalize_claim_text('  Acme   Hired  a VP  '), 'acme hired a vp')

    def test_strips_trailing_punctuation(self):
        self.assertEqual(_normalize_claim_text('Acme hired a VP of Sales.'), 'acme hired a vp of sales')
        self.assertEqual(_normalize_claim_text('Acme hired a VP of Sales!'), 'acme hired a vp of sales')
        self.assertEqual(_normalize_claim_text('Acme hired a VP of Sales?'), 'acme hired a vp of sales')
        self.assertEqual(_normalize_claim_text('Acme hired a VP of Sales,'), 'acme hired a vp of sales')


class IsSameFactTest(unittest.TestCase):
    def test_different_signal_types_are_never_the_same_fact(self):
        a = _claim('Acme hired a VP of Sales', signal_type='hiring')
        b = _claim('Acme hired a VP of Sales', signal_type='funding')
        self.assertFalse(_is_same_fact(a, b))

    def test_near_identical_text_same_signal_type_is_the_same_fact(self):
        a = _claim('Acme hired a VP of Sales', signal_type='hiring')
        b = _claim('Acme hired a VP of Sales in Q3', signal_type='hiring')
        self.assertTrue(_is_same_fact(a, b))

    def test_unrelated_text_same_signal_type_is_not_the_same_fact(self):
        a = _claim('Acme hired a VP of Sales', signal_type='hiring')
        b = _claim('Acme raised a Series B', signal_type='hiring')
        self.assertFalse(_is_same_fact(a, b))


class BoostConfidenceTest(unittest.TestCase):
    def test_boost_increases_confidence(self):
        self.assertGreater(_boost_confidence(0.5, 0.5), 0.5)

    def test_boost_never_exceeds_one(self):
        self.assertLessEqual(_boost_confidence(0.95, 0.9), 1.0)

    def test_boost_never_decreases(self):
        self.assertGreaterEqual(_boost_confidence(0.5, 0.0), 0.5)


class ReconcileClaimsTest(unittest.TestCase):
    def test_spec1_rows_carry_a_real_input_source_id(self):
        claims_by_source = [
            ('source-a', [_claim('Acme hired a VP of Sales', signal_type='hiring')]),
            ('source-b', [_claim('Acme raised a Series B', signal_type='funding')]),
        ]
        rows = reconcile_claims(claims_by_source)
        self.assertEqual(len(rows), 2)
        for row in rows:
            self.assertIn(row.source_id, {'source-a', 'source-b'})
            self.assertTrue(row.source_id)

    def test_spec4_matching_claims_from_two_sources_boost_confidence_into_one_row(self):
        claims_by_source = [
            ('source-a', [_claim('Acme hired a VP of Sales', signal_type='hiring', confidence=0.6)]),
            ('source-b', [_claim('Acme hired a VP of Sales in Q3', signal_type='hiring', confidence=0.5)]),
        ]
        rows = reconcile_claims(claims_by_source)
        self.assertEqual(len(rows), 1)
        self.assertGreater(rows[0].confidence, 0.6)
        self.assertGreater(rows[0].confidence, 0.5)
        self.assertEqual(rows[0].source_id, 'source-a')

    def test_spec4_unrelated_claims_from_two_sources_stay_separate_and_unaveraged(self):
        claims_by_source = [
            ('source-a', [_claim('Acme hired a VP of Sales', signal_type='hiring', confidence=0.6)]),
            ('source-b', [_claim('Acme raised a Series B', signal_type='hiring', confidence=0.5)]),
        ]
        rows = reconcile_claims(claims_by_source)
        self.assertEqual(len(rows), 2)
        confidences = {row.claim: row.confidence for row in rows}
        self.assertEqual(confidences['Acme hired a VP of Sales'], 0.6)
        self.assertEqual(confidences['Acme raised a Series B'], 0.5)


class AssembleEvidenceRowsTest(unittest.TestCase):
    def test_spec2_claim_from_unresolvable_source_is_dropped(self):
        claims_by_source = [
            ('source-a', [_claim('Acme hired a VP of Sales', signal_type='hiring')]),
            ('source-unresolvable', [_claim('Acme raised a Series B', signal_type='funding')]),
        ]
        rows = assemble_evidence_rows(claims_by_source, resolvable_source_ids={'source-a'})
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].source_id, 'source-a')
        for row in rows:
            self.assertTrue(row.source_id)
            self.assertNotEqual(row.source_id, 'source-unresolvable')

    def test_all_sources_resolvable_keeps_every_claim(self):
        claims_by_source = [
            ('source-a', [_claim('Acme hired a VP of Sales', signal_type='hiring')]),
            ('source-b', [_claim('Acme raised a Series B', signal_type='funding')]),
        ]
        rows = assemble_evidence_rows(claims_by_source, resolvable_source_ids={'source-a', 'source-b'})
        self.assertEqual(len(rows), 2)


class EvidenceRowTest(unittest.TestCase):
    def test_evidence_row_is_frozen(self):
        row = EvidenceRow(
            source_id='source-a',
            claim='Acme hired a VP of Sales',
            signal_type='hiring',
            confidence=0.6,
            observed_at=None,
        )
        with self.assertRaises(Exception):
            row.confidence = 0.9


if __name__ == '__main__':
    unittest.main()
