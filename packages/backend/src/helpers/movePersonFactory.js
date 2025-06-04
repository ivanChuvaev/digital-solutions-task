export const movePersonFactory = (data) => {
    return (oldIndex, newIndex) => {
        const oldIndexLocal = data.findIndex(
            (person) => person.index === oldIndex,
        )
        const newIndexLocal = data.findIndex(
            (person) => person.index === newIndex,
        )

        if (oldIndexLocal === -1 || newIndexLocal === -1) {
            throw new Error('Old or new local indices not found')
        }

        const savedItem = data[oldIndexLocal]

        if (newIndexLocal < oldIndexLocal) {
            // Moving up
            for (let i = oldIndexLocal; i > newIndexLocal; i -= 1) {
                data[i] = { ...data[i - 1], index: data[i - 1].index + 1 }
            }
        } else {
            // Moving down
            for (let i = oldIndexLocal; i < newIndexLocal; i += 1) {
                data[i] = { ...data[i + 1], index: data[i + 1].index - 1 }
            }
        }

        data[newIndexLocal] = { ...savedItem, index: data[newIndexLocal].index }
    }
}
