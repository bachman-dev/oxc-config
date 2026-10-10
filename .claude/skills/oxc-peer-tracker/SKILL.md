---
name: oxc-peer-tracker
description: Create or refresh the GitHub issue that tracks oxlint and oxfmt changes between this package's peerDependencies floor and its devDependencies (new format settings, new lint rules, rule option/category/fix changes, and lint/format behavior changes). Use when the oxlint or oxfmt version changes in package.json devDependencies or peerDependencies, when asked to update or refresh the oxlint/oxfmt tracking issue, or before bumping the oxlint/oxfmt peer ranges.
---

# oxlint/oxfmt peer-bump tracker

This repository publishes shared oxlint and oxfmt configs. Renovate keeps `devDependencies` on the latest oxlint and oxfmt, while `peerDependencies` stays on an older floor until we're ready to raise it. A single GitHub issue lists everything that changed between the two, as categorized checklists, so we know what to implement or address before raising the peer ranges. This skill creates that issue or refreshes it.

The issue always compares the **current `peerDependencies` floor** (the lowest version the range allows) against the **current `devDependencies` version**, covering every release in the half-open range `(peer floor, dev version]`.

## Running unattended

This skill also runs as a scheduled Claude Code Routine in a cloud session, with nobody watching. In that case:

- Don't stop to ask questions. Where a step would need a decision, take the conservative option (for example, leave the issue open, or keep an existing item as it is) and mention it in the final summary.
- The only output is the issue body. Don't edit files in the repository, commit, push or open a pull request. `pnpm build` writes to `dist`, which is ignored.
- Use the GitHub MCP tools for issues in `bachman-dev/oxc-config`. They can't read `oxc-project/oxc` because it isn't in the session's repository scope, and `gh` may not be signed in. Read oxc releases and source as steps 3 and 4 describe.
- With the default network policy, `registry.npmjs.org`, `raw.githubusercontent.com` and `git` access to `github.com` work, and WebFetch can read `github.com` pages. `oxc.rs` is blocked, so use the source fallback in step 4.
- If a source can't be reached, carry on with the others and name the gap in the issue's baseline line and in the final summary. Don't fill it in from memory.

## 1. Find the tracking issue

Search the open issues in `bachman-dev/oxc-config` for one whose body contains the marker `<!-- oxc-peer-tracker -->`. If none has it, fall back to the title "Track oxlint/oxfmt changes between peerDependencies and devDependencies". Read the full current body, since checked boxes and human notes must survive the refresh (see step 5). If no issue exists, create one with that title in step 7.

If the issue's version table already matches the `peerDependencies` ranges and `devDependencies` versions in `package.json` for both tools, the release range hasn't changed, so the items can't have either. Skip steps 3 and 4. Run step 2 and the baseline commands from step 4, then update only "Last updated" and the baseline line. Leave every item as it is.

## 2. Gather the mechanical diff

```sh
pnpm install --frozen-lockfile
pnpm build
node ./scripts/oxc-version-diff.ts > /tmp/oxc-version-diff.md
```

The script reads both versions from `package.json` and installs the peer-floor oxlint and oxfmt into a temporary directory. It prints a Markdown report with these sections:

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

The changelogs are **not** complete. Some fixes appear only in the GitHub release notes. For every version in range, read the release page at `https://github.com/oxc-project/oxc/releases/tag/<tag>`:

- When oxlint and oxfmt shipped together, the combined tag is `apps_v<oxlint version>`, for example `apps_v1.84.0` holds oxlint 1.84.0 and oxfmt 0.69.0.
- Otherwise the tags are `oxlint_v<version>` and `oxfmt_v<version>`.
- If a tag 404s, try the other form, or find the tag on `https://github.com/oxc-project/oxc/releases`.
- To skip the guessing, list the real tags first: `git ls-remote --tags https://github.com/oxc-project/oxc | grep -E 'apps_v|oxlint_v|oxfmt_v'`.

Fetch each page with WebFetch and ask for the notes verbatim, including commit hashes and PR numbers. Any rule that appears in the release notes but not in the script's status section gets a re-run of the script with that rule as an argument.

## 4. Look closer where it matters

- **New rules:** read `https://oxc.rs/docs/guide/usage/linter/rules/<plugin>/<rule>.html`, or the rule's doc comment in `oxc-project/oxc` under `crates/oxc_linter/src/rules/`, so you can describe what the rule flags in one sentence. When `oxc.rs` is unreachable, fetch the source from `https://raw.githubusercontent.com/oxc-project/oxc/main/crates/oxc_linter/src/rules/<plugin>/<rule_in_snake_case>.rs`, or `<rule_in_snake_case>/mod.rs` if that 404s. For a new type-aware rule, check that the installed `oxlint-tsgolint` supports it: enable it on a scratch file outside the repo and confirm it reports.
- **Rules we enable:** compare the change against our settings in `src/oxlint/rules/*.ts`, including options, overrides, admonishments and `changes` notes. Say concretely how it affects us, for example "this affects our `destructuredArrayIgnorePattern: "^_"`".
- **Formatting changes:** relate them to our settings in `src/oxfmt/settings.ts`, for example `experimentalOperatorPosition`, `jsdoc` sub-options and `proseWrap`.
- **Baseline:** run `pnpm test`, `pnpm lint` and `pnpm format:check` against the installed devDependencies and record the results.

## 5. Merge with the existing issue

- Drop items whose version is now at or below the peer floor, because they've been absorbed by a peer bump.
- Keep each remaining item's checked state and any notes people added under it. Match items by rule or setting name and PR number, not by exact wording.
- Add new items unchecked.
- If the item for a rule or setting changed again in a newer release, update that one item. Don't add a duplicate.
- Keep "Last updated" set to today's date.

If the peer floor equals the dev version for both tools, nothing is pending. Replace the checklists with a short "Nothing pending: peerDependencies match devDependencies" note and keep the marker, the version table and the refresh instructions. Leave the issue open unless the user asks to close it.

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

Update the issue body in place, or create the issue if none exists. Use the GitHub MCP `issue_write` tool (`method: "update"`) or `gh issue edit <n> --body-file <file>`. Don't post a comment for each refresh; the body is the record. Afterwards, tell the user what changed since the previous version of the body: items added, items dropped because the peer floor moved, and anything that newly needs a decision. When running unattended, put this summary in your final message, together with a link to the issue and any source you couldn't reach. Say "No changes" if only the date and baseline moved.
