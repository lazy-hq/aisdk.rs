import "@/app/global.css";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Navbar } from "@/components/navbar";
import SearchDialog from "@/components/search";
import { ThemeProvider } from "@/components/theme-provider";
import { VercelAnalytics } from "@/lib/analytics";
import { baseOptions } from "@/lib/layout.shared";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "AI SDK | Open Source AI Toolkit for Rust",
	description: "Rust library for AI apps, inspired by the Vercel AI SDK.",
};

export default async function Layout({ children }: LayoutProps<"/">) {
	const cookieStore = await cookies();
	const themeCookie = cookieStore.get("theme");
	const theme = themeCookie?.value || "dark";

	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<ThemeProvider theme={theme}>
					<RootProvider
						search={{
							SearchDialog,
						}}
					>
						<ServerNavbar />
						<HomeLayout {...baseOptions()}>{children}</HomeLayout>
					</RootProvider>
				</ThemeProvider>
				<VercelAnalytics />
			</body>
		</html>
	);
}

async function ServerNavbar() {
	async function _getGitHubStars() {
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
			const stars = parseInt(json.stargazers_count, 10).toLocaleString();
			return stars;
		} catch {
			return null;
		}
	}
	const data = null; // await getGitHubStars();
	return <Navbar starCout={data} />;
}
