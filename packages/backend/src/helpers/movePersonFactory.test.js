import { movePersonFactory } from './movePersonFactory'

describe('movePersonFactory', () => {
    it('should throw error when old or new indices are not found', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        expect(() => movePerson(3, 1)).toThrow(
            'Old or new local indices not found',
        )
        expect(() => movePerson(1, 3)).toThrow(
            'Old or new local indices not found',
        )
    })

    it('should move person up in the list', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(3, 1)

        expect(data).toEqual([
            { index: 1, id: 3, checked: false },
            { index: 2, id: 1, checked: false },
            { index: 3, id: 2, checked: false },
        ])
    })

    it('should move person down in the list', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(1, 3)

        expect(data).toEqual([
            { index: 1, id: 2, checked: false },
            { index: 2, id: 3, checked: false },
            { index: 3, id: 1, checked: false },
        ])
    })

    it('should maintain all person properties when moving', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(1, 3)

        expect(data[2]).toEqual({ index: 3, id: 1, checked: false })
    })

    it('should handle adjacent moves correctly', () => {
        const data = [
            { index: 1, id: 1, checked: false },
            { index: 2, id: 2, checked: false },
            { index: 3, id: 3, checked: false },
        ]
        const movePerson = movePersonFactory(data)

        movePerson(1, 2)

        expect(data).toEqual([
            { index: 1, id: 2, checked: false },
            { index: 2, id: 1, checked: false },
            { index: 3, id: 3, checked: false },
        ])
    })
})
