import { midiToNote, noteToString } from '$lib/music/notes';
import { type ChordQuality } from '$lib/music/chords';
import {
	CAGED_SHAPES,
	getValidOffsets,
	applyOffset,
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

function selectPlayedNotes(voicing: AbsoluteVoicing): AbsoluteStringNote[] {
	const sounded = voicing.strings.filter((s): s is AbsoluteStringNote => s !== null);

	const byPitchClass = new Map<number, AbsoluteStringNote[]>();
	for (const note of sounded) {
		const group = byPitchClass.get(note.pitchClass) ?? [];
		group.push(note);
		byPitchClass.set(note.pitchClass, group);
	}

	const selected: AbsoluteStringNote[] = [];
	for (const [, notes] of byPitchClass) {
		notes.sort((a, b) => a.stringIndex - b.stringIndex);
		selected.push(notes[0]);
	}

	selected.sort((a, b) => a.stringIndex - b.stringIndex);

	const root = selected.find((n) => n.isRoot);
	if (root) {
		const highest = selected.reduce((a, b) => (a.midi > b.midi ? a : b));
		if (Math.floor(highest.midi / 12) !== Math.floor(root.midi / 12)) {
			const rootOctave = sounded.find(
				(n) => n.pitchClass === root.pitchClass && n.midi > root.midi
			);
			if (rootOctave && rootOctave.midi < highest.midi && !selected.some((n) => n.midi === rootOctave.midi)) {
				selected.push(rootOctave);
				selected.sort((a, b) => a.stringIndex - b.stringIndex);
			}
		}
	}

	return selected;
}

export function generateChordQuestion(qualities: ChordQuality[]): ChordQuestion {
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
	const offset = offsets[Math.floor(Math.random() * offsets.length)];

	const voicing = applyOffset(shape, offset);
	const playedNotes = selectPlayedNotes(voicing);

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
