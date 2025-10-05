import type { BaseLayoutProps, NavOptions } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

export function baseOptions(): BaseLayoutProps {
	return {
		githubUrl: "https://github.com/lazy-hq/aisdk",
		searchToggle: {
			enabled: false,
		},
		nav: {
			enabled: false,
		},
		// see https://fumadocs.dev/docs/ui/navigation/links
		links: [],
	};
}
