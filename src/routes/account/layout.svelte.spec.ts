/**
 * Unit Tests: Account Layout Component
 *
 * Tests the simplified account page layout (passthrough component).
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccountLayout from './+layout.svelte';

describe('Account Layout Component', () => {
	it('should render children content', async () => {
		const testContent = 'Test child content';
		render(AccountLayout, {
			children: (() => testContent) as any
		});

		const content = page.getByText(testContent);
		await expect.element(content).toBeInTheDocument();
	});
});
