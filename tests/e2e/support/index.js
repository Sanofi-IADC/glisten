import './commands';
import { installGraphQLMock, resetGraphQLMockState } from './graphql-mock';

beforeEach(() => {
  resetGraphQLMockState();
  installGraphQLMock();
});

// Prevent graphql-ws from opening real WebSocket connections during e2e runs.
Cypress.on('window:before:load', (win) => {
  class MockWebSocket {
    constructor() {
      this.readyState = 0;
      setTimeout(() => {
        this.readyState = 1;
        this.onopen?.({ type: 'open' });
      }, 0);
    }

    send() {}

    close() {}
  }

  win.WebSocket = MockWebSocket;
});

Cypress.on('uncaught:exception', (err) => {
  const message = err.message ?? '';
  const ignoredPatterns = [
    /WebSocket/i,
    /subscription/i,
    /NetworkError/i,
    /Failed to fetch/i,
    /Load failed/i,
  ];

  if (ignoredPatterns.some((pattern) => pattern.test(message))) {
    return false;
  }

  return true;
});
