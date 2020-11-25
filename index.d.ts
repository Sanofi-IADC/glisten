import { Subject } from 'rxjs';
import Vue from 'vue';

export interface WhisprService {
  httpURL: string;
  wsURL: string;
  getAllEvents(): Promise<any[]>;
  getOneEvent(eventId: string): Promise<any[]>;
  getFilteredEvents(event: any): Promise<any[]>;
  getFilteredEventsCount(event: any): Promise<any[]>;
  createWhisp(event: any): Promise<any[]>;
  updateEvent(id: string, event: any): Promise<any[]>;
  replaceEvent(id: string, event: any): Promise<any[]>;
  deleteEvent(id: string, event: any): Promise<any[]>;
  subscribeEvents(event: any): Subject<any>;
}
declare module '@mestrak/glisten-client' {
  export function install(): void;
  // export class Chat extends Vue { }
  // export class CommentSummaryTable extends Vue { }
  // export class AddCommentBtn extends Vue { }
}

declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $whisprApi: WhisprService
  }
}
