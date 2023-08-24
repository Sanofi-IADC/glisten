import eventEmitter from 'event-emitter';

declare global {
  interface Window {
    eventEmitter: eventEmitter.Emitter;
  }
}

class EventEmitter {
  static instance() {
    return window.eventEmitter;
  }
}

export default EventEmitter;
