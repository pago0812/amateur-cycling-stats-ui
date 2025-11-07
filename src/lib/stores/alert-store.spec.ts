/**
 * Unit Tests: Alert Store
 *
 * Tests the global alert store functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { alertStore } from './alert-store';
import { get } from 'svelte/store';

describe('Alert Store', () => {
	beforeEach(() => {
		// Reset store to initial state
		alertStore.closeAlert();
	});

	describe('Initial State', () => {
		it('should have closed alert with empty text by default', () => {
			const state = get(alertStore);

			expect(state.open).toBe(false);
			expect(state.text).toBe('');
		});
	});

	describe('openAlert', () => {
		it('should open alert with provided text', () => {
			alertStore.openAlert('Test alert message');

			const state = get(alertStore);

			expect(state.open).toBe(true);
			expect(state.text).toBe('Test alert message');
		});

		it('should update text when opening multiple times', () => {
			alertStore.openAlert('First message');
			let state = get(alertStore);
			expect(state.text).toBe('First message');

			alertStore.openAlert('Second message');
			state = get(alertStore);
			expect(state.text).toBe('Second message');
			expect(state.open).toBe(true);
		});

		it('should handle empty string', () => {
			alertStore.openAlert('');

			const state = get(alertStore);

			expect(state.open).toBe(true);
			expect(state.text).toBe('');
		});

		it('should handle long messages', () => {
			const longMessage =
				'This is a very long error message that contains lots of details about what went wrong in the application. '.repeat(
					5
				);

			alertStore.openAlert(longMessage);

			const state = get(alertStore);

			expect(state.open).toBe(true);
			expect(state.text).toBe(longMessage);
		});

		it('should handle special characters', () => {
			const specialMessage = 'Error: <script>alert("XSS")</script> & "quotes" & \'apostrophes\'';

			alertStore.openAlert(specialMessage);

			const state = get(alertStore);

			expect(state.text).toBe(specialMessage);
		});
	});

	describe('closeAlert', () => {
		it('should close alert and clear text', () => {
			alertStore.openAlert('Test message');
			alertStore.closeAlert();

			const state = get(alertStore);

			expect(state.open).toBe(false);
			expect(state.text).toBe('');
		});

		it('should be idempotent (can call multiple times)', () => {
			alertStore.openAlert('Test message');
			alertStore.closeAlert();
			alertStore.closeAlert();
			alertStore.closeAlert();

			const state = get(alertStore);

			expect(state.open).toBe(false);
			expect(state.text).toBe('');
		});

		it('should work when alert is already closed', () => {
			alertStore.closeAlert();

			const state = get(alertStore);

			expect(state.open).toBe(false);
			expect(state.text).toBe('');
		});
	});

	describe('Store Subscription', () => {
		it('should notify subscribers when alert opens', () => {
			let notificationCount = 0;
			const unsubscribe = alertStore.subscribe(() => {
				notificationCount++;
			});

			const initialCount = notificationCount;
			alertStore.openAlert('Test');

			expect(notificationCount).toBe(initialCount + 1);
			unsubscribe();
		});

		it('should notify subscribers when alert closes', () => {
			let notificationCount = 0;
			alertStore.openAlert('Initial');

			const unsubscribe = alertStore.subscribe(() => {
				notificationCount++;
			});

			const initialCount = notificationCount;
			alertStore.closeAlert();

			expect(notificationCount).toBe(initialCount + 1);
			unsubscribe();
		});

		it('should provide current state to new subscribers', () => {
			alertStore.openAlert('Current message');

			let receivedState: { open: boolean; text: string } | null = null;
			const unsubscribe = alertStore.subscribe((state) => {
				receivedState = state;
			});

			expect(receivedState).toEqual({
				open: true,
				text: 'Current message'
			});
			unsubscribe();
		});
	});

	describe('Alert Workflow', () => {
		it('should support open -> close -> open workflow', () => {
			alertStore.openAlert('First alert');
			let state = get(alertStore);
			expect(state.open).toBe(true);
			expect(state.text).toBe('First alert');

			alertStore.closeAlert();
			state = get(alertStore);
			expect(state.open).toBe(false);

			alertStore.openAlert('Second alert');
			state = get(alertStore);
			expect(state.open).toBe(true);
			expect(state.text).toBe('Second alert');
		});
	});
});
