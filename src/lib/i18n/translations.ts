import type { Locale } from './locale';

const translations = {
	en: {
		notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const,
		stringLabels: ['E', 'A', 'D', 'G', 'B', 'e'] as const,
		intervals: [
			'Unison',
			'Minor 2nd',
			'Major 2nd',
			'Minor 3rd',
			'Major 3rd',
			'Perfect 4th',
			'Tritone',
			'Perfect 5th',
			'Minor 6th',
			'Major 6th',
			'Minor 7th',
			'Major 7th',
			'Octave'
		] as const,
		chords: {
			Maj: { name: 'Major', hint: 'Bright, stable' },
			Min: { name: 'Minor', hint: 'Major with flat 3rd' },
			Dim: { name: 'Diminished', hint: 'Minor with flat 5th' },
			Aug: { name: 'Augmented', hint: 'Major with sharp 5th' },
			Sus2: { name: 'Sus2', hint: 'Major, 3rd replaced by 2nd' },
			Sus4: { name: 'Sus4', hint: 'Major, 3rd replaced by 4th' },
			Dom7: { name: 'Dominant 7', hint: 'Major + flat 7th' },
			Maj7: { name: 'Major 7', hint: 'Major + natural 7th' },
			Min7: { name: 'Minor 7', hint: 'Minor + flat 7th' }
		},
		ui: {
			exerciseType: { intervals: 'Intervals', chords: 'Chords', progressions: 'Progressions' },
			difficulty: {
				easy: 'Easy',
				medium: 'Medium',
				hard: 'Hard',
				triads: 'Triads',
				'with-7ths': 'With 7ths'
			},
			stats: {
				heading: 'Stats',
				overall: 'Overall',
				back: 'Back',
				clearAll: 'Clear all stats',
				noData: 'No data yet. Start practicing!'
			},
			feedback: {
				correct: 'Correct!',
				wrong: 'Wrong -- it was {name}'
			},
			play: {
				play: 'Play',
				playing: 'Playing...',
				next: 'Next'
			},
			score: 'Score:',
			infoPanel: {
				key: 'Key',
				degree: 'Deg',
				interval: 'Interval',
				notes: 'Notes',
				song: 'Song',
				formula: 'Formula',
				chord: 'Chord',
				hint: 'Hint',
				reference: 'Reference',
				close: 'Close'
			}
		}
	},
	cs: {
		notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'] as const,
		stringLabels: ['E', 'A', 'D', 'G', 'H', 'e'] as const,
		intervals: [
			'Unisono',
			'Malá sekunda',
			'Velká sekunda',
			'Malá tercie',
			'Velká tercie',
			'Kvarta',
			'Tritón',
			'Kvinta',
			'Malá sexta',
			'Velká sexta',
			'Malá septima',
			'Velká septima',
			'Oktáva'
		] as const,
		chords: {
			Maj: { name: 'Dur', hint: 'Veselý, stabilní' },
			Min: { name: 'Moll', hint: 'Dur s malou tercií' },
			Dim: { name: 'Zmenšený', hint: 'Moll se zmenšenou kvintou' },
			Aug: { name: 'Zvětšený', hint: 'Dur se zvětšenou kvintou' },
			Sus2: { name: 'Sus2', hint: 'Dur, tercie nahrazena sekundou' },
			Sus4: { name: 'Sus4', hint: 'Dur, tercie nahrazena kvartou' },
			Dom7: { name: 'Dominantní 7', hint: 'Dur + malá septima' },
			Maj7: { name: 'Dur 7', hint: 'Dur + velká septima' },
			Min7: { name: 'Moll 7', hint: 'Moll + malá septima' }
		},
		ui: {
			exerciseType: { intervals: 'Intervaly', chords: 'Akordy', progressions: 'Progrese' },
			difficulty: {
				easy: 'Lehké',
				medium: 'Střední',
				hard: 'Těžké',
				triads: 'Triády',
				'with-7ths': 'Se septimami'
			},
			stats: {
				heading: 'Statistiky',
				overall: 'Celkově',
				back: 'Zpět',
				clearAll: 'Smazat statistiky',
				noData: 'Zatím žádná data. Začni cvičit!'
			},
			feedback: {
				correct: 'Správně!',
				wrong: 'Špatně -- bylo to {name}'
			},
			play: {
				play: 'Přehrát',
				playing: 'Přehrávání...',
				next: 'Další'
			},
			score: 'Skóre:',
			infoPanel: {
				key: 'Tónina',
				degree: 'Stupeň',
				interval: 'Interval',
				notes: 'Noty',
				song: 'Píseň',
				formula: 'Vzorec',
				chord: 'Akord',
				hint: 'Nápověda',
				reference: 'Přehled',
				close: 'Zavřít'
			}
		}
	}
} as const;

type Translations = typeof translations;
type TranslationTree = Translations[Locale];

type PathKeys<T, Prefix extends string = ''> = T extends string
	? Prefix
	: {
			[K in keyof T & string]: PathKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
		}[keyof T & string];

type DeepGet<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? DeepGet<T[K], Rest>
		: never
	: P extends keyof T
		? T[P]
		: never;

export type TranslationKey = PathKeys<TranslationTree['ui'], 'ui'>;

export function t<K extends TranslationKey>(
	locale: Locale,
	key: K
): DeepGet<TranslationTree['ui'], K extends `ui.${infer Rest}` ? Rest : never> extends string
	? string
	: never;
export function t(locale: Locale, key: string): string {
	const parts = key.split('.');
	let current: unknown = translations[locale];
	for (const part of parts) {
		if (current == null || typeof current !== 'object') return key;
		current = (current as Record<string, unknown>)[part];
	}
	return typeof current === 'string' ? current : key;
}

export function getNoteNames(locale: Locale): readonly string[] {
	return translations[locale].notes;
}

export function getStringLabels(locale: Locale): readonly string[] {
	return translations[locale].stringLabels;
}

export function getIntervalName(locale: Locale, semitones: number): string {
	return translations[locale].intervals[semitones] ?? '';
}

export function getChordName(locale: Locale, shortName: string): string {
	const chords = translations[locale].chords as Record<string, { name: string }>;
	return chords[shortName]?.name ?? shortName;
}

export function getChordHint(locale: Locale, shortName: string): string {
	const chords = translations[locale].chords as Record<string, { hint: string }>;
	return chords[shortName]?.hint ?? '';
}

export function translateStatsName(locale: Locale, type: 'interval' | 'chord' | 'progression', englishName: string): string {
	if (type === 'interval') {
		const semitones = translations.en.intervals.indexOf(englishName as (typeof translations.en.intervals)[number]);
		if (semitones >= 0) return getIntervalName(locale, semitones);
	} else {
		const enChords = translations.en.chords as Record<string, { name: string }>;
		for (const [shortName, entry] of Object.entries(enChords)) {
			if (entry.name === englishName) return getChordName(locale, shortName);
		}
	}
	return englishName;
}
