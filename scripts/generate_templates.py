"""Generate empty slrclub JSON templates for cameras missing critique data,
and clean up existing scraped files (remove event announcements, etc.)."""

import json
from pathlib import Path

seeds_dir = Path(__file__).resolve().parent.parent / "data" / "seeds"
slrclub_dir = Path(__file__).resolve().parent.parent / "data" / "slrclub"
slrclub_dir.mkdir(parents=True, exist_ok=True)

# Get existing slrclub files
existing = {f.stem for f in slrclub_dir.glob("*.json")}

# Get all seed cameras
seeds = []
for f in sorted(seeds_dir.glob("*.json")):
    if f.name == "all_cameras_seed.json":
        continue
    data = json.loads(f.read_text(encoding="utf-8"))
    seeds.append({"slug": f.stem, "brand": data.get("brand", ""), "model": data.get("model", "")})

# 1. Clean existing files
cleaned = 0
for f in slrclub_dir.glob("*.json"):
    data = json.loads(f.read_text(encoding="utf-8"))
    ct = data.get("critique_text", "")
    changed = False

    # Remove "Critique\n" prefix
    if ct.startswith("Critique\n"):
        ct = ct[len("Critique\n"):]
        changed = True

    # Remove 당첨자 발표 event section (more aggressive)
    for marker in ["당첨자 발표", "당첨자발표"]:
        idx = ct.find(marker)
        if idx > 0:
            ct = ct[:idx].strip()
            changed = True

    # Remove event announcement patterns
    for marker in ["응모 방법", "경품 안내", "이벤트 기간", "댓글 이벤트"]:
        idx = ct.find(marker)
        if idx > 0:
            ct = ct[:idx].strip()
            changed = True

    if changed:
        data["critique_text"] = ct.strip()
        f.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        cleaned += 1

# 2. Create empty templates for missing cameras
missing = [s for s in seeds if s["slug"] not in existing]
for cam in missing:
    template = {
        "source": "slrclub",
        "camera_slug": cam["slug"],
        "camera_brand": cam["brand"],
        "camera_model": cam["model"],
        "scraped_at": "",
        "title": "",
        "critique_text": "",
        "critique_page_no": None,
        "start_no": None,
        "page_count": None,
        "url": "",
    }
    out = slrclub_dir / f"{cam['slug']}.json"
    out.write_text(json.dumps(template, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"Cleaned {cleaned} existing files (removed event text)")
print(f"Created {len(missing)} empty templates")
print(f"Total: {len(existing) + len(missing)} files in data/slrclub/")
