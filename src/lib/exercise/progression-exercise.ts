import {
	type Progression,
	type ProgressionDifficulty,
	getProgressionPool,
	getDegree,
	resolveProgressionChordNames
} from '$lib/music/progressions';
import { type CagedFamily, CAGED_SHAPES, getValidOffsets } from '$lib/music/caged-shapes';
import { getChordVoicingNotes, type ChordQuestion } from '$lib/exercise/chord-exercise';
import type { ChordQuality } from '$lib/music/chords';
import { TRIAD_QUALITIES } from '$lib/music/chords';
import { midiToNote, noteToString } from '$lib/music/notes';
import type { AbsoluteStringNote } from '$lib/music/caged-shapes';

export interface ProgressionChordVoicing {
	degree: string;
	quality: ChordQuality;
	family: CagedFamily;
	offset: number;
	notes: AbsoluteStringNote[];
	noteStrings: string[];
}

export interface ProgressionQuestion {
	progression: Progression;
	keyPitchClass: number;
	keyName: string;
	chordNames: string[];
	voicings: ProgressionChordVoicing[];
	options: Progression[];
}

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function qualityForDegree(roman: string): ChordQuality {
	const degree = getDegree(roman);
	if (!degree) return TRIAD_QUALITIES[0];
	return TRIAD_QUALITIES.find(q => q.name === degree.quality) ?? TRIAD_QUALITIES[0];
}

function pickFamilyAndOffset(keyPitchClass: number): { family: CagedFamily; offset: number } {
	const families: CagedFamily[] = ['E', 'A', 'D', 'G', 'C'];
	const shuffled = [...families].sort(() => Math.random() - 0.5);

	for (const family of shuffled) {
		const majorShapes = CAGED_SHAPES.filter(s => s.family === family && s.quality === 'Major');
		if (majorShapes.length === 0) continue;
		const shape = majorShapes[0];
		const offsets = getValidOffsets(shape);
		const rootStringMidi = family === 'E' || family === 'G' ? 40 : family === 'A' || family === 'C' ? 45 : 50;
		const neededOffset = ((keyPitchClass - (rootStringMidi % 12)) % 12 + 12) % 12;
		if (offsets.includes(neededOffset)) {
			return { family, offset: neededOffset };
		}
	}

	return { family: 'E', offset: keyPitchClass };
}

function buildVoicings(
	degrees: string[],
	family: CagedFamily,
	baseOffset: number
): ProgressionChordVoicing[] {
	return degrees.map(roman => {
		const quality = qualityForDegree(roman);
		const degree = getDegree(roman);
		const degreeSemitones = degree?.semitonesFromRoot ?? 0;
		const chordOffset = (baseOffset + degreeSemitones) % 12;
		const notes = getChordVoicingNotes(family, chordOffset, quality);
		const noteStrings = notes.map(n => noteToString(midiToNote(n.midi)));
		return { degree: roman, quality, family, offset: chordOffset, notes, noteStrings };
	});
}

export function selectDistractors(
	correct: Progression,
	pool: Progression[],
	count: number
): Progression[] {
	const others = pool.filter(p => p.nashville !== correct.nashville);
	const sameLength = others.filter(p => p.degrees.length === correct.degrees.length);
	const candidates = sameLength.length >= count ? sameLength : others;
	const shuffled = [...candidates].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

export function generateProgressionQuestion(difficulty: ProgressionDifficulty): ProgressionQuestion {
	const pool = getProgressionPool(difficulty);
	const progression = pool[Math.floor(Math.random() * pool.length)];
	const keyPitchClass = Math.floor(Math.random() * 12);
	const keyName = KEY_NAMES[keyPitchClass];
	const chordNames = resolveProgressionChordNames(progression, keyPitchClass);

	const { family, offset } = pickFamilyAndOffset(keyPitchClass);
	const voicings = buildVoicings(progression.degrees, family, offset);

	const distractors = selectDistractors(progression, pool, 3);
	const options = [progression, ...distractors].sort(() => Math.random() - 0.5);

	return {
		progression,
		keyPitchClass,
		keyName,
		chordNames,
		voicings,
		options
	};
}
