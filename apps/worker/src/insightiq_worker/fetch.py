from __future__ import annotations

import asyncio
import logging
import re
from html import unescape

import httpx
from bs4 import BeautifulSoup

log = logging.getLogger('insightiq.worker.fetch')

USER_AGENT = 'InsightIQ-Research/0.1 (+https://insightiq.app)'
TRACKING = re.compile(r'\s+')
MAX_TEXT = 12_000


def strip_html(raw: str) -> str:
    soup = BeautifulSoup(raw, 'html.parser')
    for tag in soup(['script', 'style', 'noscript', 'svg']):
        tag.decompose()
    text = unescape(soup.get_text('\n', strip=True))
    return TRACKING.sub(' ', text).strip()


def fetch_with_httpx(url: str, timeout: float = 20.0) -> str:
    with httpx.Client(
        follow_redirects=True,
        timeout=timeout,
        headers={'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'},
    ) as client:
        response = client.get(url)
        response.raise_for_status()
        content_type = response.headers.get('content-type', '')
        if 'html' in content_type or '<html' in response.text[:500].lower():
            return strip_html(response.text)[:MAX_TEXT]
        return response.text[:MAX_TEXT]


async def fetch_with_crawl4ai(url: str) -> str | None:
    try:
        from crawl4ai import AsyncWebCrawler
    except ImportError:
        log.debug('crawl4ai unavailable for %s', url)
        return None

    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            result = await crawler.arun(url=url)
            markdown = getattr(result, 'markdown', None) or getattr(result, 'markdown_v2', None)
            if isinstance(markdown, str) and markdown.strip():
                return markdown.strip()[:MAX_TEXT]
            cleaned = getattr(result, 'cleaned_html', None)
            if isinstance(cleaned, str) and cleaned.strip():
                return strip_html(cleaned)[:MAX_TEXT]
    except Exception as error:
        log.warning('crawl4ai fetch failed url=%s error=%s', url, error)
    return None


def fetch_page_text(url: str, *, prefer_crawl4ai: bool = False) -> str:
    if prefer_crawl4ai:
        try:
            crawled = asyncio.run(fetch_with_crawl4ai(url))
            if crawled:
                return crawled
        except RuntimeError:
            loop = asyncio.new_event_loop()
            try:
                crawled = loop.run_until_complete(fetch_with_crawl4ai(url))
                if crawled:
                    return crawled
            finally:
                loop.close()
    try:
        return fetch_with_httpx(url)
    except Exception as error:
        log.warning('httpx fetch failed url=%s error=%s', url, error)
        return ''


def wikipedia_summary(title: str) -> tuple[str, str | None]:
    slug = title.strip().replace(' ', '_')
    url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{slug}'
    with httpx.Client(timeout=15.0, headers={'User-Agent': USER_AGENT}) as client:
        response = client.get(url)
        if response.status_code == 404:
            return '', None
        response.raise_for_status()
        payload = response.json()
    extract = str(payload.get('extract') or '').strip()
    page_url = payload.get('content_urls', {}).get('desktop', {}).get('page')
    return extract[:MAX_TEXT], page_url
