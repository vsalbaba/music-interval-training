export interface Interval {
	semitones: number;
	name: string;
	shortName: string;
}

export const ALL_INTERVALS: Interval[] = [
	{ semitones: 0, name: 'Unison', shortName: 'P1' },
	{ semitones: 1, name: 'Minor 2nd', shortName: 'm2' },
	{ semitones: 2, name: 'Major 2nd', shortName: 'M2' },
	{ semitones: 3, name: 'Minor 3rd', shortName: 'm3' },
	{ semitones: 4, name: 'Major 3rd', shortName: 'M3' },
	{ semitones: 5, name: 'Perfect 4th', shortName: 'P4' },
	{ semitones: 6, name: 'Tritone', shortName: 'TT' },
	{ semitones: 7, name: 'Perfect 5th', shortName: 'P5' },
	{ semitones: 8, name: 'Minor 6th', shortName: 'm6' },
	{ semitones: 9, name: 'Major 6th', shortName: 'M6' },
	{ semitones: 10, name: 'Minor 7th', shortName: 'm7' },
	{ semitones: 11, name: 'Major 7th', shortName: 'M7' },
	{ semitones: 12, name: 'Octave', shortName: 'P8' }
];

export const EASY_INTERVALS = ALL_INTERVALS.filter((i) =>
	[0, 5, 7, 12].includes(i.semitones)
);

export const MEDIUM_INTERVALS = ALL_INTERVALS.filter((i) =>
	[3, 4, 5, 7, 8, 9, 12].includes(i.semitones)
);

export type IntervalDifficulty = 'easy' | 'medium' | 'hard';

export const INTERVAL_DIFFICULTIES: { key: IntervalDifficulty; label: string; intervals: Interval[] }[] = [
	{ key: 'easy', label: 'Easy', intervals: EASY_INTERVALS },
	{ key: 'medium', label: 'Medium', intervals: MEDIUM_INTERVALS },
	{ key: 'hard', label: 'Hard', intervals: ALL_INTERVALS.filter((i) => i.semitones !== 0) }
];

export function getIntervalBySemitones(semitones: number): Interval | undefined {
	return ALL_INTERVALS.find((i) => i.semitones === semitones);
}
