# GlistenClient

Modal component to submit a feeback to glisten

## Props

| Name                        | Type      | Description                                            |
| --------------------------- | --------- | ------------------------------------------------------ |
| `sheet` *required*          | `boolean` | Modal is showed whenever true                          |
| `user-name` *required*      | `string`  | The default username                                   |
| `custom-tracker` *required* | `any`     | Tracks context of the feedback (like current page URL) |
| `application-id` *required* | `string`  | Identify the feedback's application                    |

## Events

| Name    | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| `close` | <br/>**Arguments**<br/><ul><li>**`glistenWhisp: any`**</li></ul> |

