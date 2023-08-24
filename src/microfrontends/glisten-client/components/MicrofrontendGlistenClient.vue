<template>
  <v-app>
    <glisten-client
      :sheet="sheet"
      :application-id="applicationId"
      :user-name="userName"
      :custom-tracker="customTracker"
      :text-field-label="textFieldLabel"
      :greetings="greetings"
      :heart-color="heartColor"
      @close="onCloseHandler"
    />
  </v-app>
</template>

<script lang="ts">
import GlistenClient from '@/components/GlistenClient.vue';
import EventEmitter from '@/microfrontends/common/event-emitter';
import Vue from 'vue';

import {
  VApp,
  VIcon,
  VSnackbar,
  VTextarea,
  VBtn,
  VBottomSheet,
  VSheet,
  VRating,
  VSelect,
  VRow,
  VCol,
  VContainer,
  VSwitch,
  VTextField,
} from 'vuetify/lib';

interface GlistenClientState {
  sheet: boolean;
  userName: string;
  customTracker: Object;
  applicationId: string;
  greetings: string;
  textFieldLabel: string;
  heartColor: string;
};

/**
 * MicrofrontendGlistenClient component entry default
 */
export default Vue.extend({
  /* eslint-disable vue/no-unused-components */
  components: {
    GlistenClient,
    VApp,
    VIcon,
    VSnackbar,
    VTextarea,
    VBtn,
    VBottomSheet,
    VSheet,
    VRating,
    VSelect,
    VRow,
    VCol,
    VContainer,
    VSwitch,
    VTextField,
  },
  data() {
    return {
      sheet: false,
      userName: '',
      customTracker: {},
      applicationId: '',
      greetings: '',
      textFieldLabel: '',
      heartColor: '',
    };
  },
  mounted() {
    this.setupInitialState();
    EventEmitter.instance().on(
      'onGlistenClientStateChanged',
      (payload: GlistenClientState) => this.onGlistenClientStateChangedHandler(payload),
    );
  },
  methods: {
    setupInitialState() {
      this.sheet = false;
      this.userName = '';
      this.customTracker = {};
      this.applicationId = '';
      this.greetings = 'Thank you so much for taking the time to share your feedback with us! We appreciate hearing your thoughts on how we\'re doing, and we\'re excited to use your feedback to become even better.';
      this.textFieldLabel = 'We\'re always looking to improve. Please share your feedback with us';
      this.heartColor = 'red';
    },
    onCloseHandler() {
      this.setupInitialState();
    },
    onGlistenClientStateChangedHandler(payload: GlistenClientState) {
      this.sheet = payload.sheet ?? this.userName;;
      this.userName = payload.userName ?? this.userName;
      this.customTracker = payload.customTracker ?? this.customTracker;
      this.applicationId = payload.applicationId ?? this.applicationId;
      this.greetings = payload.greetings ?? this.greetings;
      this.textFieldLabel = payload.textFieldLabel ?? this.textFieldLabel;
      this.heartColor = payload.heartColor ?? this.heartColor;
    },
  },
});
</script>
