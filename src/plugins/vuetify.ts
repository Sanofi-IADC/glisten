import Vue from 'vue';
import Vuetify, {
  VApp,
  VDataTable,
  VIcon,
  VSnackbar,
  VTooltip,
  VListItem,
  VListItemContent,
  VListItemTitle,
  VListItemSubtitle,
  VMenu,
  VTextarea,
  VCheckbox,
  VChip,
  VBtn,
  VDatePicker,
  VBottomSheet,
  VSheet,
  VRating,
  VSelect,
  VRow,
  VCol,
  VContainer,
  VSwitch,
  VTextField,
  VCard,
} from 'vuetify/lib';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify, {
  components: {
    VApp,
    VDataTable,
    VIcon,
    VSnackbar,
    VTooltip,
    VListItem,
    VListItemContent,
    VListItemTitle,
    VListItemSubtitle,
    VMenu,
    VTextarea,
    VCheckbox,
    VChip,
    VBtn,
    VDatePicker,
    VBottomSheet,
    VSheet,
    VRating,
    VSelect,
    VRow,
    VCol,
    VContainer,
    VSwitch,
    VTextField,
    VCard,
  },
});

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        // amber colour from vuetify palette, used colour code because importing types caused an error
        warning: '#FFC107',
      },
    },
    options: {
      customProperties: true,
    },
  },
  breakpoint: {
    thresholds: {
      xs: 340,
      sm: 540,
      md: 800,
      lg: 1280,
    },
    scrollBarWidth: 24,
  },
});
