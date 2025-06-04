import { swapPersonFactory } from './swapPersonFactory'

describe('swapPersonFactory', () => {
    it('should throw error when indices are out of bounds', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
        ]
        const swapPerson = swapPersonFactory(data)

        expect(() => swapPerson(2, 0)).toThrow(
            'Index out of bounds',
        )
        expect(() => swapPerson(0, 2)).toThrow(
            'Index out of bounds',
        )
    })

    it('should swap persons in the list', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]

        const swapPerson = swapPersonFactory(data)

        swapPerson(2, 0)

        expect(data).toEqual([
            { id: 3, checked: false },
            { id: 2, checked: false },
            { id: 1, checked: false },
        ])
    })

    it('should swap persons twice and return to initial state', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]
        const swapPerson = swapPersonFactory(data)

        swapPerson(0, 2)

        expect(data).toEqual([
            { id: 3, checked: false },
            { id: 2, checked: false },
            { id: 1, checked: false },
        ])

        swapPerson(0, 2)

        expect(data).toEqual([
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ])
    })
})
