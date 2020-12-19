/*
 * In this will put all the queries
 * and mutations of alerts and comments
 */
import { IFeedback } from '@/types/whisps';
import { IWhisp } from '@/types/whisps';
import gql from 'graphql-tag';
import * as z from 'zod';

export const GQLCachedResultSchema = z.object({ __typename: z.string() });

export type GQLCachedResult<T> = T & {
  __typename: string;
};

export const GET_FEEDBACKS = gql`
  query feedbacks($limit: Int, $sort: JSONObject, $filter: JSONObject) {
    feedbacks: whisps(filter: $filter, sort: $sort, limit: $limit) {
      _id
      readableID
      type
      severity
      description
      closed
      applicationID
      plantID
      locationID
      manual
      openedBy
      closedBy
      timestamp
      updated
      data
    }
  }
`;

export type FeedbackQuerySortVariable = Partial<{ [T in keyof IFeedback]: -1 | 1 }>;

export interface FeedbackQueryVariables {
  limit: number;
  sort: FeedbackQuerySortVariable;
  filter: Partial<IFeedback>;
}

export interface FeedbackQueryResult {
  feedbacks: GQLCachedResult<IFeedback>[];
}

export const CREATE_WHISP = gql`
  mutation createWhisp($whisp: WhispInputType!) {
    createWhisp(whisp: $whisp) {
      _id
      openedBy
      timestamp
      data
    }
  }
`;

export interface CreateWhispResult {
  createWhisp: {
    _id: string;
    timestamp: string;
    openedBy: string;
    data: any;
  };
}

export interface CreateWhispVariables {
  whisp: Omit<IWhisp, '_id' | 'readableID' | 'updated' | 'timestamp'>;
}

export const UPDATE_WHISP = gql`
  mutation updateWhisp($id: String!, $whisp: WhispInputType!) {
    updateWhisp(id: $id, whisp: $whisp) {
      type
      readableID
      severity
      description
      closed
      applicationID
      plantID
      locationID
      manual
      openedBy
      closedBy
      timestamp
      updated
      data
    }
  }
`;

export interface UpdateWhispVariables {
  id: string;
  whisp: IWhisp;
}

export interface UpdateWhispResult {
  updateWhisp: GQLCachedResult<IWhisp>;
}

export const SUBCRIPTION_FEEDBACKS = gql`
  subscription SUBCRIPTION_FEEDBACKS($filter: JSONObject!) {
    feedbackAdded: whispAdded(filter: $filter) {
      _id
      readableID
      type
      severity
      description
      closed
      applicationID
      plantID
      locationID
      manual
      openedBy
      closedBy
      timestamp
      updated
      data
    }
  }
`;

export interface FeedbackSubcriptionResult {
  feedbackAdded: GQLCachedResult<IFeedback>;
}

export interface FeedbackSubscriptionVariables {
  filter: {
    type?: string;
    applicationID?: string;
  };
}
