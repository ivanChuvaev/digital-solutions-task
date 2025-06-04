export const togglePersonFactory = (data) => {
    return (index) => {
        if (index < 0 || index >= data.length) {
            throw new Error('Index out of bounds')
        }
        data[index].checked = !data[index].checked
    }
}
