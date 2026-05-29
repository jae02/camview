#!/usr/bin/env python3
"""Save timeline page HTML for analysis."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
"""

async def main():
    out = Path(__file__).resolve().parent.parent / "data" / "cameradecision_reviews"
    out.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 900},
            locale="en-US",
        )
        # Block ads
        await context.route("**/*.doubleclick.net/**", lambda r: r.abort())
        await context.route("**/pagead2.googlesyndication.com/**", lambda r: r.abort())
        await context.route("**/adservice.google.*/**", lambda r: r.abort())
        
        page = await context.new_page()
        await page.add_init_script(STEALTH_JS)
        
        url = "https://cameradecision.com/timeline/all-cameras"
        print(f"Fetching {url} ...")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        
        # Wait a bit for dynamic content
        await page.wait_for_timeout(3000)
        
        html = await page.content()
        
        html_file = out / "_timeline_debug.html"
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Saved HTML ({len(html)} bytes) to {html_file}")
        
        # Also try to extract links via JS
        links = await page.evaluate("""
            () => {
                const results = [];
                document.querySelectorAll('a[href]').forEach(a => {
                    const href = a.getAttribute('href') || '';
                    if (href.includes('/review/') || href.includes('/specs/')) {
                        results.push({href: href, text: a.textContent.trim().substring(0, 100)});
                    }
                });
                return results;
            }
        """)
        print(f"\nFound {len(links)} review/specs links:")
        for link in links[:20]:
            print(f"  {link['href']}  ->  {link['text']}")
        if len(links) > 20:
            print(f"  ... and {len(links) - 20} more")
        
        # Also check all links on the page
        all_links = await page.evaluate("""
            () => {
                const results = [];
                document.querySelectorAll('a[href]').forEach(a => {
                    const href = a.getAttribute('href') || '';
                    results.push({href: href, text: a.textContent.trim().substring(0, 80)});
                });
                return results;
            }
        """)
        print(f"\nTotal links on page: {len(all_links)}")
        # Show a sample of unique href patterns
        patterns = set()
        for l in all_links:
            parts = l['href'].split('/')
            if len(parts) > 1:
                patterns.add('/'.join(parts[:3]))
        print(f"Unique URL patterns: {sorted(patterns)[:30]}")
        
        await browser.close()

asyncio.run(main())
