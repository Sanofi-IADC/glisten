# Glisten Client

This is an NPM package for the Glisten user feedback app POC.

<!-- USAGE EXAMPLES -->

Install the component in your project.

```sh
npm install @sanofi-iadc/glisten
```

## Installation in Nuxt project

```sh
npm install @nuxtjs/apollo
npm install @nuxtjs/vuetify
```

Add a plugin in _plugins/glisten.client.js_ :

```javascript
import Vue from 'vue'
import Glisten, {GlistenClient, GlistenDashboard} from '@sanofi-iadc/glisten'

Vue.component('GlistenClient', GlistenClient)
Vue.component('GlistenDashboard', GlistenDashboard)
Vue.use(Glisten)
```

Then, in *nuxt.config.js* add :

```javascript
  ssr: false,
  // ...

  buildModules: [
    // ...
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],


  modules: [
    // ...
    '@nuxtjs/apollo',
  ],

  plugins: [{ src: '@/plugins/glisten.client.js', mode: 'client' }],

  apollo: {
    clientConfigs: {
      whispr: {
        httpEndpoint:
          process.env.WHISPR_HTTP_BASE_URL,
        wsEndpoint: 
          process.env.WHISPR_WS_BASE_URL,
      },
    },
  },
```

Finally, add it to the pages or components where you want to display it

```html
<template>
  <GlistenClient
    :sheet="sheet"
    application-id="you-application-Name"
    user-name="your username"
    :custom-tracker="customTracker"
    @close="toggleFeedback"
  />
</template>
```
## Installation in a basic VueJS project

In main.js : 


```javascript
import Vue from 'vue'
import { apolloProvider } from '@sanofi-iadc/glisten/graphql/apollo';
import VueApollo from 'vue-apollo';
import Glisten, {GlistenClient, GlistenDashboard} from '@sanofi-iadc/glisten'

Vue.component('GlistenClient', GlistenClient)
Vue.component('GlistenDashboard', GlistenDashboard)

Vue.use(Glisten)
Vue.use(VueApollo)
Vue.use(Vuetify);

new Vue({
  vuetify,
  apolloProvider: apolloProvider(
    process.env.VUE_APP_WHISPR_API_HTTP_URL,
    process.env.VUE_APP_WHISPR_API_WS_URL,
  ),
  render: (h) => h(App),
}).$mount('#app');

```
Then add it to the pages or components where you want to display it

```html
<template>
  <GlistenClient
    :sheet="sheet"
    application-id="you-application-Name"
    user-name="your username"
    :custom-tracker="customTracker"
    @close="toggleFeedback"
  />
</template>
```

Your config apollo must be done.