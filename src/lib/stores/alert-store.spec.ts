/**
 * Unit Tests: Alert Store
 *
 * Tests the alert store wrapper around svelte-sonner toast functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { alertStore } from './alert-store';

// Mock svelte-sonner
vi.mock('svelte-sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
		dismiss: vi.fn()
	}
}));

// Import the mocked toast
import { toast } from 'svelte-sonner';

describe('Alert Store', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
	});

	describe('openAlert', () => {
		it('should call toast.error by default when no type is specified', () => {
			alertStore.openAlert('Test error message');

			expect(toast.error).toHaveBeenCalledWith('Test error message', { duration: 5000 });
			expect(toast.success).not.toHaveBeenCalled();
			expect(toast.warning).not.toHaveBeenCalled();
			expect(toast.info).not.toHaveBeenCalled();
		});

		it('should call toast.success when type is "success"', () => {
			alertStore.openAlert('Success message', 'success');

			expect(toast.success).toHaveBeenCalledWith('Success message', { duration: 5000 });
			expect(toast.error).not.toHaveBeenCalled();
		});

		it('should call toast.error when type is "error"', () => {
			alertStore.openAlert('Error message', 'error');

			expect(toast.error).toHaveBeenCalledWith('Error message', { duration: 5000 });
			expect(toast.success).not.toHaveBeenCalled();
		});

		it('should call toast.warning when type is "warning"', () => {
			alertStore.openAlert('Warning message', 'warning');

			expect(toast.warning).toHaveBeenCalledWith('Warning message', { duration: 5000 });
			expect(toast.error).not.toHaveBeenCalled();
		});

		it('should call toast.info when type is "info"', () => {
			alertStore.openAlert('Info message', 'info');

			expect(toast.info).toHaveBeenCalledWith('Info message', { duration: 5000 });
			expect(toast.error).not.toHaveBeenCalled();
		});

		it('should handle empty string messages', () => {
			alertStore.openAlert('', 'success');

			expect(toast.success).toHaveBeenCalledWith('', { duration: 5000 });
		});

		it('should handle long messages', () => {
			const longMessage =
				'This is a very long error message that contains lots of details about what went wrong in the application. '.repeat(
					5
				);

			alertStore.openAlert(longMessage, 'error');

			expect(toast.error).toHaveBeenCalledWith(longMessage, { duration: 5000 });
		});

		it('should handle special characters and potential XSS', () => {
			const specialMessage = 'Error: <script>alert("XSS")</script> & "quotes" & \'apostrophes\'';

			alertStore.openAlert(specialMessage, 'warning');

			expect(toast.warning).toHaveBeenCalledWith(specialMessage, { duration: 5000 });
		});

		it('should support multiple consecutive calls', () => {
			alertStore.openAlert('First message', 'success');
			alertStore.openAlert('Second message', 'error');
			alertStore.openAlert('Third message', 'info');

			expect(toast.success).toHaveBeenCalledTimes(1);
			expect(toast.error).toHaveBeenCalledTimes(1);
			expect(toast.info).toHaveBeenCalledTimes(1);
		});

		it('should use 5000ms duration to match previous GlobalAlert behavior', () => {
			alertStore.openAlert('Test', 'success');

			expect(toast.success).toHaveBeenCalledWith('Test', { duration: 5000 });
		});
	});

	describe('closeAlert', () => {
		it('should call toast.dismiss to close all toasts', () => {
			alertStore.closeAlert();

			expect(toast.dismiss).toHaveBeenCalledTimes(1);
		});

		it('should be idempotent (can call multiple times)', () => {
			alertStore.closeAlert();
			alertStore.closeAlert();
			alertStore.closeAlert();

			expect(toast.dismiss).toHaveBeenCalledTimes(3);
		});
	});

	describe('Alert Workflow', () => {
		it('should support open -> close -> open workflow', () => {
			alertStore.openAlert('First alert', 'success');
			expect(toast.success).toHaveBeenCalledTimes(1);

			alertStore.closeAlert();
			expect(toast.dismiss).toHaveBeenCalledTimes(1);

			alertStore.openAlert('Second alert', 'error');
			expect(toast.error).toHaveBeenCalledTimes(1);
		});

		it('should support rapid consecutive alerts', () => {
			alertStore.openAlert('Alert 1', 'success');
			alertStore.openAlert('Alert 2', 'error');
			alertStore.openAlert('Alert 3', 'warning');
			alertStore.openAlert('Alert 4', 'info');

			expect(toast.success).toHaveBeenCalledTimes(1);
			expect(toast.error).toHaveBeenCalledTimes(1);
			expect(toast.warning).toHaveBeenCalledTimes(1);
			expect(toast.info).toHaveBeenCalledTimes(1);
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain the same API as previous implementation', () => {
			// Verify the alertStore object has the expected methods
			expect(alertStore).toHaveProperty('openAlert');
			expect(alertStore).toHaveProperty('closeAlert');
			expect(typeof alertStore.openAlert).toBe('function');
			expect(typeof alertStore.closeAlert).toBe('function');
		});

		it('should accept the same parameters as previous implementation', () => {
			// These should all work without errors
			expect(() => alertStore.openAlert('Message')).not.toThrow();
			expect(() => alertStore.openAlert('Message', 'success')).not.toThrow();
			expect(() => alertStore.openAlert('Message', 'error')).not.toThrow();
			expect(() => alertStore.openAlert('Message', 'warning')).not.toThrow();
			expect(() => alertStore.openAlert('Message', 'info')).not.toThrow();
			expect(() => alertStore.closeAlert()).not.toThrow();
		});
	});
});
