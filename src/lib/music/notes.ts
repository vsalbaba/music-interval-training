export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface Note {
	name: NoteName;
	octave: number;
	midi: number;
}

export function midiToNote(midi: number): Note {
	const name = NOTE_NAMES[midi % 12];
	const octave = Math.floor(midi / 12) - 1;
	return { name, octave, midi };
}

export function noteToString(note: Note): string {
	return `${note.name}${note.octave}`;
}

export const STANDARD_TUNING: number[] = [
	40, // E2 - low E (6th string)
	45, // A2
	50, // D3
	55, // G3
	59, // B3
	64  // E4 - high E (1st string)
];

export function getFretboardNote(stringIndex: number, fret: number): Note {
	const midi = STANDARD_TUNING[stringIndex] + fret;
	return midiToNote(midi);
}
