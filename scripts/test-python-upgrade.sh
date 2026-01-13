#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/test-python-upgrade.sh 3.14-slim
PY_VER=${1:-3.14-slim}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Target Python base: ${PY_VER}"

TMPDIR=$(mktemp -d)
failures=()

grep -R --line-number --null "^FROM python:" "$ROOT" | while IFS= read -r -d $'\0' match; do
  # match format: path:line:content (grep -n)
  filepath="${match%%:*}"
  dir=$(dirname "$filepath")
  name=$(basename "$dir")
  echo "\n=== Building service: $name (Dockerfile: $filepath) ==="

  tmpd="$TMPDIR/${name}"
  mkdir -p "$tmpd"
  cp -a "$dir/"* "$tmpd/" 2>/dev/null || true

  # Replace first FROM python:* with desired version
  awk -v ver="$PY_VER" 'BEGIN{replaced=0} { if(!replaced && match($0, /^FROM[[:space:]]+python:.*/)) { print "FROM python:" ver; replaced=1 } else print $0 }' "$filepath" > "$tmpd/Dockerfile"

  # Build image
  imagename="test-python-upgrade/${name}:${PY_VER//\//-}"
  if docker build --pull -t "$imagename" -f "$tmpd/Dockerfile" "$tmpd"; then
    echo "Built $imagename"
  else
    echo "FAILED building $imagename"
    failures+=("$imagename")
  fi
done

if [ ${#failures[@]} -ne 0 ]; then
  echo "\nBuild failures:" >&2
  for f in "${failures[@]}"; do
    echo " - $f" >&2
  done
  exit 2
fi

echo "\nAll builds succeeded for python:$PY_VER"
