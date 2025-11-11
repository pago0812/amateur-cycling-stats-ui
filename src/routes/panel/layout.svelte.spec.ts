/**
 * Unit Tests: Panel Layout Component
 *
 * Tests the simplified panel page layout (passthrough component).
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PanelLayout from './+layout.svelte';

describe('Panel Layout Component', () => {
	it('should render children content', async () => {
		const testContent = 'Test child content';
		render(PanelLayout, {
			children: (() => testContent) as any
		});

		const content = page.getByText(testContent);
		await expect.element(content).toBeInTheDocument();
	});
});
