#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$ROOT_DIR/.git/hooks"

if [[ ! -d "$ROOT_DIR/.git" ]]; then
  echo "Not a git repository. Run: git init"
  exit 1
fi

mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/post-commit" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# After each commit, open staged HTML pages so Figma capture.js can update frames.
# If you want to disable temporarily:
#   export SKIP_FIGMA_SYNC=1

if [[ "${SKIP_FIGMA_SYNC:-}" == "1" ]]; then
  exit 0
fi

ROOT_DIR="$(git rev-parse --show-toplevel)"
node "$ROOT_DIR/scripts/figma-sync.mjs" || true
EOF

chmod +x "$HOOKS_DIR/post-commit"

echo "Installed git hook: .git/hooks/post-commit"
echo "It will run: node scripts/figma-sync.mjs"
