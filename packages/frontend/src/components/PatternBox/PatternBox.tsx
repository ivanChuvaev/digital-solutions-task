import styles from './PatternBox.module.css'
import cn from 'classnames'

type PatternBoxProps = {
  children: React.ReactNode
  className?: string
}

export const PatternBox = (props: PatternBoxProps) => {
  const { className, children } = props

  return (
    <div className={cn(styles['pattern-box'], className)}>
      <svg className={styles['pattern-box-svg-pattern']}>
        <rect fill="url(#square-pattern)" height="100%" width="100%" />
      </svg>
      {children}
    </div>
  )
}
