// ** React Imports
import React, { forwardRef } from 'react'

// ** Types
import { RepeaterProps } from './types'

const Repeater = forwardRef<any, RepeaterProps>((props, ref) => {
  // ** Props
  const { count, tag, children, ...restProps } = props

  // ** Custom Tag
  const Tag = (tag || 'div') as React.ElementType

  // ** Default Items
  const items = []

  // ** Loop passed count times and push it in items Array
  for (let i = 0; i < count; i++) {
    items.push(children(i))
  }

  return React.createElement(Tag, { ref, ...restProps }, items)
})

Repeater.displayName = 'Repeater'

export default Repeater
