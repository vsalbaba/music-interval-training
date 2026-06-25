export interface NashvilleDegree {
	roman: string;
	semitonesFromRoot: number;
	quality: 'Major' | 'Minor' | 'Diminished';
}

export const NASHVILLE_DEGREES: NashvilleDegree[] = [
	{ roman: 'I',    semitonesFromRoot: 0,  quality: 'Major' },
	{ roman: 'ii',   semitonesFromRoot: 2,  quality: 'Minor' },
	{ roman: 'iii',  semitonesFromRoot: 4,  quality: 'Minor' },
	{ roman: 'IV',   semitonesFromRoot: 5,  quality: 'Major' },
	{ roman: 'V',    semitonesFromRoot: 7,  quality: 'Major' },
	{ roman: 'vi',   semitonesFromRoot: 9,  quality: 'Minor' },
	{ roman: 'vii°', semitonesFromRoot: 11, quality: 'Diminished' }
];

export interface Progression {
	degrees: string[];
	nashville: string;
	songs: string[];
}

export type ProgressionDifficulty = 'easy';

export const EASY_PROGRESSIONS: Progression[] = [
	{
		degrees: ['I', 'IV', 'V'],
		nashville: 'I IV V',
		songs: ['La Bamba', 'Twist and Shout']
	},
	{
		degrees: ['I', 'V', 'IV'],
		nashville: 'I V IV',
		songs: ['Born in the U.S.A.']
	},
	{
		degrees: ['I', 'IV', 'I', 'V'],
		nashville: 'I IV I V',
		songs: ['You Are My Sunshine']
	},
	{
		degrees: ['IV', 'V', 'I'],
		nashville: 'IV V I',
		songs: ['Happy Birthday']
	}
];

export function getProgressionPool(_difficulty: ProgressionDifficulty): Progression[] {
	return EASY_PROGRESSIONS;
}

export function getDegree(roman: string): NashvilleDegree | undefined {
	return NASHVILLE_DEGREES.find(d => d.roman === roman);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function degreeToChordName(roman: string, keyPitchClass: number): string {
	const degree = getDegree(roman);
	if (!degree) return roman;
	const chordRoot = NOTE_NAMES[((keyPitchClass + degree.semitonesFromRoot) % 12 + 12) % 12];
	const suffix = degree.quality === 'Minor' ? 'm' : degree.quality === 'Diminished' ? 'dim' : '';
	return chordRoot + suffix;
}

export function resolveProgressionChordNames(progression: Progression, keyPitchClass: number): string[] {
	return progression.degrees.map(d => degreeToChordName(d, keyPitchClass));
}
