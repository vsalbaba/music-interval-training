import { midiToNote, noteToString, STANDARD_TUNING } from '$lib/music/notes';
import { EASY_INTERVALS, type Interval } from '$lib/music/intervals';

const FRETBOARD_MIN_MIDI = Math.min(...STANDARD_TUNING);
const FRETBOARD_MAX_MIDI = Math.max(...STANDARD_TUNING) + 12;

export interface IntervalQuestion {
	rootMidi: number;
	intervalMidi: number;
	interval: Interval;
	rootNoteString: string;
	intervalNoteString: string;
}

export function generateQuestion(intervals: Interval[]): IntervalQuestion {
	const interval = intervals[Math.floor(Math.random() * intervals.length)];
	const maxRoot = FRETBOARD_MAX_MIDI - interval.semitones;
	const rootMidi =
		FRETBOARD_MIN_MIDI + Math.floor(Math.random() * (maxRoot - FRETBOARD_MIN_MIDI + 1));
	const intervalMidi = rootMidi + interval.semitones;

	return {
		rootMidi,
		intervalMidi,
		interval,
		rootNoteString: noteToString(midiToNote(rootMidi)),
		intervalNoteString: noteToString(midiToNote(intervalMidi))
	};
}
