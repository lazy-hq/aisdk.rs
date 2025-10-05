import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Inter } from "next/font/google";
import SearchDialog from "@/components/search";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "AI SDK | Open Source AI SDK for Rust",
	description: "Rust library for AI apps, inspired by the Vercel AI SDK.",
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider
					search={{
						SearchDialog,
					}}
				>
					<ServerNavbar />
					<HomeLayout {...baseOptions()}>{children}</HomeLayout>
				</RootProvider>
			</body>
		</html>
	);
}

async function ServerNavbar() {
	async function getGitHubStars() {
		try {
			const response = await fetch(
				"https://api.github.com/repos/lazy-hq/aisdk",
				{
					next: {
						revalidate: 60,
					},
				},
			);
			if (!response?.ok) {
				return null;
			}
			const json = await response.json();
			const stars = parseInt(json.stargazers_count).toLocaleString();
			return stars;
		} catch {
			return null;
		}
	}
	const data = null; // await getGitHubStars();
	return <Navbar starCout={data} />;
}
