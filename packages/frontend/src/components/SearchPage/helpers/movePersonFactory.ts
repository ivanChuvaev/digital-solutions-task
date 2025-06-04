import type { PersonCardPageStateRefObject } from '../../PersonCardPage'
import type { Person } from '../../../types'
import type { RefObject } from 'react'

export const movePersonFactory = (
  pagesRef: RefObject<Array<{
    stateRef: RefObject<PersonCardPageStateRefObject | null>
  }> | null>,
) => {
  return (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return

    if (!pagesRef.current) {
      throw new Error('Pages ref is null')
    }

    const pages = pagesRef.current

    const oldPageIndex = pages.findIndex((page) =>
      page.stateRef.current?.persons.find(
        (person) => person.index === oldIndex,
      ),
    )
    const newPageIndex = pages.findIndex((page) =>
      page.stateRef.current?.persons.find(
        (person) => person.index === newIndex,
      ),
    )

    if (oldPageIndex === -1 || newPageIndex === -1) {
      throw new Error('Not found any page with provided person index')
    }

    // -----------------------------------
    // ------------ Same page ------------
    // -----------------------------------

    if (oldPageIndex === newPageIndex) {
      pages[newPageIndex].stateRef.current?.setPersons((prev) => {
        const copy = [...prev]

        const oldIndexLocal = copy.findIndex(
          (person) => person.index === oldIndex,
        )
        const newIndexLocal = copy.findIndex(
          (person) => person.index === newIndex,
        )

        if (oldIndexLocal === -1 || newIndexLocal === -1) {
          throw new Error('Old or new local indices not found')
        }

        const savedItem = copy[oldIndexLocal]

        if (newIndexLocal < oldIndexLocal) {
          // Moving up
          for (let i = oldIndexLocal; i > newIndexLocal; i -= 1) {
            copy[i] = { ...copy[i - 1], index: copy[i - 1].index + 1 }
          }
        } else {
          // Moving down
          for (let i = oldIndexLocal; i < newIndexLocal; i += 1) {
            copy[i] = { ...copy[i + 1], index: copy[i + 1].index - 1 }
          }
        }

        copy[newIndexLocal] = { ...savedItem, index: copy[newIndexLocal].index }

        return copy
      })
      return
    }

    // -----------------------------------
    // --------- Different pages ---------
    // -----------------------------------

    // ------------ Moving up ------------

    if (newIndex < oldIndex) {
      let savedItem: Person | null = null

      // Old page

      ;(() => {
        const copy = [...pages[oldPageIndex].stateRef.current!.persons]

        const oldIndexLocal = copy.findIndex(
          (person) => person.index === oldIndex,
        )

        if (oldIndexLocal === -1) {
          throw new Error('Old local index not found')
        }

        savedItem = copy[oldIndexLocal]

        for (let i = oldIndexLocal; i > 0; i -= 1) {
          copy[i] = { ...copy[i - 1], index: copy[i - 1].index + 1 }
        }

        const edgePersonFromPreviousPage =
          pages[oldPageIndex - 1]?.stateRef.current?.persons.at(-1)

        if (!edgePersonFromPreviousPage) {
          throw new Error('Edge person from previous page not found')
        }

        copy[0] = {
          ...edgePersonFromPreviousPage,
          index: edgePersonFromPreviousPage.index + 1,
        }

        pages[oldPageIndex].stateRef.current?.setPersons(copy)
      })()

      // In between pages

      for (
        let pageIndex = oldPageIndex - 1;
        pageIndex > newPageIndex;
        pageIndex -= 1
      ) {
        pages[pageIndex].stateRef.current?.setPersons((prev) => {
          const copy = [...prev]

          for (let i = copy.length - 1; i > 0; i -= 1) {
            copy[i] = { ...copy[i - 1], index: copy[i - 1].index + 1 }
          }

          const edgePersonFromPreviousPage =
            pages[pageIndex - 1]?.stateRef.current?.persons.at(-1)

          if (!edgePersonFromPreviousPage) {
            throw new Error('Edge person from previous page not found')
          }

          copy[0] = {
            ...edgePersonFromPreviousPage,
            index: edgePersonFromPreviousPage.index + 1,
          }

          return copy
        })
      }

      // New page

      pages[newPageIndex].stateRef.current?.setPersons((prev) => {
        const copy = [...prev]

        const newIndexLocal = copy.findIndex(
          (person) => person.index === newIndex,
        )

        if (newIndexLocal === -1) {
          throw new Error('New local index not found')
        }

        for (let i = prev.length - 1; i > newIndexLocal; i -= 1) {
          copy[i] = { ...copy[i - 1], index: copy[i - 1].index + 1 }
        }

        if (!savedItem) {
          throw new Error('Saved item is null')
        }

        copy[newIndexLocal] = { ...savedItem, index: copy[newIndexLocal].index }

        return copy
      })

      return
    }

    // ----------- Moving down -----------

    let savedItem: Person | null = null

    // Old page

    pages[oldPageIndex].stateRef.current?.setPersons((prev) => {
      const copy = [...prev]

      const oldIndexLocal = copy.findIndex(
        (person) => person.index === oldIndex,
      )

      if (oldIndexLocal === -1) {
        throw new Error('Old local index not found')
      }

      savedItem = copy[oldIndexLocal]

      for (let i = oldIndexLocal; i < copy.length - 1; i += 1) {
        copy[i] = { ...copy[i + 1], index: copy[i + 1].index - 1 }
      }

      const edgePersonFromNextPage =
        pages[oldPageIndex + 1]?.stateRef.current?.persons.at(0)

      if (!edgePersonFromNextPage) {
        throw new Error('Edge person from next page not found')
      }

      copy[copy.length - 1] = {
        ...edgePersonFromNextPage,
        index: edgePersonFromNextPage.index - 1,
      }

      return copy
    })

    // In between pages

    for (
      let pageIndex = oldPageIndex + 1;
      pageIndex < newPageIndex;
      pageIndex += 1
    ) {
      pages[pageIndex].stateRef.current?.setPersons((prev) => {
        const copy = [...prev]

        for (let i = 0; i < copy.length - 1; i += 1) {
          copy[i] = { ...copy[i + 1], index: copy[i + 1].index - 1 }
        }

        const edgePersonFromNextPage =
          pages[pageIndex + 1]?.stateRef.current?.persons.at(0)

        if (!edgePersonFromNextPage) {
          throw new Error('Edge person from next page not found')
        }

        copy[copy.length - 1] = {
          ...edgePersonFromNextPage,
          index: edgePersonFromNextPage.index - 1,
        }

        return copy
      })
    }

    // New page

    pages[newPageIndex].stateRef.current?.setPersons((prev) => {
      const copy = [...prev]

      const newIndexLocal = copy.findIndex(
        (person) => person.index === newIndex,
      )

      if (newIndexLocal === -1) {
        throw new Error('New local index not found')
      }

      for (let i = 0; i < newIndexLocal; i += 1) {
        copy[i] = { ...copy[i + 1], index: copy[i + 1].index - 1 }
      }

      if (!savedItem) {
        throw new Error('Saved item is null')
      }

      copy[newIndexLocal] = {
        ...savedItem,
        index: copy[newIndexLocal].index,
      }

      return copy
    })
  }
}
