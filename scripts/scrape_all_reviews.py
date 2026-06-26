#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
CameraDecision.com - ALL Camera Review Scraper
=============================================================================
Scrapes /review/{slug} for each camera from the timeline slug list.
Collects: Pros & Cons, Scores, DxO data, Key specs, Summary
Outputs Korean-friendly JSON.

Usage:
    python scripts/scrape_all_reviews.py --step2-only --limit 10
    python scripts/scrape_all_reviews.py --step2-only --resume
    python scripts/scrape_all_reviews.py --step2-only  (all cameras)
=============================================================================
"""
from __future__ import annotations

import asyncio
import argparse
import json
import re
import sys
import os
import io
import logging
from datetime import datetime
from typing import Any, Optional
from pathlib import Path

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.async_api import async_playwright, Browser
from bs4 import BeautifulSoup, Tag

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    handlers=[logging.StreamHandler(stream=sys.stderr)],
)
log = logging.getLogger("all_reviews")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_URL = "https://cameradecision.com"
REVIEW_URL = f"{BASE_URL}/review"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_DIR / "data" / "cameradecision_reviews"
SLUGS_FILE = OUTPUT_DIR / "_all_slugs.json"
COMBINED_FILE = OUTPUT_DIR / "_all_reviews.json"
PROGRESS_FILE = OUTPUT_DIR / "_progress.json"

POLITE_DELAY_MS = 1500

STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
"""

