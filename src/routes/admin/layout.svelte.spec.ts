/**
 * Unit Tests: Admin Layout Component
 *
 * Tests the simplified admin page layout (passthrough component).
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AdminLayout from './+layout.svelte';

describe('Admin Layout Component', () => {
	it('should render children content', async () => {
		const testContent = 'Test child content';
		render(AdminLayout, {
			children: (() => testContent) as any
		});

		const content = page.getByText(testContent);
		await expect.element(content).toBeInTheDocument();
	});
});
