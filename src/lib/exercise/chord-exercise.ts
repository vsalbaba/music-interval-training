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

export const CHORD_SUFFIX_MAP: Record<string, string> = {
	Maj: '', Min: 'm', Dim: 'dim', Aug: 'aug', Sus2: 'sus2', Sus4: 'sus4',
	'5': '5', Dom7: '7', Maj7: 'maj7', Min7: 'm7', Dim7: 'dim7',
	m7b5: 'm7b5', Aug7: 'aug7', mMaj7: 'mMaj7', '7sus4': '7sus4',
	'6': '6', m6: 'm6', add9: 'add9', add11: 'add11'
};

export const FAMILY_ROOT_NAMES: Record<CagedFamily, string> = {
	C: 'C', A: 'A', G: 'G', E: 'E', D: 'D'
};

export interface OpenChordOption {
	label: string;
	quality: ChordQuality;
	rootNote: string;
	family: CagedFamily;
}

export function chordLabel(rootNote: string, shortName: string): string {
	const suffix = CHORD_SUFFIX_MAP[shortName] ?? shortName;
	return rootNote + suffix;
}

export function getChordVoicing(family: CagedFamily, offset: number, quality: ChordQuality): number[] {
	return getChordVoicingNotes(family, offset, quality).map(n => n.midi);
}

function allSoundedNotes(voicing: AbsoluteVoicing): AbsoluteStringNote[] {
	return voicing.strings.filter((s): s is AbsoluteStringNote => s !== null);
}

export function getChordVoicingNotes(family: CagedFamily, offset: number, quality: ChordQuality, targetRootMidi?: number): AbsoluteStringNote[] {
	const shape = CAGED_SHAPES.find(s => s.family === family && s.quality === quality.name);
	if (shape) {
		let effectiveOffset = offset;
		if (targetRootMidi !== undefined) {
			const rootFretInShape = shape.frets[shape.rootStringIndex]!;
			effectiveOffset = targetRootMidi - STANDARD_TUNING[shape.rootStringIndex] - rootFretInShape;
		}
		const voicing = applyOffset(shape, effectiveOffset);
		return allSoundedNotes(voicing);
	}
	const rootStringIndex = FAMILY_ROOT_STRING[family];
	const rootMidi = targetRootMidi ?? (STANDARD_TUNING[rootStringIndex] + offset);
	const rootOffset = rootMidi - STANDARD_TUNING[rootStringIndex];
	return quality.intervals.map((interval, i) => ({
		stringIndex: rootStringIndex,
		fret: rootOffset + interval,
		midi: rootMidi + interval,
		pitchClass: (rootMidi + interval) % 12,
		isRoot: i === 0
	}));
}

export interface GenerateChordOptions {
	openOnly?: boolean;
}

export function generateOpenChordOptions(
	question: ChordQuestion,
	qualities: ChordQuality[]
): OpenChordOption[] {
	const correctRoot = FAMILY_ROOT_NAMES[question.shape.family];
	const correctLabel = chordLabel(correctRoot, question.quality.shortName);
	const correct: OpenChordOption = {
		label: correctLabel,
		quality: question.quality,
		rootNote: correctRoot,
		family: question.shape.family
	};

	const families: CagedFamily[] = ['C', 'A', 'G', 'E', 'D'];
	const seen = new Set<string>([correctLabel]);
	const pool: OpenChordOption[] = [];

	for (const family of families) {
		const root = FAMILY_ROOT_NAMES[family];
		for (const q of qualities) {
			const hasShape = CAGED_SHAPES.some(s => s.family === family && s.quality === q.name);
			if (!hasShape) continue;
			const label = chordLabel(root, q.shortName);
			if (seen.has(label)) continue;
			seen.add(label);
			pool.push({ label, quality: q, rootNote: root, family });
		}
	}

	const shuffled = pool.sort(() => Math.random() - 0.5);
	const distractors = shuffled.slice(0, Math.min(shuffled.length, 7));

	return [correct, ...distractors].sort(() => Math.random() - 0.5);
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
