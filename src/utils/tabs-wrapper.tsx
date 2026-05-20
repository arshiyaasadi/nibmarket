// ** React Imports
import React from 'react'

// ** MUI Lab Imports
import TabContextOriginal from '@mui/lab/TabContext'
import TabPanelOriginal from '@mui/lab/TabPanel'
import TabListOriginal from '@mui/lab/TabList'

// ** Type assertions for React 19 compatibility
export const TabContext = TabContextOriginal as any as React.ComponentType<any>
export const TabPanel = TabPanelOriginal as any as React.ComponentType<any>
export const TabList = TabListOriginal as any as React.ComponentType<any>

