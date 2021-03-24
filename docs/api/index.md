# API

[[toc]]

## GlistenClient

Modal component to submit a feeback to glisten

### Props

| Name                        | Type      | Description                                            |
| --------------------------- | --------- | ------------------------------------------------------ |
| `sheet` _required_          | `boolean` | Modal is showed whenever true                          |
| `user-name` _required_      | `string`  | The default username                                   |
| `custom-tracker` _required_ | `any`     | Tracks context of the feedback (like current page URL) |
| `application-id` _required_ | `string`  | Identify the feedback's application                    |

### Events

| Name    | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| `close` | <br/>**Arguments**<br/><ul><li>**`glistenWhisp: any`**</li></ul> |

## GlistenCsat

Customer Satisfaction score for given applications in a period of time

### Props

| Name                               | Type       | Description                   | Default |
| ---------------------------------- | ---------- | ----------------------------- | ------- |
| `end-date`                         | `Date`     | Ending date of the interval   |         |
| `start-date`                       | `Date`     | Starting date of the interval |         |
| `filtered-applications` _required_ | `string[]` | Array of applications name    | `[]`    |
