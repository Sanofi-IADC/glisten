import { IWhisp } from './whisp';

export interface IFeedback extends IWhisp {
  data: {
    feedback: string;
    rating: number;
    name: string;
    contextPage: string;
    contextPortal: string;
  };
}
