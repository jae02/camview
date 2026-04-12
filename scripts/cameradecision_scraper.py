#!/usr/bin/env python3
"""
=============================================================================
CameraDecision.com Comprehensive Scraper
=============================================================================
Extracts structured camera specifications from cameradecision.com and maps
them to our 32-field Prisma Camera model for database seeding.

Tech: Playwright (headless Chromium) + BeautifulSoup 4
Output: seeder-ready JSON (one file per camera + combined output)

Usage:
    # Single camera
    python3 scripts/cameradecision_scraper.py --slug Sony-Alpha-A7R-V

    # Multiple cameras
    python3 scripts/cameradecision_scraper.py --slugs Sony-Alpha-A7R-V Canon-EOS-R5 Nikon-Z8

    # Crawl all cameras from a brand page
    python3 scripts/cameradecision_scraper.py --brand Sony --limit 5

    # With Korean translation
    python3 scripts/cameradecision_scraper.py --slug Sony-Alpha-A7R-V --korean
=============================================================================
"""
from __future__ import annotations  # Python 3.9 compat for modern type hints

import asyncio
import argparse
import json
import re
import sys
import os
import logging
from datetime import datetime
from typing import Any, Optional
from pathlib import Path

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup, Tag

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("cameradecision")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_URL = "https://cameradecision.com"
SPECS_URL = f"{BASE_URL}/specs"
REVIEW_URL = f"{BASE_URL}/review"
IMAGE_BASE = f"{BASE_URL}/img/px300_300/front_straight"

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "seeds"

# Delay between page loads (in ms) to be polite to the server
POLITE_DELAY_MS = 2000

# ---------------------------------------------------------------------------
# Korean Translation Map — Professional Photography Terminology
# ---------------------------------------------------------------------------
KOREAN_SPEC_MAP: dict[str, str] = {
    # ── Sensor & Image ────────────────────────────────────────────────────
    "Sensor Type":              "센서 방식",
    "Sensor Size":              "센서 규격",
    "Max Image Resolution":     "최대 이미지 해상도",
    "Image Resolution":         "이미지 해상도",
    "Effective Pixels":         "유효 화소수",
    "Total Pixels":             "총 화소수",
    "Sensor Resolution":        "센서 해상도",
    "ISO":                      "ISO 감도",
    "ISO Range":                "ISO 감도 범위",
    "Sensor":                   "이미지 센서",
    "Image Stabilization":      "손떨림 보정 (IBIS)",
    "RAW Support":              "RAW 촬영 지원",
    "Optical low-pass filter":  "광학 로우패스 필터",
    "DxO Sensor Score":         "DxO 센서 점수",

    # ── Lens ──────────────────────────────────────────────────────────────
    "Manual Focus":             "수동 초점(MF) 지원",
    "Lens Mount":               "렌즈 마운트",
    "Number of Lenses":         "호환 렌즈 수",
    "Focal Length Multiplier":  "초점거리 환산 배율(크롭 팩터)",

    # ── Screen ────────────────────────────────────────────────────────────
    "Screen Type":              "LCD 방식",
    "Screen Size":              "LCD 크기",
    "Screen Resolution":        "LCD 해상도",
    "Live View":                "라이브 뷰 지원",
    "Touch Screen":             "터치스크린 지원",

    # ── Viewfinder ────────────────────────────────────────────────────────
    "Viewfinder":               "뷰파인더 방식",
    "Viewfinder Type":          "뷰파인더 방식",
    "Viewfinder Resolution":    "뷰파인더 해상도",
    "Viewfinder Coverage":      "뷰파인더 시야율",
    "Viewfinder Magnification": "뷰파인더 배율",

    # ── Photography Features ──────────────────────────────────────────────
    "Min Shutter Speed":        "최고 셔터 속도",
    "Max Shutter Speed":        "최저 셔터 속도(장노출)",
    "Continuous Shooting Speed":"연속 촬영 속도 (연사)",
    "Shooting Speed":           "연속 촬영 속도 (연사)",
    "Top Continuous Shooting Speed": "최대 연사 속도",
    "Flash":                    "내장 플래시",
    "External Flash":           "외장 플래시 지원",
    "AF Points":                "AF 측거점 수",
    "Number of Focus Points":   "최대 측거점 수",
    "Face Detection AF":        "얼굴 인식 AF",
    "Battery Life (CIPA)":      "배터리 성능(CIPA 기준 컷수)",
    "Battery Life":             "배터리 성능(컷수)",
    "Weather Sealed":           "방진방적 지원",
    "Environmental Sealing":    "방진방적(환경 실링)",

    # ── Video Features ────────────────────────────────────────────────────
    "Max Video Resolution":     "최대 동영상 해상도",
    "Video Resolutions":        "지원 동영상 해상도",
    "Video Resolution":         "동영상 해상도",
    "Max Video Resolution/fps": "최대 동영상 해상도/프레임",
    "Video":                    "동영상 기능",
    "Video Stabilization":      "동영상 손떨림 보정",

    # ── Storage ───────────────────────────────────────────────────────────
    "Storage Type":             "저장 매체 종류",
    "Memory Card":              "메모리 카드",
    "Card Slot":                "카드 슬롯",
    "Dual Storage Slots":       "듀얼 카드 슬롯",
    "Number of Storage Slots":  "저장 슬롯 수",

    # ── Connectivity ──────────────────────────────────────────────────────
    "Built-in Wireless":        "내장 Wi-Fi",
    "Wireless":                 "무선 연결",
    "Wi-Fi":                    "Wi-Fi 지원",
    "Bluetooth":                "블루투스 지원",
    "NFC":                      "NFC 지원",
    "USB":                      "USB 규격",
    "USB Type":                 "USB 규격",
    "HDMI":                     "HDMI 출력",
    "HDMI Port":                "HDMI 포트",
    "Remote Control":           "리모컨 지원",
    "GPS":                      "내장 GPS",
    "Microphone Port":          "외장 마이크 단자",
    "External Microphone Port": "외장 마이크 포트",
    "External Headphone Port":  "외장 헤드폰 포트",
    "Headphone Port":           "헤드폰 잭",

    # ── Physical ──────────────────────────────────────────────────────────
    "Weight":                   "무게(본체)",
    "Body Weight":              "바디 무게",
    "Body Type":                "바디 형태",
    "Dimensions":               "크기(가로×세로×두께)",
    "Body Material":            "바디 소재",
    "Battery":                  "배터리 규격",
    "Battery Type":             "배터리 타입",

    # ── Pricing ───────────────────────────────────────────────────────────
    "Price":                    "가격",
    "MSRP Price":               "출시 가격(MSRP)",
    "Launch Date":              "출시일",
    "Announced":                "발표일",
}


