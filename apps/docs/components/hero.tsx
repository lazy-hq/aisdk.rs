"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, Play, SquareArrowOutUpRight } from "lucide-react";

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
					<div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl">
						{/* Window Header */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
							<div className="flex items-center gap-2">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-white/10" />
									<div className="w-3 h-3 rounded-full bg-white/10" />
									<div className="w-3 h-3 rounded-full bg-white/10" />{" "}
								</div>
								<div className="ml-4 flex gap-4 text-xs font-mono">
									<span className="px-2 py-1 rounded bg-white/10 text-white">
										main.rs
									</span>
									<span className="px-2 py-1 rounded text-gray-500">
										Cargo.toml
									</span>
								</div>
							</div>
							<Copy className="w-4 h-4 text-gray-500" />
						</div>
						{/* Code Content */}
						<div className="p-6 overflow-x-auto">
							<pre className="font-mono text-sm leading-relaxed">
								<code>
									<span className="text-purple-400">use</span> aisdk::{`{`}
									{"\n"}
									{"    "}core::{`{`}LanguageModelRequest{`}`},{"\n"}
									{"    "}providers::openai::OpenAI,{"\n"}
									{`}`};{"\n"}
									{"\n"}
									<span className="text-purple-400">async fn</span>{" "}
									<span className="text-blue-400">main</span>() -&gt;{" "}
									<span className="text-yellow-400">Result</span>&lt;(),
									Box&lt;dyn std::error::Error&gt;&gt; {`{`}
									{"\n"}
									{"\n"}
									{"    "}
									<span className="text-gray-500">// Initialize provider</span>
									{"\n"}
									{"    "}
									<span className="text-purple-400">let</span> openai = OpenAI::
									<span className="text-blue-400">new</span>(
									<span className="text-green-400">&quot;gpt-4o&quot;</span>);
									{"\n"}
									{"\n"}
									{"    "}
									<span className="text-gray-500">// Create request</span>
									{"\n"}
									{"    "}
									<span className="text-purple-400">let</span> result =
									LanguageModelRequest::
									<span className="text-blue-400">builder</span>(){"\n"}
									{"        "}.<span className="text-blue-400">model</span>
									(openai){"\n"}
									{"        "}.<span className="text-blue-400">prompt</span>(
									<span className="text-green-400">
										&quot;What is the meaning of life?&quot;
									</span>
									){"\n"}
									{"        "}.<span className="text-blue-400">build</span>()
									{"\n"}
									{"        "}.
									<span className="text-blue-400">generate_text</span>(){"\n"}
									{"        "}.<span className="text-purple-400">await</span>?;
									{"\n"}
									{"\n"}
									{"    "}println!(
									<span className="text-green-400">&quot;{`{}`}&quot;</span>,
									result.<span className="text-blue-400">text</span>().
									<span className="text-blue-400">unwrap</span>());{"\n"}
									{"    "}
									<span className="text-purple-400">Ok</span>(()){"\n"}
									{`}`}
								</code>
							</pre>
						</div>
						{/* Footer/Status Bar */}
						<div className="px-4 py-2 border-t border-white/10 bg-white/5 flex justify-end">
							<div className="flex items-center gap-2 text-xs text-white bg-white/10 px-3 py-1.5 rounded cursor-pointer hover:bg-white/20 transition-colors">
								<Play className="w-3 h-3 fill-current" />
								<span>Run</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