# ---------------------------------------------------------------------------
# Korean Translation Map for Pros/Cons
# ---------------------------------------------------------------------------
KOREAN_PROS_CONS_MAP = {
    # ---- Sensor & Image ----
    "High Resolution Sensor": "고해상도 센서",
    "Resolution Sensor": "센서 해상도",
    "megapixels": "화소",
    "MP": "화소",
    "Sensor": "센서",
    "BSI-CMOS": "이면조사형 CMOS",
    "Stacked CMOS": "적층형 CMOS",
    "Full frame": "풀프레임",
    "APS-C": "APS-C",
    "Micro Four Thirds": "마이크로 포서드",
    "Medium Format": "중형 포맷",
    "Pixel Shift": "픽셀 시프트",
    "High Resolution Mode": "고해상도 모드",
    "DxO": "DxO 센서 점수",
    "Dynamic Range": "다이나믹 레인지",
    "Color Depth": "색 심도",
    "Low Light ISO": "저조도 ISO 성능",
    "Dual Native ISO": "듀얼 네이티브 ISO",
    
    # ---- Stabilization ----
    "Image Stabilization": "손떨림 보정 (IBIS)",
    "5-axis": "5축 손떨림 보정",
    "In-body": "바디 내 손떨림 보정",
    "No Image Stabilization": "손떨림 보정 없음",
    
    # ---- Autofocus ----
    "Focus Points": "측거점",
    "Phase Detection": "위상차 AF",
    "Face Detection": "얼굴 인식 AF",
    "Eye AF": "아이 AF (눈 인식)",
    "Animal Eye AF": "동물 눈 인식 AF",
    "Animal AF": "동물 인식 AF",
    "Bird AF": "조류 인식 AF",
    "Vehicle Tracking": "차량 추적 AF",
    "Focus Coverage": "AF 커버리지",
    "Focus Sensitivity": "AF 감도",
    "Focus Bracketing": "포커스 브라케팅",
    "Autofocus at f8": "f8에서 AF 지원",
    
    # ---- Display ----
    "Touch Screen": "터치스크린",
    "No Touch Screen": "터치스크린 없음",
    "Fully Articulated": "풀 틸트 회전 LCD",
    "Tilting Screen": "틸트 LCD",
    "LCD": "LCD",
    "Screen": "화면",
    "Selfie": "셀피 촬영 가능",
    "Vlogger": "브이로그",
    "Top LCD": "상단 LCD",
    
    # ---- Viewfinder ----
    "Electronic Viewfinder": "전자식 뷰파인더 (EVF)",
    "Electronic Built-in Viewfinder": "내장 전자식 뷰파인더",
    "Viewfinder Resolution": "뷰파인더 해상도",
    "Viewfinder": "뷰파인더",
    "magnification": "배율",
    "No Viewfinder": "뷰파인더 없음",
    
    # ---- Shooting Performance ----
    "Continuous Shooting Speed": "연사 속도",
    "Continuous Shooting": "연속 촬영",
    "fps": "fps",
    "Shutter Speed": "셔터 속도",
    "Electronic Shutter": "전자식 셔터",
    "Mechanical Shutter": "기계식 셔터",
    "Shutter Life": "셔터 내구성",
    "AE Bracketing": "AE 브라케팅",
    "Timelapse Recording": "타임랩스 촬영",
    "Silent Shooting": "무음 촬영",
    
    # ---- Video ----
    "Video Recording": "동영상 촬영",
    "RAW Video": "RAW 동영상",
    "4K": "4K 동영상",
    "8K": "8K 동영상",
    "6K": "6K 동영상",
    "120fps": "120fps 고속 촬영",
    "High Speed Video": "고속 동영상",
    "No crop": "크롭 없음",
    "10-bit": "10비트",
    "4:2:2": "4:2:2 색 샘플링",
    "S-Log": "S-Log",
    "Canon Log": "Canon Log",
    "V-Log": "V-Log",
    "F-Log": "F-Log",
    "N-Log": "N-Log",
    "Video bit rate": "동영상 비트레이트",
    
    # ---- Connectivity ----
    "Built-in Wireless": "내장 Wi-Fi",
    "Wi-fi": "Wi-Fi",
    "Bluetooth": "블루투스",
    "Bluetooth Connectivity": "블루투스 연결",
    "USB Charging": "USB 충전",
    "USB": "USB",
    "HDMI": "HDMI",
    "Webcam": "웹캠 기능",
    "Remote control": "리모컨/원격제어",
    "NFC": "NFC",
    "GPS": "GPS",
    
    # ---- Audio ----
    "External Microphone Port": "외장 마이크 단자",
    "Microphone Port": "마이크 단자",
    "External Headphone Port": "외장 헤드폰 단자",
    "Headphone Port": "헤드폰 단자",
    "No Microphone Port": "마이크 단자 없음",
    "No Headphone Port": "헤드폰 단자 없음",
    
    # ---- Build & Body ----
    "Environmental Sealing": "방진방적",
    "Weather Sealed": "방진방적",
    "No Weather Sealing": "방진방적 없음",
    "No Environmental Sealing": "방진방적 없음",
    "Magnesium alloy": "마그네슘 합금 바디",
    "Dust": "방진",
    
    # ---- Storage ----
    "Storage Slots": "저장 슬롯",
    "Dual Card": "듀얼 카드 슬롯",
    "CFexpress": "CFexpress",
    "UHS-II": "UHS-II",
    "SD": "SD 카드",
    
    # ---- Battery ----
    "Battery Life": "배터리 수명",
    "Low Battery Life": "짧은 배터리 수명",
    "Battery": "배터리",
    
    # ---- Misc ----
    "Built-in Flash": "내장 플래시",
    "No Built-in Flash": "내장 플래시 없음",
    "Flash": "플래시",
    "Low Resolution": "낮은 해상도",
    "Lightweight": "경량 바디",
    "Compact": "컴팩트 바디",
    "Voice Memo": "음성 메모",
    "Anti-dust": "안티더스트",
}


# =============================================================================
# PAGE FETCHING
# =============================================================================

async def fetch_page_html(browser: Browser, url: str, max_retries: int = 2) -> str:
    """Open a fresh, ad-blocked context+page, grab HTML immediately."""
    for attempt in range(max_retries + 1):
        log.info(f"  -> Fetching: {url}" + (f" (retry {attempt})" if attempt > 0 else ""))
        context = None
        try:
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1440, "height": 900},
                locale="en-US",
                java_script_enabled=True,
            )

            await context.route("**/*.doubleclick.net/**", lambda route: route.abort())
            await context.route("**/pagead2.googlesyndication.com/**", lambda route: route.abort())
            await context.route("**/adservice.google.*/**", lambda route: route.abort())
            await context.route("**/amazon-adsystem.com/**", lambda route: route.abort())
            await context.route("**/sharethis.com/**", lambda route: route.abort())
            await context.route("**/facebook.net/**", lambda route: route.abort())

            page = await context.new_page()
            await page.add_init_script(STEALTH_JS)

            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            html = await page.content()
            return html

        except Exception as e:
            log.warning(f"  ! Attempt {attempt + 1} failed: {e}")
            if attempt >= max_retries:
                raise
            await asyncio.sleep(2 * (attempt + 1))
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass


