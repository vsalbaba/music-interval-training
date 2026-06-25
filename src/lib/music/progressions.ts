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

export type ProgressionDifficulty = 'easy' | 'medium' | 'hard';

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

export const MEDIUM_PROGRESSIONS: Progression[] = [
	{
		degrees: ['I', 'V', 'vi', 'IV'],
		nashville: 'I V vi IV',
		songs: ['Let It Be', 'No Woman No Cry']
	},
	{
		degrees: ['I', 'vi', 'IV', 'V'],
		nashville: 'I vi IV V',
		songs: ['Stand by Me', 'Every Breath You Take']
	},
	{
		degrees: ['vi', 'IV', 'I', 'V'],
		nashville: 'vi IV I V',
		songs: ['Despacito', 'Numb']
	},
	{
		degrees: ['I', 'IV', 'vi', 'V'],
		nashville: 'I IV vi V',
		songs: ['Africa', 'Take Me Home, Country Roads']
	}
];

export const HARD_PROGRESSIONS: Progression[] = [
	{
		degrees: ['ii', 'V', 'I'],
		nashville: 'ii V I',
		songs: ['Fly Me to the Moon', 'Autumn Leaves']
	},
	{
		degrees: ['I', 'vi', 'ii', 'V'],
		nashville: 'I vi ii V',
		songs: ['I Got Rhythm', 'Heart and Soul']
	},
	{
		degrees: ['I', 'IV', 'V', 'IV'],
		nashville: 'I IV V IV',
		songs: ['Louie Louie', 'Wild Thing']
	},
	{
		degrees: ['vi', 'IV', 'V', 'I'],
		nashville: 'vi IV V I',
		songs: ['Boulevard of Broken Dreams']
	}
];

export const PROGRESSION_DIFFICULTIES: { key: ProgressionDifficulty; label: string; progressions: Progression[] }[] = [
	{ key: 'easy', label: 'Easy', progressions: EASY_PROGRESSIONS },
	{ key: 'medium', label: 'Medium', progressions: [...EASY_PROGRESSIONS, ...MEDIUM_PROGRESSIONS] },
	{ key: 'hard', label: 'Hard', progressions: [...EASY_PROGRESSIONS, ...MEDIUM_PROGRESSIONS, ...HARD_PROGRESSIONS] }
];

export function getProgressionPool(difficulty: ProgressionDifficulty): Progression[] {
	const config = PROGRESSION_DIFFICULTIES.find(d => d.key === difficulty);
	return config?.progressions ?? EASY_PROGRESSIONS;
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
