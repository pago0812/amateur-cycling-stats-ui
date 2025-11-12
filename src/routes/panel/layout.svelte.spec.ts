/**
 * Unit Tests: Panel Layout Component
 *
 * Tests the simplified panel page layout (passthrough component).
 */

import { describe, it, expect } from 'vitest';

describe('Panel Layout Component', () => {
	it('should be importable', async () => {
		// Layout component is a passthrough wrapper - tested via integration tests
		// This smoke test ensures the component file is valid
		const module = await import('./+layout.svelte');
		expect(module.default).toBeDefined();
	});
});