# =============================================================================
# REVIEW DATA EXTRACTION
# =============================================================================

def extract_review_data(html: str, slug: str) -> dict[str, Any]:
    """
    Extract review data from a cameradecision.com /review/ page.
    """
    soup = BeautifulSoup(html, "html.parser")
    
    # --- Pros & Cons ---
    pros: list[str] = []
    cons: list[str] = []
    
    for element in soup.find_all(["td", "li"]):
        text = element.get_text(strip=True)
        if not text or len(text) < 3:
            continue
        if element.find(class_=re.compile(r"glyphicon-thumbs-up|fa-thumbs-up")):
            pros.append(text)
        elif element.find(class_=re.compile(r"glyphicon-thumbs-down|fa-thumbs-down")):
            cons.append(text)
    
    pros = list(dict.fromkeys(pros))
    cons = list(dict.fromkeys(cons))
    
    # --- All table specs (raw) ---
    all_specs: dict[str, Any] = {}
    for row in soup.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) >= 2:
            label = cells[0].get_text(strip=True)
            value_cell = cells[1]
            if value_cell.find(class_="glyphicon-ok"):
                value = True
            elif value_cell.find(class_="glyphicon-remove"):
                value = False
            else:
                value = value_cell.get_text(strip=True)
            
            if label and len(label) < 80:
                all_specs[label] = value
    
    # --- DxO Scores ---
    dxo: dict[str, Any] = {}
    for key in ["DxO Overall Score", "DxO Color Depth", "DxO Dynamic Range", "DxO Low Light ISO"]:
        if key in all_specs:
            try:
                dxo[key.replace("DxO ", "").lower().replace(" ", "_")] = float(str(all_specs[key]))
            except (ValueError, TypeError):
                pass
    
    # --- Extract camera name from page title ---
    camera_name = slug.replace("-", " ")
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)
        match = re.match(r"^(.+?)\s+(?:Detailed\s+)?(?:Review|Pros|Cons|Specifications)", title)
        if match:
            camera_name = match.group(1).strip()
    
    # --- Extract image URL ---
    image_url = None
    for img in soup.find_all("img"):
        src = img.get("src", "") or img.get("data-src", "")
        if "front_straight" in src:
            if not src.startswith("http"):
                src = BASE_URL + src
            image_url = src
            break
    
    # --- Extract key numeric specs ---
    key_specs: dict[str, Any] = {}
    for label, value in all_specs.items():
        # Capture the most important specs
        label_lower = label.lower()
        if any(k in label_lower for k in [
            "sensor resolution", "sensor size", "sensor type", "sensor dimensions",
            "max native iso", "min native iso", "max boosted iso",
            "image stabilization", "max video resolution", "video resolutions",
            "screen size", "screen type", "screen resolution",
            "viewfinder", "number of focus points",
            "max continuous shooting", "max mechanical shutter",
            "weight", "battery life", "physical dimensions",
            "wireless", "bluetooth", "usb", "hdmi",
            "storage type", "storage slots",
            "environmental sealing", "touch screen",
            "announced", "msrp", "body type", "lens mount",
            "number of lenses", "focal length multiplier",
            "microphone port", "headphone port",
        ]):
            key_specs[label] = value
    
    return {
        "slug": slug,
        "camera_name": camera_name,
        "image_url": image_url,
        "pros": pros,
        "cons": cons,
        "dxo_scores": dxo if dxo else None,
        "key_specs": key_specs if key_specs else None,
        "all_specs": all_specs if all_specs else None,
    }


