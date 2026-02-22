declare module 'vaul' {
  import * as React from 'react'

  type AnyComp = React.ComponentType<any>

  export const Drawer: AnyComp & {
    Root: AnyComp
    Trigger: AnyComp
    Portal: AnyComp
    Close: AnyComp
    Overlay: AnyComp
    Content: AnyComp
    Title: AnyComp
    Description: AnyComp
  }

  export default Drawer
}
