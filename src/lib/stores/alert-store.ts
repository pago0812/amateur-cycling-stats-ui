import { toast } from 'svelte-sonner';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

/**
 * Alert store - wrapper around svelte-sonner toast for backward compatibility
 * Maintains the same API as the previous custom GlobalAlert implementation
 */
export const alertStore = {
	/**
	 * Display a toast notification
	 * @param text - Message to display
	 * @param type - Alert type (success, error, info, warning). Defaults to 'error'
	 */
	openAlert: (text: string, type: AlertType = 'error') => {
		// Configure toast to match previous GlobalAlert behavior (5 second auto-dismiss)
		const options = { duration: 5000 };

		switch (type) {
			case 'success':
				toast.success(text, options);
				break;
			case 'error':
				toast.error(text, options);
				break;
			case 'warning':
				toast.warning(text, options);
				break;
			case 'info':
				toast.info(text, options);
				break;
		}
	},

	/**
	 * Close all active toasts
	 */
	closeAlert: () => {
		toast.dismiss();
	}
};
