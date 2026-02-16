import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO = "lazy-hq/aisdk";
const DEFAULT_REF = "feat/macro-based-openai-compatablity";
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}`;

const scriptDir = path.join(process.cwd(), "scripts");
const providersDir = path.join(
	process.cwd(),
	"content",
	"docs",
	"providers",
);
const templatePath = path.join(scriptDir, "templates", "provider.mdx.template");
const metaJsonPath = path.join(providersDir, "meta.json");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProviderEntry {
	featureName: string;
	moduleName: string;
	dirName: string;
	structName: string;
}

interface ProviderSettings {
	displayName: string;
	baseUrl: string;
	envVar: string;
}

interface FirstModel {
	typeName: string;
	modelName: string;
	constructorName: string;
}

interface ProviderData {
	PROVIDER_NAME: string;
	PROVIDER_LOWERCASE: string;
	ENV_VAR_NAME: string;
	EXAMPLE_MODEL_METHOD: string;
	EXAMPLE_MODEL_STRING: string;
	MODEL_TYPE_EXAMPLE: string;
	DEFAULT_BASE_URL: string;
	OUTPUT_FILENAME: string;
}

// ---------------------------------------------------------------------------
// Ref resolution
// ---------------------------------------------------------------------------

function resolveRef(arg: string | undefined): string {
	if (!arg) {
		return DEFAULT_REF;
	}

	// If the argument is all digits, treat it as a PR number
	if (/^\d+$/.test(arg)) {
		console.log(`Resolving PR #${arg} to branch name...`);
		try {
			const branch = execSync(
				`gh pr view ${arg} --repo ${REPO} --json headRefName -q .headRefName`,
				{ encoding: "utf-8" },
			).trim();

			if (!branch) {
				throw new Error(`Could not resolve PR #${arg} to a branch`);
			}
			console.log(`  Resolved to branch: ${branch}`);
			return branch;
		} catch (err) {
			throw new Error(
				`Failed to resolve PR #${arg}. Ensure 'gh' CLI is installed and authenticated.\n${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	return arg;
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

async function fetchFile(ref: string, filePath: string): Promise<string> {
	const url = `${RAW_BASE}/${encodeURIComponent(ref)}/${filePath}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
	}
	return res.text();
}

// ---------------------------------------------------------------------------
// Parsing providers/mod.rs
// ---------------------------------------------------------------------------

function parseCodegenBlock(modRs: string): ProviderEntry[] {
	const startMarker = "// [codegen]";
	const endMarker = "// [end-codegen]";

	const startIdx = modRs.indexOf(startMarker);
	const endIdx = modRs.indexOf(endMarker);

	if (startIdx === -1 || endIdx === -1) {
		throw new Error(
			"Could not find // [codegen] ... // [end-codegen] markers in src/providers/mod.rs",
		);
	}

	const block = modRs.slice(startIdx + startMarker.length, endIdx);
	const entries: ProviderEntry[] = [];

	// Match groups of cfg + optional path + pub mod + cfg + pub use
	// Each provider entry looks like:
	//   #[cfg(feature = "xxx")]
	//   #[path = "dir/mod.rs"]   <-- optional
	//   pub mod module_name;
	//   #[cfg(feature = "xxx")]
	//   pub use module_name::StructName;
	const entryRegex =
		/#\[cfg\(feature\s*=\s*"([^"]+)"\)\]\s*(?:#\[path\s*=\s*"([^"]+)"\]\s*)?pub\s+mod\s+(\w+);\s*#\[cfg\(feature\s*=\s*"[^"]+"\)\]\s*pub\s+use\s+\w+::(\w+);/g;

	const matches = block.matchAll(entryRegex);
	for (const match of matches) {
		const featureName = match[1];
		const pathAttr = match[2]; // e.g. "fireworks-ai/mod.rs" or undefined
		const moduleName = match[3];
		const structName = match[4];

		// Derive directory name from #[path] attribute if present
		let dirName = moduleName;
		if (pathAttr) {
			// "fireworks-ai/mod.rs" -> "fireworks-ai"
			const parts = pathAttr.split("/");
			if (parts.length >= 2) {
				dirName = parts[0];
			}
		}

		entries.push({ featureName, moduleName, dirName, structName });
	}

	return entries;
}

// ---------------------------------------------------------------------------
// Parsing provider mod.rs (openai_compatible_settings!)
// ---------------------------------------------------------------------------

function parseProviderSettings(modRs: string): ProviderSettings | null {
	// crate::openai_compatible_settings!(
	//     SettingsStruct,
	//     BuilderStruct,
	//     "DisplayName",
	//     "https://base.url",
	//     "ENV_VAR"
	// );
	const regex =
		/openai_compatible_settings!\(\s*\w+\s*,\s*\w+\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/;
	const match = modRs.match(regex);
	if (!match) return null;

	return {
		displayName: match[1],
		baseUrl: match[2],
		envVar: match[3],
	};
}

// ---------------------------------------------------------------------------
// Parsing capabilities.rs (first model entry)
// ---------------------------------------------------------------------------

function parseFirstModel(capabilitiesRs: string): FirstModel | null {
	// Match the first model entry in model_capabilities! { ... models: { ... } }
	const regex =
		/(\w+)\s*\{\s*model_name:\s*"([^"]+)"\s*,\s*constructor_name:\s*(\w+)\s*,/;
	const match = capabilitiesRs.match(regex);
	if (!match) return null;

	return {
		typeName: match[1],
		modelName: match[2],
		constructorName: match[3],
	};
}

