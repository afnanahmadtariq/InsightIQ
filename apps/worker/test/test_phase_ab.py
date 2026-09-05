import unittest

from insightiq_worker.email import render_brief_ready_email
from insightiq_worker.graph_brief import _compute_urgency


class BriefReadyEmailTest(unittest.TestCase):
    def test_render_brief_ready_email_includes_prospect_and_link(self):
        template = render_brief_ready_email(
            prospect_name='Jane Doe',
            action_url='https://app.example.com/dashboard/briefs/brief-1',
            recipient_name='Alex',
        )
        self.assertIn('Jane Doe', template['subject'])
        self.assertIn('brief-1', template['html'])
        self.assertIn('Hi Alex', template['text'])


class UrgencyScoreTest(unittest.TestCase):
    def test_recent_hiring_signals_score_high(self):
        score, label = _compute_urgency([
            {
                'signal_type': 'hiring',
                'confidence': 0.9,
                'observed_at': '2026-08-20',
            },
            {
                'signal_type': 'launch',
                'confidence': 0.85,
                'observed_at': '2026-08-15',
            },
        ])
        self.assertGreaterEqual(score, 0.65)
        self.assertEqual(label, 'High urgency')

    def test_empty_evidence_is_low(self):
        score, label = _compute_urgency([])
        self.assertEqual(score, 0.0)
        self.assertEqual(label, 'Low')


if __name__ == '__main__':
    unittest.main()
