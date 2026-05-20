'use client'

// ** Type Imports
import { NavLink, NavGroup, LayoutProps, NavSectionTitle } from 'src/@core/layouts/types'

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavGroup from './VerticalNavGroup'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

interface Props {
  parent?: NavGroup
  navHover?: boolean
  navVisible?: boolean
  groupActive: string[]
  isSubToSub?: NavGroup
  currentActiveGroup: string[]
  navigationBorderWidth: number
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  setGroupActive: (value: string[]) => void
  setCurrentActiveGroup: (item: string[]) => void
  toggleNavVisibility?: () => void
  collapsedNavWidth?: number
  verticalNavItems?: LayoutProps['verticalLayoutProps']['navMenu']['navItems']
}

const resolveNavItemComponent = (item: NavGroup | NavLink | NavSectionTitle) => {
  if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle
  if ((item as NavGroup).children) return VerticalNavGroup

  return VerticalNavLink
}

const VerticalNavItems = (props: Props) => {
  // ** Props
  const { verticalNavItems, parent, ...restProps } = props

  // ** Early return if no items
  if (!verticalNavItems || verticalNavItems.length === 0) {
    return null
  }

  // ** Map items to components
  const RenderMenuItems = verticalNavItems.map((item: NavGroup | NavLink | NavSectionTitle, index: number) => {
    const TagName: any = resolveNavItemComponent(item)
    
    // ** Prepare props for child components
    // VerticalNavLink expects parent as boolean, VerticalNavGroup expects parent as NavGroup
    const componentProps = TagName === VerticalNavLink 
      ? { ...restProps, parent: !!parent } 
      : { ...restProps, parent }

    // ** Generate unique key based on item type
    let itemKey: string
    if ('sectionTitle' in item) {
      itemKey = (item as NavSectionTitle).sectionTitle
    } else if ('path' in item) {
      itemKey = (item as NavLink).path || (item as NavLink).title
    } else {
      itemKey = (item as NavGroup).title
    }
    itemKey = itemKey || `nav-item-${index}`

    return <TagName {...componentProps} key={itemKey} item={item} />
  })

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
