import { PersonCardChunkList } from './PersonCardChunkList'
import { PersonCardChunkRoot } from './PersonCardChunkRoot'

export {
  type PersonCardChunkStateRefObject,
  type PersonCardChunkRootProps,
  type PersonCardChunkListProps,
} from './types'

export const PersonCardChunk = {
  List: PersonCardChunkList,
  Root: PersonCardChunkRoot,
}
