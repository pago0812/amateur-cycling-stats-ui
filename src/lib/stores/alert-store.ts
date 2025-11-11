import { writable } from 'svelte/store';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertState {
	open: boolean;
	text: string;
	type: AlertType;
}

interface AlertStore {
	subscribe: (subscription: (value: AlertState) => void) => () => void;
	closeAlert: () => void;
	openAlert: (text: string, type?: AlertType) => void;
}

function createAlertStore(): AlertStore {
	const { subscribe, set } = writable<AlertState>({
		open: false,
		text: '',
		type: 'error'
	});

	return {
		subscribe,
		closeAlert: () => set({ open: false, text: '', type: 'error' }),
		openAlert: (text: string, type: AlertType = 'error') => set({ open: true, text, type })
	};
}

export const alertStore = createAlertStore();
