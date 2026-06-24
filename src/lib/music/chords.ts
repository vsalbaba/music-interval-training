export interface ChordQuality {
	name: string;
	shortName: string;
	intervals: number[];
}

export const TRIAD_QUALITIES: ChordQuality[] = [
	{ name: 'Major', shortName: 'Maj', intervals: [0, 4, 7] },
	{ name: 'Minor', shortName: 'Min', intervals: [0, 3, 7] },
	{ name: 'Diminished', shortName: 'Dim', intervals: [0, 3, 6] },
	{ name: 'Augmented', shortName: 'Aug', intervals: [0, 4, 8] },
	{ name: 'Sus2', shortName: 'Sus2', intervals: [0, 2, 7] },
	{ name: 'Sus4', shortName: 'Sus4', intervals: [0, 5, 7] }
];

export const SEVENTH_QUALITIES: ChordQuality[] = [
	{ name: 'Dominant 7', shortName: 'Dom7', intervals: [0, 4, 7, 10] },
	{ name: 'Major 7', shortName: 'Maj7', intervals: [0, 4, 7, 11] },
	{ name: 'Minor 7', shortName: 'Min7', intervals: [0, 3, 7, 10] }
];

export const ALL_CHORD_QUALITIES = [...TRIAD_QUALITIES, ...SEVENTH_QUALITIES];

export type ChordDifficulty = 'triads' | 'with-7ths';

export const CHORD_DIFFICULTIES: { key: ChordDifficulty; label: string; qualities: ChordQuality[] }[] = [
	{ key: 'triads', label: 'Triads', qualities: TRIAD_QUALITIES },
	{ key: 'with-7ths', label: 'With 7ths', qualities: ALL_CHORD_QUALITIES }
];
