export const swapPersonFactory = (data) => {
    return (aIndex, bIndex) => {
        if (
            aIndex < 0 ||
            bIndex < 0 ||
            aIndex >= data.length ||
            bIndex >= data.length
        ) {
            throw new Error('Index out of bounds')
        }
        ;[data[aIndex], data[bIndex]] = [data[bIndex], data[aIndex]]
    }
}
