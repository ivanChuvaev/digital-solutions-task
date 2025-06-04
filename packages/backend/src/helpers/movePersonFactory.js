export const movePersonFactory = (data) => {
    return (oldIndex, newIndex) => {
        if (
            oldIndex < 0 ||
            newIndex < 0 ||
            oldIndex >= data.length ||
            newIndex >= data.length
        ) {
            throw new Error('Index out of bounds')
        }

        const savedItem = data[oldIndex]

        if (newIndex < oldIndex) {
            // Moving up
            for (let i = oldIndex; i > newIndex; i -= 1) {
                data[i] = data[i - 1]
            }
        } else {
            // Moving down
            for (let i = oldIndex; i < newIndex; i += 1) {
                data[i] = data[i + 1]
            }
        }

        data[newIndex] = savedItem
    }
}
