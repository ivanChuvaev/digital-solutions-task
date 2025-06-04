import type { Person } from '../../../../types'
import type { SetStateAction } from 'react'
import { togglePersonFactory } from '../togglePersonFactory'
import { describe, expect, it } from '@jest/globals'

describe('togglePersonFactory', () => {
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

  const createMockPerson = (
    id: number,
    index = id,
    checked = false,
  ): Person => ({
    first_name: '',
    last_name: '',
    avatar: '',
    email: '',
    checked,
    index,
    id,
  })

  it('should throw error when pages ref is null', () => {
    const togglePerson = togglePersonFactory({ current: null })
    expect(() => togglePerson(1)).toThrow('Pages ref is null')
  })

  it('should throw error when person index is not found in any page', () => {
    const pages = [createMockPage([createMockPerson(1)])]
    const togglePerson = togglePersonFactory({ current: pages })
    expect(() => togglePerson(999)).toThrow(
      'Not found any page with provided person index',
    )
  })

  it('should toggle person checked state when found in page', () => {
    const pages = [createMockPage([createMockPerson(1)])]
    const togglePerson = togglePersonFactory({ current: pages })

    togglePerson(1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(1, 1, true),
    ])
  })

  it('should toggle twice and return to initial state', () => {
    const pages = [createMockPage([createMockPerson(1)])]
    const togglePerson = togglePersonFactory({ current: pages })

    togglePerson(1)
    togglePerson(1)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(1, 1, false),
    ])
  })

  it('should handle multiple pages correctly', () => {
    const pages = [
      createMockPage([createMockPerson(1)]),
      createMockPage([createMockPerson(2)]),
      createMockPage([createMockPerson(3)]),
      createMockPage([createMockPerson(4)]),
    ]
    const togglePerson = togglePersonFactory({ current: pages })

    togglePerson(4)

    expect(pages[0].stateRef.current?.persons).toEqual([
      createMockPerson(1, 1, false),
    ])
    expect(pages[1].stateRef.current?.persons).toEqual([
      createMockPerson(2, 2, false),
    ])
    expect(pages[2].stateRef.current?.persons).toEqual([
      createMockPerson(3, 3, false),
    ])
    expect(pages[3].stateRef.current?.persons).toEqual([
      createMockPerson(4, 4, true),
    ])
  })
})
