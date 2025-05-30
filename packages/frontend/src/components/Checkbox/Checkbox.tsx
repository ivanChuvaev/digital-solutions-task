import { forwardRef, type ComponentProps } from 'react'
import styles from './Checkbox.module.css'
import cn from 'classnames'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, className, ...props }, ref) => {
    return (
      <div className={cn(styles.checkbox, className)}>
        <input type="checkbox" checked={checked} {...props} ref={ref} />
      </div>
    )
  },
)
