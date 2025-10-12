import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Type, ImageIcon, Music, Grid, Workflow, Brain } from "lucide-react";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		Workflow,
		Brain,
		Type,
		ImageIcon,
		Music,
		Grid,
		...components,
	};
}
