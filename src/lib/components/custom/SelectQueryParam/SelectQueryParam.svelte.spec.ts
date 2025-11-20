/**
 * Unit Tests: SelectQueryParam Component
 *
 * Tests the URL query parameter select dropdown component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import SelectQueryParam from './SelectQueryParam.svelte';

// Mock SvelteKit stores and navigation
vi.mock('$app/stores', () => ({
	page: writable({
		url: new URL('http://localhost:4173/results/event-1'),
		params: { id: 'event-1' },
		route: { id: '/results/[id]' },
		status: 200,
		error: null,
		data: {},
		form: undefined,
		state: {}
	})
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('SelectQueryParam Component', () => {
	const mockOptions = [
		{ value: 'option1', t: 'Option 1' },
		{ value: 'option2', t: 'Option 2' }
	];

	it('should render select with label', async () => {
		render(SelectQueryParam, {
			name: 'category',
			title: 'Select Category',
			options: mockOptions
		});

		const label = page.getByText('Select Category');
		await expect.element(label).toBeInTheDocument();
	});

	it('should render options', async () => {
		render(SelectQueryParam, {
			name: 'category',
			title: 'Select Category',
			options: mockOptions
		});

		const option1 = page.getByText('Option 1');
		await expect.element(option1).toBeInTheDocument();
	});
});
