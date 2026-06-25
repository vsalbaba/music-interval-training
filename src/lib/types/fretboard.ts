export interface HighlightedNote {
	midi: number;
	role: 'root' | 'interval' | 'ghost';
	stringIndex?: number;
	fret?: number;
}

export interface MutedString {
	stringIndex: number;
}
