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
import { useEffect, useState } from "react";
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
		<div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden pt-24 p-4 md:pt-32 lg:p-8 ">
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
				<div className="flex flex-col items-start text-left space-y-4 sm:space-y-6">
					<div className="flex items-center gap-2 mb-1 sm:mb-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
						<div className="w-2 h-2 rounded-full bg-black/50 dark:bg-white/50" />
						<span>Blazingly Fast :)</span>
					</div>

					<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-black dark:text-white leading-tight">
						The AI Toolkit for <span className="text-orange-500">Rust</span>
					</h1>

					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-full sm:max-w-xl">
						An open-source Rust library for building AI-powered applications,
						inspired by the Vercel AI SDK.
					</p>

					{/* Command Snippet */}
					<div className="w-full rounded-xs max-w-full sm:max-w-md bg-white border border-black/10 dark:bg-black dark:border-white/10 p-2.5 flex items-center gap-2.5 font-mono text-xs">
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
							className="bg-black dark:bg-white rounded-xs font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 sm:px-6"
						>
							<Link href="/docs">GET STARTED</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="px-3 sm:px-5 rounded-xs border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
						>
							<Link href="https://github.com/lazy-hq/aisdk" target="_blank">
								<SquareArrowOutUpRight className="mr-1 h-4 w-4" />
								View on GitHub
							</Link>
						</Button>
					</div>
				</div>

				{/* Right Column - Code Window */}
				<div className="relative w-full">
					<ProvidersExampleCodeTabs />
				</div>
			</div>
		</div>
	);
}

const ProvidersExampleCodeTabs = () => {
	const openAICode = `
use aisdk::{
    core::LanguageModelRequest,
    providers::openai::OpenAI,
};

let text = LanguageModelRequest::builder()
	.model(OpenAI::new("gpt-5"))
	.prompt("What is the meaning of life?")
	.build()
	.generate_text()
	.await?
	.text()?;
}
`;

	const anthropicCode = `
use aisdk::{
    core::LanguageModelRequest,
    providers::anthropic::Anthropic,
};

let text = LanguageModelRequest::builder()
	.model(Anthropic::new("claude-4.5-haiku"))
	.prompt("What is the meaning of life?")
	.build()
	.generate_text()
	.await?
	.text()?;
}
`;

	const googleCode = `
use aisdk::{
    core::LanguageModelRequest,
    providers::google::Google,
};

let text = LanguageModelRequest::builder()
	.model(Google::new("gemini-2.5-pro"))
	.prompt("What is the meaning of life?")
	.build()
	.generate_text()
	.await?
	.text()?;
}
`;

	return (
		<Tabs defaultValue="openai">
			<TabsList>
				<TabsTrigger value="openai">
					<OpenAI />
					OpenAI
				</TabsTrigger>
				<TabsTrigger value="anthropic">
					<Anthropic />
					Anthropic
				</TabsTrigger>
				<TabsTrigger value="google">
					<Google.Color />
					Google
				</TabsTrigger>
			</TabsList>
			<TabsContent value="openai">
				<DynamicCodeBlock lang="rust" code={openAICode} />
			</TabsContent>
			<TabsContent value="anthropic">
				<DynamicCodeBlock lang="rust" code={anthropicCode} />
			</TabsContent>

			<TabsContent value="google">
				<DynamicCodeBlock lang="rust" code={googleCode} />
			</TabsContent>
		</Tabs>
	);
};
