import type { IFeedback } from './whisps';

export type ItemActionTypes = {
  text: string;
  icon: string;
  iconColor: string;
  onClickHandler: (feedback: IFeedback) => void;
}[];

export type ConfirmationDialog = {
  confirmCallback: () => void;
  title: string;
  description: string;
  visible: boolean;
};

export interface FeedbackTableHeader {
  title: string;
  key: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: string | number;
  adminPermission?: boolean;
}
