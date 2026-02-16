import * as fs from "node:fs";
import * as path from "node:path";

const scriptDir = path.join(process.cwd(), "scripts");
const templatePath = path.join(scriptDir, "templates", "provider.mdx.template");
const docsProvidersDir = path.join(
	process.cwd(),
	"content",
	"docs",
	"providers",
);
const docsMetaPath = path.join(docsProvidersDir, "meta.json");

const IGNORED_FEATURES = new Set<string>([
	"openaicompatible", // Generic public adapter; not a provider-specific docs page.
]);
const INTERNAL_MODULE_DIRS = new Set<string>(["openai_chat_completions"]);

const NON_PROVIDER_FEATURES = new Set<string>([
	"full",
	"test-access",
	"prompt",
	"axum",
	"openaichatcompletions",
]);

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

interface ProviderSettings {
	displayName?: string;
	baseUrl: string;
	envVar: string;
}

interface FirstModel {
	typeName: string;
	modelName: string;
	constructorName: string;
}

interface ProviderSource {
	moduleDir: string;
	featureName: string;
	structName: string;
	settings: ProviderSettings;
	firstModel: FirstModel | null;
}

interface CliOptions {
	sourceRepoRoot?: string;
	sourceProvidersDir?: string;
	sourceCargoToml?: string;
	overwrite: boolean;
	dryRun: boolean;
}

interface ResolvedSourcePaths {
	sourceProvidersDir: string;
	sourceCargoToml: string;
}

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);

	const options: CliOptions = {
		overwrite: false,
		dryRun: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--source-repo-root" && args[i + 1]) {
			options.sourceRepoRoot = args[i + 1];
			i++;
			continue;
		}

		if (arg === "--source-providers-dir" && args[i + 1]) {
			options.sourceProvidersDir = args[i + 1];
			i++;
			continue;
		}

		if (arg === "--source-cargo-toml" && args[i + 1]) {
			options.sourceCargoToml = args[i + 1];
			i++;
			continue;
		}

		if (arg === "--overwrite") {
			options.overwrite = true;
			continue;
		}

		if (arg === "--dry-run") {
			options.dryRun = true;
		}
	}

	return options;
}

function resolveSourcePaths(options: CliOptions): ResolvedSourcePaths {
	const fromRootProviders = options.sourceRepoRoot
		? path.join(options.sourceRepoRoot, "src", "providers")
		: undefined;
	const fromRootCargo = options.sourceRepoRoot
		? path.join(options.sourceRepoRoot, "Cargo.toml")
		: undefined;

	const sourceProvidersDir = options.sourceProvidersDir ?? fromRootProviders;
	const sourceCargoToml = options.sourceCargoToml ?? fromRootCargo;

	if (!sourceProvidersDir || !sourceCargoToml) {
		throw new Error(
			[
				"Missing source path arguments.",
				"Provide either:",
				"  --source-repo-root /path/to/ai-sdk-rs",
				"or both:",
				"  --source-providers-dir /path/to/ai-sdk-rs/src/providers --source-cargo-toml /path/to/ai-sdk-rs/Cargo.toml",
			].join("\n"),
		);
	}

	return { sourceProvidersDir, sourceCargoToml };
}

