import type { App, DefineComponent } from 'vue';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';

export const GlistenClient: DefineComponent<Record<string, unknown>>;
export const GlistenDashboard: DefineComponent<Record<string, unknown>>;
export const GlistenCsat: DefineComponent<Record<string, unknown>>;

export function apolloClient(
  httpURL: string,
  wsURL?: string,
  token?: string,
): ApolloClient<NormalizedCacheObject>;

export function apolloClients(
  httpURL: string,
  wsURL?: string,
  token?: string,
): Record<string, ApolloClient<NormalizedCacheObject>>;

export { ApolloClients } from '@vue/apollo-composable';

export interface GlistenPluginOptions {
  httpURL?: string;
  wsURL?: string;
  token?: string;
}

declare const Plugin: {
  install: (app: App, options?: GlistenPluginOptions) => void;
};

export default Plugin;
