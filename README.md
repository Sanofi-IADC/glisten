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

Add a plugin in _plugins/GlistenClient.js_ :

```sh
import Vue from 'vue'
import GlistenClient from '@sanofi-iadc/glisten'

Vue.component('GlistenClient', GlistenClient)
```

Then, in \*nuxt.config.js add :

```sh
  ssr: false,

  modules: [
    '@nuxtjs/apollo',
  ],

  plugins: [{ src: '@/plugins/GlistenClient', mode: 'client' }],

  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint:
          process.env.WHISPR_BASE_URL,
      },
    },
  },
```

Finally, add it to the pages or components where you want to display it

```html
<template>
  <GlistenClient
    :sheet="sheet"
    applicationID="you-application-Name"
    :customTracker="customTracker"
    @close="toggleFeedback"
  />
</template>
```
## Installation in a basic VueJS project

In main.js : 


```sh
import GlistenClient from '@sanofi-iadc/glisten';
Vue.component('GlistenClient', GlistenClient);
```
Then add it to the pages or components where you want to display it

```html
<template>
  <GlistenClient
    :sheet="sheet"
    applicationID="you-application-Name"
    :customTracker="customTracker"
    @close="toggleFeedback"
  />
</template>
```

Your config apollo must be done.