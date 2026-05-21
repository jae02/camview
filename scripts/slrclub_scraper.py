#!/usr/bin/env python3
"""
=============================================================================
SLR Club Camera Review — 총평 (Critique) Scraper
=============================================================================
Extracts the 총평 (critique/conclusion) HTML and images from SLR Club camera reviews
for cameras that already exist in the project's seed data.

Tech: Playwright (headless Chromium) + BeautifulSoup 4
Output: JSON files under data/slrclub/
Images Output: public/images/slrclub/[slug]/

Usage:
    # Scrape all matching reviews
    python scripts/slrclub_scraper.py

    # Dry-run: show matches without scraping
    python scripts/slrclub_scraper.py --dry-run

    # Scrape specific review by no
    python scripts/slrclub_scraper.py --no 829
=============================================================================
"""
from __future__ import annotations

import asyncio
import argparse
import json
import re
import sys
import logging
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime
from typing import Any, Optional

from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup, Tag

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("slrclub")

# ---------------------------------------------------------------------------
# Paths & Constants
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SEEDS_DIR = PROJECT_ROOT / "data" / "seeds"
OUTPUT_DIR = PROJECT_ROOT / "data" / "slrclub"
IMAGES_DIR = PROJECT_ROOT / "public" / "images" / "slrclub"

BASE_URL = "https://www.slrclub.com"
REVIEW_LIST_URL = f"{BASE_URL}/bbs/zboard.php?id=slr_review"
REVIEW_VIEW_URL = f"{BASE_URL}/bbs/vx2.php?id=slr_review"

POLITE_DELAY_S = 2  # seconds between page loads


# =============================================================================
# 1. PAGE FETCHING & IMAGES
# =============================================================================

async def fetch_html(browser: Browser, url: str, retries: int = 2) -> str:
    """Fetch page HTML using Playwright with retry logic."""
    for attempt in range(retries + 1):
        context = None
        try:
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1440, "height": 900},
                locale="ko-KR",
            )
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            await page.wait_for_timeout(1500)
            html = await page.content()
            return html
        except Exception as e:
            log.warning(f"  ⚠ Attempt {attempt+1} failed for {url}: {e}")
            if attempt >= retries:
                raise
            await asyncio.sleep(2 * (attempt + 1))
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass

def download_image(url: str, dest_path: Path) -> bool:
    if not url.startswith('http'):
        url = urllib.parse.urljoin(BASE_URL, url)
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Referer': BASE_URL
        })
        with urllib.request.urlopen(req, timeout=10) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        log.warning(f"  ⚠ Failed to download image {url}: {e}")
        return False


# =============================================================================
# 2. SEED CAMERA LOADING
# =============================================================================

def load_seed_cameras() -> list[dict]:
    """Load camera brand/model info from seed JSON files."""
    cameras = []
    for f in sorted(SEEDS_DIR.glob("*.json")):
        if f.name == "all_cameras_seed.json":
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            cameras.append({
                "slug": f.stem,
                "brand": data.get("brand", ""),
                "model": data.get("model", ""),
            })
        except Exception:
            pass
    log.info(f"Loaded {len(cameras)} cameras from seed data")
    return cameras


# =============================================================================
# 3. REVIEW INDEX CRAWLING
# =============================================================================

