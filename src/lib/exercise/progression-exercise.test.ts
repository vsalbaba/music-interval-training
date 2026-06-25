import { describe, it, expect } from 'vitest';
import { generateProgressionQuestion, selectDistractors } from './progression-exercise';
import {
	EASY_PROGRESSIONS,
	degreeToChordName,
	resolveProgressionChordNames,
	getDegree,
	NASHVILLE_DEGREES
} from '$lib/music/progressions';

describe('degreeToChordName', () => {
	it('resolves I in key of C to C', () => {
		expect(degreeToChordName('I', 0)).toBe('C');
	});

	it('resolves IV in key of C to F', () => {
		expect(degreeToChordName('IV', 0)).toBe('F');
	});

	it('resolves V in key of G to D', () => {
		expect(degreeToChordName('V', 7)).toBe('D');
	});

	it('resolves ii in key of C to Dm', () => {
		expect(degreeToChordName('ii', 0)).toBe('Dm');
	});

	it('resolves vi in key of C to Am', () => {
		expect(degreeToChordName('vi', 0)).toBe('Am');
	});

	it('resolves vii° in key of C to Bdim', () => {
		expect(degreeToChordName('vii°', 0)).toBe('Bdim');
	});

	it('resolves I in key of A to A', () => {
		expect(degreeToChordName('I', 9)).toBe('A');
	});

	it('resolves IV in key of A to D', () => {
		expect(degreeToChordName('IV', 9)).toBe('D');
	});

	it('resolves V in key of A to E', () => {
		expect(degreeToChordName('V', 9)).toBe('E');
	});
});

describe('resolveProgressionChordNames', () => {
	it('resolves I IV V in key of C to C F G', () => {
		const prog = EASY_PROGRESSIONS.find(p => p.nashville === 'I IV V')!;
		expect(resolveProgressionChordNames(prog, 0)).toEqual(['C', 'F', 'G']);
	});

	it('resolves I IV V in key of G to G C D', () => {
		const prog = EASY_PROGRESSIONS.find(p => p.nashville === 'I IV V')!;
		expect(resolveProgressionChordNames(prog, 7)).toEqual(['G', 'C', 'D']);
	});
});

describe('getDegree', () => {
	it('returns correct degree for all Nashville numerals', () => {
		expect(getDegree('I')?.semitonesFromRoot).toBe(0);
		expect(getDegree('ii')?.semitonesFromRoot).toBe(2);
		expect(getDegree('iii')?.semitonesFromRoot).toBe(4);
		expect(getDegree('IV')?.semitonesFromRoot).toBe(5);
		expect(getDegree('V')?.semitonesFromRoot).toBe(7);
		expect(getDegree('vi')?.semitonesFromRoot).toBe(9);
		expect(getDegree('vii°')?.semitonesFromRoot).toBe(11);
	});

	it('returns undefined for invalid degrees', () => {
		expect(getDegree('VIII')).toBeUndefined();
	});
});

describe('NASHVILLE_DEGREES', () => {
	it('has exactly 7 degrees', () => {
		expect(NASHVILLE_DEGREES).toHaveLength(7);
	});
});

describe('EASY_PROGRESSIONS', () => {
	it('has at least 4 progressions', () => {
		expect(EASY_PROGRESSIONS.length).toBeGreaterThanOrEqual(4);
	});

	it('each progression has songs', () => {
		for (const prog of EASY_PROGRESSIONS) {
			expect(prog.songs.length).toBeGreaterThan(0);
		}
	});

	it('each progression has a nashville string matching its degrees', () => {
		for (const prog of EASY_PROGRESSIONS) {
			expect(prog.nashville).toBe(prog.degrees.join(' '));
		}
	});

	it('all degrees in easy pool are valid Nashville numerals', () => {
		for (const prog of EASY_PROGRESSIONS) {
			for (const degree of prog.degrees) {
				expect(getDegree(degree)).toBeDefined();
			}
		}
	});
});

describe('selectDistractors', () => {
	it('returns 3 distractors different from the correct answer', () => {
		const correct = EASY_PROGRESSIONS[0];
		const distractors = selectDistractors(correct, EASY_PROGRESSIONS, 3);
		expect(distractors.length).toBe(3);
		for (const d of distractors) {
			expect(d.nashville).not.toBe(correct.nashville);
		}
	});

	it('returns fewer distractors when pool is too small', () => {
		const correct = EASY_PROGRESSIONS[0];
		const smallPool = EASY_PROGRESSIONS.slice(0, 2);
		const distractors = selectDistractors(correct, smallPool, 3);
		expect(distractors.length).toBe(1);
	});
});

describe('generateProgressionQuestion', () => {
	it('returns a valid question object', () => {
		const q = generateProgressionQuestion('easy');
		expect(q.progression).toBeDefined();
		expect(q.keyPitchClass).toBeGreaterThanOrEqual(0);
		expect(q.keyPitchClass).toBeLessThan(12);
		expect(q.keyName).toBeDefined();
		expect(q.chordNames.length).toBe(q.progression.degrees.length);
		expect(q.voicings.length).toBe(q.progression.degrees.length);
		expect(q.options.length).toBe(4);
	});

	it('includes the correct answer in the options', () => {
		for (let i = 0; i < 20; i++) {
			const q = generateProgressionQuestion('easy');
			const optionNashvilles = q.options.map(o => o.nashville);
			expect(optionNashvilles).toContain(q.progression.nashville);
		}
	});

	it('voicings produce valid MIDI notes', () => {
		for (let i = 0; i < 10; i++) {
			const q = generateProgressionQuestion('easy');
			for (const v of q.voicings) {
				expect(v.notes.length).toBeGreaterThanOrEqual(3);
				for (const n of v.notes) {
					expect(n.midi).toBeGreaterThanOrEqual(0);
					expect(n.midi).toBeLessThanOrEqual(127);
				}
				expect(v.noteStrings.length).toBe(v.notes.length);
			}
		}
	});

	it('all voicings use the same CAGED family', () => {
		for (let i = 0; i < 10; i++) {
			const q = generateProgressionQuestion('easy');
			const families = q.voicings.map(v => v.family);
			const uniqueFamilies = new Set(families);
			expect(uniqueFamilies.size).toBe(1);
		}
	});
});
