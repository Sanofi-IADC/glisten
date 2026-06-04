import feedbacksFixture from '../fixtures/feedbacks.json';

/** @type {typeof feedbacksFixture} */
let feedbackStore = [];

/** @type {{ succeed: boolean }} */
let mutationOptions = { succeed: true };

function cloneFeedbacks() {
  return structuredClone(feedbackStore);
}

function resetFeedbacks(overrides) {
  feedbackStore = structuredClone(overrides ?? feedbacksFixture);
}

function resetMutationOptions(options = {}) {
  mutationOptions = { succeed: true, ...options };
}

function getOperationName(body) {
  if (body?.operationName) {
    return body.operationName;
  }

  const query = body?.query ?? '';
  const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  if (match?.[1]) {
    return match[1];
  }

  if (query.includes('createWhisp')) {
    return 'createWhisp';
  }
  if (query.includes('updateWhisp')) {
    return 'updateWhisp';
  }
  if (query.includes('deleteWhisp')) {
    return 'DeleteWhisp';
  }
  if (query.includes('feedbacks')) {
    return 'feedbacks';
  }

  return '';
}

function filterFeedbacksByVariables(feedbacks, variables) {
  const filter = variables?.filter ?? {};
  let result = feedbacks;

  const applicationFilter = filter.applicationID?.$in;
  if (Array.isArray(applicationFilter) && applicationFilter.length > 0) {
    result = result.filter((entry) => applicationFilter.includes(entry.applicationID));
  }

  const timestampFilter = filter.timestamp;
  if (timestampFilter?.$gte && timestampFilter?.$lte) {
    const start = new Date(timestampFilter.$gte).getTime();
    const end = new Date(timestampFilter.$lte).getTime();
    result = result.filter((entry) => {
      const ts = new Date(entry.timestamp).getTime();
      return ts >= start && ts <= end;
    });
  }

  return result;
}

function handleGraphQLRequest(req) {
  const operationName = getOperationName(req.body);

  switch (operationName) {
    case 'feedbacks':
      req.reply({
        statusCode: 200,
        body: {
          data: {
            feedbacks: filterFeedbacksByVariables(cloneFeedbacks(), req.body.variables),
          },
        },
      });
      return;

    case 'createWhisp': {
      if (!mutationOptions.succeed) {
        req.reply({
          statusCode: 200,
          body: {
            errors: [{ message: 'Failed to create whisp' }],
          },
        });
        return;
      }

      const whisp = req.body.variables?.whisp ?? {};
      const created = {
        _id: `fb-created-${Date.now()}`,
        readableID: 'R999',
        type: whisp.type ?? 'GLISTEN',
        severity: 1,
        description: whisp.description ?? '',
        closed: false,
        applicationID: whisp.applicationID ?? 'GLISTEN',
        plantID: null,
        locationID: null,
        manual: false,
        openedBy: whisp.openedBy ?? '',
        closedBy: null,
        timestamp: new Date().toISOString(),
        updated: new Date().toISOString(),
        data: whisp.data,
        __typename: 'Whisp',
      };

      feedbackStore = [created, ...feedbackStore];

      req.reply({
        statusCode: 200,
        body: {
          data: {
            createWhisp: {
              _id: created._id,
              openedBy: created.openedBy,
              timestamp: created.timestamp,
              data: created.data,
            },
          },
        },
      });
      return;
    }

    case 'updateWhisp': {
      const { id, whisp } = req.body.variables ?? {};
      feedbackStore = feedbackStore.map((entry) =>
        entry._id === id
          ? {
              ...entry,
              ...whisp,
              data: { ...entry.data, ...whisp.data },
              updated: new Date().toISOString(),
            }
          : entry,
      );

      const updated = feedbackStore.find((entry) => entry._id === id);
      req.reply({
        statusCode: 200,
        body: {
          data: {
            updateWhisp: updated,
          },
        },
      });
      return;
    }

    case 'DeleteWhisp': {
      const { id } = req.body.variables ?? {};
      feedbackStore = feedbackStore.filter((entry) => entry._id !== id);
      req.reply({
        statusCode: 200,
        body: {
          data: {
            deleteWhisp: true,
          },
        },
      });
      return;
    }

    default:
      req.reply({
        statusCode: 200,
        body: {
          data: {},
        },
      });
  }
}

function installGraphQLMock() {
  cy.intercept('POST', '**/graphql', handleGraphQLRequest).as('gqlFeedbacks');
}

function resetGraphQLMockState(overrides) {
  resetFeedbacks(overrides?.feedbacks);
  resetMutationOptions(overrides?.mutations);
}

export { installGraphQLMock, resetGraphQLMockState, resetFeedbacks, resetMutationOptions };
