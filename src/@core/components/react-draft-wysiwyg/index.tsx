// ** Next Import
import dynamic from 'next/dynamic'

// ** Types
import { EditorProps } from 'react-draft-wysiwyg'
import React from 'react'

// ! To avoid 'Window is not defined' error
const ReactDraftWysiwyg = dynamic<EditorProps>(
  () => import('react-draft-wysiwyg').then(mod => mod.Editor as React.ComponentType<EditorProps>),
  {
    ssr: false
  }
)

export default ReactDraftWysiwyg
