import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
	const base = baseOptions();
	return (
		<DocsLayout
			{...base}
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
