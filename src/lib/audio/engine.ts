import * as Tone from 'tone';

const POOL_SIZE = 6;
let synthPool: Tone.PluckSynth[] = [];
let nextSynth = 0;

export async function ensureStarted() {
	if (Tone.getContext().state !== 'running') {
		await Tone.start();
	}
	if (synthPool.length === 0) {
		for (let i = 0; i < POOL_SIZE; i++) {
			synthPool.push(
				new Tone.PluckSynth({
					attackNoise: 2,
					dampening: 4000,
					resonance: 0.98
				}).toDestination()
			);
		}
	}
}

export function getSynth(): Tone.PluckSynth {
	const s = synthPool[nextSynth % POOL_SIZE];
	nextSynth++;
	return s;
}

export function stopAll() {
	for (const s of synthPool) {
		s.dispose();
	}
	synthPool = [];
	nextSynth = 0;
	for (let i = 0; i < POOL_SIZE; i++) {
		synthPool.push(
			new Tone.PluckSynth({
				attackNoise: 2,
				dampening: 4000,
				resonance: 0.98
			}).toDestination()
		);
	}
}

export async function playNote(noteString: string) {
	await ensureStarted();
	getSynth().triggerAttack(noteString, Tone.now());
}

export async function playNotes(noteStrings: string[], staggerMs = 0) {
	await ensureStarted();
	const now = Tone.now();
	for (let i = 0; i < noteStrings.length; i++) {
		getSynth().triggerAttack(noteStrings[i], now + (i * staggerMs) / 1000);
	}
}

export async function playIntervalPattern(note1: string, note2: string) {
	await ensureStarted();
	const now = Tone.now();
	const noteDuration = 0.5;
	const pauseDuration = 0.2;
	const strumStagger = 0.04;

	const s1 = getSynth();
	const s2 = getSynth();
	s1.triggerAttack(note1, now);
	s2.triggerAttack(note2, now + noteDuration);
	const strumTime = now + noteDuration * 2 + pauseDuration;
	s1.triggerAttack(note1, strumTime);
	s2.triggerAttack(note2, strumTime + strumStagger);
}

export async function playProgressionPattern(chords: string[][]) {
	await ensureStarted();
	const now = Tone.now();
	const strumStagger = 0.04;
	const chordDuration = 1.2;

	for (let c = 0; c < chords.length; c++) {
		const chordStart = now + c * chordDuration;
		const notes = chords[c];
		for (let i = 0; i < notes.length; i++) {
			getSynth().triggerAttack(notes[i], chordStart + i * strumStagger);
		}
	}
}

export async function playChordPattern(notes: string[]) {
	await ensureStarted();
	const now = Tone.now();
	const noteDuration = 0.5;
	const pauseDuration = 0.2;
	const strumStagger = 0.04;

	const synths = notes.map(() => getSynth());
	for (let i = 0; i < notes.length; i++) {
		synths[i].triggerAttack(notes[i], now + i * noteDuration);
	}
	const strumTime = now + notes.length * noteDuration + pauseDuration;
	for (let i = 0; i < notes.length; i++) {
		synths[i].triggerAttack(notes[i], strumTime + i * strumStagger);
	}
}
