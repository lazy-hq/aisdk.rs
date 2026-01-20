"use client";
import { Anthropic, Google, OpenAI } from "@lobehub/icons";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "fumadocs-ui/components/tabs";
import { Check, Copy, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useServerTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Hero() {
	const [copied, setCopied] = useState(false);
	const { resolvedTheme } = useTheme();
	const { serverTheme } = useServerTheme();
	const theme = resolvedTheme || serverTheme;
	const isDark = theme === "dark";

	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => setCopied(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [copied]);

	const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
	const overlayBackground = isDark
		? "radial-gradient(ellipse 120% 100% at 50% 0%, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)"
		: "radial-gradient(ellipse 120% 100% at 50% 0%, transparent 0%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.7) 100%)";

	return (
		<div className="hero-component relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden pt-24 p-0 sm:p-4 md:pt-32 lg:p-8">
			{/* Background Grid with Gradient Overlay */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Grid Pattern */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
						backgroundSize: "80px 80px",
					}}
				/>

				{/* Gradient Overlay - subtle fade */}
				<div
					className="absolute inset-0"
					style={{
						background: overlayBackground,
					}}
				/>
			</div>

			<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 max-w-7xl w-full items-center mt-8">
				{/* Left Column */}
				<div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 lg:items-start lg:text-left">
					<div className="flex items-center gap-2 mb-1 sm:mb-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
						<div className="w-2 h-2 rounded-full bg-black/50 dark:bg-white/50" />
						<span>Blazingly Fast :)</span>
					</div>

					<h1 className="text-3xl sm:text-5xl xl:text-[3.5rem] font-bold tracking-tight text-black dark:text-white leading-tight">
						The AI Toolkit for <span className="text-orange-500">Rust</span>
					</h1>

					<p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 max-w-sm sm:max-w-xl md:max-w-lg">
						An open-source Rust library for building AI-powered applications,
						inspired by the Vercel AI SDK.
					</p>

					{/* Command Snippet */}
					<div className="w-full mt-4 rounded-xs max-w-xs sm:mt-0 sm:max-w-md bg-white border border-black/10 dark:bg-black dark:border-white/10 p-2.5 flex items-center gap-2.5 font-mono text-xs">
						<span className="text-black dark:text-white font-semibold">
							<span className="text-red-500 dark:text-red-400">cargo</span> add{" "}
							<span className="text-orange-500">aisdk</span>
						</span>
						<div className="flex-1" />
						{copied ? (
							<Check className="w-3.5 h-3.5 text-black dark:text-white" />
						) : (
							<Copy
								className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
								onClick={() => {
									navigator.clipboard.writeText("cargo add aisdk");
									setCopied(true);
								}}
							/>
						)}
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							asChild
							size="sm"
							className="bg-black dark:bg-white rounded-xs font-semibold text-white text-xs sm:text-sm dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-2 sm:px-6"
						>
							<Link href="/docs">GET STARTED</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="px-2 sm:px-6 rounded-xs text-xs sm:text-sm border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
						>
							<Link href="https://github.com/lazy-hq/aisdk" target="_blank">
								<SquareArrowOutUpRight className="mr-1 h-4 w-4" />
								View on GitHub
							</Link>
						</Button>
					</div>
				</div>

				{/* Right Column - Code Window */}
				<div className="relative w-full mt-8 md:mt-0 p-1 sm:p-0">
					<ProvidersExampleCodeTabs />
				</div>
			</div>
		</div>
	);
}