async def crawl_review_index(browser: Browser, max_pages: int = 39) -> list[dict]:
    """Crawl all pages of the SLR Club review listing to build an index."""
    all_reviews = []
    seen_nos = set()

    for pg in range(1, max_pages + 1):
        url = f"{REVIEW_LIST_URL}&page={pg}"
        log.info(f"  Index page {pg}/{max_pages} ...")

        try:
            html = await fetch_html(browser, url)
        except Exception as e:
            log.error(f"  ✗ Failed to fetch page {pg}: {e}")
            continue

        soup = BeautifulSoup(html, "html.parser")

        for a in soup.find_all("a", href=re.compile(r"vx2\.php\?id=slr_review.*?no=\d+")):
            title = a.get_text(strip=True)
            href = a.get("href", "")
            no_match = re.search(r"no=(\d+)", href)
            if not no_match or not title:
                continue

            no = int(no_match.group(1))
            if no in seen_nos or "[공지]" in title:
                continue

            seen_nos.add(no)
            cat_match = re.search(r"category=(\d+)", href)
            category = int(cat_match.group(1)) if cat_match else 0

            all_reviews.append({
                "no": no,
                "title": title,
                "category": category,
            })

        await asyncio.sleep(POLITE_DELAY_S)

    all_reviews.sort(key=lambda r: r["no"])
    log.info(f"  Found {len(all_reviews)} total reviews")
    return all_reviews


# =============================================================================
# 4. MATCHING REVIEWS TO SEED CAMERAS
# =============================================================================

