---
name: oxc-peer-tracker
description: Create or refresh the GitHub issue that tracks oxlint and oxfmt changes between this package's peerDependencies floor and the latest oxlint and oxfmt releases tagged in oxc-project/oxc (new format settings, new lint rules, rule option/category/fix changes, lint/format behavior changes, and whether the latest releases would fail our CI). Use when a new oxlint or oxfmt release comes out, when the oxlint or oxfmt version changes in package.json peerDependencies or devDependencies, when asked to update or refresh the oxlint/oxfmt tracking issue, or before bumping the oxlint/oxfmt peer ranges.
---

# oxlint/oxfmt peer-bump tracker

This repository publishes shared oxlint and oxfmt configs. `peerDependencies` stays on an older floor until we're ready to raise it, Renovate moves `devDependencies` up to new oxlint and oxfmt releases on its usual schedule, and oxc ships new releases in between. A single GitHub issue lists everything that changed from the peer floor up to the latest release, as categorized checklists, so we know what to implement or address before raising the peer ranges, and which upcoming changes would fail CI before Renovate opens a pull request for them. This skill creates that issue or refreshes it.

The issue always compares the **current `peerDependencies` floor** (the lowest version the range allows) against the **latest release tagged in `oxc-project/oxc`** (the newest `oxlint_v<version>` and `oxfmt_v<version>` tags that are also published on npm), covering every release in the half-open range `(peer floor, latest release]`. The `devDependencies` versions don't bound the range; they only show which of those releases our CI already runs.

## Running unattended

This skill also runs as a scheduled Claude Code Routine in a cloud session, with nobody watching. In that case:

- The session may start on a `claude/…` branch instead of `main`. That's fine if `git diff origin/main` is empty; otherwise run `git checkout --detach origin/main` first.
- Don't stop to ask questions. Where a step would need a decision, take the conservative option (for example, leave the issue open, or keep an existing item as it is) and mention it in the final summary.
- The only output is the issue body. Don't edit files in the repository, commit, push or open a pull request. `pnpm build` writes to `dist`, which is ignored. The CI preview in step 4 runs in a throwaway `git worktree` in the scratchpad directory, which is fine; remove it when you're done.
- Use the GitHub MCP tools for issues in `bachman-dev/oxc-config`. They can't read `oxc-project/oxc` because it isn't in the session's repository scope, and `gh` may not be signed in. Read oxc releases and source as steps 3 and 4 describe.
- The skill needs `registry.npmjs.org`, `raw.githubusercontent.com`, `git` access to `github.com` and WebFetch access to `github.com` pages, all of which the default network policy allows. `oxc.rs` isn't on the default list. This repository's environment allows it, but if it's blocked, use the source fallback in step 4.
- If a source can't be reached, carry on with the others and name the gap in the issue's baseline line and in the final summary. Don't fill it in from memory.

## 1. Find the tracking issue

List the open issues in `bachman-dev/oxc-config` (GitHub MCP `list_issues` with `state: "OPEN"`) and pick the one whose body contains the marker `<!-- oxc-peer-tracker -->`. Don't use issue search for this, because GitHub search doesn't index HTML comments. If none has it, fall back to the title "Track oxlint/oxfmt changes between peerDependencies and the latest releases", or the older "Track oxlint/oxfmt changes between peerDependencies and devDependencies". Read the full current body, since checked boxes and human notes must survive the refresh (see step 5). If no issue exists, create one with that title in step 7.

After step 2, compare the issue's version table with the report's. If the `peerDependencies` ranges and latest releases match for both tools, the release range hasn't changed, so the items can't have either. Skip steps 3 and 4 except for the baseline and CI preview in step 4, then update only "Last updated", the `devDependencies` column, the "(not in devDependencies yet)" markers in the releases column, the baseline and the CI preview. If the CI preview turns up a new failure, add it as step 4 describes. Leave every item as it is.

## 2. Gather the mechanical diff

```sh
pnpm install --frozen-lockfile
pnpm build
node ./scripts/oxc-version-diff.ts > "${TMPDIR:-/tmp}/oxc-version-diff.md"
```

