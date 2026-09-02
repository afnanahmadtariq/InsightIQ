from __future__ import annotations

import argparse
import json
import sys

from insightiq_worker.extract import extract_claims, merge_claim_lists
from insightiq_worker.fetch import fetch_page_text, wikipedia_summary
from insightiq_worker.graph_brief import build_brief_graph, new_id
from insightiq_worker.graph_evidence import build_evidence_graph
from insightiq_worker.models import RunContext, SourceBundle


def collect_public_profile(prospect_name: str, company_name: str | None, *, use_crawl4ai: bool) -> dict:
    bundles: list[SourceBundle] = []
    wiki_text, wiki_url = wikipedia_summary(company_name or prospect_name)
    if wiki_text:
        bundles.append(
            SourceBundle(
                source_id='wiki-company',
                url=wiki_url or f'https://en.wikipedia.org/wiki/{(company_name or prospect_name).replace(" ", "_")}',
                title=f'Wikipedia · {company_name or prospect_name}',
                text=wiki_text,
                score=0.7,
            )
        )
    person_text, person_url = wikipedia_summary(prospect_name)
    if person_text and person_url != (wiki_url or ''):
        bundles.append(
            SourceBundle(
                source_id='wiki-person',
                url=person_url or '',
                title=f'Wikipedia · {prospect_name}',
                text=person_text,
                score=0.75,
            )
        )

    if company_name:
        domain_guess = company_name.lower().replace(' ', '')
        for url in (f'https://{domain_guess}.com/about', f'https://www.{domain_guess}.com/about'):
            fetched = fetch_page_text(url, prefer_crawl4ai=use_crawl4ai)
            if len(fetched) > 120:
                bundles.append(
                    SourceBundle(
                        source_id=f'web-{len(bundles)}',
                        url=url,
                        title=f'{company_name} about page',
                        text=fetched,
                        score=0.55,
                    )
                )
                break

    context = RunContext(
        run_id='demo',
        organization_id='demo',
        goal='meeting',
        created_by_id=None,
        prospect_name=prospect_name,
        company_name=company_name,
        offer_name='InsightIQ platform',
        value_proposition='Evidence-first sales intelligence for better conversations.',
    )
    evidence_result = build_evidence_graph().invoke(
        {'context': context, 'sources': bundles, 'drafts': [], 'prefer_crawl4ai': use_crawl4ai}
    )
    stored = [
        {
            'id': new_id(),
            'claim': draft.claim,
            'signal_type': draft.signal_type,
            'confidence': draft.confidence,
            'source_url': next(item.url for item in bundles if item.source_id == draft.source_id),
            'source_title': next(item.title for item in bundles if item.source_id == draft.source_id),
        }
        for draft in evidence_result['drafts']
    ]
    brief_result = build_brief_graph().invoke(
        {'context': context, 'evidence': stored, 'sections': None, 'error': None}
    )
    if brief_result.get('error'):
        raise RuntimeError(str(brief_result['error']))
    return {
        'prospect': prospect_name,
        'company': company_name,
        'sources_collected': len(bundles),
        'claims_extracted': len(stored),
        'claims': stored,
        'brief': brief_result['sections'].model_dump() if brief_result['sections'] else None,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description='Collect public prospect signals without the database.')
    parser.add_argument('--prospect', required=True, help='Prospect full name')
    parser.add_argument('--company', help='Company name')
    parser.add_argument('--crawl4ai', action='store_true', help='Prefer Crawl4AI for page extraction')
    args = parser.parse_args(argv)

    payload = collect_public_profile(args.prospect, args.company, use_crawl4ai=args.crawl4ai)
    print(json.dumps(payload, indent=2))
    print(
        f"\nCollected {payload['sources_collected']} source(s) and {payload['claims_extracted']} claim(s) for {payload['prospect']}.",
        file=sys.stderr,
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