def _norm(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()
    return re.sub(r"\s+", " ", s)


def _word_boundary_match(model_norm: str, title_norm: str) -> bool:
    pattern = r"(?:^|\s)" + re.escape(model_norm) + r"(?:\s|$)"
    return bool(re.search(pattern, title_norm))


def match_reviews_to_seeds(
    reviews: list[dict], cameras: list[dict]
) -> list[tuple[dict, dict]]:
    matches = []
    matched_slugs = set()

    for review in reviews:
        title = review["title"]
        clean = re.sub(r"^\[.*?\]\s*", "", title)
        clean = re.sub(r"\s*(Review|Preview|Overview)\s*$", "", clean, flags=re.I)
        norm_title = _norm(clean)

        best_cam = None
        best_score = 0

        for cam in cameras:
            brand_n = _norm(cam["brand"])
            model_n = _norm(cam["model"])

            if not brand_n or not model_n:
                continue

            if brand_n in norm_title and _word_boundary_match(model_n, norm_title):
                score = len(brand_n) + len(model_n)
                if score > best_score:
                    best_score = score
                    best_cam = cam

        if best_cam and best_cam["slug"] not in matched_slugs:
            matches.append((review, best_cam))
            matched_slugs.add(best_cam["slug"])

    return matches


# =============================================================================
# 5. 총평 (CRITIQUE) EXTRACTION & HTML PARSING
# =============================================================================

def extract_critique_data(html: str) -> Optional[dict]:
    """
    Extract 총평 HTML and image URLs from a review page.
    """
    soup = BeautifulSoup(html, "html.parser")
    body = (soup.find(id="review")
           or soup.find(id="user_contents")
           or soup.find(class_="bbs_content"))
    if not body:
        return None

    # Find the target node containing "총평"
    target_node = None
    for text_node in body.find_all(string=re.compile(r"\*?\s*총\s*평")):
        if len(text_node.strip()) < 50:
            target_node = text_node
            break

    if not target_node:
        return None

    # Get the highest level ancestor that is a direct child of body
    ancestor = target_node
    while ancestor.parent and ancestor.parent != body:
        ancestor = ancestor.parent

    # Collect ancestor and all its subsequent siblings
    critique_tags = [ancestor]
    for sibling in ancestor.next_siblings:
        critique_tags.append(sibling)

    critique_html = "".join(str(tag) for tag in critique_tags)

    # Trim common end markers
    temp_soup = BeautifulSoup(critique_html, "html.parser")
    end_markers = ["다음글", "이전글", "목록보기", "COPYRIGHT"]

    for marker in end_markers:
        for text_node in temp_soup.find_all(string=re.compile(marker)):
            anc = text_node
            while anc.parent and anc.parent != temp_soup:
                anc = anc.parent
            sibs = list(anc.next_siblings)
            for sib in sibs:
                if isinstance(sib, Tag):
                    sib.decompose()
            if isinstance(anc, Tag):
                anc.decompose()

    image_urls = []
    for img in temp_soup.find_all("img"):
        src = img.get("src")
        if src:
            image_urls.append(src)

    return {
        "html": str(temp_soup).strip(),
        "image_urls": image_urls
    }


async def process_images_and_html(critique_data: dict, slug: str) -> dict:
    """Download images and rewrite HTML src to local paths."""
    html_content = critique_data["html"]
    image_urls = critique_data["image_urls"]
    downloaded_images = []

    img_dir = IMAGES_DIR / slug
    img_dir.mkdir(parents=True, exist_ok=True)

    for i, img_url in enumerate(image_urls):
        ext = img_url.split('.')[-1].split('?')[0]
        if ext.lower() not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            ext = 'jpg'
        local_filename = f"img_{i+1:02d}.{ext}"
        local_filepath = img_dir / local_filename

        # Download image in a thread
        success = await asyncio.to_thread(download_image, img_url, local_filepath)
        if success:
            downloaded_images.append(local_filename)
            local_src = f"/images/slrclub/{slug}/{local_filename}"
            html_content = html_content.replace(img_url, local_src)

    return {
        "critique_html": html_content,
        "downloaded_images": downloaded_images
    }


async def find_critique_page(browser: Browser, start_no: int, slug: str = None) -> Optional[dict]:
    first_url = f"{REVIEW_VIEW_URL}&no={start_no}"
    log.info(f"  Loading review start page: no={start_no}")

    try:
        html = await fetch_html(browser, first_url)
    except Exception as e:
        log.error(f"  ✗ Failed to load: {e}")
        return None

    soup = BeautifulSoup(html, "html.parser")
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True).replace(" - SLR클럽", "") if title_tag else ""
    title_prefix = re.sub(r"^\[.*?\]\s*", "", title)[:15]

    page_nos = {start_no}
    body = (soup.find(id="review")
           or soup.find(id="user_contents")
           or soup.find(class_="bbs_content"))

    if body:
        for a in body.find_all("a", href=re.compile(r"vx2\.php.*?slr_review.*?no=\d+")):
            href = a.get("href", "")
            m = re.search(r"no=(\d+)", href)
            if m:
                page_nos.add(int(m.group(1)))

    for a in soup.find_all("a", href=re.compile(r"vx2\.php.*?slr_review.*?no=\d+")):
        link_text = a.get_text(strip=True)
        href = a.get("href", "")
        m = re.search(r"no=(\d+)", href)
        if m and "총평" in link_text:
            page_nos.add(int(m.group(1)))

    if len(page_nos) <= 2 and title_prefix:
        log.info(f"  Probing consecutive pages (title prefix: '{title_prefix}')...")
        for offset in range(1, 9):
            probe_no = start_no + offset
            if probe_no in page_nos:
                continue
            await asyncio.sleep(1)
            try:
                probe_html = await fetch_html(browser, f"{REVIEW_VIEW_URL}&no={probe_no}")
                probe_soup = BeautifulSoup(probe_html, "html.parser")
                probe_title_tag = probe_soup.find("title")
                if probe_title_tag:
                    probe_title = probe_title_tag.get_text(strip=True).replace(" - SLR클럽", "")
                    probe_prefix = re.sub(r"^\[.*?\]\s*", "", probe_title)[:15]
                    if probe_prefix == title_prefix:
                        page_nos.add(probe_no)
                        log.info(f"    + Page no={probe_no} belongs to this review")
                    else:
                        break
                else:
                    break
            except Exception:
                break

    page_nos_sorted = sorted(page_nos)
    log.info(f"  Total {len(page_nos_sorted)} pages: {page_nos_sorted}")

    for pno in reversed(page_nos_sorted):
        url = f"{REVIEW_VIEW_URL}&no={pno}"
        log.info(f"  Checking page no={pno} for 총평...")

        if pno == start_no:
            page_html = html
        else:
            await asyncio.sleep(POLITE_DELAY_S)
            try:
                page_html = await fetch_html(browser, url)
            except Exception:
                continue

        critique_data = extract_critique_data(page_html)
        if critique_data:
            log.info(f"  ✓ Found 총평 HTML on page no={pno} (length: {len(critique_data['html'])})")
            
            used_slug = slug if slug else f"review_{start_no}"
            processed = await process_images_and_html(critique_data, used_slug)
            
            return {
                "title": title,
                "critique_html": processed["critique_html"],
                "downloaded_images": processed["downloaded_images"],
                "critique_page_no": pno,
                "start_no": start_no,
                "page_count": len(page_nos_sorted),
                "url": url,
            }

    log.warning(f"  ⚠ No 총평 found in review no={start_no}")
    return None


