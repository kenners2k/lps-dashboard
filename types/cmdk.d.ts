declare module 'cmdk' {
  import * as React from 'react'

  type AnyComp = React.ComponentType<any>

  /**
   * `Command` is a component that also exposes subcomponents as static properties.
   */
  export const Command: AnyComp & {
    Input: AnyComp
    List: AnyComp
    Empty: AnyComp
    Group: AnyComp
    Separator: AnyComp
    Item: AnyComp
  }

  export default Command
}
