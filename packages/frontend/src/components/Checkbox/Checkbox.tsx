import { type ComponentProps, forwardRef } from 'react'
import styles from './Checkbox.module.css'
import cn from 'classnames'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <div className={cn(styles.checkbox, className)}>
        <svg className={styles['checkbox-svg-pattern']}>
          <rect fill="url(#line-dense-pattern)" height="100%" width="100%" />
        </svg>
        <input checked={checked} type="checkbox" {...props} ref={ref} />
      </div>
    )
  },
)
