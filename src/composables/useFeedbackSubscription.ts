import type { DocumentNode } from 'graphql';
import {
  SUBCRIPTION_FEEDBACKS,
  type FeedbackQueryResult,
  type FeedbackSubcriptionResult,
  type FeedbackSubscriptionVariables,
} from '@/graphql/queries/whispQueries';
import { isWhisprSubscriptionEnabled } from '@/graphql/apollo';
import { WHISP_FEEDBACK_TYPE } from '@/types/whisps';

type SubscribeToMoreFn = (
  options: {
    document: DocumentNode;
    variables: FeedbackSubscriptionVariables;
    updateQuery: (
      previous: FeedbackQueryResult,
      options: { subscriptionData: { data: FeedbackSubcriptionResult } },
    ) => FeedbackQueryResult;
    onError?: (error: Error) => void;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

/**
 * Registers the feedback subscription when a WebSocket endpoint is configured.
 * Skips silently when only HTTP is available (subscriptions cannot run over HTTP).
 */
export function useFeedbackSubscription(
  subscribeToMore: SubscribeToMoreFn | undefined,
  updateQuery: (
    previous: FeedbackQueryResult,
    update: { subscriptionData: { data: FeedbackSubcriptionResult } },
  ) => FeedbackQueryResult,
): void {
  if (!subscribeToMore || !isWhisprSubscriptionEnabled()) {
    return;
  }

  subscribeToMore({
    document: SUBCRIPTION_FEEDBACKS,
    variables: {
      filter: {
        type: WHISP_FEEDBACK_TYPE,
      },
    },
    onError: (error) => {
      console.warn('[Glisten] Feedback subscription error:', error.message);
    },
    updateQuery,
  });
}
