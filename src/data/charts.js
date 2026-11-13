// Chord charts keyed by song title. Each line is a row of bars (one chord per bar),
// with an optional repeat count. No lyrics.
export const charts = {
  'These Are Days': {
    key: 'E♭ major',
    tempo: '~109 BPM',
    time: '4/4',
    capo: 'Capo 1: D G A Bm, or capo 3: C F G Am',
    sections: [
      {
        name: 'Intro',
        lines: [{ bars: ['B♭', 'A♭', 'E♭', 'A♭'] }, { bars: ['B♭', 'A♭', 'E♭', 'E♭'] }, { bars: ['E♭', 'B♭'] }],
      },
      {
        name: 'Verse 1',
        lines: [{ bars: ['E♭', 'E♭', 'E♭', 'B♭'] }, { bars: ['Cm', 'B♭', 'A♭', 'E♭'], repeat: 2 }],
      },
      {
        name: 'Chorus 1',
        lines: [{ bars: ['B♭', 'A♭', 'E♭', 'A♭'], repeat: 2 }, { bars: ['B♭', 'A♭', 'E♭', 'E♭'] }, { bars: ['E♭', 'B♭'] }],
      },
      {
        name: 'Verse 2',
        lines: [{ bars: ['E♭', 'E♭', 'E♭', 'B♭'] }, { bars: ['Cm', 'B♭', 'A♭', 'E♭'], repeat: 2 }],
      },
      {
        name: 'Chorus 2',
        lines: [{ bars: ['B♭', 'A♭', 'E♭', 'A♭'], repeat: 2 }, { bars: ['B♭', 'A♭', 'E♭', 'E♭'] }, { bars: ['E♭', 'E♭'] }],
      },
      {
        name: 'Verse 3',
        lines: [{ bars: ['E♭', 'E♭', 'E♭', 'B♭'] }],
      },
      {
        name: 'Chorus 3',
        lines: [{ bars: ['B♭', 'A♭', 'E♭', 'A♭'], repeat: 3 }, { bars: ['B♭', 'A♭', 'E♭', 'E♭'] }, { bars: ['E♭', 'B♭'] }],
      },
      {
        name: 'Outro',
        lines: [{ bars: ['E♭', 'E♭', 'E♭', 'B♭'], repeat: 2 }, { bars: ['E♭', 'E♭'] }],
      },
    ],
    notes: [
      'Verse: the first B♭ can be played as B♭sus4.',
      'Chorus: the E♭ can be played as E♭/G.',
      'Bar lengths and section names are a best reading of the sources; check against the recording.',
    ],
  },

  // Draft: from one auto-detected chord sheet (chordu.com). Each line is a phrase,
  // not a bar count, and section boundaries are unknown.
  Overjoyed: {
    draft: 'Auto-detected chords from a single source, not a checked transcription. Each row is one phrase in order; bar lengths and section names are unknown.',
    key: 'E♭ (unconfirmed)',
    tempo: '~84 BPM',
    time: '4/4',
    sections: [
      {
        name: 'Opening',
        lines: [{ bars: ['B♭m'] }, { bars: ['C', 'B', 'C'] }, { bars: ['B♭m', 'C', 'B', 'B♭'] }],
      },
      {
        name: 'Phrase group A',
        lines: [
          { bars: ['E♭', 'Fm'] },
          { bars: ['B♭'] },
          { bars: ['E♭', 'Cm', 'F', 'G'] },
          { bars: ['C', 'G'] },
          { bars: ['E♭', 'F', 'B♭', 'E♭'] },
        ],
      },
      {
        name: 'Phrase group A (repeat)',
        lines: [
          { bars: ['Cm', 'Fm'] },
          { bars: ['B♭'] },
          { bars: ['E♭', 'Cm', 'F', 'G'] },
          { bars: ['C', 'G'] },
          { bars: ['Cm', 'F', 'Fm', 'B♭'] },
        ],
      },
      {
        name: 'Phrase group B',
        lines: [
          { bars: ['A♭', 'Gm', 'E♭', 'A♭'] },
          { bars: ['B♭', 'D♭', 'C'] },
          { bars: ['Gm'] },
          { bars: ['F', 'A♭', 'B♭', 'Fm', 'B♭', 'B♭m', 'C'] },
        ],
      },
      {
        name: 'Return',
        lines: [
          { bars: ['B', 'C'] },
          { bars: ['B♭m', 'C', 'B', 'B♭', 'E♭', 'Cm', 'Fm'] },
          { bars: ['B♭', 'E♭', 'Cm', 'F', 'G'] },
          { bars: ['C', 'G'] },
          { bars: ['Cm', 'F', 'B♭', 'Fm', 'B♭'] },
          { bars: ['A♭', 'B♭', 'E♭'] },
          { bars: ['A♭', 'B♭', 'D♭', 'C'] },
          { bars: ['Gm'] },
        ],
      },
      {
        name: 'Ending (key shifts up)',
        lines: [
          { bars: ['Am', 'F', 'B♭', 'Fm', 'B♭', 'C'] },
          { bars: ['Gm', 'F'] },
          { bars: ['Gm', 'C', 'E♭', 'D'] },
          { bars: ['Am'] },
          { bars: ['G', 'C'] },
          { bars: ['Gm', 'C', 'F'] },
          { bars: ['G♭'] },
          { bars: ['E', 'F', 'Fm', 'B♭'] },
          { bars: ['E♭'] },
        ],
      },
    ],
    notes: [
      'Section names are my grouping of repeated phrases, not labels from the source.',
      'Sources disagree on the key (one MIDI file marks B♭ major); the chords centre on E♭.',
    ],
  },
}
