import { writable } from 'svelte/store';

function createAlertStore() {
	const { subscribe, set } = writable({
		open: false,
		text: ''
	});

	return {
		subscribe,
		closeAlert: () => set({ open: false, text: '' }),
		openAlert: (text: string) => set({ open: true, text })
	};
}

export const alertStore = createAlertStore();
