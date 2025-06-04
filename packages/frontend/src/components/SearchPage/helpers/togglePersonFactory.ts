import type { PersonCardPageStateRefObject } from '../../PersonCardPage/types'
import type { RefObject } from 'react'

export const togglePersonFactory = (
  pagesRef: RefObject<Array<{
    stateRef: RefObject<PersonCardPageStateRefObject | null>
  }> | null>,
) => {
  return (index: number) => {
    if (!pagesRef.current) {
      throw new Error('Pages ref is null')
    }

    const pages = pagesRef.current

    const pageIndex = pages.findIndex((page) =>
      page.stateRef.current?.persons.find((person) => person.index === index),
    )

    if (pageIndex === -1) {
      throw new Error('Not found any page with provided person index')
    }

    pages[pageIndex].stateRef.current?.setPersons((prev) => {
      return prev.map((person) =>
        person.index === index
          ? { ...person, checked: !person.checked }
          : person,
      )
    })
  }
}
