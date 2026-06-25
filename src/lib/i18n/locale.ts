import { writable } from 'svelte/store';

export type Locale = 'en' | 'cs';

const STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
	if (typeof localStorage === 'undefined') return 'cs';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'en' || stored === 'cs') return stored;
	return 'cs';
}

export const locale = writable<Locale>(getInitialLocale());

locale.subscribe((value) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, value);
	}
});
