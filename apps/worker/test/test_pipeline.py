import unittest

from insightiq_worker.extract import classify_sentence, extract_claims, merge_claim_lists
from insightiq_worker.llm import fallback_claims, llm_enabled
from insightiq_worker.models import SourceBundle
from insightiq_worker.tavily import build_discovery_queries, tavily_configured
from insightiq_worker.graph_brief import build_brief_graph, citation_gate, new_id
from insightiq_worker.models import BriefCitation, BriefSections, RunContext


class TavilyTest(unittest.TestCase):
    def test_builds_bounded_discovery_queries(self):
        queries = build_discovery_queries('Jane Doe', 'Northstar', 'northstar.io')
        self.assertGreaterEqual(len(queries), 2)
        joined = ' '.join(item['query'] for item in queries)
        self.assertIn('Jane Doe', joined)
        self.assertIn('Northstar', joined)


class LlmTest(unittest.TestCase):
    def test_llm_disabled_without_keys(self):
        import os

        saved = {key: os.environ.pop(key, None) for key in ('OPENAI_API_KEY', 'DASHSCOPE_API_KEY')}
        try:
            self.assertFalse(llm_enabled())
        finally:
            for key, value in saved.items():
                if value is not None:
                    os.environ[key] = value

    def test_fallback_claims_from_sources(self):
        from insightiq_worker.models import RunContext

        context = RunContext(
            run_id='run',
            organization_id='org',
            goal='meeting',
            created_by_id='user',
            prospect_name='Tim Cook',
            company_name='Apple',
            offer_name='Platform',
            value_proposition='Better conversations.',
        )
        sources = [
            SourceBundle(
                source_id='src-1',
                url='https://example.com/cook',
                title='Example',
                text='Timothy Donald Cook is the chief executive officer of Apple Inc.',
                score=0.9,
            )
        ]
        drafts = fallback_claims(context, sources, limit=2)
        self.assertTrue(drafts)
        self.assertIn('Cook', drafts[0].claim)

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
        self.assertGreaterEqual(claims[0].confidence, 0.55)
        self.assertTrue(any('Nadella' in claim.claim or 'Microsoft' in claim.claim for claim in claims))

    def test_rejects_fruit_and_boilerplate_noise(self):
        text = (
            'An apple is the round, edible fruit of an apple tree. '
            'Or call 1-800-MY-APPLE (1-800-692-7753). '
            'Timothy Donald Cook is the chief executive officer of Apple Inc.'
        )
        claims = extract_claims(text, prospect_name='Tim Cook', company_name='Apple', source_score=0.8)
        joined = ' '.join(claim.claim for claim in claims)
        self.assertNotIn('edible fruit', joined.lower())
        self.assertNotIn('1-800', joined)
        self.assertIn('Cook', joined)

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
        self.assertTrue(sections.personalized_opener)
        self.assertTrue(sections.objection_handling)
        self.assertTrue(sections.next_steps)


if __name__ == '__main__':
    unittest.main()
