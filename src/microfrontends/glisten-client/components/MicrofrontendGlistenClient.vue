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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import GlistenClient from '@/components/GlistenClient.vue';
import EventEmitter from '@/microfrontends/common/event-emitter';

interface GlistenClientState {
  sheet: boolean;
  userName: string;
  customTracker: Record<string, unknown>;
  applicationId: string;
  greetings: string;
  textFieldLabel: string;
  heartColor: string;
}

const sheet = ref(false);
const userName = ref('');
const customTracker = ref<Record<string, unknown>>({});
const applicationId = ref('');
const greetings = ref('');
const textFieldLabel = ref('');
const heartColor = ref('');

function setupInitialState() {
  sheet.value = false;
  userName.value = '';
  customTracker.value = {};
  applicationId.value = '';
  greetings.value =
    "Thank you so much for taking the time to share your feedback with us! We appreciate hearing your thoughts on how we're doing, and we're excited to use your feedback to become even better.";
  textFieldLabel.value = "We're always looking to improve. Please share your feedback with us";
  heartColor.value = 'red';
}

function onCloseHandler() {
  setupInitialState();
}

function onGlistenClientStateChangedHandler(payload: GlistenClientState) {
  sheet.value = payload.sheet ?? sheet.value;
  userName.value = payload.userName ?? userName.value;
  customTracker.value = payload.customTracker ?? customTracker.value;
  applicationId.value = payload.applicationId ?? applicationId.value;
  greetings.value = payload.greetings ?? greetings.value;
  textFieldLabel.value = payload.textFieldLabel ?? textFieldLabel.value;
  heartColor.value = payload.heartColor ?? heartColor.value;
}

onMounted(() => {
  setupInitialState();
  EventEmitter.instance().on('onGlistenClientStateChanged', (payload: GlistenClientState) =>
    onGlistenClientStateChangedHandler(payload),
  );
});
</script>
