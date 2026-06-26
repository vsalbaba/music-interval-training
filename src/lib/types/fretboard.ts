export interface HighlightedNote {
	midi: number;
	role: 'root' | 'interval' | 'ghost' | 'selected' | 'correct' | 'wrong';
	stringIndex?: number;
	fret?: number;
}

export interface SelectedFret {
	stringIndex: number;
	fret: number;
}

export interface MutedString {
	stringIndex: number;
}
