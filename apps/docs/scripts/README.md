# Provider Documentation Generator

This script generates provider docs in `apps/docs/content/docs/providers` by extracting provider metadata from a source `ai-sdk-rs` repository.

## Usage

Run from `apps/docs`:

```bash
pnpm gen:provider --source-repo-root /path/to/ai-sdk-rs
```

Or provide source paths explicitly:

```bash
pnpm gen:provider \
  --source-providers-dir /path/to/ai-sdk-rs/src/providers \
  --source-cargo-toml /path/to/ai-sdk-rs/Cargo.toml
```

## Common Commands

Dry-run (no file writes):

```bash
pnpm gen:provider --source-repo-root /path/to/ai-sdk-rs --dry-run
```

Refresh existing docs from source (overwrite):

```bash
pnpm gen:provider --source-repo-root /path/to/ai-sdk-rs --overwrite
```

## CLI Arguments

| Argument | Description | Required |
| --- | --- | --- |
| `--source-repo-root` | Root of the source `ai-sdk-rs` repo | Yes, unless both explicit source paths are provided |
| `--source-providers-dir` | Source providers directory | Yes if `--source-repo-root` is not used |
| `--source-cargo-toml` | Source Cargo.toml path | Yes if `--source-repo-root` is not used |
| `--dry-run` | Discover + render in memory without writing files | No |
| `--overwrite` | Overwrite existing provider docs | No |

## What It Extracts

For each provider, the script extracts:

- Provider feature name from source `Cargo.toml` `[features]`
- Provider type name from provider `mod.rs`
- Default base URL and env var:
  - from `openai_compatible_settings!(...)` in `mod.rs`, or
  - from `settings.rs` defaults
- Example model type/method/string from `capabilities.rs`

## Ignore Rules

The script intentionally ignores:

- `OpenAICompatible` (`openaicompatible`)

## Output Behavior

- Generates/updates `content/docs/providers/{feature}.mdx` from `scripts/templates/provider.mdx.template`
- Updates `content/docs/providers/meta.json` automatically
- Skips existing files unless `--overwrite` is passed

## Troubleshooting

- If values look stale, run again with `--overwrite`.
- If you get a missing source path error, pass `--source-repo-root` or both explicit source paths.

## Files

- `scripts/generate-provider-doc.ts` - source-driven generator
- `scripts/templates/provider.mdx.template` - provider doc template
- `scripts/README.md` - this guide
