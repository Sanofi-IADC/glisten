# API

[[toc]]

## GlistenClient

The modal component to submit a feeback

### Props

| Name          | Description                                            | Type      | Required | Default |
| ------------- | ------------------------------------------------------ | --------- | -------- | ------- |
| sheet         | Modal is showed whenever true                          | `boolean` | `true`   | -       |
| userName      | The default username                                   | `string`  | `true`   | -       |
| customTracker | Tracks context of the feedback (like current page URL) | `any`     | `true`   | -       |
| applicationId | Identify the feedback's application                    | `string`  | `true`   | -       |

### Events

| Event Name | Description                              | Parameters |
| ---------- | ---------------------------------------- | ---------- |
| close      | emitted whenever close button is pressed | void       |