# =============================================================================
# 6. MAIN ORCHESTRATOR
# =============================================================================

async def scrape_single(browser: Browser, review_no: int) -> Optional[dict]:
    result = await find_critique_page(browser, review_no)
    if result:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"review_{review_no}.json"
        output = {
            "source": "slrclub",
            "scraped_at": datetime.now().isoformat(),
            **result,
        }
        out_path = OUTPUT_DIR / filename
        out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
        log.info(f"  → Saved to {out_path}")
        return output
    return None


async def scrape_all(browser: Browser, dry_run: bool = False):
    cameras = load_seed_cameras()
    if not cameras:
        log.error("No seed cameras found!")
        return

    log.info("=" * 60)
    log.info("STEP 1: Crawling SLR Club review index...")
    log.info("=" * 60)
    reviews = await crawl_review_index(browser)

    log.info("=" * 60)
    log.info("STEP 2: Matching reviews to seed cameras...")
    log.info("=" * 60)
    matches = match_reviews_to_seeds(reviews, cameras)
    log.info(f"  Found {len(matches)} matching reviews:")
    for review, cam in matches:
        log.info(f"    • [{review['no']}] {review['title']}  →  {cam['slug']}")

    if dry_run:
        log.info("Dry run — stopping here.")
        return

    log.info("=" * 60)
    log.info("STEP 3: Extracting 총평 HTML & Images...")
    log.info("=" * 60)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    results = []
    for i, (review, cam) in enumerate(matches):
        log.info(f"\n[{i+1}/{len(matches)}] {cam['brand']} {cam['model']}")
        log.info(f"  Review: {review['title']} (no={review['no']})")

        filename = f"{cam['slug']}.json"
        out_path = OUTPUT_DIR / filename
        if out_path.exists():
            try:
                existing_data = json.loads(out_path.read_text(encoding="utf-8"))
                if "critique_html" in existing_data:
                    log.info(f"  ⏭ Already has HTML data, skipping: {filename}")
                    continue
            except Exception:
                pass

        critique_data = await find_critique_page(browser, review["no"], cam["slug"])

        if critique_data:
            output = {
                "source": "slrclub",
                "camera_slug": cam["slug"],
                "camera_brand": cam["brand"],
                "camera_model": cam["model"],
                "scraped_at": datetime.now().isoformat(),
                **critique_data,
            }

            filename = f"{cam['slug']}.json"
            out_path = OUTPUT_DIR / filename
            out_path.write_text(
                json.dumps(output, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            log.info(f"  → Saved to {out_path}")
            results.append(output)
        else:
            log.warning(f"  ✗ No critique found for {cam['model']}")

        await asyncio.sleep(POLITE_DELAY_S)

    log.info("\n" + "=" * 60)
    log.info(f"DONE: Scraped {len(results)}/{len(matches)} critiques")
    log.info("=" * 60)


async def main():
    parser = argparse.ArgumentParser(description="SLR Club 총평 Scraper")
    parser.add_argument("--dry-run", action="store_true", help="Show matches without scraping")
    parser.add_argument("--no", type=int, help="Scrape a single review by its no parameter")
    args = parser.parse_args()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            if args.no:
                await scrape_single(browser, args.no)
            else:
                await scrape_all(browser, dry_run=args.dry_run)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