function normalizeIdentifier(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseProviderFeatures(cargoToml: string): Set<string> {
	const start = cargoToml.indexOf("[features]");
	if (start === -1) {
		throw new Error("Could not find [features] section in Cargo.toml");
	}

	const rest = cargoToml.slice(start + "[features]".length);
	const nextSectionMatch = rest.match(/\n\[[^\]]+\]/);
	const section = nextSectionMatch
		? rest.slice(0, nextSectionMatch.index)
		: rest;

	const featureSet = new Set<string>();
	const featureLineRegex = /^\s*([a-zA-Z0-9_-]+)\s*=\s*\[/gm;

	for (const match of section.matchAll(featureLineRegex)) {
		const feature = match[1];
		if (NON_PROVIDER_FEATURES.has(feature)) {
			continue;
		}
		featureSet.add(feature);
	}

	return featureSet;
}

function parseStructName(modRs: string): string | null {
	const macroMatch = modRs.match(/openai_compatible_provider!\(\s*(\w+)\s*,/m);
	if (macroMatch) return macroMatch[1];

	const structMatch = modRs.match(/pub\s+struct\s+(\w+)\s*(?:<|\{)/m);
	if (structMatch) return structMatch[1];

	return null;
}

function parseOpenAICompatibleSettings(modRs: string): ProviderSettings | null {
	const match = modRs.match(
		/openai_compatible_settings!\(\s*\w+\s*,\s*\w+\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/m,
	);
	if (!match) return null;

	return {
		displayName: match[1],
		baseUrl: match[2],
		envVar: match[3],
	};
}

function parseSettingsFromSettingsRs(
	settingsRs: string,
	structName: string,
): ProviderSettings | null {
	const baseUrlMatch = settingsRs.match(/base_url:\s*"([^"]+)"/m);
	const envVarMatch = settingsRs.match(/std::env::var\("([^"]+)"\)/m);

	if (!baseUrlMatch || !envVarMatch) return null;

	return {
		displayName: structName,
		baseUrl: baseUrlMatch[1],
		envVar: envVarMatch[1],
	};
}

function parseFirstModel(capabilitiesRs: string): FirstModel | null {
	const match = capabilitiesRs.match(
		/(\w+)\s*\{\s*model_name:\s*"([^"]+)"\s*,\s*constructor_name:\s*(\w+)\s*,/m,
	);
	if (!match) return null;

	return {
		typeName: match[1],
		modelName: match[2],
		constructorName: match[3],
	};
}

function inferFeatureName(
	moduleDir: string,
	structName: string,
	features: Set<string>,
): string | null {
	const candidates = new Set<string>([
		moduleDir,
		moduleDir.replace(/_/g, "-"),
		moduleDir.replace(/[-_]/g, ""),
		structName.toLowerCase(),
		structName
			.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			.toLowerCase()
			.replace(/_/g, "-"),
	]);

	for (const candidate of candidates) {
		if (features.has(candidate)) {
			return candidate;
		}
	}

	const normalizedStruct = normalizeIdentifier(structName);
	const normalizedMatches = [...features].filter(
		(feature) => normalizeIdentifier(feature) === normalizedStruct,
	);

	if (normalizedMatches.length === 1) {
		return normalizedMatches[0];
	}

	return null;
}

function buildProviderData(source: ProviderSource): ProviderData {
	const firstModel = source.firstModel;
	return {
		PROVIDER_NAME: source.structName,
		PROVIDER_LOWERCASE: source.featureName,
		ENV_VAR_NAME: source.settings.envVar,
		EXAMPLE_MODEL_METHOD: firstModel?.constructorName ?? "model_name",
		EXAMPLE_MODEL_STRING: firstModel?.modelName ?? "your-model-name",
		MODEL_TYPE_EXAMPLE: firstModel?.typeName ?? "DynamicModel",
		DEFAULT_BASE_URL: source.settings.baseUrl,
		OUTPUT_FILENAME: `${source.featureName}.mdx`,
	};
}

function replaceTemplate(template: string, data: ProviderData): string {
	let result = template;

	for (const [key, value] of Object.entries(data)) {
		if (key === "OUTPUT_FILENAME") continue;
		result = result.split(`{{${key}}}`).join(value);
	}

	return result;
}

function collectProviderSlugsFromDocsDir(): string[] {
	if (!fs.existsSync(docsProvidersDir)) return [];

	const slugs = fs
		.readdirSync(docsProvidersDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
		.map((entry) => entry.name.replace(/\.mdx$/, ""))
		.sort((a, b) => a.localeCompare(b));

	const hasIndex = slugs.includes("index");
	const rest = slugs.filter((entry) => entry !== "index");
	return hasIndex ? ["index", ...rest] : rest;
}

function syncMetaJsonFromDocs(dryRun: boolean): {
	changed: boolean;
	pageCount: number;
} {
	if (!fs.existsSync(docsMetaPath)) {
		return { changed: false, pageCount: 0 };
	}

	const meta = JSON.parse(fs.readFileSync(docsMetaPath, "utf-8"));
	const nextPages = collectProviderSlugsFromDocsDir();
	const currentPages: string[] = Array.isArray(meta.pages) ? meta.pages : [];
	const changed = JSON.stringify(currentPages) !== JSON.stringify(nextPages);

	meta.pages = nextPages;

	if (changed && !dryRun) {
		fs.writeFileSync(docsMetaPath, `${JSON.stringify(meta, null, "\t")}\n`);
	}

	return { changed, pageCount: nextPages.length };
}

function discoverProviders(sourcePaths: ResolvedSourcePaths): {
	providers: ProviderSource[];
	ignored: string[];
	failed: string[];
} {
	const providers: ProviderSource[] = [];
	const ignored: string[] = [];
	const failed: string[] = [];

	if (!fs.existsSync(sourcePaths.sourceProvidersDir)) {
		throw new Error(
			`Providers directory not found: ${sourcePaths.sourceProvidersDir}`,
		);
	}
	if (!fs.existsSync(sourcePaths.sourceCargoToml)) {
		throw new Error(`Cargo.toml not found: ${sourcePaths.sourceCargoToml}`);
	}

	const cargoToml = fs.readFileSync(sourcePaths.sourceCargoToml, "utf-8");
	const providerFeatures = parseProviderFeatures(cargoToml);

	const dirs = fs
		.readdirSync(sourcePaths.sourceProvidersDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));

	for (const moduleDir of dirs) {
		if (INTERNAL_MODULE_DIRS.has(moduleDir)) {
			continue;
		}

		const modulePath = path.join(sourcePaths.sourceProvidersDir, moduleDir);
		const modPath = path.join(modulePath, "mod.rs");
		if (!fs.existsSync(modPath)) {
			failed.push(`${moduleDir} (missing mod.rs)`);
			continue;
		}

		const modRs = fs.readFileSync(modPath, "utf-8");
		const structName = parseStructName(modRs);
		if (!structName) {
			failed.push(`${moduleDir} (could not parse provider struct name)`);
			continue;
		}

		const featureName = inferFeatureName(
			moduleDir,
			structName,
			providerFeatures,
		);
		if (!featureName) {
			failed.push(`${moduleDir} (could not infer provider feature name)`);
			continue;
		}

		if (IGNORED_FEATURES.has(featureName)) {
			ignored.push(`${featureName} (${structName})`);
			continue;
		}

		const settingsFromMacro = parseOpenAICompatibleSettings(modRs);
		let settings = settingsFromMacro;

		if (!settings) {
			const settingsPath = path.join(modulePath, "settings.rs");
			if (fs.existsSync(settingsPath)) {
				const settingsRs = fs.readFileSync(settingsPath, "utf-8");
				settings = parseSettingsFromSettingsRs(settingsRs, structName);
			}
		}

		if (!settings) {
			failed.push(`${featureName} (could not parse provider settings)`);
			continue;
		}

		let firstModel: FirstModel | null = null;
		const capabilitiesPath = path.join(modulePath, "capabilities.rs");
		if (fs.existsSync(capabilitiesPath)) {
			const capabilitiesRs = fs.readFileSync(capabilitiesPath, "utf-8");
			firstModel = parseFirstModel(capabilitiesRs);
		}

		providers.push({
			moduleDir,
			featureName,
			structName,
			settings,
			firstModel,
		});
	}

	return { providers, ignored, failed };
}

async function main() {
	try {
		const options = parseArgs();
		const sourcePaths = resolveSourcePaths(options);

		if (!fs.existsSync(templatePath)) {
			throw new Error(`Template not found: ${templatePath}`);
		}

		const template = fs.readFileSync(templatePath, "utf-8");
		const { providers, ignored, failed } = discoverProviders(sourcePaths);

		console.log("\n🚀 Provider Documentation Generator (Core Extract Mode)\n");
		console.log(`Source providers dir: ${sourcePaths.sourceProvidersDir}`);
		console.log(`Source Cargo.toml:    ${sourcePaths.sourceCargoToml}`);
		console.log(`Overwrite existing:   ${options.overwrite ? "yes" : "no"}`);
		console.log(`Dry run:              ${options.dryRun ? "yes" : "no"}\n`);
		console.log(`Discovered providers: ${providers.length}`);

		const created: string[] = [];
		const skipped: string[] = [];

		for (const provider of providers) {
			const data = buildProviderData(provider);
			const outputPath = path.join(docsProvidersDir, data.OUTPUT_FILENAME);

			if (fs.existsSync(outputPath) && !options.overwrite) {
				skipped.push(data.PROVIDER_LOWERCASE);
				continue;
			}

			const content = replaceTemplate(template, data);
			if (!options.dryRun) {
				fs.writeFileSync(outputPath, content, "utf-8");
			}
			created.push(data.PROVIDER_LOWERCASE);
		}

		const metaSync = syncMetaJsonFromDocs(options.dryRun);

		console.log("\n--- Summary ---");
		console.log(`Created: ${created.length}`);
		console.log(`Skipped (already exists): ${skipped.length}`);
		console.log(`Ignored: ${ignored.length}`);
		console.log(`Failed: ${failed.length}`);
		if (metaSync.changed) {
			console.log(
				`Meta pages: ${metaSync.pageCount} (${options.dryRun ? "would update" : "updated"})`,
			);
		} else {
			console.log(`Meta pages: ${metaSync.pageCount} (unchanged)`);
		}
		if (skipped.length > 0 && !options.overwrite) {
			console.log(
				"Tip: use --overwrite to refresh existing docs from source values.",
			);
		}

		if (ignored.length > 0) {
			console.log("\nIgnored list:");
			for (const item of ignored) {
				console.log(`  - ${item}`);
			}
		}

		if (failed.length > 0) {
			console.log("\nFailed list:");
			for (const item of failed) {
				console.log(`  - ${item}`);
			}
		}

		if (created.length > 0) {
			console.log("\nGenerated provider docs:");
			for (const slug of created) {
				console.log(`  - ${slug}.mdx`);
			}
		}

		console.log("");
	} catch (error) {
		console.error(
			"\n❌ Error:",
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
}

main();
