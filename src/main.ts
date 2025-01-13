import { createApp } from "vue";
import App from "./App.vue";

import { createRouter, createWebHistory } from "vue-router";

import { createVuetify } from "vuetify";
import "vuetify/styles";
import '@mdi/font/css/materialdesignicons.css';
import colors from 'vuetify/util/colors'

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { routes } from "./core/routes";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.red.darken1, // #E53935
          secondary: colors.red.lighten4, // #FFCDD2
        },
      },
    },
  },
});
const app = createApp(App);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

app.use(router);
app.use(vuetify);

app.mount("#app");
