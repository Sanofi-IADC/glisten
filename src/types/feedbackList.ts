import { DataTableHeader } from 'vuetify';
import { IFeedback } from './whisps';

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
}
