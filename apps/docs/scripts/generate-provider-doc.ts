import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

// Get the directory of this script file
const scriptDir = path.join(process.cwd(), "scripts");

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

// Helper to create readline interface
function createReadline(): readline.Interface {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
}

// Helper to prompt user with optional default value
function prompt(
	rl: readline.Interface,
	question: string,
	defaultValue?: string,
): Promise<string> {
	return new Promise((resolve) => {
		const promptText = defaultValue
			? `${question} [${defaultValue}]: `
			: `${question}: `;

		rl.question(promptText, (answer) => {
			resolve(answer.trim() || defaultValue || "");
		});
	});
}

// Helper functions to derive values
function deriveProviderLowercase(providerName: string): string {
	return providerName.toLowerCase();
}

function deriveEnvVarName(providerName: string): string {
	return `${providerName.toUpperCase()}_API_KEY`;
}

function deriveModelString(modelMethod: string): string {
	// Convert snake_case method to kebab-case string
	// e.g., "command_r_plus" -> "command-r-plus"
	return modelMethod.replace(/_/g, "-");
}

function deriveOutputFilename(providerLowercase: string): string {
	return `${providerLowercase}.mdx`;
}

// Main function to gather provider data
async function gatherProviderData(): Promise<ProviderData> {
	const rl = createReadline();
	const data = {} as ProviderData;

	try {
		console.log("\n🚀 Provider Documentation Generator\n");
		console.log("This will create a new provider documentation file.");
		console.log("Press Enter to accept suggested values.\n");

		// 1. Provider name (no default)
		data.PROVIDER_NAME = await prompt(
			rl,
			"Provider name (e.g., Anthropic, Google, OpenAI)",
		);
		if (!data.PROVIDER_NAME) {
			throw new Error("Provider name is required");
		}

		// 2. Provider lowercase (suggested)
		const suggestedLowercase = deriveProviderLowercase(data.PROVIDER_NAME);
		data.PROVIDER_LOWERCASE = await prompt(
			rl,
			"Provider lowercase",
			suggestedLowercase,
		);

		// 3. Environment variable (suggested)
		const suggestedEnvVar = deriveEnvVarName(data.PROVIDER_NAME);
		data.ENV_VAR_NAME = await prompt(
			rl,
			"Environment variable name",
			suggestedEnvVar,
		);

		// 4. Example model method (no default)
		data.EXAMPLE_MODEL_METHOD = await prompt(
			rl,
			"Example model method (e.g., gpt_5, claude_3_5_sonnet)",
		);
		if (!data.EXAMPLE_MODEL_METHOD) {
			throw new Error("Example model method is required");
		}

		// 5. Model string (suggested from method)
		const suggestedModelString = deriveModelString(data.EXAMPLE_MODEL_METHOD);
		data.EXAMPLE_MODEL_STRING = await prompt(
			rl,
			"Model string (kebab-case)",
			suggestedModelString,
		);

		// 6. Model type example (no default)
		data.MODEL_TYPE_EXAMPLE = await prompt(
			rl,
			"Model type example (PascalCase, e.g., Gpt5, Claude35Sonnet)",
		);
		if (!data.MODEL_TYPE_EXAMPLE) {
			throw new Error("Model type example is required");
		}

		// 7. Base URL (no default)
		data.DEFAULT_BASE_URL = await prompt(
			rl,
			"Default base URL (e.g., https://api.openai.com)",
		);
		if (!data.DEFAULT_BASE_URL) {
			throw new Error("Default base URL is required");
		}

		// 8. Output filename (suggested)
		const suggestedFilename = deriveOutputFilename(data.PROVIDER_LOWERCASE);
		data.OUTPUT_FILENAME = await prompt(
			rl,
			"Output filename",
			suggestedFilename,
		);

		return data;
	} finally {
		rl.close();
	}
}

// Replace placeholders in template
function replaceTemplate(template: string, data: ProviderData): string {
	let result = template;

	for (const [key, value] of Object.entries(data)) {
		if (key === "OUTPUT_FILENAME") continue; // Don't replace this in content
		const placeholder = `{{${key}}}`;
		result = result.split(placeholder).join(value);
	}

	return result;
}

// Check if file exists and confirm overwrite
async function confirmOverwrite(filePath: string): Promise<boolean> {
	if (!fs.existsSync(filePath)) {
		return true;
	}

	const rl = createReadline();
	try {
		console.log(`\n⚠️  File already exists: ${filePath}`);
		const answer = await prompt(rl, "Overwrite? (y/N)", "N");
		return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
	} finally {
		rl.close();
	}
}

// Main execution
async function main() {
	try {
		// Gather data from user
		const data = await gatherProviderData();

		// Read template
		const templatePath = path.join(
			scriptDir,
			"templates",
			"provider.mdx.template",
		);
		if (!fs.existsSync(templatePath)) {
			throw new Error(`Template file not found: ${templatePath}`);
		}
		const template = fs.readFileSync(templatePath, "utf-8");

		// Replace placeholders
		const content = replaceTemplate(template, data);

		// Determine output path
		const outputPath = path.join(
			scriptDir,
			"..",
			"content",
			"docs",
			"providers",
			data.OUTPUT_FILENAME,
		);

		// Check for existing file
		const shouldWrite = await confirmOverwrite(outputPath);
		if (!shouldWrite) {
			console.log("\n❌ Cancelled. No file was created.");
			process.exit(0);
		}

		// Write file
		fs.writeFileSync(outputPath, content, "utf-8");

		console.log(`\n✅ Successfully created: ${outputPath}`);
		console.log("\n📋 Next steps:");
		console.log("  1. Review the generated file");
		console.log("  2. Customize if needed");
		console.log(
			`  3. Add "${data.PROVIDER_LOWERCASE}" to apps/docs/content/docs/providers/meta.json (alphabetical order)`,
		);
		console.log(
			`  4. Add link to apps/docs/content/docs/(get-started)/index.mdx (alphabetical order)`,
		);
		console.log("\n💡 See scripts/README.md for detailed instructions\n");
	} catch (error) {
		console.error(
			"\n❌ Error:",
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
}

main();
