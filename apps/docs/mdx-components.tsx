import defaultMdxComponents from "fumadocs-ui/mdx";
import {
	BicepsFlexed,
	Blocks,
	Brain,
	Grid,
	ImageIcon,
	Music,
	Type,
	Workflow,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { CustomCodeTabs } from "./components/custom-code-tabs";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		CustomCodeTabs,
		Link,
		Workflow,
		Brain,
		Type,
		ImageIcon,
		Music,
		Grid,
		BicepsFlexed,
		Blocks,
		...components,
	};
}
