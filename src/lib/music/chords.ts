export interface ChordQuality {
	name: string;
	shortName: string;
	intervals: number[];
	formula: string;
	hint: string;
}

export const TRIAD_QUALITIES: ChordQuality[] = [
	{ name: 'Major', shortName: 'Maj', intervals: [0, 4, 7], formula: '1-3-5', hint: 'Bright, stable' },
	{ name: 'Minor', shortName: 'Min', intervals: [0, 3, 7], formula: '1-b3-5', hint: 'Major with flat 3rd' },
	{ name: 'Diminished', shortName: 'Dim', intervals: [0, 3, 6], formula: '1-b3-b5', hint: 'Minor with flat 5th' },
	{ name: 'Augmented', shortName: 'Aug', intervals: [0, 4, 8], formula: '1-3-#5', hint: 'Major with sharp 5th' },
	{ name: 'Sus2', shortName: 'Sus2', intervals: [0, 2, 7], formula: '1-2-5', hint: 'Major, 3rd replaced by 2nd' },
	{ name: 'Sus4', shortName: 'Sus4', intervals: [0, 5, 7], formula: '1-4-5', hint: 'Major, 3rd replaced by 4th' }
];

export const SEVENTH_QUALITIES: ChordQuality[] = [
	{ name: 'Dominant 7', shortName: 'Dom7', intervals: [0, 4, 7, 10], formula: '1-3-5-b7', hint: 'Major + flat 7th' },
	{ name: 'Major 7', shortName: 'Maj7', intervals: [0, 4, 7, 11], formula: '1-3-5-7', hint: 'Major + natural 7th' },
	{ name: 'Minor 7', shortName: 'Min7', intervals: [0, 3, 7, 10], formula: '1-b3-5-b7', hint: 'Minor + flat 7th' }
];

export const ALL_CHORD_QUALITIES = [...TRIAD_QUALITIES, ...SEVENTH_QUALITIES];

export type ChordDifficulty = 'triads' | 'with-7ths';

export const CHORD_DIFFICULTIES: { key: ChordDifficulty; label: string; qualities: ChordQuality[] }[] = [
	{ key: 'triads', label: 'Triads', qualities: TRIAD_QUALITIES },
	{ key: 'with-7ths', label: 'With 7ths', qualities: ALL_CHORD_QUALITIES }
];
