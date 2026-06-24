import { midiToNote, noteToString, STANDARD_TUNING } from '$lib/music/notes';
import { type ChordQuality } from '$lib/music/chords';

const FRETBOARD_MIN_MIDI = Math.min(...STANDARD_TUNING);
const FRETBOARD_MAX_MIDI = Math.max(...STANDARD_TUNING) + 12;

export interface ChordQuestion {
	rootMidi: number;
	chordMidis: number[];
	quality: ChordQuality;
	noteStrings: string[];
}

export function generateChordQuestion(qualities: ChordQuality[]): ChordQuestion {
	const quality = qualities[Math.floor(Math.random() * qualities.length)];
	const maxInterval = Math.max(...quality.intervals);
	const maxRoot = FRETBOARD_MAX_MIDI - maxInterval;
	const rootMidi =
		FRETBOARD_MIN_MIDI + Math.floor(Math.random() * (maxRoot - FRETBOARD_MIN_MIDI + 1));

	const chordMidis = quality.intervals.map((i) => rootMidi + i);
	const noteStrings = chordMidis.map((m) => noteToString(midiToNote(m)));

	return { rootMidi, chordMidis, quality, noteStrings };
}
