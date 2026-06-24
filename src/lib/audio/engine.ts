import * as Tone from 'tone';

let synth: Tone.PluckSynth | null = null;

async function ensureStarted() {
	if (Tone.getContext().state !== 'running') {
		await Tone.start();
	}
	if (!synth) {
		synth = new Tone.PluckSynth({
			attackNoise: 2,
			dampening: 4000,
			resonance: 0.98
		}).toDestination();
	}
}

export async function playNote(noteString: string, duration = '4n') {
	await ensureStarted();
	synth!.triggerAttack(noteString, Tone.now());
}

export async function playNotes(noteStrings: string[], staggerMs = 0) {
	await ensureStarted();
	const now = Tone.now();
	for (let i = 0; i < noteStrings.length; i++) {
		synth!.triggerAttack(noteStrings[i], now + (i * staggerMs) / 1000);
	}
}

export async function playIntervalPattern(note1: string, note2: string) {
	await ensureStarted();
	const now = Tone.now();
	const noteDuration = 0.5;
	const pauseDuration = 0.2;
	const strumStagger = 0.04;

	synth!.triggerAttack(note1, now);
	synth!.triggerAttack(note2, now + noteDuration);
	const strumTime = now + noteDuration * 2 + pauseDuration;
	synth!.triggerAttack(note1, strumTime);
	synth!.triggerAttack(note2, strumTime + strumStagger);
}

export async function playChordPattern(notes: string[]) {
	await ensureStarted();
	const now = Tone.now();
	const noteDuration = 0.5;
	const pauseDuration = 0.2;
	const strumStagger = 0.04;

	for (let i = 0; i < notes.length; i++) {
		synth!.triggerAttack(notes[i], now + i * noteDuration);
	}
	const strumTime = now + notes.length * noteDuration + pauseDuration;
	for (let i = 0; i < notes.length; i++) {
		synth!.triggerAttack(notes[i], strumTime + i * strumStagger);
	}
}
