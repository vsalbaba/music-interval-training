import { describe, it, expect } from 'vitest';
import {
	generateChordBuilderQuestion,
	validateChordBuilderAnswer,
	type ChordBuilderQuestion
} from './chord-builder';
import { STANDARD_TUNING } from '$lib/music/notes';
import { CHORD_GROUPS, type ChordGroup } from '$lib/music/chords';

function makeQuestion(
	rootPitchClass: number,
	intervals: number[],
	rootHint = { stringIndex: 0, fret: 0 }
): ChordBuilderQuestion {
	return {
		quality: { name: 'Test', shortName: 'Tst', intervals, formula: '', hint: '' },
		rootPitchClass,
		rootHint,
		validPitchClasses: intervals.map((i) => (rootPitchClass + i) % 12)
	};
}

describe('generateChordBuilderQuestion', () => {
	const groups: ChordGroup[] = ['triads', 'sevenths', 'extensions', 'all'];

	for (const group of groups) {
		it(`generates questions from the "${group}" group`, () => {
			const groupDef = CHORD_GROUPS.find((g) => g.key === group)!;
			const q = generateChordBuilderQuestion(group);
			expect(groupDef.qualities).toContain(q.quality);
		});
	}

	it('root pitch class is 0-11', () => {
		for (let i = 0; i < 50; i++) {
			const q = generateChordBuilderQuestion('triads');
			expect(q.rootPitchClass).toBeGreaterThanOrEqual(0);
			expect(q.rootPitchClass).toBeLessThanOrEqual(11);
		}
	});

	it('root hint fret is 0-8', () => {
		for (let i = 0; i < 50; i++) {
			const q = generateChordBuilderQuestion('triads');
			expect(q.rootHint.fret).toBeGreaterThanOrEqual(0);
			expect(q.rootHint.fret).toBeLessThanOrEqual(8);
		}
	});

	it('root hint position matches root pitch class', () => {
		for (let i = 0; i < 50; i++) {
			const q = generateChordBuilderQuestion('all');
			const hintPitchClass = (STANDARD_TUNING[q.rootHint.stringIndex] + q.rootHint.fret) % 12;
			expect(hintPitchClass).toBe(q.rootPitchClass);
		}
	});

	it('valid pitch classes correctly computed from root + quality intervals', () => {
		for (let i = 0; i < 50; i++) {
			const q = generateChordBuilderQuestion('all');
			const expected = q.quality.intervals.map((interval) => (q.rootPitchClass + interval) % 12);
			expect(q.validPitchClasses).toEqual(expected);
		}
	});

	it('throws for unknown group', () => {
		expect(() => generateChordBuilderQuestion('nonexistent' as ChordGroup)).toThrow();
	});
});

describe('validateChordBuilderAnswer', () => {
	it('accepts a correct voicing with all pitch classes present', () => {
		// C Major: pitch classes 0, 4, 7
		const q = makeQuestion(0, [0, 4, 7]);
		// Pick frets that produce C(0), E(4), G(7)
		// String 0 (E2=40): fret 8 -> 48 % 12 = 0 (C)
		// String 1 (A2=45): fret 7 -> 52 % 12 = 4 (E)
		// String 2 (D3=50): fret 5 -> 55 % 12 = 7 (G)
		const result = validateChordBuilderAnswer(q, [
			{ stringIndex: 0, fret: 8 },
			{ stringIndex: 1, fret: 7 },
			{ stringIndex: 2, fret: 5 }
		]);
		expect(result.correct).toBe(true);
		expect(result.missingPitchClasses).toEqual([]);
		expect(result.extraPitchClasses).toEqual([]);
		expect(result.noteResults.every((n) => n.isValid)).toBe(true);
	});

	it('accepts doubled pitch classes', () => {
		// C Major with two C notes
		const q = makeQuestion(0, [0, 4, 7]);
		const result = validateChordBuilderAnswer(q, [
			{ stringIndex: 0, fret: 8 }, // C
			{ stringIndex: 1, fret: 7 }, // E
			{ stringIndex: 2, fret: 5 }, // G
			{ stringIndex: 5, fret: 8 }  // C again (64+8=72, 72%12=0)
		]);
		expect(result.correct).toBe(true);
	});

	it('rejects notes outside the chord pitch class set', () => {
		const q = makeQuestion(0, [0, 4, 7]); // C Major
		// Include an F# (pitchClass 6)
		// String 0 (E2=40): fret 6 -> 46 % 12 = 10 (Bb) -- wrong
		const result = validateChordBuilderAnswer(q, [
			{ stringIndex: 0, fret: 8 }, // C
			{ stringIndex: 1, fret: 7 }, // E
			{ stringIndex: 2, fret: 5 }, // G
			{ stringIndex: 0, fret: 6 }  // Bb -- wrong
		]);
		expect(result.correct).toBe(false);
		expect(result.extraPitchClasses.length).toBeGreaterThan(0);
		const wrongNote = result.noteResults.find((n) => n.fret === 6 && n.stringIndex === 0);
		expect(wrongNote?.isValid).toBe(false);
	});

	it('rejects answers missing a pitch class', () => {
		const q = makeQuestion(0, [0, 4, 7]); // C Major
		// Only C and E, missing G
		const result = validateChordBuilderAnswer(q, [
			{ stringIndex: 0, fret: 8 }, // C
			{ stringIndex: 1, fret: 7 }  // E
		]);
		expect(result.correct).toBe(false);
		expect(result.missingPitchClasses).toContain(7);
	});

	it('returns empty results for no selections', () => {
		const q = makeQuestion(0, [0, 4, 7]);
		const result = validateChordBuilderAnswer(q, []);
		expect(result.correct).toBe(false);
		expect(result.missingPitchClasses).toEqual([0, 4, 7]);
		expect(result.noteResults).toEqual([]);
	});

	it('works with seventh chord qualities', () => {
		// G7: pitch classes 7, 11, 2, 5
		const q = makeQuestion(7, [0, 4, 7, 10]);
		// String 0 (E2=40): fret 3 -> 43 % 12 = 7 (G)
		// String 1 (A2=45): fret 2 -> 47 % 12 = 11 (B)
		// String 2 (D3=50): fret 4 -> 54 % 12 = 6 -- wrong, need 2 (D)
		// String 2 (D3=50): fret 0 -> 50 % 12 = 2 (D) -- correct
		// String 3 (G3=55): fret 0 -> 55 % 12 = 7 (G dup, but we need 5=F)
		// String 3 (G3=55): fret 10 -> 65 % 12 = 5 (F)
		const result = validateChordBuilderAnswer(q, [
			{ stringIndex: 0, fret: 3 },  // G (7)
			{ stringIndex: 1, fret: 2 },  // B (11)
			{ stringIndex: 2, fret: 0 },  // D (2)
			{ stringIndex: 3, fret: 10 }  // F (5)
		]);
		expect(result.correct).toBe(true);
		expect(result.missingPitchClasses).toEqual([]);
		expect(result.extraPitchClasses).toEqual([]);
	});
});
