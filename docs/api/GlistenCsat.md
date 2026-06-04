# GlistenCsat

## Props

| Prop name            | Description | Type  | Values | Default                                        |
| -------------------- | ----------- | ----- | ------ | ---------------------------------------------- |
| endDate              |             | Date  | -      | () =&gt; new Date()                            |
| startDate            |             | Date  | -      | () =&gt; dayjs().subtract(2, 'month').toDate() |
| filteredApplications |             | Array | -      | () =&gt; []                                    |

---

# GlistenCsat

Customer Satisfaction score for given applications in a period of time

## Props

| Name                               | Type       | Description                   | Default |
| ---------------------------------- | ---------- | ----------------------------- | ------- |
| `end-date`                         | `Date`     | Ending date of the interval   |         |
| `start-date`                       | `Date`     | Starting date of the interval |         |
| `filtered-applications` _required_ | `string[]` | Array of applications name    | `[]`    |
