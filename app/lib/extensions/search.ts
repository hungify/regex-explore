import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'
import { RegExpCursor } from '@codemirror/search'
import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state'

const searchHighlightEffect = StateEffect.define<{
  expression: string
}>()

const searchHighlightDecoration = Decoration.mark({
  class: 'cm-search-highlight',
  attributes: { title: 'Matched string' },
})

export const highlightSearchRegex = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(value, transaction) {
    value = value.map(transaction.changes)

    for (const effect of transaction.effects) {
      if (effect.is(searchHighlightEffect)) {
        const builder = new RangeSetBuilder<Decoration>()

        const { expression } = effect.value
        const { doc } = transaction.state
        const stringMatcherCursor = new RegExpCursor(doc, expression)

        for (const matcher of stringMatcherCursor) {
          const { from, to, match } = matcher
          if (match[0])

            builder.add(from, to, searchHighlightDecoration)
        }
        value = builder.finish()
      }
    }
    return value
  },
  provide: field => EditorView.decorations.from(field),
})

export function createSearchHighlighter() {
  function searchMatches(view: EditorView, expression: string) {
    view.dispatch({
      effects: searchHighlightEffect.of({ expression }),
    })
  }

  return {
    highlightSearchRegex,
    searchMatches,
  }
}
