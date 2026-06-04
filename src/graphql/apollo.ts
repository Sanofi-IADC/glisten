import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  from,
  type NormalizedCacheObject,
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { WHISP_GQL_CLIENT } from '@/types/whisps';

/** Derives `wss://host/graphql` from `https://host/graphql` when no explicit WS URL is set. */
export function resolveWhisprWsURL(httpURL: string, wsURL?: string): string | undefined {
  const explicit = wsURL?.trim();
  if (explicit) {
    return explicit;
  }
  const http = httpURL?.trim();
  if (!http) {
    return undefined;
  }
  try {
    const url = new URL(http);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.href;
  } catch {
    return undefined;
  }
}

/** True when subscriptions can run over WebSocket (explicit or derived from the HTTP URL). */
export function isWhisprSubscriptionEnabled(): boolean {
  const httpURL = import.meta.env.VITE_WHISPR_API_HTTP_URL?.trim() ?? '';
  return Boolean(resolveWhisprWsURL(httpURL, import.meta.env.VITE_WHISPR_API_WS_URL));
}

function createApolloClientOptions(link: ReturnType<typeof from>) {
  return {
    link,
    cache: new InMemoryCache(),
    devtools: { enabled: import.meta.env.DEV },
  };
}

// Create the apollo client
export const apolloClient = (
  httpURL: string,
  wsURL?: string,
  token?: string,
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = new HttpLink({
    uri: httpURL,
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation?.operationName}`,
        ),
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const resolvedWsURL = resolveWhisprWsURL(httpURL, wsURL);
  if (resolvedWsURL) {
    const connectionParams = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};

    const wsLink = new GraphQLWsLink(
      createClient({
        url: resolvedWsURL,
        lazy: true,
        connectionParams,
      }),
    );

    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      httpLink,
    );

    return new ApolloClient(createApolloClientOptions(from([errorLink, link])));
  }

  return new ApolloClient(createApolloClientOptions(from([errorLink, httpLink])));
};

// Tracks the most recently created `whispr` client so components can detect
// whether the named client is actually registered before referencing it.
let whisprClient: ApolloClient<NormalizedCacheObject> | null = null;

/**
 * Build the apollo client map consumed by `@vue/apollo-composable`'s `provideApolloClients`.
 * Keeps backwards compatibility with the named `whispr` client used across the components.
 */
export const apolloClients = (httpURL: string, wsURL?: string, token?: string) => {
  const client = apolloClient(httpURL, wsURL, token);
  whisprClient = client;
  return {
    default: client,
    [WHISP_GQL_CLIENT]: client,
  };
};

/**
 * Returns the `whispr` Apollo client if one has been created via {@link apolloClients},
 * otherwise `null`. Lets components fall back to the default client gracefully instead of
 * throwing "Apollo client with id whispr not found".
 */
export const getWhisprClient = (): ApolloClient<NormalizedCacheObject> | null => whisprClient;
