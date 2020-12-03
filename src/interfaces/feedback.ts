import { IWhisp } from './whisp';

export interface IFeedback extends IWhisp {
  data: {
    category: string;
    status: FeedbackStatus;
    feedback: string;
    rating: number;
    name: string;
    contextPage: string;
    contextPortal: string;
    notes: string;
  };
}

export enum FeedbackStatus {
  ACTION_NEEDED = 'ACTION_NEEDED',
  ACTION_DONE = 'ACTION_DONE',
  NO_ACTION_NEEDED = 'NO_ACTION_NEEDED',
}
