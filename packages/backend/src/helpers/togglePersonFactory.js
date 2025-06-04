export const togglePersonFactory = (data) => {
    return (index) => {
        const indexLocal = data.findIndex((item) => item.index === index)

        if (indexLocal === -1) {
            throw new Error('Index not found')
        }

        data[indexLocal].checked = !data[indexLocal].checked
    }
}
