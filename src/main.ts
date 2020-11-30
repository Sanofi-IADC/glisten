import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';
import moment from 'moment';
import { apolloProvider } from './graphql/apollo';
import VueApollo from 'vue-apollo';

Vue.prototype.moment = moment;
Vue.config.productionTip = false;

Vue.use(VueApollo);

new Vue({
  vuetify,
  apolloProvider: apolloProvider(
    process.env.VUE_APP_WHISPR_API_HTTP_URL || '',
    process.env.VUE_APP_WHISPR_API_WS_URL || '',
  ),
  render: (h) => h(App),
}).$mount('#app');