# ---------------------------------------------------------------------------
# Prisma Enum Mappings
# ---------------------------------------------------------------------------
SENSOR_SIZE_MAP: dict[str, str] = {
    "full frame":       "FULL_FRAME",
    "full-frame":       "FULL_FRAME",
    "35mm":             "FULL_FRAME",
    "aps-c":            "APS_C",
    "aps-h":            "APS_C",
    "four thirds":      "MICRO_FOUR_THIRDS",
    "4/3":              "MICRO_FOUR_THIRDS",
    "micro 4/3":        "MICRO_FOUR_THIRDS",
    "medium format":    "MEDIUM_FORMAT",
    "1 inch":           "ONE_INCH",
    "1\"":              "ONE_INCH",
    "1-inch":           "ONE_INCH",
}

LENS_MOUNT_MAP: dict[str, str] = {
    "sony e":           "SONY_E",
    "sony fe":          "SONY_E",
    "canon rf":         "CANON_RF",
    "canon ef":         "CANON_EF",
    "canon ef-s":       "CANON_EF",
    "nikon z":          "NIKON_Z",
    "nikon f":          "NIKON_F",
    "fujifilm x":       "FUJIFILM_X",
    "fuji x":           "FUJIFILM_X",
    "fujifilm gfx":     "FUJIFILM_GFX",
    "fuji gfx":         "FUJIFILM_GFX",
    "micro four thirds":"MICRO_FOUR_THIRDS",
    "micro 4/3":        "MICRO_FOUR_THIRDS",
    "leica l":          "LEICA_L",
    "leica m":          "LEICA_M",
    "pentax k":         "PENTAX_K",
}

BODY_TYPE_MAP: dict[str, str] = {
    "slr-style mirrorless": "MIRRORLESS",
    "mirrorless":       "MIRRORLESS",
    "dslr":             "DSLR",
    "slr":              "DSLR",
    "compact":          "COMPACT",
    "point and shoot":  "COMPACT",
    "medium format":    "MEDIUM_FORMAT",
    "cinema":           "CINEMA",
    "action":           "ACTION",
    "action camera":    "ACTION",
}


# =============================================================================
# 1. PAGE FETCHING UTILITIES
# =============================================================================

STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
"""

# Ad/tracking domains that crash the renderer
BLOCKED_PATTERNS = [
    "**/*.doubleclick.net/**",
    "**/pagead2.googlesyndication.com/**",
    "**/adservice.google.*/**",
    "**/googletagservices.com/**",
    "**/googletag*/**",
    "**/amazon-adsystem.com/**",
    "**/sharethis.com/**",
    "**/facebook.net/**",
    "**/analytics.google.com/**",
]


async def fetch_page_html(browser: Browser, url: str, max_retries: int = 2) -> str:
    """
    Open a fresh, ad-blocked context+page, grab HTML immediately.
    Retries on crash with exponential backoff.
    """
    for attempt in range(max_retries + 1):
        log.info(f"  → Fetching: {url}" + (f" (retry {attempt})" if attempt > 0 else ""))
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

            # Block ad scripts that crash the page
            await context.route("**/*.doubleclick.net/**", lambda route: route.abort())
            await context.route("**/pagead2.googlesyndication.com/**", lambda route: route.abort())
            await context.route("**/adservice.google.*/**", lambda route: route.abort())
            await context.route("**/amazon-adsystem.com/**", lambda route: route.abort())
            await context.route("**/sharethis.com/**", lambda route: route.abort())
            await context.route("**/facebook.net/**", lambda route: route.abort())

            page = await context.new_page()
            await page.add_init_script(STEALTH_JS)

            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            # Grab content immediately — don't wait for ads to load
            html = await page.content()
            return html

        except Exception as e:
            log.warning(f"  ⚠ Attempt {attempt + 1} failed: {e}")
            if attempt >= max_retries:
                raise
            await asyncio.sleep(2 * (attempt + 1))  # Backoff
        finally:
            if context:
                try:
                    await context.close()
                except Exception:
                    pass


# =============================================================================
# 2. SPECS EXTRACTION (from /specs/ page)
# =============================================================================

def _parse_cell_value(cell: Tag) -> Any:
    """
    Parse a table cell value, handling:
    - Boolean checkmarks (glyphicon-ok -> True, glyphicon-remove -> False)
    - Plain text values (stripped)
    """
    # Check for Bootstrap Glyphicon boolean indicators
    if cell.find(class_="glyphicon-ok"):
        return True
    if cell.find(class_="glyphicon-remove"):
        return False
    # Check for FontAwesome boolean indicators (fallback)
    if cell.find(class_="fa-check"):
        return True
    if cell.find(class_="fa-times"):
        return False
    # Plain text
    return cell.get_text(strip=True)


def _extract_section_name(element: Tag) -> Optional[str]:
    """Try to extract a section heading from an h2/h3/h4 above or within a table."""
    prev = element.find_previous(["h2", "h3", "h4"])
    if prev:
        return prev.get_text(strip=True)
    return None


def extract_all_specs(html: str) -> dict[str, dict[str, Any]]:
    """
    Extract all specification label-value pairs from the specs page.
    Returns a dict organized by section name:
    {
        "Sensor": {"Sensor Type": "BSI-CMOS", ...},
        "Lens": {"Manual Focus": True, ...},
        ...
    }
    """
    soup = BeautifulSoup(html, "html.parser")
    sections: dict[str, dict[str, Any]] = {}

    # Valid spec section names on cameradecision.com
    valid_sections = {
        "sensor", "lens", "screen", "viewfinder",
        "photography features", "video features",
        "storage", "connectivity", "physical",
        "other features", "focus", "flash",
    }

    # Strategy 1: Find spec headings (h2/h3/h4) followed by tables
    for heading in soup.find_all(["h2", "h3", "h4"]):
        heading_text = heading.get_text(strip=True)
        if not heading_text or len(heading_text) > 50:
            continue

        # Check if this looks like a spec section heading
        is_spec_heading = heading_text.lower() in valid_sections or any(
            s in heading_text.lower() for s in valid_sections
        )
        if not is_spec_heading:
            continue

        section_name = heading_text
        section_data: dict[str, Any] = {}

        # Walk forward from this heading looking for a table
        next_el = heading.find_next()
        depth = 0
        while next_el and depth < 20:
            depth += 1
            if next_el.name == "table":
                for row in next_el.find_all("tr"):
                    cells = row.find_all("td")
                    if len(cells) >= 2:
                        label = cells[0].get_text(strip=True)
                        value = _parse_cell_value(cells[1])
                        if label and label != "":
                            section_data[label] = value
                break
            elif next_el.name in ("h2", "h3", "h4") and next_el != heading:
                break
            next_el = next_el.find_next()

        if section_data:
            sections[section_name] = section_data

    # Strategy 2: If still empty, extract from ALL tables, grouping by
    # the nearest preceding heading
    if not sections:
        log.info("  → Using fallback: extracting specs from all tables...")
        current_section = "General"
        for table in soup.find_all("table"):
            # Try to find a preceding heading
            prev_heading = table.find_previous(["h2", "h3", "h4"])
            if prev_heading:
                ht = prev_heading.get_text(strip=True)
                if ht and len(ht) < 50:
                    current_section = ht

            if current_section not in sections:
                sections[current_section] = {}

            for row in table.find_all("tr"):
                cells = row.find_all("td")
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    value = _parse_cell_value(cells[1])
                    if label and len(label) < 80:
                        sections[current_section][label] = value

    spec_count = sum(len(s) for s in sections.values())
    if spec_count == 0:
        log.warning("  ⚠ No specs extracted from page!")

    return sections


def extract_camera_metadata(html: str) -> dict[str, str]:
    """Extract metadata like brand, model name, body type from the page."""
    soup = BeautifulSoup(html, "html.parser")
    meta: dict[str, str] = {}

    # Page title: "Sony A7R V Detailed Specifications - CameraDecision"
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)
        match = re.match(r"^(.+?)\s+(?:Detailed\s+)?(?:Specifications|Review|Specs)", title)
        if match:
            meta["full_name"] = match.group(1).strip()

    # Breadcrumbs: Home / Sony Cameras / Mirrorless Cameras / ...
    breadcrumbs = soup.find("ol", class_="breadcrumb")
    if breadcrumbs:
        crumb_texts = [li.get_text(strip=True) for li in breadcrumbs.find_all("li")]
        for crumb in crumb_texts:
            if "cameras" in crumb.lower():
                # "Sony Cameras" -> "Sony"
                brand_match = re.match(r"^(\w+)\s+Cameras?$", crumb.strip(), re.IGNORECASE)
                if brand_match:
                    meta["brand"] = brand_match.group(1)
            if "mirrorless" in crumb.lower():
                meta["body_type_hint"] = "Mirrorless"
            elif "dslr" in crumb.lower():
                meta["body_type_hint"] = "DSLR"
            elif "compact" in crumb.lower():
                meta["body_type_hint"] = "Compact"

    # Product image: first <img> with the camera slug in the URL
    for img in soup.find_all("img"):
        src = img.get("src", "") or img.get("data-src", "")
        if "front_straight" in src or "/img/" in src:
            if src.endswith(".jpg") or src.endswith(".png"):
                if not src.startswith("http"):
                    src = BASE_URL + src
                meta["image_url"] = src
                break

    return meta


# =============================================================================
# 3. PROS & CONS EXTRACTION (from /review/ page)
# =============================================================================

def extract_pros_cons(html: str) -> dict[str, list[str]]:
    """
    Extract pros and cons from the review page.
    CameraDecision uses TABLE layout:
    - <td> with <span class="glyphicon glyphicon-thumbs-up"> = pro
    - <td> with <span class="glyphicon glyphicon-thumbs-down"> = con
    """
    soup = BeautifulSoup(html, "html.parser")
    pros: list[str] = []
    cons: list[str] = []

    # Search both <td> and <li> elements for maximum compatibility
    for element in soup.find_all(["td", "li"]):
        text = element.get_text(strip=True)
        if not text or len(text) < 3:
            continue

        if element.find(class_=re.compile(r"glyphicon-thumbs-up|fa-thumbs-up")):
            pros.append(text)
        elif element.find(class_=re.compile(r"glyphicon-thumbs-down|fa-thumbs-down")):
            cons.append(text)

    # Deduplicate while preserving order
    pros = list(dict.fromkeys(pros))
    cons = list(dict.fromkeys(cons))

    return {"pros": pros, "cons": cons}


# =============================================================================
# 4. PRISMA FIELD MAPPING — 32 Fields
# =============================================================================

def _safe_float(val: Any) -> Optional[float]:
    """Try to extract a float from a string like '61.0MP', '3.20"', '0.9x'."""
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        m = re.search(r"([\d.]+)", val)
        if m:
            return float(m.group(1))
    return None


def _safe_int(val: Any) -> Optional[int]:
    """Try to extract an int from a string like '693', '2' etc."""
    if isinstance(val, int):
        return val
    if isinstance(val, (float)):
        return int(val)
    if isinstance(val, str):
        # Remove commas: "102,400" -> "102400"
        cleaned = val.replace(",", "")
        m = re.search(r"(\d+)", cleaned)
        if m:
            return int(m.group(1))
    return None


def _parse_iso_range(val: Any) -> tuple[Optional[int], Optional[int]]:
    """
    Parse ISO strings like:
    - "100 - 32000( expands to 50 - 102800)"
    - "100-51200"
    Returns (min_native, max_native).
    """
    if not isinstance(val, str):
        return (None, None)
    # Native ISO range (before the expansion parenthetical)
    native = val.split("(")[0].strip()
    parts = re.findall(r"[\d,]+", native.replace(",", ""))
    if len(parts) >= 2:
        return (int(parts[0]), int(parts[1]))
    return (None, None)


def _parse_weight(val: Any) -> Optional[int]:
    """Parse weight string like '723g', '723 g' into grams (int)."""
    if isinstance(val, str):
        m = re.search(r"([\d,]+)\s*g", val.lower())
        if m:
            return int(m.group(1).replace(",", ""))
    return _safe_int(val)


def _parse_video_resolution(val: Any) -> str:
    """Parse video strings like '8K at 24fps and 4K at 60fps' into concise format."""
    if not isinstance(val, str):
        return str(val) if val else ""
    # Try to get the highest resolution mention
    resolutions = re.findall(r"(\d+K)\s*(?:at|@)?\s*(\d+)\s*(?:fps|p)", val, re.IGNORECASE)
    if resolutions:
        top = resolutions[0]
        return f"{top[0]} {top[1]}fps"
    # Try simpler patterns
    simple = re.findall(r"(\d+K|\d{3,4}p)", val, re.IGNORECASE)
    if simple:
        return simple[0]
    return val.strip()


def _parse_release_date(val: Any) -> Optional[str]:
    """
    Parse date strings like 'October 2022', '2022', 'Oct 2022', '2022-10-26'.
    Returns ISO date string. Day defaults to 01 if not available.
    """
    if not isinstance(val, str):
        return None
    val = val.strip()
    # Try ISO format "YYYY-MM-DD" (used by cameradecision.com)
    iso_match = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", val)
    if iso_match:
        return f"{val}T00:00:00.000Z"
    # Try "Month Year"
    for fmt in ("%B %Y", "%b %Y", "%B, %Y", "%b, %Y"):
        try:
            dt = datetime.strptime(val, fmt)
            return dt.strftime("%Y-%m-%dT00:00:00.000Z")
        except ValueError:
            continue
    # Try just year
    m = re.search(r"(\d{4})", val)
    if m:
        return f"{m.group(1)}-01-01T00:00:00.000Z"
    return None


def _classify_sensor_size(raw: str) -> str:
    """Map raw sensor size string to Prisma SensorSize enum."""
    lower = raw.lower()
    for key, enum_val in SENSOR_SIZE_MAP.items():
        if key in lower:
            return enum_val
    return "OTHER"


def _classify_lens_mount(raw: str) -> str:
    """Map raw mount string to Prisma LensMount enum."""
    lower = raw.lower()
    for key, enum_val in LENS_MOUNT_MAP.items():
        if key in lower:
            return enum_val
    return "OTHER"


def _classify_body_type(hints: dict[str, str], breadcrumb_hint: Optional[str] = None) -> str:
    """Determine body type from metadata hints."""
    combined = " ".join([
        hints.get("body_type_hint", ""),
        breadcrumb_hint or "",
    ]).lower()
    for key, enum_val in BODY_TYPE_MAP.items():
        if key in combined:
            return enum_val
    return "MIRRORLESS"  # Default for modern cameras


def _make_slug(brand: str, model: str) -> str:
    """Generate a URL-friendly slug from brand + model."""
    combined = f"{brand} {model}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", combined)
    return slug.strip("-")


def _lookup(sections: dict[str, dict[str, Any]], *keys: str) -> Any:
    """
    Look up a spec value across all sections.
    Tries each key in order; returns the first match found.
    """
    for key in keys:
        for section in sections.values():
            if key in section:
                return section[key]
    return None


def map_to_prisma(
    sections: dict[str, dict[str, Any]],
    metadata: dict[str, str],
    pros_cons: dict[str, list[str]],
    slug: str,
) -> dict[str, Any]:
    """
    Map extracted raw specs to our 32-field Prisma Camera model.
    Returns a seeder-ready dictionary.
    """
    # ── Helpers ──────────────────────────────────────────────────────────
    full_name = metadata.get("full_name", slug.replace("-", " "))
    brand = metadata.get("brand", "")
    model_name = full_name.replace(brand, "").strip() if brand else full_name

    # If brand wasn't detected from breadcrumbs, try to infer from slug
    if not brand:
        brand_guess = slug.split("-")[0]
        brand = brand_guess.capitalize()
        model_name = full_name.replace(brand_guess, "").strip()

    # Try to get model from raw spec "Model" field
    raw_model = _lookup(sections, "Model")
    if raw_model and isinstance(raw_model, str):
        # "Sony Alpha A7R V" → strip brand prefix
        model_name = raw_model.replace(brand, "").strip()

    # ── Sensor & Image ──────────────────────────────────────────────────
    sensor_raw = _lookup(sections, "Sensor Size", "Sensor", "Sensor Type") or ""
    sensor_size_enum = _classify_sensor_size(str(sensor_raw))

    megapixels_raw = _lookup(sections, "Sensor Resolution", "Effective Pixels", "Total Pixels")
    megapixels = _safe_float(megapixels_raw)

    # CameraDecision uses separate "Min Native ISO" and "Max Native ISO" fields
    iso_min_raw = _lookup(sections, "Min Native ISO", "Min ISO")
    iso_max_raw = _lookup(sections, "Max Native ISO", "Max ISO")
    iso_min = _safe_int(iso_min_raw) if iso_min_raw else None
    iso_max = _safe_int(iso_max_raw) if iso_max_raw else None
    # Fallback to combined "ISO" or "ISO Range" field
    if not iso_min or not iso_max:
        iso_raw = _lookup(sections, "ISO", "ISO Range")
        _min, _max = _parse_iso_range(iso_raw)
        iso_min = iso_min or _min
        iso_max = iso_max or _max

    ibis = _lookup(sections, "Image Stabilization", "Body-based Image Stabilization")
    image_stabilization = ibis is True if isinstance(ibis, bool) else bool(ibis)

    # ── Autofocus ────────────────────────────────────────────────────────
    af_points_raw = _lookup(sections, "Number of Focus Points", "AF Points")
    af_points = _safe_int(af_points_raw) or 0

    # Build AF type description from available fields
    af_parts = []
    if _lookup(sections, "AF Phase Detection") is True:
        af_parts.append("Phase Detection")
    if _lookup(sections, "AF Contrast Detection") is True:
        af_parts.append("Contrast Detection")
    if _lookup(sections, "AF Face Detection") is True:
        af_parts.append("Face Detection")
    af_type = " + ".join(af_parts) if af_parts else "Phase Detection"

    # ── Video ────────────────────────────────────────────────────────────
    video_raw = _lookup(sections, "Max Video Resolution", "Video Resolutions")
    max_video = _parse_video_resolution(video_raw) if video_raw else ""

    # Build video features from format info
    video_formats = _lookup(sections, "Video Formats")
    video_features = str(video_formats) if video_formats and isinstance(video_formats, str) else None

    # ── Viewfinder & Display ─────────────────────────────────────────────
    vf_type_raw = _lookup(sections, "Viewfinder", "Viewfinder Type") or ""
    vf_type = str(vf_type_raw)
    if vf_type.lower() == "electronic":
        vf_type = "Electronic (EVF)"
    elif vf_type.lower() == "optical":
        vf_type = "Optical (OVF)"

    vf_mag_raw = _lookup(sections, "Viewfinder Magnification")
    vf_mag = _safe_float(vf_mag_raw)

    lcd_size_raw = _lookup(sections, "Screen Size")
    lcd_size = _safe_float(lcd_size_raw) or 3.0

    lcd_res = str(_lookup(sections, "Screen Resolution") or "")
    touchscreen = _lookup(sections, "Touch Screen")
    touchscreen = touchscreen is True if isinstance(touchscreen, bool) else True

    # ── Lens Mount ───────────────────────────────────────────────────────
    mount_raw = str(_lookup(sections, "Lens Mount") or "")
    mount_enum = _classify_lens_mount(mount_raw)

    # ── Performance ──────────────────────────────────────────────────────
    # CameraDecision keys: "Max Continuous Shooting (Mechanical Shutter)"
    fps_raw = _lookup(
        sections,
        "Max Continuous Shooting (Mechanical Shutter)",
        "Max Continuous Shooting (Electronic Shutter)",
        "Top Continuous Shooting Speed",
        "Continuous Shooting Speed",
    )
    cont_fps = _safe_float(fps_raw) or 0.0

    # CameraDecision: "Min Shutter Speed" = slowest (30s), "Max Mechanical Shutter Speed" = fastest (1/8000s)
    shutter_fastest = str(_lookup(sections, "Max Mechanical Shutter Speed", "Max Shutter Speed") or "1/4000")
    shutter_slowest = str(_lookup(sections, "Min Shutter Speed") or '30"')
    # In our Prisma schema: shutterSpeedMin = fastest (1/8000), shutterSpeedMax = slowest (30")
    shutter_min = shutter_fastest
    shutter_max = shutter_slowest

    # ── Connectivity ─────────────────────────────────────────────────────
    # CameraDecision uses "Storage Slots" (not "Number of Storage Slots")
    storage_slots_raw = _lookup(sections, "Storage Slots", "Number of Storage Slots", "Card Slot")
    card_slots = _safe_int(storage_slots_raw) or 1

    card_type = str(_lookup(sections, "Storage Type", "Memory Card") or "SD")

    # CameraDecision uses "Wireless Connectivity": "Built-In" for wifi
    wifi_raw = _lookup(sections, "Wireless Connectivity", "Built-in Wireless", "Wi-Fi")
    if isinstance(wifi_raw, bool):
        wifi = wifi_raw
    elif isinstance(wifi_raw, str):
        wifi = wifi_raw.lower() in ("built-in", "yes", "true", "wi-fi")
    else:
        wifi = False

    bt_val = _lookup(sections, "Bluetooth")
    bluetooth = bt_val is True if isinstance(bt_val, bool) else bool(bt_val)

    usb_val = _lookup(sections, "USB", "USB Type")
    usb = str(usb_val) if usb_val and usb_val is not True else None

    hdmi_val = _lookup(sections, "HDMI")
    # Enrich video features with HDMI if present
    if hdmi_val is True and video_features:
        video_features += ", HDMI output"

    # ── Physical ─────────────────────────────────────────────────────────
    weight_raw = _lookup(sections, "Weight", "Body Weight")
    weight_grams = _parse_weight(weight_raw) or 0

    # CameraDecision uses "Physical Dimensions" not just "Dimensions"
    dims = str(_lookup(sections, "Physical Dimensions", "Dimensions") or "")
    # Normalize: "131 x 97 x 82mm" → "131 x 97 x 82 mm"
    dims = re.sub(r"(\d)\s*mm", r"\1 mm", dims)

    weather_sealed_val = _lookup(sections, "Environmental Sealing", "Weather Sealed")
    weather_sealed = weather_sealed_val is True if isinstance(weather_sealed_val, bool) else False

    # ── Pricing & Availability ───────────────────────────────────────────
    price_raw = _lookup(sections, "MSRP", "MSRP Price", "Price", "Body Only Price")
    price_msrp = None
    if price_raw:
        # "$3,398.00" → 339800 cents
        cleaned = str(price_raw).replace(",", "").replace("$", "")
        price_num = _safe_float(cleaned)
        if price_num:
            price_msrp = int(price_num * 100)

    # CameraDecision uses "Announced" with format "YYYY-MM-DD"
    release_raw = _lookup(sections, "Announced", "Launch Date", "Release Date")
    release_date = _parse_release_date(release_raw)

    # ── Body Type ────────────────────────────────────────────────────────
    body_type_raw = _lookup(sections, "Body Type")
    body_type_enum = _classify_body_type(metadata, str(body_type_raw) if body_type_raw else None)

    # ── Image URLs ───────────────────────────────────────────────────────
    image_url = metadata.get("image_url", f"{IMAGE_BASE}/{slug}.jpg")
    thumbnail_url = image_url.replace("px300_300", "px100_100") if image_url else None

    # ── Build Prisma Record ──────────────────────────────────────────────
    record: dict[str, Any] = {
        # Identity
        "slug":                     _make_slug(brand, model_name),
        "brand":                    brand,
        "model":                    model_name,

        # Body
        "bodyType":                 body_type_enum,

        # Sensor & Image
        "sensorSize":               sensor_size_enum,
        "megapixels":               megapixels or 0.0,
        "isoMin":                   iso_min or 100,
        "isoMax":                   iso_max or 25600,
        "imageStabilization":       image_stabilization,

        # Autofocus
        "afPoints":                 af_points,
        "afType":                   af_type,

        # Video
        "maxVideoResolution":       max_video,
        "videoFeatures":            video_features,

        # Viewfinder & Display
        "viewfinderType":           vf_type,
        "viewfinderMagnification":  vf_mag,
        "lcdSize":                  lcd_size,
        "lcdResolution":            lcd_res,
        "touchscreen":              touchscreen,

        # Lens Mount
        "mount":                    mount_enum,

        # Performance
        "continuousShootingSpeed":  cont_fps,
        "shutterSpeedMin":          shutter_min,
        "shutterSpeedMax":          shutter_max,

        # Connectivity
        "cardSlots":                card_slots,
        "cardType":                 card_type,
        "wifi":                     wifi,
        "bluetooth":                bluetooth,
        "usb":                      usb,

        # Physical
        "weightGrams":              weight_grams,
        "dimensions":               dims,
        "weatherSealed":            weather_sealed,

        # Pricing & Availability
        "priceMsrp":                price_msrp,
        "releaseDate":              release_date or datetime.now().strftime("%Y-%m-%dT00:00:00.000Z"),

        # Media
        "imageUrl":                 image_url,
        "thumbnailUrl":             thumbnail_url,

        # Description (from pros/cons)
        "description":              None,  # Can be populated later

        # ── Extra: Pros & Cons (for Review seeding) ──────────────────────
        "_prosCons":                pros_cons,

        # ── Extra: Full raw specs (for debugging / future fields) ────────
        "_rawSpecs":                sections,
    }

    return record


# =============================================================================
# 5. KOREAN TRANSLATION
# =============================================================================

def translate_specs_korean(sections: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """
    Create a parallel Korean-translated version of the spec sections.
    Only translates the keys; values remain as-is.
    """
    translated: dict[str, dict[str, Any]] = {}
    for section_name, specs in sections.items():
        translated_specs: dict[str, Any] = {}
        for key, value in specs.items():
            korean_key = KOREAN_SPEC_MAP.get(key, key)
            translated_specs[korean_key] = value
        translated[section_name] = translated_specs
    return translated


# =============================================================================
# 6. BRAND LIST CRAWLING
# =============================================================================

async def crawl_brand_camera_slugs(
    page: Page, brand: str, limit: int = 50
) -> list[str]:
    """
    Crawl a brand page to discover camera slugs.
    URL pattern: https://cameradecision.com/{Brand}
    """
    brand_url = f"{BASE_URL}/{brand}"
    log.info(f"📋 Crawling brand page: {brand_url}")
    await page.goto(brand_url, wait_until="domcontentloaded", timeout=30_000)
    await page.wait_for_timeout(POLITE_DELAY_MS)

    # Execute JS to extract camera slugs from links
    slugs = await page.evaluate("""
        () => {
            const slugs = [];
            document.querySelectorAll('a[href*="/specs/"], a[href*="/review/"]').forEach(a => {
                const href = a.href;
                const match = href.match(/\\/(specs|review)\\/(.+?)(?:\\/|$)/);
                if (match && match[2]) {
                    slugs.push(match[2]);
                }
            });
            return [...new Set(slugs)];
        }
    """)

    slugs = slugs[:limit]
    log.info(f"  Found {len(slugs)} camera slugs for {brand}")
    return slugs


# =============================================================================
# 7. MAIN ORCHESTRATION
# =============================================================================

async def scrape_single_camera(
    browser: Browser, slug: str, include_korean: bool = False
) -> dict[str, Any]:
    """
    Full scrape pipeline for a single camera:
    1. Fetch specs page → extract structured data
    2. Fetch review page → extract pros & cons
    3. Map to Prisma schema
    4. Optionally translate to Korean
    """
    log.info(f"📷 Scraping camera: {slug}")

    # ── Step 1: Specs ─────────────────────────────────────────────────────
    specs_html = await fetch_page_html(browser, f"{SPECS_URL}/{slug}")
    sections = extract_all_specs(specs_html)
    metadata = extract_camera_metadata(specs_html)

    spec_count = sum(len(s) for s in sections.values())
    log.info(f"  ✓ Extracted {spec_count} spec fields across {len(sections)} sections")

    # ── Step 2: Pros & Cons ──────────────────────────────────────────────
    review_html = await fetch_page_html(browser, f"{REVIEW_URL}/{slug}")
    pros_cons = extract_pros_cons(review_html)
    log.info(f"  ✓ Found {len(pros_cons['pros'])} pros, {len(pros_cons['cons'])} cons")

    # ── Step 3: Map to Prisma ────────────────────────────────────────────
    record = map_to_prisma(sections, metadata, pros_cons, slug)
    log.info(f"  ✓ Mapped to Prisma: {record['brand']} {record['model']} ({record['slug']})")

    # ── Step 4: Korean Translation ───────────────────────────────────────
    if include_korean:
        record["_koreanSpecs"] = translate_specs_korean(sections)
        log.info(f"  ✓ Korean translation applied ({len(KOREAN_SPEC_MAP)} terms)")

    return record


async def run_scraper(
    slugs: list[str],
    include_korean: bool = False,
    output_dir: Optional[Path] = None,
) -> list[dict[str, Any]]:
    """Run the scraper for a list of camera slugs."""
    out = output_dir or OUTPUT_DIR
    out.mkdir(parents=True, exist_ok=True)

    all_records: list[dict[str, Any]] = []

    async with async_playwright() as pw:
        browser: Browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )

        for i, slug in enumerate(slugs, 1):
            log.info(f"\n{'='*60}")
            log.info(f"  [{i}/{len(slugs)}] Processing: {slug}")
            log.info(f"{'='*60}")

            try:
                record = await scrape_single_camera(browser, slug, include_korean)
                all_records.append(record)

                # Save individual JSON
                individual_path = out / f"{record['slug']}.json"
                with open(individual_path, "w", encoding="utf-8") as f:
                    json.dump(record, f, ensure_ascii=False, indent=2)
                log.info(f"  💾 Saved: {individual_path}")

            except Exception as e:
                log.error(f"  ✕ Failed to scrape {slug}: {e}", exc_info=True)
                continue

        await browser.close()

    # Save combined seed file
    if all_records:
        combined_path = out / "all_cameras_seed.json"
        with open(combined_path, "w", encoding="utf-8") as f:
            json.dump(all_records, f, ensure_ascii=False, indent=2)
        log.info(f"\n✅ Combined seed saved: {combined_path} ({len(all_records)} cameras)")

    return all_records


# =============================================================================
# 8. CLI ENTRY POINT
# =============================================================================

async def main():
    parser = argparse.ArgumentParser(
        description="CameraDecision.com Scraper → Prisma Camera Seeder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single camera
  python3 scripts/cameradecision_scraper.py --slug Sony-Alpha-A7R-V

  # Multiple cameras with Korean translation
  python3 scripts/cameradecision_scraper.py \\
      --slugs Sony-Alpha-A7R-V Canon-EOS-R5 Nikon-Z8 \\
      --korean

  # Crawl all Sony cameras (limited to 5)
  python3 scripts/cameradecision_scraper.py --brand Sony --limit 5
        """,
    )
    parser.add_argument(
        "--slug", type=str, help="Single camera slug to scrape"
    )
    parser.add_argument(
        "--slugs", nargs="+", type=str, help="Multiple camera slugs to scrape"
    )
    parser.add_argument(
        "--brand", type=str, help="Crawl all cameras from a brand (e.g., 'Sony')"
    )
    parser.add_argument(
        "--limit", type=int, default=10,
        help="Max cameras to scrape from a brand page (default: 10)"
    )
    parser.add_argument(
        "--korean", action="store_true",
        help="Include Korean-translated spec labels"
    )
    parser.add_argument(
        "--output", type=str, help="Custom output directory path"
    )

    args = parser.parse_args()
    output_dir = Path(args.output) if args.output else None

    # Determine which slugs to scrape
    slugs: list[str] = []

    if args.slug:
        slugs = [args.slug]
    elif args.slugs:
        slugs = args.slugs
    elif args.brand:
        # Need to crawl the brand page first
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            ctx = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
            )
            page = await ctx.new_page()
            slugs = await crawl_brand_camera_slugs(page, args.brand, args.limit)
            await browser.close()
    else:
        # Demo mode: scrape the Sony A7R V as a sample
        log.info("No arguments provided. Running demo with Sony-Alpha-A7R-V...")
        slugs = ["Sony-Alpha-A7R-V"]
        args.korean = True

    if not slugs:
        log.error("No camera slugs found to scrape.")
        sys.exit(1)

    log.info(f"🎯 Scraping {len(slugs)} camera(s): {', '.join(slugs[:5])}{'...' if len(slugs) > 5 else ''}")
    results = await run_scraper(slugs, args.korean, output_dir)

    # Print summary
    print(f"\n{'='*60}")
    print(f"  SCRAPE COMPLETE — {len(results)} cameras processed")
    print(f"{'='*60}")
    for r in results:
        print(f"  • {r['brand']} {r['model']} ({r['slug']})")
        print(f"    Sensor: {r['sensorSize']} | {r['megapixels']}MP")
        print(f"    Video: {r['maxVideoResolution']} | Mount: {r['mount']}")
        print(f"    Pros: {len(r['_prosCons']['pros'])} | Cons: {len(r['_prosCons']['cons'])}")
        print()


if __name__ == "__main__":
    asyncio.run(main())
