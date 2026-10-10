#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
#
# Installs the Node.js and pnpm versions pinned by package.json `devEngines`
# (resolved through mise, as configured in mise.toml), puts them on PATH for
# the rest of the session, then installs dependencies and builds the package.
#
# Works with or without the cloud environment's setup script: if mise isn't
# already installed, it's bootstrapped with the official installer.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

mise_bin_dir="$HOME/.local/bin"
mise_shims_dir="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims"
mise_config="${MISE_CONFIG_DIR:-$HOME/.config/mise}/config.toml"
export PATH="$mise_shims_dir:$mise_bin_dir:$PATH"

if ! command -v mise >/dev/null 2>&1; then
  # Needs mise.run on the environment's network allowlist.
  curl -fsSL --retry 3 https://mise.run | MISE_INSTALL_PATH="$mise_bin_dir/mise" sh >&2
fi

if [ ! -f "$mise_config" ]; then
  mkdir -p "$(dirname "$mise_config")"
  # The default pnpm backend (aqua) verifies GitHub artifact attestations
  # through the GitHub API, which the cloud GitHub proxy only allows for the
  # session's own repos, so install pnpm from npm instead.
  cat >"$mise_config" <<'EOF'
[settings]
npm.package_manager = "npm"

[tool_alias]
pnpm = "npm:pnpm"
EOF
fi

mise trust --quiet "$CLAUDE_PROJECT_DIR" >&2
mise install --yes >&2

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$mise_shims_dir:$mise_bin_dir:\$PATH\"" >>"$CLAUDE_ENV_FILE"
fi

pnpm install >&2
# oxlint.config.ts and oxfmt.config.ts import this package's own build output.
pnpm build >&2

echo "Toolchain from mise: node $(node --version), pnpm $(pnpm --version)"
