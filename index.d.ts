import { VueConstructor } from 'vue';
import VueApollo from 'vue-apollo';

export const GlistenClient: VueConstructor;
export const GlistenDashboard: VueConstructor;
export const GlistenCsat: VueConstructor;

export const ApolloProvider: (httpURL: string, wsURL?: string, token?: string) => VueApollo;

declare module '@sanofi-iadc/glisten' {
  export function install(vue: VueConstructor, options: any): void;
}