// ---------------------------------------------------------------------------
// Template rendering (same logic as generate-provider-doc.ts)
// ---------------------------------------------------------------------------

function replaceTemplate(template: string, data: ProviderData): string {
	let result = template;
	for (const [key, value] of Object.entries(data)) {
		if (key === "OUTPUT_FILENAME") continue;
		const placeholder = `{{${key}}}`;
		result = result.split(placeholder).join(value);
	}
	return result;
}

// ---------------------------------------------------------------------------
// meta.json management
// ---------------------------------------------------------------------------

function updateMetaJson(newSlugs: string[]): void {
	if (newSlugs.length === 0) return;

	const meta = JSON.parse(fs.readFileSync(metaJsonPath, "utf-8"));
	const pages: string[] = meta.pages ?? [];

	for (const slug of newSlugs) {
		if (!pages.includes(slug)) {
			pages.push(slug);
		}
	}

	// Sort alphabetically, but keep "index" first
	const hasIndex = pages.includes("index");
	const rest = pages.filter((p: string) => p !== "index").sort();
	meta.pages = hasIndex ? ["index", ...rest] : rest;

	fs.writeFileSync(metaJsonPath, `${JSON.stringify(meta, null, "\t")}\n`, "utf-8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const ref = resolveRef(process.argv[2]);
	console.log(`\nSyncing OpenAI-compatible provider docs from ${REPO}@${ref}\n`);

	// 1. Read template
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template not found: ${templatePath}`);
	}
	const template = fs.readFileSync(templatePath, "utf-8");

	// 2. Fetch and parse mod.rs
	console.log("Fetching src/providers/mod.rs...");
	const modRs = await fetchFile(ref, "src/providers/mod.rs");
	const entries = parseCodegenBlock(modRs);
	console.log(`Found ${entries.length} OpenAI-compatible providers in codegen block\n`);

	if (entries.length === 0) {
		console.log("No providers found. Nothing to do.");
		return;
	}

	// 3. Process each provider
	const created: string[] = [];
	const skipped: string[] = [];
	const failed: string[] = [];

	for (const entry of entries) {
		const outputFilename = `${entry.featureName}.mdx`;
		const outputPath = path.join(providersDir, outputFilename);

		// Skip existing docs
		if (fs.existsSync(outputPath)) {
			skipped.push(entry.featureName);
			continue;
		}

		try {
			// Fetch provider mod.rs
			const providerModRs = await fetchFile(
				ref,
				`src/providers/${entry.dirName}/mod.rs`,
			);
			const settings = parseProviderSettings(providerModRs);
			if (!settings) {
				console.log(
					`  [SKIP] ${entry.featureName}: could not parse openai_compatible_settings!`,
				);
				failed.push(entry.featureName);
				continue;
			}

			// Fetch capabilities.rs
			let firstModel: FirstModel | null = null;
			try {
				const capRs = await fetchFile(
					ref,
					`src/providers/${entry.dirName}/capabilities.rs`,
				);
				firstModel = parseFirstModel(capRs);
			} catch {
				// capabilities.rs may not exist; we'll derive fallback values
			}

			// Build template data
			const data: ProviderData = {
				PROVIDER_NAME: entry.structName,
				PROVIDER_LOWERCASE: entry.featureName,
				ENV_VAR_NAME: settings.envVar,
				EXAMPLE_MODEL_METHOD:
					firstModel?.constructorName ??
					`${entry.moduleName.toLowerCase()}_default`,
				EXAMPLE_MODEL_STRING:
					firstModel?.modelName ??
					entry.featureName,
				MODEL_TYPE_EXAMPLE:
					firstModel?.typeName ?? entry.structName,
				DEFAULT_BASE_URL: settings.baseUrl,
				OUTPUT_FILENAME: outputFilename,
			};

			// Render and write
			const content = replaceTemplate(template, data);
			fs.writeFileSync(outputPath, content, "utf-8");
			created.push(entry.featureName);
			console.log(`  [CREATED] ${outputFilename}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log(`  [FAIL] ${entry.featureName}: ${msg}`);
			failed.push(entry.featureName);
		}
	}

	// 4. Update meta.json
	if (created.length > 0) {
		updateMetaJson(created);
		console.log(`\nUpdated meta.json with ${created.length} new entries`);
	}

	// 5. Summary
	console.log("\n--- Summary ---");
	console.log(`  Created: ${created.length}`);
	console.log(`  Skipped (already exist): ${skipped.length}`);
	if (failed.length > 0) {
		console.log(`  Failed:  ${failed.length} (${failed.join(", ")})`);
	}
	console.log("");

	if (created.length > 0) {
		console.log("Next steps:");
		console.log("  1. Review the generated files in content/docs/providers/");
		console.log(
			"  2. Optionally add links to content/docs/(get-started)/index.mdx",
		);
		console.log("");
	}
}

main().catch((err) => {
	console.error(
		"\nError:",
		err instanceof Error ? err.message : String(err),
	);
	process.exit(1);
});
