import type { PersonCardPageStateRefObject } from '../../PersonCardPage/types'
import type { RefObject } from 'react'

export const swapPersonFactory = (
  pagesRef: RefObject<Array<{
    stateRef: RefObject<PersonCardPageStateRefObject | null>
  }> | null>,
) => {
  return (aIndex: number, bIndex: number) => {
    if (aIndex === bIndex) return

    if (!pagesRef.current) {
      throw new Error('Pages ref is null')
    }

    const pages = pagesRef.current

    const aPageIndex = pages.findIndex((page) =>
      page.stateRef.current?.persons.find((person) => person.index === aIndex),
    )
    const bPageIndex = pages.findIndex((page) =>
      page.stateRef.current?.persons.find((person) => person.index === bIndex),
    )

    if (aPageIndex === -1 || bPageIndex === -1) {
      throw new Error('Not found any page with provided person index')
    }

    if (aPageIndex === bPageIndex) {
      pages[aPageIndex].stateRef.current?.setPersons((prev) => {
        const copy = [...prev]
        const aIndexLocal = copy.findIndex((person) => person.index === aIndex)
        const bIndexLocal = copy.findIndex((person) => person.index === bIndex)

        if (aIndexLocal === -1 || bIndexLocal === -1) {
          throw new Error('Person not found')
        }

        ;[copy[aIndexLocal].index, copy[bIndexLocal].index] = [
          copy[bIndexLocal].index,
          copy[aIndexLocal].index,
        ]
        ;[copy[aIndexLocal], copy[bIndexLocal]] = [
          copy[bIndexLocal],
          copy[aIndexLocal],
        ]

        return copy
      })
      return
    }

    const getPerson = (pageIndex: number, index: number) => {
      return pages[pageIndex].stateRef.current?.persons.find(
        (item) => item.index === index,
      )
    }

    const aPerson = getPerson(aPageIndex, aIndex)
    const bPerson = getPerson(bPageIndex, bIndex)

    if (!aPerson || !bPerson) {
      throw new Error('Person not found')
    }

    pages[aPageIndex].stateRef.current?.setPersons((prev) => {
      return prev.map((person) =>
        person.index === aIndex ? { ...bPerson, index: aPerson.index } : person,
      )
    })

    pages[bPageIndex].stateRef.current?.setPersons((prev) => {
      return prev.map((person) =>
        person.index === bIndex ? { ...aPerson, index: bPerson.index } : person,
      )
    })
  }
}
