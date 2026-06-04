import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import { aliases as svgAliases, mdi as mdiSvg } from 'vuetify/iconsets/mdi-svg';
import { mdi as mdiFont } from 'vuetify/iconsets/mdi';

export default createVuetify({
  icons: {
    // Default to the tree-shakeable SVG set (`@mdi/js`); keep the font set
    // available under `mdi` so existing `mdi-*` string names still resolve.
    defaultSet: 'mdi-svg',
    aliases: svgAliases,
    sets: {
      mdi: mdiFont,
      'mdi-svg': mdiSvg,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          // amber colour from vuetify palette
          warning: '#FFC107',
        },
      },
    },
  },
  display: {
    thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
    },
  },
});