const ProvidersExampleCodeTabs = () => {
	const [activeCategory, setActiveCategory] = useState<Category>("basic");
	const [isStreaming, setIsStreaming] = useState(false);

	/* ------------------------------------------------------------------ */
	/* Types */
	/* ------------------------------------------------------------------ */

	type Category = "basic" | "tool" | "structured" | "type_safety";
	type ProviderKey = "openai" | "anthropic" | "google";

	interface ProviderConfig {
		label: string;
		model: string;
		basicPrompt?: string;
		icon: React.ReactNode;
	}

	interface CodeContext {
		provider: string;
		model: string;
		method: string;
		streaming: boolean;
	}

	/* ------------------------------------------------------------------ */
	/* Provider Definitions */
	/* ------------------------------------------------------------------ */

	const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
		openai: {
			label: "OpenAI",
			model: "gpt_5()",
			basicPrompt: '.prompt("What is the meaning of life?")',
			icon: <OpenAI className="w-4 h-4 mr-2" />,
		},
		anthropic: {
			label: "Anthropic",
			model: "claude_opus_4_5()",
			basicPrompt: '.prompt("What is the meaning of life?")',
			icon: <Anthropic className="w-4 h-4 mr-2" />,
		},
		google: {
			label: "Google",
			model: "gemini_3_flash_preview()",
			basicPrompt: '.prompt("What is the meaning of life?")',
			icon: <Google.Color className="w-4 h-4 mr-2" />,
		},
	};

	/* ------------------------------------------------------------------ */
	/* Templates */
	/* ------------------------------------------------------------------ */

	const TEMPLATES: Record<
		Category,
		(ctx: CodeContext, providerConfig: ProviderConfig) => string
	> = {
		basic: ({ provider, model, method, streaming }, cfg) =>
			`use aisdk::{
    core::LanguageModelRequest,
    providers::${provider},
};

let ${streaming ? "stream" : "response"} = LanguageModelRequest::builder()
    .model(${provider}::${model})
    ${cfg.basicPrompt}
    .build()
    .${method}()
    .await?
    .${streaming ? "stream" : "text()"};`,

		tool: ({ provider, model, method, streaming }) => `#[tool]
/// Get the weather in a given location
fn get_weather(location: String) -> Tool {
    Ok(format!("72°F in {}", location))
}

let ${streaming ? "stream" : "response"} = LanguageModelRequest::builder()
    .model(${provider}::${model})
    .system("You are a helpful assistant.")
    .prompt("Weather in SF?")
    .with_tool(get_weather())
    .build()
    .${method}()
    .await?
    .${streaming ? "stream" : "text()"};`,

		structured: ({ provider, model, method, streaming }) => {
			const schema = `#[derive(JsonSchema, Deserialize)]
struct User { 
    name: String,
    age: u32,
    email: String
}`;

			if (streaming) {
				return `${schema}

let stream = LanguageModelRequest::builder()
    .model(${provider}::${model})
    .prompt("Generate a random user")
    .schema::<User>()
    .build()
    .${method}()
    .await?
    .stream;`;
			}

			return `${schema}

let user: User = LanguageModelRequest::builder()
    .model(${provider}::${model})
    .prompt("Generate a random user")
    .schema::<User>()
    .build()
    .${method}()
    .await?
    .into_schema()?;`;
		},

		type_safety: ({ provider, model: _model, method, streaming }) => {
			if (provider === "OpenAI") {
				return `#[tool]
/// Get the weather in a given location
fn get_weather(location: String) -> Tool {
    Ok(format!("72°F in {}", location))
}

// Using model that doesn't support tool calls
let ${streaming ? "stream" : "response"} = LanguageModelRequest::builder()
	.model(OpenAI::gpt_3_5_turbo())
	.system("You are a helpful assistant.")
	.prompt("Weather in SF?")
	.with_tool(get_weather()) 
	// ^ 🦀 COMPILE ERROR 🦀
	// GPT 3.5 Turbo doesn't support tools
	.build() 
	.${streaming ? "stream_text" : "generate_text"}()
	.await?;`;
			}

			if (provider === "Anthropic") {
				return `#[derive(JsonSchema, Deserialize)]
struct User { 
    name: String,
    email: String
}

// Using model that doesn't support structured output
let ${streaming ? "stream" : "user: User"} = LanguageModelRequest::builder()
	.model(Anthropic::claude_opus_4_0())
	.prompt("Generate a random user")
	.schema::<User>()
	// ^ 🦀 COMPILE ERROR 🦀
	// Claude Opus 4.0 doesn't support structured output
	.build()
	.${method}()
	.await?
	.${streaming ? "stream" : "into_schema()?"};`;
			}

			return `use aisdk::{
    core::LanguageModelRequest,
    providers::${provider},
};

// Using model that doesn't text output for text generation
let ${streaming ? "stream" : "response"} = LanguageModelRequest::builder()
    .model(Google::gemini_2_5_pro_preview_tts())
	// ^ 🦀 COMPILE ERROR 🦀
	// Gemini 2.5 Pro Preview TTS doesn't support text generation
    .prompt("Explain lifetimes like I'm five")
    .build()
    .${method}()
    .await?
    .${streaming ? "stream" : "text()"};
`;
		},
	};

	/* ------------------------------------------------------------------ */
	/* Code Generator */
	/* ------------------------------------------------------------------ */

	const generateCode = (
		category: Category,
		providerKey: ProviderKey,
		streaming: boolean,
	) => {
		const providerConfig = PROVIDERS[providerKey];

		const context: CodeContext = {
			provider: providerConfig.label,
			model: providerConfig.model,
			method: streaming ? "stream_text" : "generate_text",
			streaming,
		};

		return TEMPLATES[category](context, providerConfig);
	};

	/* ------------------------------------------------------------------ */
	/* Render */
	/* ------------------------------------------------------------------ */

	// biome-ignore lint/correctness/useExhaustiveDependencies: generateCode is a stable function that doesn't depend on props or state
	const codes = useMemo(() => {
		const result = {} as Record<
			ProviderKey,
			Record<Category, { streaming: string; nonStreaming: string }>
		>;
		for (const provider of Object.keys(PROVIDERS) as ProviderKey[]) {
			result[provider] = {} as Record<
				Category,
				{ streaming: string; nonStreaming: string }
			>;
			for (const category of [
				"basic",
				"tool",
				"structured",
				"type_safety",
			] as const) {
				result[provider][category] = {
					streaming: generateCode(category, provider, true),
					nonStreaming: generateCode(category, provider, false),
				};
			}
		}
		return result;
	}, []);

	return (
		<div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto">
			{/* Category Switch */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
				<div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xs w-fit">
					{(["basic", "tool", "structured", "type_safety"] as const).map(
						(cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setActiveCategory(cat)}
								className={`px-2 py-1.5 text-xs lg:text-[10px] xl:text-xs sm:px-4 font-medium rounded-xs transition-all cursor-pointer ${
									activeCategory === cat
										? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
										: "text-gray-500 hover:text-black dark:hover:text-white"
								}`}
							>
								{cat === "tool"
									? "Tools"
									: cat === "structured"
										? "Structured Output"
										: cat === "type_safety"
											? "Type Safety"
											: "Basic"}
							</button>
						),
					)}
				</div>

				{/* Streaming Toggle */}
				<div className="flex items-center gap-3 px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xs">
					<span className="text-[10px] lg:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-dark dark:text-gray-200">
						Stream
					</span>
					<button
						type="button"
						onClick={() => setIsStreaming((s) => !s)}
						className={`relative w-8 h-4.5 rounded-xs transition-colors cursor-pointer ${
							isStreaming ? "bg-orange-500" : "bg-gray-300 dark:bg-zinc-700"
						}`}
					>
						<div
							className={`absolute top-0.75 left-0.75 w-3 h-3 bg-white rounded-xs transition-transform ${
								isStreaming ? "translate-x-3.5" : ""
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Provider Tabs */}
			<Tabs defaultValue="openai" className="w-full mt-0 rounded-xs">
				<TabsList className="bg-transparent border-b border-black/10 dark:border-white/10 p-0">
					{Object.entries(PROVIDERS).map(([key, cfg]) => (
						<TabsTrigger
							key={key}
							value={key}
							className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 px-4 py-2 flex items-center cursor-pointer"
						>
							{cfg.icon}
							{cfg.label}
						</TabsTrigger>
					))}
				</TabsList>

				{(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => (
					<TabsContent key={key} value={key} className="rounded-xs p-0 m-0">
						{(["basic", "tool", "structured", "type_safety"] as const).flatMap(
							(cat) =>
								[true, false].map((stream) => (
									<div
										key={`${key}-${cat}-${stream}`}
										className={`custom-code-block rounded-xs ${
											activeCategory === cat && isStreaming === stream
												? "block"
												: "hidden"
										}`}
									>
										<DynamicCodeBlock
											lang="rust"
											code={
												codes[key][cat][stream ? "streaming" : "nonStreaming"]
											}
										/>
									</div>
								)),
						)}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
};
