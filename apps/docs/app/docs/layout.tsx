import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
	return (
		<DocsLayout
			tree={source.pageTree}
			themeSwitch={{ enabled: false }}
			sidebar={{
				collapsible: false,
				className: "[&>div:last-child]:border-t-0", // remove fotter
			}}
		>
			{children}
		</DocsLayout>
	);
}
