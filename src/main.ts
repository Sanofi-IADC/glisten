import 'babel-polyfill';
import Vue from 'vue';
import singleSpaVue from 'single-spa-vue';
import App from './App.vue';
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { apolloProvider } from './graphql/apollo';
import VueApollo from 'vue-apollo';
import { setPublicPath } from 'systemjs-webpack-interop';

setPublicPath('@sanofi-iadc/glisten', 1);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

Vue.prototype.dayjs = dayjs;
Vue.config.productionTip = false;

Vue.use(VueApollo);

// new Vue({
//   vuetify,
//   apolloProvider: apolloProvider(
//     process.env.VUE_APP_WHISPR_API_HTTP_URL || '',
//     process.env.VUE_APP_WHISPR_API_WS_URL || '',
//   ),
//   render: (h) => h(App),
// }).$mount('#app');

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render(h: any) {
      return h(App, {
        props: {
          // single-spa props are available on the "this" object. Forward them to your component as needed.
          // https://single-spa.js.org/docs/building-applications#lifecyle-props
          // if you uncomment these, remember to add matching prop definitions for them in your App.vue file.
          /*
          name: this.name,
          mountParcel: this.mountParcel,
          singleSpa: this.singleSpa,
          */          
          applicationId:this.applicationId, // this is set in the root config application
          userName:this.userName, // this is set in the root config application
        },
      });
    },
    vuetify,
    apolloProvider: apolloProvider(
      process.env.VUE_APP_WHISPR_API_HTTP_URL || '',
      process.env.VUE_APP_WHISPR_API_WS_URL || '',
    ),
  },
});
// export const bootstrap = vueLifecycles.bootstrap;
// export const mount = vueLifecycles.mount;
// export const unmount = vueLifecycles.unmount;
export const GlistenParcel = {

  bootstrap: vueLifecycles.bootstrap,
  mount: vueLifecycles.mount,
  unmount: vueLifecycles.unmount,
  
};