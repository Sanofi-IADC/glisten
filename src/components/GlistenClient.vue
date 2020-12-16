<template>
  <div class="text-center">
    <v-bottom-sheet v-model="show" inset>
      <v-sheet class="text-center sheet--feedback">
        <v-container fluid>
          <div class="title py-3">
            Thanks for letting us know how do you like this and sending your feedback to further
            improve.
          </div>

          <v-rating
            v-model="glistenWhisp.data.rating"
            color="red"
            background-color="grey darken-1"
            half-increments
            hover
            clearable
            x-large
            empty-icon="mdi-heart-outline"
            full-icon="mdi-heart"
            half-icon="mdi-heart-half-full"
          ></v-rating>

          <v-select
            v-if="customTracker && customTracker.categories"
            :items="customTracker.categories"
            label="Choose category"
            outlined
            v-model="glistenWhisp.data.category"
          ></v-select>

          <v-textarea
            v-model="glistenWhisp.data.feedback"
            outlined
            name="input-7-4"
            label="Leave us a comment"
            rows="4"
          ></v-textarea>
          <v-row no-gutters row wrap>
            <v-col xs12 sm6 md4>
              <v-switch
                v-model="glistenWhisp.data.anonymous"
                class="my-0 py-0 px-1"
                label="Make my feedback anonymous"
              ></v-switch>
              <v-switch
                v-model="actionRequired"
                class="my-0 py-0 px-1"
                label="Action expected"
              ></v-switch>
            </v-col>

            <v-col xs12 sm6 md4>
              <v-text-field
                v-if="glistenWhisp.data.anonymous === false"
                v-model="glistenWhisp.data.name"
                outlined
                label="Your name"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-btn color="primary" :disabled="!glistenWhisp.data.feedback" @click="submitFeedback"
            >Submit feedback</v-btn
          >
        </v-container>
      </v-sheet>
    </v-bottom-sheet>

    <v-snackbar v-model="snackbar" :timeout="timeout" :color="color" outlined class="pa-10">
      <p>{{ text }}</p>
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { WhispService } from '../services/whisp.service';
import { Component, Prop, Inject, Provide, Vue, Watch } from 'vue-property-decorator';
import { IFeedback, FeedbackStatus } from '@/interfaces/feedback';
import { CREATE_WHISP } from '@/graphql/queries/whispQueries';

@Component({})
export default class GlistenClient extends Vue {
  @Prop()
  public sheet!: boolean;

  @Prop()
  public userName!: string;

  @Prop()
  public customTracker!: any;

  @Prop()
  public applicationId!: string;

  get show() {
    return this.sheet;
  }

  set show(val) {
    this.$emit('close', val);
  }

  private actionRequired = false;
  private snackbar = false;
  private timeout = 3000;
  private text = '';
  private color = 'success';

  private glistenWhisp = {
    type: 'GLISTEN',
    applicationID: this.applicationId,
    openedBy: '',
    description: '',
    data: {
      status: FeedbackStatus.NO_ACTION_NEEDED, // OPENED | CLOSED | NONE
      anonymous: false,
      feedback: null,
      rating: 4.5,
      name: '',
      commentSentimentScore: 0,
      category: null,
    },
    timestamp: '',
  };

  @Watch('glistenWhisp.data.anonymous', { immediate: true })
  private onAnonymousChanged(val: boolean, oldVal: boolean) {
    this.glistenWhisp.data.name = val ? '' : this.userName;
  }

  @Watch('actionRequired', { immediate: true })
  private onActionChanged(val: boolean, oldVal: boolean) {
    this.glistenWhisp.data.status = val
      ? FeedbackStatus.ACTION_NEEDED
      : FeedbackStatus.NO_ACTION_NEEDED;
  }

  private calculateSentiment(comment: string): number {
    const sentiment = require('wink-sentiment');
    const sentimentResult = sentiment(comment);
    return sentimentResult.normalizedScore;
  }

  private truncateDescription(str: string) {
    const n = 200;
    if (str.length <= n) {
      return str;
    }
    const subString = str.substr(0, n - 1); // the original check
    return subString.substr(0, subString.lastIndexOf(' ')) + '...';
  }

  private async submitFeedback() {
    this.glistenWhisp.data.commentSentimentScore = this.calculateSentiment(
      this.glistenWhisp.data.feedback!,
    );
    this.glistenWhisp.openedBy = this.glistenWhisp.data.name;
    const timestamp = new Date(Date.now());
    this.glistenWhisp.timestamp = timestamp.toISOString();
    this.glistenWhisp.description = this.truncateDescription(this.glistenWhisp.data.feedback!);
    this.glistenWhisp.data = { ...this.glistenWhisp.data, ...this.customTracker };

    this.$apollo
      .mutate({
        mutation: CREATE_WHISP,
        variables: { whisp: this.glistenWhisp },
      })
      .then((res) => {
        if (res.data) {
          const name = this.glistenWhisp.openedBy ? this.glistenWhisp.openedBy : '';
          this.text = `Thanks for your feedback ${name} !`;
          this.color = 'success';
          this.snackbar = true;
        } else {
          this.text = `An error occured`;
          this.color = 'error';
          this.snackbar = true;
        }
      });

    this.$emit('close', this.glistenWhisp);
  }
}
</script>

<style lang="scss" scoped>
.sheet--feedback {
  border-radius: 15px 15px 0px 0px;
}
</style>
