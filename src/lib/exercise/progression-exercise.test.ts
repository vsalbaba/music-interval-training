import { describe, it, expect } from 'vitest';
import { generateProgressionQuestion, selectDistractors } from './progression-exercise';
import {
	EASY_PROGRESSIONS,
	MEDIUM_PROGRESSIONS,
	HARD_PROGRESSIONS,
	PROGRESSION_DIFFICULTIES,
	getProgressionPool,
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

describe('MEDIUM_PROGRESSIONS', () => {
	it('has at least 4 progressions', () => {
		expect(MEDIUM_PROGRESSIONS.length).toBeGreaterThanOrEqual(4);
	});

	it('each progression has songs', () => {
		for (const prog of MEDIUM_PROGRESSIONS) {
			expect(prog.songs.length).toBeGreaterThan(0);
		}
	});

	it('each progression has a nashville string matching its degrees', () => {
		for (const prog of MEDIUM_PROGRESSIONS) {
			expect(prog.nashville).toBe(prog.degrees.join(' '));
		}
	});

	it('all degrees are valid Nashville numerals', () => {
		for (const prog of MEDIUM_PROGRESSIONS) {
			for (const degree of prog.degrees) {
				expect(getDegree(degree)).toBeDefined();
			}
		}
	});
});

describe('HARD_PROGRESSIONS', () => {
	it('has at least 2 progressions', () => {
		expect(HARD_PROGRESSIONS.length).toBeGreaterThanOrEqual(2);
	});

	it('each progression has songs', () => {
		for (const prog of HARD_PROGRESSIONS) {
			expect(prog.songs.length).toBeGreaterThan(0);
		}
	});

	it('all degrees are valid Nashville numerals', () => {
		for (const prog of HARD_PROGRESSIONS) {
			for (const degree of prog.degrees) {
				expect(getDegree(degree)).toBeDefined();
			}
		}
	});
});

describe('PROGRESSION_DIFFICULTIES', () => {
	it('has 3 difficulty levels', () => {
		expect(PROGRESSION_DIFFICULTIES).toHaveLength(3);
	});

	it('medium pool includes all easy progressions', () => {
		const mediumPool = getProgressionPool('medium');
		for (const prog of EASY_PROGRESSIONS) {
			expect(mediumPool.some(p => p.nashville === prog.nashville)).toBe(true);
		}
	});

	it('hard pool includes all easy and medium progressions', () => {
		const hardPool = getProgressionPool('hard');
		for (const prog of [...EASY_PROGRESSIONS, ...MEDIUM_PROGRESSIONS]) {
			expect(hardPool.some(p => p.nashville === prog.nashville)).toBe(true);
		}
	});
});

describe('distractor selection across difficulty levels', () => {
	it('easy distractors come only from easy pool', () => {
		const easyPool = getProgressionPool('easy');
		const correct = easyPool[0];
		const distractors = selectDistractors(correct, easyPool, 3);
		const easyNashvilles = new Set(EASY_PROGRESSIONS.map(p => p.nashville));
		for (const d of distractors) {
			expect(easyNashvilles.has(d.nashville)).toBe(true);
		}
	});

	it('medium distractors come from easy + medium pools only', () => {
		const mediumPool = getProgressionPool('medium');
		const correct = MEDIUM_PROGRESSIONS[0];
		const distractors = selectDistractors(correct, mediumPool, 3);
		const allowedNashvilles = new Set([...EASY_PROGRESSIONS, ...MEDIUM_PROGRESSIONS].map(p => p.nashville));
		for (const d of distractors) {
			expect(allowedNashvilles.has(d.nashville)).toBe(true);
		}
	});

	it('hard distractors never include progressions outside the hard pool', () => {
		const hardPool = getProgressionPool('hard');
		const hardNashvilles = new Set(hardPool.map(p => p.nashville));
		const correct = HARD_PROGRESSIONS[0];
		const distractors = selectDistractors(correct, hardPool, 3);
		for (const d of distractors) {
			expect(hardNashvilles.has(d.nashville)).toBe(true);
		}
	});

	it('medium question generates valid question with 4 options', () => {
		const q = generateProgressionQuestion('medium');
		expect(q.options.length).toBe(4);
		expect(q.options.map(o => o.nashville)).toContain(q.progression.nashville);
	});

	it('hard question generates valid question with 4 options', () => {
		const q = generateProgressionQuestion('hard');
		expect(q.options.length).toBe(4);
		expect(q.options.map(o => o.nashville)).toContain(q.progression.nashville);
	});
});
