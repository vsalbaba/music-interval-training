import { STANDARD_TUNING } from './notes';

export type CagedFamily = 'C' | 'A' | 'G' | 'E' | 'D';

export interface ChordShape {
	family: CagedFamily;
	quality: string;
	frets: (number | null)[];
	rootStringIndex: number;
}

export interface AbsoluteStringNote {
	stringIndex: number;
	fret: number;
	midi: number;
	pitchClass: number;
	isRoot: boolean;
}

export interface AbsoluteVoicing {
	strings: (AbsoluteStringNote | null)[];
}

export function getValidOffsets(shape: ChordShape): number[] {
	const maxFret = Math.max(...shape.frets.filter((f): f is number => f !== null));
	const maxOffset = 12 - maxFret;
	const offsets: number[] = [];
	for (let i = 0; i <= maxOffset; i++) {
		offsets.push(i);
	}
	return offsets;
}

export function applyOffset(shape: ChordShape, offset: number): AbsoluteVoicing {
	const strings = shape.frets.map((relativeFret, stringIndex) => {
		if (relativeFret === null) return null;
		const fret = relativeFret + offset;
		const midi = STANDARD_TUNING[stringIndex] + fret;
		return {
			stringIndex,
			fret,
			midi,
			pitchClass: midi % 12,
			isRoot: stringIndex === shape.rootStringIndex
		};
	});
	return { strings };
}

// frets: [lowE, A, D, G, B, highE], null = muted
// rootStringIndex: 0=lowE, 1=A, 2=D, 3=G, 4=B, 5=highE

export const CAGED_SHAPES: ChordShape[] = [
	// ===== E-shape family =====
	// Root on string 0 (low E)
	{ family: 'E', quality: 'Major', frets: [0, 2, 2, 1, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Minor', frets: [0, 2, 2, 0, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Diminished', frets: [0, 1, 2, 0, null, null], rootStringIndex: 0 },
	{ family: 'E', quality: 'Augmented', frets: [0, 3, 2, 1, null, null], rootStringIndex: 0 },
	{ family: 'E', quality: 'Sus2', frets: [0, 2, 4, 4, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Sus4', frets: [0, 2, 2, 2, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Dominant 7', frets: [0, 2, 0, 1, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Major 7', frets: [0, 2, 1, 1, 0, 0], rootStringIndex: 0 },
	{ family: 'E', quality: 'Minor 7', frets: [0, 2, 0, 0, 0, 0], rootStringIndex: 0 },

	// ===== A-shape family =====
	// Root on string 1 (A)
	{ family: 'A', quality: 'Major', frets: [null, 0, 2, 2, 2, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Minor', frets: [null, 0, 2, 2, 1, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Diminished', frets: [null, 0, 1, 2, 1, null], rootStringIndex: 1 },
	{ family: 'A', quality: 'Augmented', frets: [null, 0, 3, 2, 2, 1], rootStringIndex: 1 },
	{ family: 'A', quality: 'Sus2', frets: [null, 0, 2, 2, 0, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Sus4', frets: [null, 0, 2, 2, 3, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Dominant 7', frets: [null, 0, 2, 0, 2, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Major 7', frets: [null, 0, 2, 1, 2, 0], rootStringIndex: 1 },
	{ family: 'A', quality: 'Minor 7', frets: [null, 0, 2, 0, 1, 0], rootStringIndex: 1 },

	// ===== C-shape family =====
	// Root on string 1 (A) at fret 3
	{ family: 'C', quality: 'Major', frets: [null, 3, 2, 0, 1, 0], rootStringIndex: 1 },
	{ family: 'C', quality: 'Minor', frets: [null, 3, 1, 0, 1, null], rootStringIndex: 1 },
	{ family: 'C', quality: 'Diminished', frets: [null, 3, 1, null, 4, 2], rootStringIndex: 1 },
	{ family: 'C', quality: 'Augmented', frets: [null, 3, 2, 1, 1, 0], rootStringIndex: 1 },
	{ family: 'C', quality: 'Sus2', frets: [null, 3, 0, 0, 1, null], rootStringIndex: 1 },
	{ family: 'C', quality: 'Sus4', frets: [null, 3, 3, 0, 1, 1], rootStringIndex: 1 },
	{ family: 'C', quality: 'Dominant 7', frets: [null, 3, 2, 3, 1, 3], rootStringIndex: 1 },
	{ family: 'C', quality: 'Major 7', frets: [null, 3, 2, 0, 0, 0], rootStringIndex: 1 },
	{ family: 'C', quality: 'Minor 7', frets: [null, 3, 1, 3, 1, 3], rootStringIndex: 1 },

	// ===== D-shape family =====
	// Root on string 2 (D)
	{ family: 'D', quality: 'Major', frets: [null, null, 0, 2, 3, 2], rootStringIndex: 2 },
	{ family: 'D', quality: 'Minor', frets: [null, null, 0, 2, 3, 1], rootStringIndex: 2 },
	{ family: 'D', quality: 'Diminished', frets: [null, null, 0, 1, 3, 1], rootStringIndex: 2 },
	{ family: 'D', quality: 'Augmented', frets: [null, null, 0, 3, 3, 2], rootStringIndex: 2 },
	{ family: 'D', quality: 'Sus2', frets: [null, null, 0, 2, 3, 0], rootStringIndex: 2 },
	{ family: 'D', quality: 'Sus4', frets: [null, null, 0, 2, 3, 3], rootStringIndex: 2 },
	{ family: 'D', quality: 'Dominant 7', frets: [null, null, 0, 2, 1, 2], rootStringIndex: 2 },
	{ family: 'D', quality: 'Major 7', frets: [null, null, 0, 2, 2, 2], rootStringIndex: 2 },
	{ family: 'D', quality: 'Minor 7', frets: [null, null, 0, 2, 1, 1], rootStringIndex: 2 },

	// ===== G-shape family =====
	// Root on string 0 (low E) at fret 3
	{ family: 'G', quality: 'Major', frets: [3, 2, 0, 0, 0, 3], rootStringIndex: 0 },
	{ family: 'G', quality: 'Minor', frets: [3, 1, 0, 0, null, null], rootStringIndex: 0 },
	{ family: 'G', quality: 'Diminished', frets: [3, 1, null, null, 2, 3], rootStringIndex: 0 },
	{ family: 'G', quality: 'Augmented', frets: [3, 2, 1, 0, 0, 3], rootStringIndex: 0 },
	{ family: 'G', quality: 'Sus2', frets: [3, 0, 0, 0, 3, 3], rootStringIndex: 0 },
	{ family: 'G', quality: 'Sus4', frets: [3, 3, 0, 0, 1, 3], rootStringIndex: 0 },
	{ family: 'G', quality: 'Dominant 7', frets: [3, 2, 0, 0, 0, 1], rootStringIndex: 0 },
	{ family: 'G', quality: 'Major 7', frets: [3, 2, 0, 0, 0, 2], rootStringIndex: 0 },
	{ family: 'G', quality: 'Minor 7', frets: [3, 1, 0, 0, 3, 1], rootStringIndex: 0 }
];
