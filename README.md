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
```

Add a plugin in _plugins/glisten.client.js_ :

```sh
import Vue from 'vue'
import Glisten, {GlistenClient, GlistenDashboard} from '@sanofi-iadc/glisten'

Vue.component('GlistenClient', GlistenClient)
Vue.component('GlistenDashboard', GlistenDashboard)
Vue.use(Glisten)
```

Then, in \*nuxt.config.js add :

```sh
  ssr: false,

  modules: [
    '@nuxtjs/apollo',
  ],

  plugins: [{ src: '@/plugins/glisten.client.js', mode: 'client' }],

  apollo: {
    clientConfigs: {
      default: {
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


```sh
import Vue from 'vue'
import Glisten, {GlistenClient, GlistenDashboard} from '@sanofi-iadc/glisten'

Vue.component('GlistenClient', GlistenClient)
Vue.component('GlistenDashboard', GlistenDashboard)
Vue.use(Glisten)
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