If the session has a scratchpad directory, write the report there instead. The script reads the peer floor and devDependency versions from `package.json`, lists the release tags in `oxc-project/oxc` with `git ls-remote` and takes the newest tagged version that's on npm as the latest release. It installs the peer-floor and latest oxlint and oxfmt into a temporary directory and prints a Markdown report with these sections:

- **Version table**: the `peerDependencies` range and floor, the `devDependencies` version and the latest release for each tool. Notes below the table say when a tag isn't on npm yet (that release is left out until it is) or when the tags couldn't be listed (the upper bound falls back to npm's `latest` dist-tag).
- **Releases in range**: every version in range with its GitHub release tag and link, marked "(not in devDependencies yet)" when our CI doesn't run it yet. Use these for the issue's version table and for step 3.
- **oxlint rule catalog changes**: added or removed rules, and changes to category, fix type (for example `fixable_fix` → `fixable_suggestion`), type-awareness and on-by-default status. Release notes often omit fix-type changes, so this section is the only reliable source for them.
- **oxlint / oxfmt configuration schema changes**: new or changed rule options and new or changed format settings. If the oxfmt section says "No changes", there are no new format settings.
- **Status of affected rules in our config**: for each rule in the catalog diff or the changelogs, whether we configure it (with severity and overrides), turn it on through the `correctness` category, or leave it off. Use this to mark items **(we enable)**; don't guess.
- **Formatting check with the peer-floor oxfmt**: whether the oldest supported oxfmt formats this repository differently from the installed one.
- **Changelog entries in range**: the matching sections of `apps/oxlint`, `apps/oxfmt`, `crates/oxc_linter` and `crates/oxc_formatter*` changelogs on `main`.

To get the status of extra rules, such as ones that appear only in the release notes, pass their keys as arguments. ESLint rules have no prefix:

```sh
node ./scripts/oxc-version-diff.ts typescript/no-unnecessary-parameter-property-assignment no-unused-vars
```

If the script can't reach `raw.githubusercontent.com`, it still prints the other sections. Read the changelogs some other way, for example with a sparse `git clone` of `oxc-project/oxc`.

## 3. Read the GitHub release notes

The changelogs are **not** complete. Some fixes appear only in the GitHub release notes. For every version in range, read the release page linked in the script's "Releases in range" section:

- When oxlint and oxfmt shipped together, the release is on the combined `apps_v<oxlint version>` tag, for example `apps_v1.84.0` holds oxlint 1.84.0 and oxfmt 0.69.0. Otherwise it's on `oxlint_v<version>` or `oxfmt_v<version>`. The script already picks the right one.
- If the script couldn't list the tags, list them yourself with `git ls-remote --tags https://github.com/oxc-project/oxc | grep -E 'apps_v|oxlint_v|oxfmt_v'`, or find them on `https://github.com/oxc-project/oxc/releases`. If a tag 404s, try the other form.

Fetch each page with WebFetch. WebFetch summarizes pages, so asking for the notes verbatim gets a condensed summary that drops entries. Ask for one line per entry instead, for example: "List every entry in the release notes body, one per line, as `<section> | <scope> | <entry text> | <PR number(s)> | <commit hash>`. Include every entry from every section, and don't skip or merge entries. At the end, give the total number of entries." Cite only PR numbers that appear in that list or in the script's changelog section. Any rule that appears in the release notes but not in the script's status section gets a re-run of the script with that rule as an argument.

## 4. Look closer where it matters

- **New rules:** read `https://oxc.rs/docs/guide/usage/linter/rules/<plugin>/<rule>.html`, or the rule's doc comment in `oxc-project/oxc` under `crates/oxc_linter/src/rules/`, so you can describe what the rule flags in one sentence. When `oxc.rs` is unreachable, fetch the source from `https://raw.githubusercontent.com/oxc-project/oxc/main/crates/oxc_linter/src/rules/<plugin>/<rule_in_snake_case>.rs`, or `<rule_in_snake_case>/mod.rs` if that 404s. For a new type-aware rule, check that the installed `oxlint-tsgolint` supports it: enable it on a scratch file outside the repo and confirm it reports.
- **Rules we enable:** compare the change against our settings in `src/oxlint/rules/*.ts`, including options, overrides, admonishments and `changes` notes. Say concretely how it affects us, for example "this affects our `destructuredArrayIgnorePattern: "^_"`".
- **Formatting changes:** relate them to our settings in `src/oxfmt/settings.ts`, for example `experimentalOperatorPosition`, `jsdoc` sub-options and `proseWrap`.
- **Baseline:** run `pnpm test`, `pnpm lint` and `pnpm format:check` against the installed devDependencies and record the results.
- **CI preview:** if the latest release of either tool is newer than our devDependencies, run the CI steps from `.github/workflows/pr.yml` against the latest releases in a throwaway worktree, so we learn about failures before Renovate's pull request does. Use the latest versions from the script's version table:

  ```sh
  preview="${TMPDIR:-/tmp}/oxc-latest-preview"
  git worktree add --detach "$preview" HEAD
  cd "$preview"
  pnpm add --save-dev --save-exact oxlint@<latest> oxfmt@<latest> oxlint-tsgolint@latest
  pnpm build
  pnpm test
  pnpm typecheck
  pnpm build:docs && git status --porcelain -- src
  pnpm format:check
  pnpm lint
  cd - && git worktree remove --force "$preview"
  ```

  Put the worktree in the scratchpad directory if there is one. pnpm may add the new versions to `minimumReleaseAgeExclude` in the worktree's `pnpm-workspace.yaml`; that's expected and is thrown away with the worktree. Run every step even when an earlier one fails, and record each result. Any `src/oxlint/README.md` / `src/oxfmt/README.md` changes from `pnpm build:docs` mean the regenerated docs would differ. For each failure, add or update the item it belongs to (for example, a rule option we set that the latest oxlint rejects) and say in it that it fails CI with the latest release. If both latest releases equal our devDependencies, skip this and say the preview matches the baseline.

## 5. Merge with the existing issue

- Drop items whose version is now at or below the peer floor, because they've been absorbed by a peer bump.
- Keep each remaining item's checked state and any notes people added under it. Match items by rule or setting name and PR number, not by exact wording.
- Add new items unchecked.
- If the item for a rule or setting changed again in a newer release, update that one item. Don't add a duplicate.
- Keep "Last updated" set to today's date.

If the peer floor equals the latest release for both tools, nothing is pending. Replace the checklists with a short "Nothing pending: peerDependencies match the latest releases" note and keep the marker, the version table and the refresh instructions. Leave the issue open unless the user asks to close it.

## 6. Write the body

Follow `references/issue-template.md` exactly. It has the section order, the category definitions and the item format. Rules:

- Every change is a `- [ ]` checklist item in exactly one category. Items that don't need action (plugins we don't use, rules we leave off) still get listed, marked "FYI only". Performance-only changes go into the collapsed performance section as a single item.
- Item format: **bold lead naming the rule or setting**, then (version, [#PR](https://github.com/oxc-project/oxc/pull/PR)), then one or two sentences on what changed and how it affects us. End with a "Decide whether …" or "Check …" action when there's something to do.
- Add **(we enable)** only when the script's status section says the rule is configured or on through `correctness`.
- Cite only versions and PR numbers you actually saw in the release notes or changelogs. For something found only in the catalog or schema diff, say "(found in the rule catalog diff, not in the release notes)" instead of a version.
- PR links always use the full `https://github.com/oxc-project/oxc/pull/<n>` URL. A bare `#n` would point at this repository.
- Use US English and plain, factual sentences. Don't speculate about impact you haven't checked.
- The body must start with the `<!-- oxc-peer-tracker -->` marker and end with the Claude Code attribution footer.

## 7. Publish

Update the issue body in place, or create the issue if none exists. Use the GitHub MCP `issue_write` tool (`method: "update"`) or `gh issue edit <n> --body-file <file>`. If the issue still has the older title, change it to the template's title in the same update. Don't post a comment for each refresh; the body is the record. Afterwards, tell the user what changed since the previous version of the body: items added, items dropped because the peer floor moved, anything that newly needs a decision, and any CI preview failures. When running unattended, put this summary in your final message, together with a link to the issue and any source you couldn't reach. Say "No changes" if only the date and baseline moved.
