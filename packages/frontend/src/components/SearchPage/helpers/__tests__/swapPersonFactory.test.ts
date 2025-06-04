import type { PersonCardPageStateRefObject } from '../../../PersonCardPage/types'
import type { SetStateAction, RefObject } from 'react'
import type { Person } from '../../../../types'
import { swapPersonFactory } from '../swapPersonFactory'
import { describe, expect, it } from '@jest/globals'

describe('swapPersonFactory', () => {
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

  it('should not do anything if pagesRef is null', () => {
    const swapPerson = swapPersonFactory({ current: null })
    expect(() => swapPerson(1, 2)).toThrow('Pages ref is null')
  })

  it('should swap persons within the same page', () => {
    const pages = [createMockPage([createMockPerson(1), createMockPerson(2)])]

    const swapPerson = swapPersonFactory({ current: pages })

    swapPerson(1, 2)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(2, 1),
      createMockPerson(1, 2),
    ])
  })

  it('should swap persons between different pages', () => {
    const pages = [
      createMockPage([createMockPerson(1), createMockPerson(2)]),
      createMockPage([createMockPerson(3), createMockPerson(4)]),
    ]

    const swapPerson = swapPersonFactory({ current: pages })

    swapPerson(1, 3)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(3, 1),
      createMockPerson(2, 2),
    ])
    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(1, 3),
      createMockPerson(4, 4),
    ])
  })

  it('should throw error if persons are not found', () => {
    const pages = [createMockPage([createMockPerson(1), createMockPerson(2)])]

    const swapPerson = swapPersonFactory({ current: pages })

    expect(() => swapPerson(1, 999)).toThrow(
      'Not found any page with provided person index',
    )
  })

  it('should throw error if pages are empty', () => {
    const pages: Array<{
      stateRef: RefObject<PersonCardPageStateRefObject | null>
    }> = []

    const swapPerson = swapPersonFactory({ current: pages })

    expect(() => swapPerson(1, 2)).toThrow(
      'Not found any page with provided person index',
    )
  })
})
