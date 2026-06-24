import { parseOnly } from 'abcjs';
import type { AudioTrackNoteItem } from 'abcjs';
import * as Tone from 'tone';
import { ensureStarted, getSynth } from './engine.js';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

function midiToNoteName(midi: number): string {
	const name = NOTE_NAMES[midi % 12];
	const octave = Math.floor(midi / 12) - 1;
	return `${name}${octave}`;
}

export interface AbcNote {
	note: string;
	time: number;
	duration: number;
}

export function parseAbc(abc: string): AbcNote[] {
	const [tune] = parseOnly(abc);
	const audio = tune.setUpAudio({ qpm: 100 });
	const track = audio.tracks[0];
	if (!track) return [];

	const notes: AbcNote[] = [];
	for (const item of track) {
		if (item.cmd !== 'note') continue;
		const noteItem = item as AudioTrackNoteItem;
		notes.push({
			note: midiToNoteName(noteItem.pitch),
			time: noteItem.start,
			duration: noteItem.duration
		});
	}

	return notes;
}

function extractQpm(abc: string): number {
	const match = abc.match(/Q:\s*1\/4\s*=\s*(\d+)/);
	return match ? parseInt(match[1], 10) : 100;
}

export async function playAbc(abc: string): Promise<number> {
	const notes = parseAbc(abc);
	if (notes.length === 0) return 0;

	await ensureStarted();
	const now = Tone.now();
	const scale = 240 / extractQpm(abc);

	let endTime = 0;
	for (const { note, time, duration } of notes) {
		getSynth().triggerAttack(note, now + time * scale);
		endTime = Math.max(endTime, (time + duration) * scale);
	}

	return endTime;
}
