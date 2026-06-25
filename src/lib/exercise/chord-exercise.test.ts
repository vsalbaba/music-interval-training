import { describe, it, expect } from 'vitest';
import { getChordVoicing } from './chord-exercise';
import { CAGED_SHAPES, applyOffset, type CagedFamily } from '$lib/music/caged-shapes';
import { STANDARD_TUNING } from '$lib/music/notes';
import type { ChordQuality } from '$lib/music/chords';

const MAJOR: ChordQuality = { name: 'Major', shortName: 'Maj', intervals: [0, 4, 7], formula: '1-3-5', hint: '' };
const MINOR: ChordQuality = { name: 'Minor', shortName: 'Min', intervals: [0, 3, 7], formula: '1-b3-5', hint: '' };

function makeQuality(name: string, intervals: number[]): ChordQuality {
	return { name, shortName: '', intervals, formula: '', hint: '' };
}

describe('getChordVoicing', () => {
	it('returns MIDI notes from the looked-up voicing when shape exists', () => {
		const midis = getChordVoicing('E', 0, MAJOR);
		// E Major open: frets [0, 2, 2, 1, 0, 0], all strings sounded
		// MIDI values: 40, 47, 52, 56, 59, 64
		expect(midis.length).toBeGreaterThanOrEqual(3);
		// Root note should be E2 = 40
		expect(midis[0]).toBe(40);
		// All notes should be valid MIDI
		midis.forEach(m => expect(m).toBeGreaterThanOrEqual(0));
	});

	it('returns notes from the first variant when multiple shapes exist', () => {
		// E Minor has two shape variants in CAGED_SHAPES
		const shapes = CAGED_SHAPES.filter(s => s.family === 'E' && s.quality === 'Minor');
		expect(shapes.length).toBeGreaterThan(1);

		const midis = getChordVoicing('E', 0, MINOR);
		// Should use the first variant: [0, 2, 2, 0, 0, 0]
		const firstVoicing = applyOffset(shapes[0], 0);
		const firstMidis = firstVoicing.strings
			.filter((s): s is NonNullable<typeof s> => s !== null)
			.map(s => s.midi);
		// The result should contain notes from the first shape
		midis.forEach(m => expect(firstMidis).toContain(m));
	});

	it('falls back to rootMidi + intervals when no shape exists', () => {
		const fake = makeQuality('NonexistentQuality', [0, 5, 9]);
		const offset = 3;
		const midis = getChordVoicing('A', offset, fake);
		// A root string is index 1, MIDI 45. With offset 3: 48
		const expectedRoot = STANDARD_TUNING[1] + offset;
		expect(midis).toEqual([expectedRoot, expectedRoot + 5, expectedRoot + 9]);
	});

	it('produces valid output for all five CAGED families with Major quality', () => {
		const families: CagedFamily[] = ['C', 'A', 'G', 'E', 'D'];
		for (const family of families) {
			const midis = getChordVoicing(family, 0, MAJOR);
			expect(midis.length).toBeGreaterThanOrEqual(3);
			midis.forEach(m => {
				expect(m).toBeGreaterThanOrEqual(0);
				expect(m).toBeLessThanOrEqual(127);
			});
		}
	});

	it('produces valid output for all five CAGED families with Minor quality', () => {
		const families: CagedFamily[] = ['C', 'A', 'G', 'E', 'D'];
		for (const family of families) {
			const midis = getChordVoicing(family, 0, MINOR);
			expect(midis.length).toBeGreaterThanOrEqual(3);
			midis.forEach(m => {
				expect(m).toBeGreaterThanOrEqual(0);
				expect(m).toBeLessThanOrEqual(127);
			});
		}
	});

	it('applies offset correctly when shape exists', () => {
		const open = getChordVoicing('E', 0, MAJOR);
		const barred = getChordVoicing('E', 3, MAJOR);
		// Every note should shift up by 3 semitones
		expect(barred.length).toBe(open.length);
		for (let i = 0; i < open.length; i++) {
			expect(barred[i]).toBe(open[i] + 3);
		}
	});
});
