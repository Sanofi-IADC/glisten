import {
  GET_ALL_COMMENTS,
  GET_SINGLE_COMMENT,
  GET_FILTERED_COMMENTS,
  GET_FILTERED_COMMENTS_COUNT,
  CREATE_WHISP,
  UPDATE_COMMENT,
  REPLACE_COMMENT,
  DELETE_COMMENT,
  SUBSCRIPTION_COMMENTS,
} from '../graphql/queries/eventQueries';
import { apolloClient } from '../graphql/apollo';
import { Subject } from 'rxjs';

export class WhispService {
  public static httpURL: string;
  public static wsURL: string;

  /**
   * Queries
   */
  public static async getAllEvents() {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_ALL_COMMENTS,
    });
  }

  public static async getOneEvent(eventId: string) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_SINGLE_COMMENT,
      variables: { id: eventId },
      fetchPolicy: 'network-only',
    });
  }

  public static async getFilteredEvents(event: any) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_FILTERED_COMMENTS,
      variables: { filter: event },
      fetchPolicy: 'network-only',
    });
  }

  public static async getFilteredEventsCount(event: any) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_FILTERED_COMMENTS_COUNT,
      variables: { filter: event },
    });
  }

  /**
   * Mutations
   */

  public static async createWhisp(whisp: any) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: CREATE_WHISP,
      variables: { whisp },
    });
  }

  public static async updateEvent(id: string, event: any) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: UPDATE_COMMENT,
      variables: {
        event,
        id,
      },
    });
  }

  public static async replaceEvent(id: string, event: any) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: REPLACE_COMMENT,
      variables: {
        event,
        id,
      },
    });
  }

  public static async deleteEvent(id: string) {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: DELETE_COMMENT,
      variables: { id },
    });
  }

  /**
   * Subscriptions
   */
  public static subscribeEvents(event: any): Subject<any> {
    const sub = new Subject();

    apolloClient(WhispService.httpURL, WhispService.wsURL).subscribe({
      query: SUBSCRIPTION_COMMENTS,
      variables: {
        filter: event,
      },
    }).subscribe((data) => {
      sub.next(data);
    });
    return sub;
  }
}
