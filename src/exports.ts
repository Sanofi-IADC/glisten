import GlistenClient from './components/GlistenClient.vue';
import { WhispService } from './services/whisp.service';

const components = {
  GlistenClient,
} as any;

const Plugin = {
  install(Vue: any, options: { httpURL: string; wsURL: string }) {
    //   if (this.installed) {
    //     return
    //   }

    // this.installed = true

    Object.keys(components).forEach((name) => {
      Vue.component(name, components[name]);
    });

    // const WhispService = ;

    WhispService.httpURL = options.httpURL;
    WhispService.wsURL = options.wsURL;

    Vue.prototype.$whisprApi = {
      getAllEvents: WhispService.getAllEvents,
      getOneEvent: WhispService.getOneEvent,
      getFilteredEvents: WhispService.getFilteredEvents,
      getFilteredEventsCount: WhispService.getFilteredEventsCount,
      createWhisp: WhispService.createWhisp,
      updateEvent: WhispService.updateEvent,
      replaceEvent: WhispService.replaceEvent,
      deleteEvent: WhispService.deleteEvent,
      subscribeEvents: WhispService.subscribeEvents,
    };
  },
};

// const plugin = {
//   install,
// };

export default Plugin;
