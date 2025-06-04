import type { PersonCardPageRootContextType } from './types'
import type { FC } from 'react'
import { usePersonCardPage } from './usePersonCardPage'

type PersonCardPageConsumerProps = {
  children: (context: PersonCardPageRootContextType) => React.ReactNode
}

export const PersonCardPageConsumer: FC<PersonCardPageConsumerProps> = ({
  children,
}) => children(usePersonCardPage())
