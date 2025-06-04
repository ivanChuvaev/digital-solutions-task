import { movePersonFactory } from './movePersonFactory'

describe('movePersonFactory', () => {
    it('should throw error when indices are out of bounds', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        expect(() => movePerson(3, 1)).toThrow(
            'Index out of bounds',
        )
        expect(() => movePerson(1, 3)).toThrow(
            'Index out of bounds',
        )
    })

    it('should move person up in the list', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(2, 0)

        expect(data).toEqual([
            { id: 3, checked: false },
            { id: 1, checked: false },
            { id: 2, checked: false },
        ])
    })

    it('should move person down in the list', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(0, 2)

        expect(data).toEqual([
            { id: 2, checked: false },
            { id: 3, checked: false },
            { id: 1, checked: false },
        ])
    })

    it('should maintain all person properties when moving', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(0, 2)

        expect(data[2]).toEqual({ id: 1, checked: false })
    })

    it('should handle adjacent moves correctly', () => {
        const data = [
            { id: 1, checked: false },
            { id: 2, checked: false },
            { id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(0, 1)

        expect(data).toEqual([
            { id: 2, checked: false },
            { id: 1, checked: false },
            { id: 3, checked: false },
        ])
    })
})
