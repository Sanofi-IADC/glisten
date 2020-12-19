import { VueConstructor } from 'vue';

export const GlistenClient: VueConstructor;
export const GlistenDashboard: VueConstructor;

declare module '@sanofi-iadc/glisten' {
  export function install(vue: VueConstructor, options: any): void;
}
