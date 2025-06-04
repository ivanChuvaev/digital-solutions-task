import type { Person } from '../../../../types'
import type { SetStateAction } from 'react'
import { movePersonFactory } from '../movePersonFactory'
import { describe, expect, it } from '@jest/globals'

describe('movePersonFactory', () => {
  const createMockPage = (persons: Person[]) => {
    return {
      stateRef: {
        current: {
          persons: [...persons],
          setPersons(value: SetStateAction<Person[]>) {
            if (typeof value === 'function') {
              this.persons = value(this.persons)
              return
            }
            this.persons = value
          },
        },
      },
    }
  }

  const createMockPerson = (id: number, index = id): Person => ({
    checked: false,
    first_name: '',
    last_name: '',
    avatar: '',
    email: '',
    index,
    id,
  })

  it('should throw error if pagesRef is null', () => {
    const movePerson = movePersonFactory({ current: null })
    expect(() => movePerson(1, 2)).toThrow('Pages ref is null')
  })

  it('should throw error if old page is not found', () => {
    const pages = [
      createMockPage([createMockPerson(2)]),
      createMockPage([createMockPerson(3)]),
    ]
    const movePerson = movePersonFactory({ current: pages })
    expect(() => movePerson(1, 2)).toThrow(
      'Not found any page with provided person index',
    )
  })

  it('should throw error if new page is not found', () => {
    const pages = [
      createMockPage([createMockPerson(1)]),
      createMockPage([createMockPerson(3)]),
    ]
    const movePerson = movePersonFactory({ current: pages })
    expect(() => movePerson(1, 2)).toThrow(
      'Not found any page with provided person index',
    )
  })

  it('should move person through the same page up', () => {
    const persons = [
      createMockPerson(1),
      createMockPerson(2),
      createMockPerson(3),
    ]
    const pages = [createMockPage(persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(3, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(3, 1),
      createMockPerson(1, 2),
      createMockPerson(2, 3),
    ])
  })

  it('should move person through two pages up', () => {
    const page1Persons = [createMockPerson(1), createMockPerson(2)]
    const page2Persons = [createMockPerson(3), createMockPerson(4)]
    const pages = [createMockPage(page1Persons), createMockPage(page2Persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(3, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(3, 1),
      createMockPerson(1, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(2, 3),
      createMockPerson(4, 4),
    ])
  })

  it('should move person through three pages up', () => {
    const page1Persons = [createMockPerson(1), createMockPerson(2)]
    const page2Persons = [createMockPerson(3), createMockPerson(4)]
    const page3Persons = [createMockPerson(5), createMockPerson(6)]
    const pages = [
      createMockPage(page1Persons),
      createMockPage(page2Persons),
      createMockPage(page3Persons),
    ]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(5, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(2, 3),
      createMockPerson(3, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(4, 5),
      createMockPerson(6, 6),
    ])
  })

  it('should move person through the same page down', () => {
    const persons = [
      createMockPerson(1),
      createMockPerson(2),
      createMockPerson(3),
    ]
    const pages = [createMockPage(persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(1, 3)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(2, 1),
      createMockPerson(3, 2),
      createMockPerson(1, 3),
    ])
  })

  it('should move person through two pages down', () => {
    const page1Persons = [createMockPerson(1), createMockPerson(2)]
    const page2Persons = [createMockPerson(3), createMockPerson(4)]
    const pages = [createMockPage(page1Persons), createMockPage(page2Persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(1, 3)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(2, 1),
      createMockPerson(3, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(1, 3),
      createMockPerson(4, 4),
    ])
  })

  it('should move person through three pages down', () => {
    const page1Persons = [createMockPerson(1), createMockPerson(2)]
    const page2Persons = [createMockPerson(3), createMockPerson(4)]
    const page3Persons = [createMockPerson(5), createMockPerson(6)]
    const pages = [
      createMockPage(page1Persons),
      createMockPage(page2Persons),
      createMockPage(page3Persons),
    ]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(1, 5)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(2, 1),
      createMockPerson(3, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(4, 3),
      createMockPerson(5, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(1, 5),
      createMockPerson(6, 6),
    ])
  })

  it('should handle moving person through multiple pages multiple times', () => {
    const page1Persons = [createMockPerson(1), createMockPerson(2)]
    const page2Persons = [createMockPerson(3), createMockPerson(4)]
    const page3Persons = [createMockPerson(5), createMockPerson(6)]
    const pages = [
      createMockPage(page1Persons),
      createMockPage(page2Persons),
      createMockPage(page3Persons),
    ]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(5, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(2, 3),
      createMockPerson(3, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(4, 5),
      createMockPerson(6, 6),
    ])

    movePerson(6, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(6, 1),
      createMockPerson(5, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(1, 3),
      createMockPerson(2, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(3, 5),
      createMockPerson(4, 6),
    ])

    movePerson(1, 4)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(2, 3),
      createMockPerson(6, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(3, 5),
      createMockPerson(4, 6),
    ])

    movePerson(3, 6)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(6, 3),
      createMockPerson(3, 4),
    ])

    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(4, 5),
      createMockPerson(2, 6),
    ])
  })

  it('should be reversible in one page', () => {
    const page1Persons = [
      createMockPerson(1),
      createMockPerson(2),
      createMockPerson(3),
      createMockPerson(4),
      createMockPerson(5),
      createMockPerson(6),
    ]
    const pages = [createMockPage(page1Persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(5, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
      createMockPerson(2, 3),
      createMockPerson(3, 4),
      createMockPerson(4, 5),
      createMockPerson(6, 6),
    ])

    movePerson(1, 5)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(1, 1),
      createMockPerson(2, 2),
      createMockPerson(3, 3),
      createMockPerson(4, 4),
      createMockPerson(5, 5),
      createMockPerson(6, 6),
    ])
  })

  it('should be reversible in multiple pages', () => {
    const page1Persons = [
      createMockPerson(1),
      createMockPerson(2),
      createMockPerson(3),
    ]
    const page2Persons = [
      createMockPerson(4),
      createMockPerson(5),
      createMockPerson(6),
    ]
    const pages = [createMockPage(page1Persons), createMockPage(page2Persons)]
    const movePerson = movePersonFactory({ current: pages })

    movePerson(5, 1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(5, 1),
      createMockPerson(1, 2),
      createMockPerson(2, 3),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(3, 4),
      createMockPerson(4, 5),
      createMockPerson(6, 6),
    ])

    movePerson(1, 5)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(1),
      createMockPerson(2),
      createMockPerson(3),
    ])

    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(4),
      createMockPerson(5),
      createMockPerson(6),
    ])
  })
})
