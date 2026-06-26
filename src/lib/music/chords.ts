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
	{ name: 'Sus4', shortName: 'Sus4', intervals: [0, 5, 7], formula: '1-4-5', hint: 'Major, 3rd replaced by 4th' },
	{ name: 'Power Chord', shortName: '5', intervals: [0, 7], formula: '1-5', hint: 'Root and 5th only, no 3rd' }
];

export const SEVENTH_QUALITIES: ChordQuality[] = [
	{ name: 'Dominant 7', shortName: 'Dom7', intervals: [0, 4, 7, 10], formula: '1-3-5-b7', hint: 'Major + flat 7th' },
	{ name: 'Major 7', shortName: 'Maj7', intervals: [0, 4, 7, 11], formula: '1-3-5-7', hint: 'Major + natural 7th' },
	{ name: 'Minor 7', shortName: 'Min7', intervals: [0, 3, 7, 10], formula: '1-b3-5-b7', hint: 'Minor + flat 7th' },
	{ name: 'Diminished 7', shortName: 'Dim7', intervals: [0, 3, 6, 9], formula: '1-b3-b5-bb7', hint: 'Fully diminished, symmetric' },
	{ name: 'Half-Diminished', shortName: 'm7b5', intervals: [0, 3, 6, 10], formula: '1-b3-b5-b7', hint: 'Diminished triad + minor 7th' },
	{ name: 'Augmented 7', shortName: 'Aug7', intervals: [0, 4, 8, 10], formula: '1-3-#5-b7', hint: 'Augmented triad + flat 7th' },
	{ name: 'Minor-Major 7', shortName: 'mMaj7', intervals: [0, 3, 7, 11], formula: '1-b3-5-7', hint: 'Minor triad + natural 7th' },
	{ name: '7sus4', shortName: '7sus4', intervals: [0, 5, 7, 10], formula: '1-4-5-b7', hint: 'Dominant 7 with 4th instead of 3rd' },
	{ name: 'Major 6', shortName: '6', intervals: [0, 4, 7, 9], formula: '1-3-5-6', hint: 'Major triad + major 6th' },
	{ name: 'Minor 6', shortName: 'm6', intervals: [0, 3, 7, 9], formula: '1-b3-5-6', hint: 'Minor triad + major 6th' }
];

export const EXTENSION_QUALITIES: ChordQuality[] = [
	{ name: 'Add 9', shortName: 'add9', intervals: [0, 4, 7, 14], formula: '1-3-5-9', hint: 'Major triad + 9th (no 7th)' },
	{ name: 'Add 11', shortName: 'add11', intervals: [0, 4, 7, 17], formula: '1-3-5-11', hint: 'Major triad + 11th (no 7th)' }
];

export const ALL_CHORD_QUALITIES = [...TRIAD_QUALITIES, ...SEVENTH_QUALITIES, ...EXTENSION_QUALITIES];

export type ChordGroup = 'triads' | 'sevenths' | 'extensions' | 'all';

const MAJOR = TRIAD_QUALITIES[0];
const MINOR = TRIAD_QUALITIES[1];

export const CHORD_GROUPS: { key: ChordGroup; label: string; qualities: ChordQuality[] }[] = [
	{ key: 'triads', label: 'Triads', qualities: TRIAD_QUALITIES },
	{
		key: 'sevenths', label: 'Sevenths', qualities: [
			MAJOR, MINOR,
			...SEVENTH_QUALITIES.filter(q => ['Dom7', 'Maj7', 'Min7', 'Dim7', 'm7b5', 'mMaj7', '7sus4'].includes(q.shortName))
		]
	},
	{
		key: 'extensions', label: 'Extensions', qualities: [
			MAJOR, MINOR,
			...EXTENSION_QUALITIES,
			...SEVENTH_QUALITIES.filter(q => ['6', 'm6', 'Aug7'].includes(q.shortName))
		]
	},
	{ key: 'all', label: 'All', qualities: ALL_CHORD_QUALITIES }
];
