#!/bin/bash
# ===========================================================
# Bulk scraper — reads slugs from bulk_slugs.txt, skips
# cameras already in data/seeds/, scrapes in batches of 5
# ===========================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SEEDS_DIR="$PROJECT_DIR/data/seeds"
SLUG_FILE="$SCRIPT_DIR/bulk_slugs.txt"
LOG_FILE="$PROJECT_DIR/data/scrape_log.txt"

echo "=== Bulk Camera Scrape — $(date) ===" | tee "$LOG_FILE"

# Collect slugs, skip comments / blanks / already-scraped
declare -a TODO=()
while IFS= read -r line; do
  line="${line%%#*}"        # strip comments
  line="${line// /}"        # strip spaces
  [[ -z "$line" ]] && continue

  # Convert slug to the filename format the scraper uses
  # e.g. Sony-Alpha-A9-III  →  sony-alpha-a9-iii
  fname=$(echo "$line" | tr '[:upper:]' '[:lower:]' | sed 's/-\+/-/g')

  if [[ -f "$SEEDS_DIR/${fname}.json" ]]; then
    echo "  ⏭  Skip (exists): $line" | tee -a "$LOG_FILE"
  else
    TODO+=("$line")
  fi
done < "$SLUG_FILE"

TOTAL=${#TODO[@]}
echo "" | tee -a "$LOG_FILE"
echo "📋  Total to scrape: $TOTAL cameras" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [[ $TOTAL -eq 0 ]]; then
  echo "✅  Nothing new to scrape." | tee -a "$LOG_FILE"
  exit 0
fi

# Scrape in batches of 5 to avoid overwhelming the site
BATCH=5
SUCCESS=0
FAIL=0
for (( i=0; i<TOTAL; i+=BATCH )); do
  BATCH_SLUGS=("${TODO[@]:i:BATCH}")
  BATCH_NUM=$(( i/BATCH + 1 ))
  BATCH_TOTAL=$(( (TOTAL+BATCH-1)/BATCH ))

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
  echo "  Batch $BATCH_NUM / $BATCH_TOTAL  (${#BATCH_SLUGS[@]} cameras)" | tee -a "$LOG_FILE"
  echo "  ${BATCH_SLUGS[*]}" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

  if python3 "$SCRIPT_DIR/cameradecision_scraper.py" \
       --slugs "${BATCH_SLUGS[@]}" --korean 2>&1 | tee -a "$LOG_FILE"; then
    SUCCESS=$(( SUCCESS + ${#BATCH_SLUGS[@]} ))
  else
    echo "  ⚠  Some cameras in this batch may have failed." | tee -a "$LOG_FILE"
    # Count actual successes from seeds dir
    for s in "${BATCH_SLUGS[@]}"; do
      fn=$(echo "$s" | tr '[:upper:]' '[:lower:]' | sed 's/-\+/-/g')
      [[ -f "$SEEDS_DIR/${fn}.json" ]] && SUCCESS=$(( SUCCESS + 1 )) || FAIL=$(( FAIL + 1 ))
    done
  fi

  # Polite delay between batches (3 seconds)
  if (( i + BATCH < TOTAL )); then
    echo "  ⏳  Waiting 3s before next batch..." | tee -a "$LOG_FILE"
    sleep 3
  fi
done

echo "" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "  BULK SCRAPE COMPLETE" | tee -a "$LOG_FILE"
echo "  ✅ Success: ~$SUCCESS  ❌ Failed: ~$FAIL" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════" | tee -a "$LOG_FILE"
