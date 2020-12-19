import moment from 'moment';
import * as z from 'zod';

export const WHISP_FEEDBACK_TYPE = 'GLISTEN';
export const WHISP_GQL_CLIENT = 'whispr';

export const WhispSchema = z.object({
  _id: z.string(),
  readableID: z.string(),
  type: z
    .string()
    .optional()
    .nullable(),
  severity: z
    .number()
    .optional()
    .nullable(),
  description: z
    .string()
    .optional()
    .nullable(),
  closed: z
    .boolean()
    .optional()
    .nullable(),
  applicationID: z
    .string()
    .optional()
    .nullable(),
  plantID: z
    .string()
    .optional()
    .nullable(),
  locationID: z
    .string()
    .optional()
    .nullable(),
  manual: z
    .boolean()
    .optional()
    .nullable(),
  openedBy: z
    .string()
    .optional()
    .nullable(),
  openedById: z
    .string()
    .optional()
    .nullable(),
  closedBy: z
    .string()
    .optional()
    .nullable(),
  closedById: z
    .string()
    .optional()
    .nullable(),
  timestamp: z.string().refine((x) => moment(x).isValid()),
  updated: z.string().refine((x) => moment(x).isValid()),
  data: z.any(),
  attachments: z
    .array(
      z.object({
        dataMappingPath: z
          .string()
          .optional()
          .nullable(),
        file: z.string(),
      }),
    )
    .optional(),
});

export type IWhisp = z.infer<typeof WhispSchema>;

export enum FeedbackStatus {
  ACTION_NEEDED = 'ACTION_NEEDED',
  ACTION_DONE = 'ACTION_DONE',
  NO_ACTION_NEEDED = 'NO_ACTION_NEEDED',
}

export const FeedbackStatusEnumSchema = z.nativeEnum(FeedbackStatus);

export const FeedbackSchema = WhispSchema.extend({
  data: z.object({
    status: FeedbackStatusEnumSchema,
    feedback: z
      .string()
      .optional()
      .nullable(),
    rating: z.number(),
    commentSentimentScore: z
      .number()
      .optional()
      .nullable(),
    name: z
      .string()
      .optional()
      .nullable(),
    anonymous: z
      .boolean()
      .optional()
      .nullable(),
    contextPage: z
      .string()
      .optional()
      .nullable(),
    contextPortal: z
      .string()
      .optional()
      .nullable(),
    notes: z
      .string()
      .optional()
      .nullable(),
    category: z
      .string()
      .optional()
      .nullable(),
  }),
});

export type IFeedback = z.infer<typeof FeedbackSchema>;
