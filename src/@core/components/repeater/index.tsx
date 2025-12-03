// ** React Imports
import { forwardRef } from 'react'

// ** Types
import { RepeaterProps } from './types'

const Repeater = forwardRef<any, RepeaterProps>((props, ref) => {
  // ** Props
  const { count, tag, children, ...restProps } = props

  // ** Custom Tag
  const Tag = tag || 'div'

  // ** Default Items
  const items = []

  // ** Loop passed count times and push it in items Array
  for (let i = 0; i < count; i++) {
    items.push(children(i))
  }

  return <Tag ref={ref} {...restProps}>{items}</Tag>
})

Repeater.displayName = 'Repeater'

export default Repeater
