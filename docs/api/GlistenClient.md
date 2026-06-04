# GlistenClient

## Props

| Prop name      | Description | Type    | Values | Default                                                                                                                                                                                       |
| -------------- | ----------- | ------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sheet          |             | boolean | -      |                                                                                                                                                                                               |
| userName       |             | string  | -      |                                                                                                                                                                                               |
| customTracker  |             | any     | -      |                                                                                                                                                                                               |
| applicationId  |             | string  | -      |                                                                                                                                                                                               |
| greetings      |             | string  | -      | "Thank you so much for taking the time to share your feedback with us! We appreciate hearing your thoughts on how we're doing, and we're excited to use your feedback to become even better." |
| textFieldLabel |             | string  | -      | "We're always looking to improve. Please share your feedback with us"                                                                                                                         |
| heartColor     |             | string  | -      | 'red'                                                                                                                                                                                         |

## Events

| Event name | Properties | Description |
| ---------- | ---------- | ----------- |
| close      |            |

---

# GlistenClient

Modal component to submit a feeback to glisten

## Props

| Name                        | Type      | Description                                            |
| --------------------------- | --------- | ------------------------------------------------------ |
| `sheet` _required_          | `boolean` | Modal is showed whenever true                          |
| `user-name` _required_      | `string`  | The default username                                   |
| `custom-tracker` _required_ | `any`     | Tracks context of the feedback (like current page URL) |
| `application-id` _required_ | `string`  | Identify the feedback's application                    |

## Events

| Name    | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| `close` | <br/>**Arguments**<br/><ul><li>**`glistenWhisp: any`**</li></ul> |
