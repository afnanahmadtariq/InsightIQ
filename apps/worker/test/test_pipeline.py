import unittest

from insightiq_worker.extract import classify_sentence, extract_claims, merge_claim_lists
from insightiq_worker.graph_brief import build_brief_graph, citation_gate, new_id
from insightiq_worker.models import BriefCitation, BriefSections, RunContext


class ExtractTest(unittest.TestCase):
    def test_classifies_hiring_sentence(self):
        self.assertEqual(
            classify_sentence('Northstar is hiring senior account executives across two regions.'),
            'hiring',
        )

    def test_extracts_bounded_claim_for_named_prospect(self):
        text = (
            'Satya Nadella leads Microsoft as chief executive officer. '
            'Microsoft is hiring cloud engineers in Seattle. '
            'Short.'
        )
        claims = extract_claims(text, prospect_name='Satya Nadella', company_name='Microsoft', source_score=0.8)
        self.assertTrue(claims)
        self.assertLessEqual(len(claims), 3)
        self.assertGreaterEqual(claims[0].confidence, 0.4)

    def test_merge_deduplicates_claims(self):
        first = extract_claims('Microsoft is hiring cloud engineers in Seattle.', prospect_name='Tim Cook', company_name='Microsoft')
        second = extract_claims('Microsoft is hiring cloud engineers in Seattle.', prospect_name='Tim Cook', company_name='Microsoft')
        merged = merge_claim_lists([first, second], limit=5)
        self.assertEqual(len(merged), 1)


class BriefGateTest(unittest.TestCase):
    def test_rejects_uncited_evidence_id(self):
        context = RunContext(
            run_id='run',
            organization_id='org',
            goal='meeting',
            created_by_id='user',
            prospect_name='Jane Doe',
            company_name='Acme',
            offer_name='Platform',
            value_proposition='Better conversations.',
        )
        evidence = [
            {
                'id': 'evidence-1',
                'claim': 'Acme opened a new regional office.',
                'signal_type': 'launch',
                'confidence': 0.8,
                'source_url': 'https://example.com/acme',
                'source_title': 'Example',
            }
        ]
        assembled = build_brief_graph().invoke({'context': context, 'evidence': evidence, 'sections': None, 'error': None})
        sections = assembled['sections']
        self.assertIsNotNone(sections)
        tampered = sections.model_copy(
            update={
                'key_signals': sections.key_signals + [
                    BriefCitation(
                        evidence_id='missing',
                        claim='Fake claim',
                        source_url='https://example.com/fake',
                        signal_type='other',
                    )
                ]
            }
        )
        gated = citation_gate({'context': context, 'evidence': evidence, 'sections': tampered, 'error': None})
        self.assertIn('unresolved evidence id', gated['error'] or '')

    def test_generates_meeting_sections(self):
        context = RunContext(
            run_id='run',
            organization_id='org',
            goal='meeting',
            created_by_id='user',
            prospect_name='Jane Doe',
            company_name='Acme',
            offer_name='Platform',
            value_proposition='Better conversations.',
        )
        evidence = [
            {
                'id': new_id(),
                'claim': 'Acme is hiring enterprise account executives in Austin.',
                'signal_type': 'hiring',
                'confidence': 0.82,
                'source_url': 'https://example.com/acme',
                'source_title': 'Example',
            }
        ]
        result = build_brief_graph().invoke({'context': context, 'evidence': evidence, 'sections': None, 'error': None})
        self.assertIsNone(result['error'])
        sections = BriefSections.model_validate(result['sections'].model_dump())
        self.assertTrue(sections.summary)
        self.assertEqual(len(sections.key_signals), 1)
        self.assertTrue(sections.questions_to_ask)


if __name__ == '__main__':
    unittest.main()