def translate_to_korean(review: dict[str, Any]) -> dict[str, Any]:
    """Add Korean-translated pros/cons."""
    
    def make_korean_label(text: str) -> str:
        """Find best Korean translation for a pro/con item."""
        best_match = ""
        best_kor = text
        for eng, kor in KOREAN_PROS_CONS_MAP.items():
            if eng.lower() in text.lower() and len(eng) > len(best_match):
                best_match = eng
                best_kor = kor
        if best_match:
            # Replace the matched portion, keep rest as context
            return best_kor
        return text
    
    pros_ko = [{"en": p, "ko": make_korean_label(p)} for p in review.get("pros", [])]
    cons_ko = [{"en": c, "ko": make_korean_label(c)} for c in review.get("cons", [])]
    
    review["pros_ko"] = pros_ko
    review["cons_ko"] = cons_ko
    
    return review


# Import Korean spec map from existing scraper, with fallback
KOREAN_SPEC_MAP: dict[str, str] = {
    "Sensor Type": "센서 방식", "Sensor Size": "센서 규격",
    "Sensor Resolution": "센서 해상도", "Max Native ISO": "최대 네이티브 ISO",
    "Min Native ISO": "최소 네이티브 ISO", "Image Stabilization": "손떨림 보정 (IBIS)",
    "Max Video Resolution": "최대 동영상 해상도", "Video Resolutions": "지원 동영상 해상도",
    "Screen Size": "LCD 크기", "Screen Type": "LCD 방식", "Screen Resolution": "LCD 해상도",
    "Touch Screen": "터치스크린 지원", "Viewfinder": "뷰파인더 방식",
    "Viewfinder Resolution": "뷰파인더 해상도",
    "Number of Focus Points": "최대 측거점 수",
    "Max Continuous Shooting (Mechanical Shutter)": "최대 연사 속도 (기계식 셔터)",
    "Max Continuous Shooting (Electronic Shutter)": "최대 연사 속도 (전자식 셔터)",
    "Max Mechanical Shutter Speed": "최대 기계식 셔터 속도",
    "Weight": "무게(본체)", "Battery Life": "배터리 성능(컷수)",
    "Physical Dimensions": "크기", "Wireless Connectivity": "무선 연결",
    "Bluetooth": "블루투스", "USB": "USB 규격", "HDMI": "HDMI 출력",
    "Storage Type": "저장 매체", "Storage Slots": "카드 슬롯 수",
    "Environmental Sealing": "방진방적", "Announced": "발표일",
    "MSRP": "출시 가격", "Body Type": "바디 형태", "Lens Mount": "렌즈 마운트",
    "Number of Lenses": "호환 렌즈 수", "Focal Length Multiplier": "크롭 팩터",
    "Microphone Port": "외장 마이크 단자", "Headphone Port": "헤드폰 잭",
    "Sensor Dimensions": "센서 크기", "Sensor Area": "센서 면적",
    "Max Boosted ISO": "최대 확장 ISO", "Video Formats": "동영상 포맷",
    "Max Image Resolution": "최대 이미지 해상도",
}


def translate_specs_korean(review: dict[str, Any]) -> dict[str, Any]:
    """Add Korean-translated key specs."""
    if not review.get("key_specs"):
        return review
    
    specs_ko: dict[str, Any] = {}
    for label, value in review["key_specs"].items():
        ko_label = KOREAN_SPEC_MAP.get(label, label)
        specs_ko[ko_label] = value
    
    review["key_specs_ko"] = specs_ko
    return review


async def scrape_camera_review(browser: Browser, slug: str) -> Optional[dict[str, Any]]:
    """Scrape a single camera's review page."""
    try:
        url = f"{REVIEW_URL}/{slug}"
        html = await fetch_page_html(browser, url)
        review = extract_review_data(html, slug)
        review = translate_to_korean(review)
        review = translate_specs_korean(review)
        
        log.info(
            f"  [OK] {review['camera_name']}: "
            f"{len(review['pros'])} pros, {len(review['cons'])} cons"
            + (f", DxO={review['dxo_scores'].get('overall_score', '?')}" if review.get('dxo_scores') else "")
        )
        return review
    except Exception as e:
        log.error(f"  [FAIL] {slug}: {e}")
        return None


# =============================================================================
# PROGRESS TRACKING
# =============================================================================

def load_progress() -> dict[str, Any]:
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": [], "failed": []}


def save_progress(progress: dict[str, Any]):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


# =============================================================================
# MAIN
# =============================================================================

