/*
 * In this will put all the queries
 * and mutations of alerts and comments
 */
import { IWhisp } from '@/interfaces/whisp';
import gql from 'graphql-tag';

// -----------------------------------------------------------------------------------------
//                                      QUERIES
// -----------------------------------------------------------------------------------------

// query for getting all alerts and comments
export const GET_ALL_WHISPS = gql`
  query {
    whisps {
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

export type GetAllWhispsResult = { whisps: IWhisp[] };

export const GET_SINGLE_WHISP = gql`
  query GET_SINGLE_WHISP($id: String!) {
    whispById(id: $id) {
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

export type GetSingleResult = { whispById: IWhisp };

export const GET_FILTERED_WHISPS = gql`
  query GET_FILTERED_WHISPS($filter: JSONObject!) {
    whisps(filter: $filter) {
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
export type GetFileteredWhispsResult = { whisps: IWhisp[] };

export const GET_FILTERED_WHISPS_COUNT = gql`
  query GET_FILTERED_WHISPS_COUNT($filter: WhispInputType!) {
    whispsCount(filter: $filter)
  }
`;

export type GetFileteredWhispsCountResult = { whispsCount: number };

// -----------------------------------------------------------------------------------------
//                                      Mutation
// -----------------------------------------------------------------------------------------

// subscription for getting alerts and comments

export const CREATE_WHISP = gql`
  mutation($whisp: WhispInputType!) {
    createWhisp(whisp: $whisp) {
      _id
      openedBy
      timestamp
      data
    }
  }
`;

export type CreateWhispResult = {
  createWhisp: {
    _id: string;
    timestamp: string;
    openedBy: string;
    data: any;
  };
};

export const UPDATE_WHISP = gql`
  mutation($id: String!, $whisp: WhispInputType!) {
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

export type UpdateWhispResult = {
  updateWhisp: IWhisp;
};

export const REPLACE_WHISP = gql`
  mutation($id: String!, $whisp: WhispInputType!) {
    replaceWhisp(id: $id, whisp: $whisp) {
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

export type ReplaceWhispResult = {
  replaceWhisp: IWhisp;
};

export const DELETE_WHISP = gql`
  mutation($id: String!) {
    deleteWhisp(id: $id)
  }
`;

export type DeleteWhispResult = {
  deleteWhisp: boolean;
};

// -----------------------------------------------------------------------------------------
//                                      Subscription
// -----------------------------------------------------------------------------------------

// subscription for getting alerts and comments

export const SUBSCRIPTION_WHISPS = gql`
  subscription SUBSCRIPTION_WHISPS($filter: WhispInputType!) {
    whispAdded(whisp: $filter) {
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

export type SubcriptionsWhispsResult = {
  whispAdded: IWhisp;
};
