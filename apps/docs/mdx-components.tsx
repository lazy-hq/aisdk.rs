import defaultMdxComponents from "fumadocs-ui/mdx";
import { Brain, Grid, ImageIcon, Music, Type, Workflow } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		Link,
		Workflow,
		Brain,
		Type,
		ImageIcon,
		Music,
		Grid,
		...components,
	};
}
