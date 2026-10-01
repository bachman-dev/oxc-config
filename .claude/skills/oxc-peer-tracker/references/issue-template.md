# Tracking issue template

**Title:** `Track oxlint/oxfmt changes between peerDependencies and devDependencies`

Copy the body below and fill in the `{placeholders}`. Keep every heading, in this order, even when a category is empty. For an empty category write `- [x] **None.** {how you know, for example "the rule catalog diff shows no added rules"}`.

Category definitions:

| Category                                  | What goes in it                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New lint rules                            | Rules added to the catalog                                                                                                                             |
| New or changed lint rule options          | Rule option additions, removals or default changes from the oxlint schema diff                                                                         |
| Rule category and fix-type changes        | Recategorized rules, fix ↔ suggestion ↔ none changes, type-aware or on-by-default changes, removed or renamed rules                                    |
| Behavior changes in rules we enable       | Fixes or features that change what a rule we configure (or get through `correctness`) reports or autofixes                                             |
| Behavior changes in rules we don't enable | The same, for rules that are off or belong to plugins we don't use                                                                                     |
| Linter CLI, config and engine behavior    | CLI flags, config discovery, type-aware/type-check modes, LSP, parser and JS-plugin changes                                                            |
| Performance-only changes                  | Changes with no intended behavior change, as one item in a collapsed section                                                                           |
| New format settings                       | New or changed keys in the oxfmt schema diff                                                                                                           |
| Formatting behavior changes               | Split by subject (Markdown, JSDoc, comments and JS/TS layout, CSS/YAML/GraphQL and so on); relate each item to our settings in `src/oxfmt/settings.ts` |
| Bundled Prettier and CLI behavior         | Prettier version bumps, config discovery and CLI changes                                                                                               |

Release link per version: the combined `apps_v<oxlint version>` tag when oxlint and oxfmt shipped together, otherwise `oxlint_v<version>` / `oxfmt_v<version>`.

```markdown
<!-- oxc-peer-tracker -->

This issue tracks the oxlint and oxfmt changes between the minimum versions in our `peerDependencies` and the versions in our `devDependencies`. We work through these items before raising the peer ranges. Whenever this issue is refreshed, it compares the current `peerDependencies` floor against the current `devDependencies`.

To refresh it, ask Claude to use the `oxc-peer-tracker` skill (`.claude/skills/oxc-peer-tracker/SKILL.md`). Do this whenever the oxlint or oxfmt dev or peer versions change, and before raising the peer ranges.

**Last updated:** {YYYY-MM-DD}

| Package | `peerDependencies` | `devDependencies` | Releases covered |
| ------- | ------------------ | ----------------- | ---------------- |
| oxlint  | `{range}`          | `{version}`       | {release links}  |
| oxfmt   | `{range}`          | `{version}`       | {release links}  |

Sources: the GitHub release notes above, plus the `apps/oxlint`, `apps/oxfmt`, `crates/oxc_linter` and `crates/oxc_formatter*` changelogs in `oxc-project/oxc`, and `scripts/oxc-version-diff.ts`. The script compares the rule catalog (`oxlint --rules`) and both packages' `configuration_schema.json` between the peer-floor and installed versions.

Items are marked **(we enable)** when the rule is turned on by our config, either explicitly in `src/oxlint/rules/*.ts` or through the `correctness` category.

---

## oxlint

### New lint rules

- [ ] **`{plugin/rule}`** ({version}, [#{pr}](https://github.com/oxc-project/oxc/pull/{pr})): category `{category}`, {type-aware or not}, {fixer}. {What it flags.} Decide whether to enable it in `src/oxlint/rules/{plugin}.ts`.

### New or changed lint rule options

### Rule category and fix-type changes

### Behavior changes in rules we enable

### Behavior changes in rules we don't enable

### Linter CLI, config and engine behavior

<details>
<summary>Performance-only changes (no action expected)</summary>

- [ ] Skimmed and nothing needs to change ({PR links})

</details>

---

## oxfmt

### New format settings

### Formatting behavior changes: {subject}

### Bundled Prettier and CLI behavior

---

## Before bumping the peer ranges

- [ ] Address or consciously skip every item above.
- [ ] Bump `peerDependencies` to `"oxlint": "^{dev version}"` and `"oxfmt": ">={dev version} <1"`. Use the current devDependency versions if they've moved on.
- [ ] Run `pnpm all` and check that `src/oxfmt/README.md` / `src/oxlint/README.md` regenerate cleanly.
- [ ] Bump the package version and note the new minimum versions in the release notes.

**Baseline as of this update:** {results of `pnpm test`, `pnpm lint`, `pnpm format:check`, and the script's peer-floor oxfmt check}

---

_Generated by [Claude Code](https://claude.ai/code)_
```