async def main():
    parser = argparse.ArgumentParser(
        description="Scrape ALL camera reviews from cameradecision.com"
    )
    parser.add_argument("--step2-only", action="store_true",
                        help="Use existing slug list (skip timeline crawl)")
    parser.add_argument("--limit", type=int, default=0,
                        help="Limit number of cameras to scrape (0=all)")
    parser.add_argument("--resume", action="store_true",
                        help="Resume from last progress checkpoint")
    parser.add_argument("--batch-size", type=int, default=5,
                        help="Cameras per batch (default: 5)")
    
    args = parser.parse_args()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load slug list
    if not SLUGS_FILE.exists():
        log.error(f"Slug file not found: {SLUGS_FILE}")
        log.error("Run extract_slugs.py first, or remove --step2-only")
        sys.exit(1)
    
    with open(SLUGS_FILE, "r", encoding="utf-8") as f:
        all_cameras = json.load(f)
    log.info(f"Loaded {len(all_cameras)} camera slugs")
    
    # Load/init progress
    progress = load_progress() if args.resume else {"completed": [], "failed": []}
    completed_slugs = set(progress["completed"])
    
    # Filter
    slugs_to_scrape = [c for c in all_cameras if c["slug"] not in completed_slugs]
    
    if args.resume:
        log.info(f"  Resuming: {len(completed_slugs)} done, {len(slugs_to_scrape)} remaining")
    
    if args.limit > 0:
        slugs_to_scrape = slugs_to_scrape[:args.limit]
        log.info(f"  Limited to {args.limit} cameras")
    
    total = len(slugs_to_scrape)
    if total == 0:
        log.info("Nothing to scrape!")
        return
    
    log.info(f"Starting scrape of {total} cameras...\n")
    
    all_reviews: list[dict[str, Any]] = []
    
    # Load existing reviews if resuming
    if args.resume:
        for slug in completed_slugs:
            rf = OUTPUT_DIR / f"{slug}.json"
            if rf.exists():
                with open(rf, "r", encoding="utf-8") as f:
                    all_reviews.append(json.load(f))
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )
        
        batch_size = args.batch_size
        for i in range(0, total, batch_size):
            batch = slugs_to_scrape[i:i + batch_size]
            batch_num = i // batch_size + 1
            batch_total = (total + batch_size - 1) // batch_size
            
            log.info(f"{'='*60}")
            log.info(f"  Batch {batch_num}/{batch_total} ({len(batch)} cameras)")
            log.info(f"{'='*60}")
            
            for j, cam in enumerate(batch):
                slug = cam["slug"]
                log.info(f"  [{i + j + 1}/{total}] {cam.get('name', slug)}")
                
                review = await scrape_camera_review(browser, slug)
                
                if review:
                    review["brand"] = cam.get("brand", "")
                    review["timeline_name"] = cam.get("name", "")
                    review["scraped_at"] = datetime.now().isoformat()
                    
                    review_file = OUTPUT_DIR / f"{slug}.json"
                    with open(review_file, "w", encoding="utf-8") as f:
                        json.dump(review, f, ensure_ascii=False, indent=2)
                    
                    all_reviews.append(review)
                    progress["completed"].append(slug)
                else:
                    progress["failed"].append(slug)
                
                save_progress(progress)
                await asyncio.sleep(POLITE_DELAY_MS / 1000)
            
            if i + batch_size < total:
                log.info("  Waiting 3s before next batch...")
                await asyncio.sleep(3)
        
        await browser.close()
    
    # Save combined
    if all_reviews:
        with open(COMBINED_FILE, "w", encoding="utf-8") as f:
            json.dump(all_reviews, f, ensure_ascii=False, indent=2)
        log.info(f"Combined reviews saved: {COMBINED_FILE}")
    
    # Summary
    log.info(f"\n{'='*60}")
    log.info(f"  SCRAPE COMPLETE")
    log.info(f"  Scraped: {len(progress['completed'])} cameras")
    log.info(f"  Failed:  {len(progress['failed'])} cameras")
    log.info(f"  Output:  {OUTPUT_DIR}")
    log.info(f"{'='*60}")
    
    if progress["failed"]:
        log.info("Failed cameras:")
        for s in progress["failed"]:
            log.info(f"  - {s}")


if __name__ == "__main__":
    asyncio.run(main())
