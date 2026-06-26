import { STANDARD_TUNING } from '$lib/music/notes';
import { type ChordQuality, CHORD_GROUPS, type ChordGroup } from '$lib/music/chords';
import { CAGED_SHAPES, applyOffset, type AbsoluteStringNote } from '$lib/music/caged-shapes';
import type { SelectedFret } from '$lib/types/fretboard';

export interface ChordBuilderQuestion {
	quality: ChordQuality;
	rootPitchClass: number;
	rootHint: { stringIndex: number; fret: number };
	validPitchClasses: number[];
}

export interface NoteResult {
	stringIndex: number;
	fret: number;
	pitchClass: number;
	isValid: boolean;
}

export interface ChordBuilderValidation {
	correct: boolean;
	noteResults: NoteResult[];
	missingPitchClasses: number[];
	extraPitchClasses: number[];
}

const MAX_FRET = 8;

export function generateChordBuilderQuestion(group: ChordGroup): ChordBuilderQuestion {
	const groupDef = CHORD_GROUPS.find((g) => g.key === group);
	if (!groupDef) throw new Error(`Unknown chord group: ${group}`);

	const qualities = groupDef.qualities;
	const quality = qualities[Math.floor(Math.random() * qualities.length)];
	const rootPitchClass = Math.floor(Math.random() * 12);

	const validPositions: { stringIndex: number; fret: number }[] = [];
	for (let s = 0; s < 6; s++) {
		for (let f = 0; f <= MAX_FRET; f++) {
			if ((STANDARD_TUNING[s] + f) % 12 === rootPitchClass) {
				validPositions.push({ stringIndex: s, fret: f });
			}
		}
	}

	const rootHint = validPositions[Math.floor(Math.random() * validPositions.length)];

	const validPitchClasses = quality.intervals.map((interval) => (rootPitchClass + interval) % 12);

	return { quality, rootPitchClass, rootHint, validPitchClasses };
}

export function validateChordBuilderAnswer(
	question: ChordBuilderQuestion,
	selectedFrets: SelectedFret[]
): ChordBuilderValidation {
	const noteResults: NoteResult[] = selectedFrets.map((sel) => {
		const pitchClass = (STANDARD_TUNING[sel.stringIndex] + sel.fret) % 12;
		const isValid = question.validPitchClasses.includes(pitchClass);
		return { stringIndex: sel.stringIndex, fret: sel.fret, pitchClass, isValid };
	});

	const presentPitchClasses = new Set(noteResults.filter((n) => n.isValid).map((n) => n.pitchClass));
	const missingPitchClasses = question.validPitchClasses.filter((pc) => !presentPitchClasses.has(pc));

	const extraPitchClasses = [
		...new Set(noteResults.filter((n) => !n.isValid).map((n) => n.pitchClass))
	];

	const correct = missingPitchClasses.length === 0 && extraPitchClasses.length === 0;

	return { correct, noteResults, missingPitchClasses, extraPitchClasses };
}

export interface ReferenceVoicing {
	notes: AbsoluteStringNote[];
}

export function findReferenceVoicing(question: ChordBuilderQuestion): ReferenceVoicing | null {
	const shapes = CAGED_SHAPES.filter(s => s.quality === question.quality.name);
	if (shapes.length === 0) return null;

	const hintFret = question.rootHint.fret;
	const hintString = question.rootHint.stringIndex;

	let bestNotes: AbsoluteStringNote[] | null = null;
	let bestDistance = Infinity;

	for (const shape of shapes) {
		const rootFretInShape = shape.frets[shape.rootStringIndex];
		if (rootFretInShape === null) continue;

		const neededOffset = question.rootPitchClass - ((STANDARD_TUNING[shape.rootStringIndex] + rootFretInShape) % 12);
		const offset = ((neededOffset % 12) + 12) % 12;

		const maxShapeFret = Math.max(...shape.frets.filter((f): f is number => f !== null));
		if (maxShapeFret + offset > 12) continue;

		const voicing = applyOffset(shape, offset);
		const sounded = voicing.strings.filter((s): s is AbsoluteStringNote => s !== null);

		const rootNote = sounded.find(n => n.isRoot);
		if (!rootNote) continue;

		const distance = Math.abs(rootNote.fret - hintFret) + Math.abs(rootNote.stringIndex - hintString) * 2;
		if (distance < bestDistance) {
			bestDistance = distance;
			bestNotes = sounded;
		}
	}

	return bestNotes ? { notes: bestNotes } : null;
}
