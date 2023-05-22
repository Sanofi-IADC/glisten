import Vue from 'vue';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';
import fetch from 'node-fetch';

import { split, from } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { WHISP_GQL_CLIENT } from '@/types/whisps';

// Create the apollo client
export const apolloClient = (httpURL: string, wsURL: string, token?: string) => {
  const httpLink = new HttpLink({
    fetch: fetch as any,
    uri: httpURL,
  });

  const wsLink = new WebSocketLink({
    uri: wsURL,
    options: {
      ...token != null ? {
        connectionParams: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      } : {},
      reconnect: true,
      lazy: true,
    },
  });

  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  // Error Handling
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  return new ApolloClient({
    link: from([errorLink, link]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
};

export const apolloProvider = (httpURL: string, wsURL: string, token?: string) => {
  const client = apolloClient(httpURL, wsURL, token);
  return new VueApollo({
    defaultClient: client,
    clients: {
      [WHISP_GQL_CLIENT]: client,
    },
  });
};
