import { useContext } from "react"
import { VirtualContext } from "./VirtualContext"

export const useVirtual = () => {
    const context = useContext(VirtualContext)

    if (!context) {
        throw new Error('useVirtual out of context')
    }

    return context
}
