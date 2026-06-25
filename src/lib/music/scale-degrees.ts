import { ALL_INTERVALS } from './intervals';
import { ALL_CHORD_QUALITIES } from './chords';
import { getNoteNames, getIntervalName, getChordName, getChordHint } from '$lib/i18n/translations';
import type { Locale } from '$lib/i18n/locale';

const SCALE_DEGREE_LABELS: Record<number, string> = {
	0: '1',
	1: 'b2',
	2: '2',
	3: 'b3',
	4: '3',
	5: '4',
	6: 'b5',
	7: '5',
	8: 'b6',
	9: '6',
	10: 'b7',
	11: '7',
	12: '8'
};

export function getScaleDegreeLabel(semitones: number): string {
	return SCALE_DEGREE_LABELS[semitones] ?? String(semitones);
}

export function getNoteName(pitchClass: number, locale: Locale = 'en'): string {
	const names = getNoteNames(locale);
	return names[((pitchClass % 12) + 12) % 12];
}

export interface IntervalTableRow {
	degree: string;
	shortName: string;
	semitones: number;
	name: string;
	rootNote: string;
	targetNote: string;
}

export function getIntervalTableRows(rootPitchClass: number, locale: Locale = 'en'): IntervalTableRow[] {
	const rootNote = getNoteName(rootPitchClass, locale);
	return ALL_INTERVALS.map((interval) => ({
		degree: getScaleDegreeLabel(interval.semitones),
		shortName: interval.shortName,
		semitones: interval.semitones,
		name: getIntervalName(locale, interval.semitones),
		rootNote,
		targetNote: getNoteName(rootPitchClass + interval.semitones, locale)
	}));
}

export interface ChordTableRow {
	formula: string;
	name: string;
	hint: string;
	notes: string[];
}

export function getChordTableRows(rootPitchClass: number, locale: Locale = 'en'): ChordTableRow[] {
	return ALL_CHORD_QUALITIES.map((quality) => ({
		formula: quality.formula,
		name: getChordName(locale, quality.shortName),
		hint: getChordHint(locale, quality.shortName),
		notes: quality.intervals.map((i) => getNoteName(rootPitchClass + i, locale))
	}));
}
