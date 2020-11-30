import {
  GET_ALL_WHISPS,
  GET_SINGLE_WHISP,
  GET_FILTERED_WHISPS,
  GET_FILTERED_WHISPS_COUNT,
  CREATE_WHISP,
  UPDATE_WHISP,
  REPLACE_WHISP,
  DELETE_WHISP,
  SUBSCRIPTION_WHISPS,
  GetAllWhispsResult,
  GetSingleResult,
  GetFileteredWhispsResult,
  GetFileteredWhispsCountResult,
  CreateWhispResult,
  UpdateWhispResult,
  ReplaceWhispResult,
  DeleteWhispResult,
  SubcriptionsWhispsResult,
} from '../graphql/queries/whispQueries';
import { apolloClient } from '../graphql/apollo';
import { Subject } from 'rxjs';
import { IWhisp } from '@/interfaces/whisp';
import { ApolloQueryResult } from 'apollo-client/core/types';
import { FetchResult } from 'apollo-link';

export type WhispsQuery = { whisps: IWhisp[] };

export class WhispService {
  public static httpURL: string;
  public static wsURL: string;

  /**
   * Queries
   */
  public static async getAllWhisps(): Promise<ApolloQueryResult<GetAllWhispsResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query<WhispsQuery>({
      query: GET_ALL_WHISPS,
    });
  }

  public static async getOneWhisp(whispId: string): Promise<ApolloQueryResult<GetSingleResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_SINGLE_WHISP,
      variables: { id: whispId },
      fetchPolicy: 'network-only',
    });
  }

  public static async getFilteredWhisps(
    filter: Partial<IWhisp>,
  ): Promise<ApolloQueryResult<GetFileteredWhispsResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_FILTERED_WHISPS,
      variables: { filter: filter },
      fetchPolicy: 'network-only',
    });
  }

  public static async getFilteredWhispsCount(
    filter: Partial<IWhisp>,
  ): Promise<ApolloQueryResult<GetFileteredWhispsCountResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).query({
      query: GET_FILTERED_WHISPS_COUNT,
      variables: { filter: filter },
    });
  }

  /**
   * Mutations
   */

  public static async createWhisp(whisp: Partial<IWhisp>): Promise<FetchResult<CreateWhispResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: CREATE_WHISP,
      variables: { whisp },
    });
  }

  public static async updateWhisp(
    id: string,
    whisp: Partial<IWhisp>,
  ): Promise<FetchResult<UpdateWhispResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: UPDATE_WHISP,
      variables: {
        whisp,
        id,
      },
    });
  }

  public static async replaceWhisp(
    id: string,
    whisp: Partial<IWhisp>,
  ): Promise<FetchResult<ReplaceWhispResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: REPLACE_WHISP,
      variables: {
        whisp,
        id,
      },
    });
  }

  public static async deleteWhisp(id: string): Promise<FetchResult<DeleteWhispResult>> {
    return apolloClient(WhispService.httpURL, WhispService.wsURL).mutate({
      mutation: DELETE_WHISP,
      variables: { id },
    });
  }

  /**
   * Subscriptions
   */
  public static subscribeWhisps(filter: Partial<IWhisp>): Subject<IWhisp> {
    const sub = new Subject<IWhisp>();

    apolloClient(WhispService.httpURL, WhispService.wsURL)
      .subscribe<SubcriptionsWhispsResult>({
        query: SUBSCRIPTION_WHISPS,
        variables: {
          filter: filter,
        },
      })
      .subscribe((data) => {
        if (data.data) {
          sub.next(data.data.whispAdded);
        }
      });
    return sub;
  }
}
