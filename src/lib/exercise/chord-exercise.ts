import { midiToNote, noteToString, STANDARD_TUNING } from '$lib/music/notes';
import { type ChordQuality } from '$lib/music/chords';
import {
	CAGED_SHAPES,
	getValidOffsets,
	applyOffset,
	type CagedFamily,
	type ChordShape,
	type AbsoluteVoicing,
	type AbsoluteStringNote
} from '$lib/music/caged-shapes';

export interface ChordQuestion {
	rootMidi: number;
	chordMidis: number[];
	quality: ChordQuality;
	noteStrings: string[];
	shape: ChordShape;
	offset: number;
	voicing: AbsoluteVoicing;
	playedNotes: AbsoluteStringNote[];
}


const FAMILY_ROOT_STRING: Record<CagedFamily, number> = {
	'C': 1,
	'A': 1,
	'G': 0,
	'E': 0,
	'D': 2
};

export function getChordVoicing(family: CagedFamily, offset: number, quality: ChordQuality): number[] {
	return getChordVoicingNotes(family, offset, quality).map(n => n.midi);
}

function allSoundedNotes(voicing: AbsoluteVoicing): AbsoluteStringNote[] {
	return voicing.strings.filter((s): s is AbsoluteStringNote => s !== null);
}

export function getChordVoicingNotes(family: CagedFamily, offset: number, quality: ChordQuality): AbsoluteStringNote[] {
	const shape = CAGED_SHAPES.find(s => s.family === family && s.quality === quality.name);
	if (shape) {
		const voicing = applyOffset(shape, offset);
		return allSoundedNotes(voicing);
	}
	const rootStringIndex = FAMILY_ROOT_STRING[family];
	const rootMidi = STANDARD_TUNING[rootStringIndex] + offset;
	return quality.intervals.map((interval, i) => ({
		stringIndex: rootStringIndex,
		fret: offset + interval,
		midi: rootMidi + interval,
		pitchClass: (rootMidi + interval) % 12,
		isRoot: i === 0
	}));
}

export interface GenerateChordOptions {
	openOnly?: boolean;
}

export function generateChordQuestion(qualities: ChordQuality[], options?: GenerateChordOptions): ChordQuestion {
	let quality: ChordQuality;
	let matchingShapes: ChordShape[];

	// Pick a quality that has shapes available
	const shuffled = [...qualities].sort(() => Math.random() - 0.5);
	quality = shuffled[0];
	matchingShapes = CAGED_SHAPES.filter((s) => s.quality === quality.name);
	for (const q of shuffled) {
		const shapes = CAGED_SHAPES.filter((s) => s.quality === q.name);
		if (shapes.length > 0) {
			quality = q;
			matchingShapes = shapes;
			break;
		}
	}

	const shape = matchingShapes[Math.floor(Math.random() * matchingShapes.length)];

	const offsets = getValidOffsets(shape);
	const offset = options?.openOnly ? 0 : offsets[Math.floor(Math.random() * offsets.length)];

	const voicing = applyOffset(shape, offset);
	const playedNotes = allSoundedNotes(voicing);

	const rootNote = playedNotes.find((n) => n.isRoot) ?? playedNotes[0];
	const chordMidis = playedNotes.map((n) => n.midi);
	const noteStrings = playedNotes.map((n) => noteToString(midiToNote(n.midi)));

	return {
		rootMidi: rootNote.midi,
		chordMidis,
		quality,
		noteStrings,
		shape,
		offset,
		voicing,
		playedNotes
	};
}
