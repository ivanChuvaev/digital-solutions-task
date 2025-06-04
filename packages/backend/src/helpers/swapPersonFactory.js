export const swapPersonFactory = (data) => {
    return (aIndex, bIndex) => {
        const aIndexLocal = data.findIndex((item) => item.index === aIndex)
        const bIndexLocal = data.findIndex((item) => item.index === bIndex)

        if (aIndexLocal === -1 || bIndexLocal === -1) {
            throw new Error('Old or new local indices not found')
        }

        ;[data[aIndexLocal].index, data[bIndexLocal].index] = [
            data[bIndexLocal].index,
            data[aIndexLocal].index,
        ]
        ;[data[aIndexLocal], data[bIndexLocal]] = [
            data[bIndexLocal],
            data[aIndexLocal],
        ]
    }
}
