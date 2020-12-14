import Vue, { VueConstructor } from 'vue';
import VueApollo from 'vue-apollo';
import GlistenClient from './components/GlistenClient.vue';
import { apolloProvider } from './graphql/apollo';
import { WhispService } from './services/whisp.service';

const components = {
  GlistenClient,
} as any;

const Plugin = {
  install(Vue: VueConstructor<Vue>, options: { httpURL: string; wsURL: string }) {
    //   if (this.installed) {
    //     return
    //   }

    Vue.use(VueApollo);
    Vue.extend({
      apolloProvider: apolloProvider(
        process.env.VUE_APP_WHISPR_API_HTTP_URL || '',
        process.env.VUE_APP_WHISPR_API_WS_URL || '',
      ),
    });

    // this.installed = true

    Object.keys(components).forEach((name) => {
      Vue.component(name, components[name]);
    });

    // const WhispService = ;

    WhispService.httpURL = options.httpURL;
    WhispService.wsURL = options.wsURL;
  },
};

// const plugin = {
//   install,
// };

export default Plugin;
