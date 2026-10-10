#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
#
# Installs the Node.js and pnpm versions pinned by package.json `devEngines`
# (resolved through mise, as configured in mise.toml), puts them on PATH for
# the rest of the session, then installs dependencies and builds the package.
#
# Works with or without the cloud environment's setup script: if mise isn't
# already installed, it's bootstrapped from its GitHub release.
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
  case "$(uname -m)" in
    x86_64) arch=x64 ;;
    aarch64 | arm64) arch=arm64 ;;
    *) echo "Unsupported architecture: $(uname -m)" >&2 && exit 1 ;;
  esac
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  # mise.run and mise.jdx.dev aren't on the cloud network allowlist, but the
  # npm registry and GitHub release downloads are. npm runs outside the repo
  # so it doesn't trip over this package's devEngines.
  version="${MISE_INSTALL_VERSION:-$(cd "$tmp" && npm view @jdxcode/mise version)}"
  asset="mise-v${version}-linux-${arch}"
  curl -fsSL --retry 3 -o "$tmp/$asset" "https://github.com/jdx/mise/releases/download/v${version}/${asset}"
  curl -fsSL --retry 3 -o "$tmp/SHASUMS256.txt" "https://github.com/jdx/mise/releases/download/v${version}/SHASUMS256.txt"
  (cd "$tmp" && grep -E " \./${asset}\$" SHASUMS256.txt | sha256sum -c --quiet -) >&2
  install -D -m 755 "$tmp/$asset" "$mise_bin_dir/mise"
fi

if [ ! -f "$mise_config" ]; then
  mkdir -p "$(dirname "$mise_config")"
  # The default pnpm backend (aqua) and the mise versions host both call
  # hosts the cloud network blocks, so install pnpm from npm instead.
  cat >"$mise_config" <<'EOF'
[settings]
use_versions_host = false
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
