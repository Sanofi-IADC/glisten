import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';
import moment from 'moment';
// import { apolloProvider } from './graphql/apollo';

Vue.prototype.moment = moment;
Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
