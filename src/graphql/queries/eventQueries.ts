/*
 * In this will put all the queries
 * and mutations of alerts and comments
 */
import gql from 'graphql-tag';

// -----------------------------------------------------------------------------------------
//                                      QUERIES
// -----------------------------------------------------------------------------------------

// query for getting all alerts and comments
export const GET_ALL_COMMENTS = gql`
  query {
    event {
        _id,
        readableID,
        type,
        severity,
        description,
        closed,
        applicationID,
        plantID,
        locationID,
        manual,
        openedBy,
        closedBy,
        timestamp,
        updated,
        data
      }
  }
`;

export const GET_SINGLE_COMMENT = gql`
  query GET_SINGLE_COMMENT($id: String!) {
    eventById(id: $id) {
        _id,
        readableID,
        type,
        severity,
        description,
        closed,
        applicationID,
        plantID,
        locationID,
        manual,
        openedBy,
        closedBy,
        timestamp,
        updated,
        data
      }
  }
`;

export const GET_FILTERED_COMMENTS = gql`
  query GET_FILTERED_COMMENTS($filter: WhispInputType!) {
    eventFiltered(event: $filter) {
        _id,
        readableID,
        type,
        severity,
        description,
        closed,
        applicationID,
        plantID,
        locationID,
        manual,
        openedBy,
        closedBy,
        timestamp,
        updated,
        data
      }
  }
`;

export const GET_FILTERED_COMMENTS_COUNT = gql`
  query GET_FILTERED_COMMENTS_COUNT($filter: WhispInputType!) {
    eventCount(event: $filter)
  }
`;

// -----------------------------------------------------------------------------------------
//                                      Mutation
// -----------------------------------------------------------------------------------------

// subscription for getting alerts and comments

export const CREATE_WHISP = gql`
mutation ($whisp: WhispInputType!) {
    createWhisp (whisp: $whisp) {
      _id,
      openedBy,
      timestamp,
      data
    }
}`;

export const UPDATE_COMMENT = gql`
mutation ($id: String!, $event: WhispInputType!) {
    updateEvent (id: $id, event: $event) {
      type,
      readableID,
      severity,
      description,
      closed,
      applicationID,
      plantID,
      locationID,
      manual,
      openedBy,
      closedBy,
      timestamp,
      updated,
      data
    }
}`;

export const REPLACE_COMMENT = gql`
mutation ($id: String!, $event: WhispInputType!) {
    replaceEvent (id: $id, event: $event) {
      _id,
      readableID,
      type,
      severity,
      description,
      closed,
      applicationID,
      plantID,
      locationID,
      manual,
      openedBy,
      closedBy,
      timestamp,
      updated,
      data
    }
}`;

export const DELETE_COMMENT = gql`
mutation ($id: String!) {
    deleteEvent (id: $id)
}`;

// -----------------------------------------------------------------------------------------
//                                      Subscription
// -----------------------------------------------------------------------------------------

// subscription for getting alerts and comments

export const SUBSCRIPTION_COMMENTS = gql`
subscription SUBSCRIPTION_COMMENTS($filter: WhispInputType!){
  eventAdded (event: $filter) {
    _id,
    readableID,
    type,
    severity,
    description,
    closed,
    applicationID,
    plantID,
    locationID,
    manual,
    openedBy,
    closedBy,
    timestamp,
    updated,
    data
    }
}`;
