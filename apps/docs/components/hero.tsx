"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, SquareArrowOutUpRight } from "lucide-react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "fumadocs-ui/components/tabs";
import { Anthropic, Google, OpenAI } from "@lobehub/icons";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

export function Hero() {
	return (
		<div className="h-full w-full mt-[-12px] relative flex flex-col items-center justify-center bg-black text-white md:p-8">
			{/* Background Grid with Gradient Overlay */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Grid Pattern */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
						backgroundSize: "80px 80px",
					}}
				/>

				{/* Gradient Overlay - subtle fade */}
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse 120% 100% at 50% 0%, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)",
					}}
				/>
			</div>

			<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
				{/* Left Column */}
				<div className="flex flex-col items-start text-left space-y-6">
					<div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
						<div className="w-2 h-2 rounded-full bg-white/50" />
						<span>Blazingly Fast :)</span>
					</div>

					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
						The AI Toolkit for <span className="text-orange-500">Rust</span>
					</h1>

					<p className="text-base text-gray-400 max-w-xl">
						An open-source Rust library for building AI-powered applications,
						inspired by the Vercel AI SDK.
					</p>

					{/* Command Snippet */}
					<div className="w-full rounded-xs max-w-md bg-black border border-white/10 p-2.5 flex items-center gap-2.5 font-mono text-xs">
						<span className="text-white font-semibold">
							<span className="text-red-400"> cargo </span>add{" "}
							<span className="text-orange-500">aisdk</span>
						</span>
						<div className="flex-1" />
						<Copy
							className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-white transition-colors"
							onClick={() => navigator.clipboard.writeText("cargo add aisdk")}
						/>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							asChild
							size="default"
							className="bg-white rounded-xs font-semibold text-black hover:bg-gray-200 px-6"
						>
							<Link href="/docs">GET STARTED</Link>
						</Button>
						<Button
							variant="outline"
							size="default"
							asChild
							className="px-5 rounded-xs border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
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
