import { PersonCardPageConsumer } from './PersonCardPageConsumer'
import { PersonCardPageList } from './PersonCardPageList'
import { PersonCardPageRoot } from './PersonCardPageRoot'

export type {
  PersonCardPageStateRefObject,
  PersonCardPageRootContextType,
} from './types'

export const PersonCardPage = {
  Consumer: PersonCardPageConsumer,
  List: PersonCardPageList,
  Root: PersonCardPageRoot,
}
