import { swapPersonFactory } from './swapPersonFactory'

describe('swapPersonFactory', () => {
    it('should throw error when old or new indices are not found', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
        ]
        const swapPerson = swapPersonFactory(data)

        expect(() => swapPerson(3, 1)).toThrow(
            'Old or new local indices not found',
        )
        expect(() => swapPerson(1, 3)).toThrow(
            'Old or new local indices not found',
        )
    })

    it('should swap persons in the list', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]

        const swapPerson = swapPersonFactory(data)

        swapPerson(3, 1)

        expect(data).toEqual([
            { index: 1, id: 3, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 1, checked: false },
        ])
    })

    it('should swap persons twice and return to initial state', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]
        const swapPerson = swapPersonFactory(data)

        swapPerson(1, 3)

        expect(data).toEqual([
            { index: 1, id: 3, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 1, checked: false },
        ])

        swapPerson(1, 3)

        expect(data).toEqual([
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ])
    })
})
