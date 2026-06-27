const sanitizeRouteId = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? encodeURIComponent(trimmed) : null;
};

const normalizeInternalPath = (path) => path.replace(/\/+/g, '/');

export const buildTestSeriesTestsPath = (seriesId) => {
  const safeSeriesId = sanitizeRouteId(seriesId);
  if (!safeSeriesId) {
    return null;
  }

  return normalizeInternalPath(`/test-series/${safeSeriesId}/tests`);
};

export const buildTestResultPath = (attemptId) => {
  const safeAttemptId = sanitizeRouteId(attemptId);
  if (!safeAttemptId) {
    return null;
  }

  return normalizeInternalPath(`/test-result/${safeAttemptId}`);
};

export const buildTestAttemptPath = ({ testId, seriesId }) => {
  const safeTestId = sanitizeRouteId(testId);
  if (!safeTestId) {
    return null;
  }

  const params = new URLSearchParams({ testId: decodeURIComponent(safeTestId) });
  const safeSeriesId = sanitizeRouteId(seriesId);

  if (safeSeriesId) {
    params.set('seriesId', decodeURIComponent(safeSeriesId));
  }

  return `/test-attempt?${params.toString()}`;
};

export const buildTestRankingPath = ({ testId, seriesId }) => {
  const safeTestId = sanitizeRouteId(testId);
  if (!safeTestId) {
    return null;
  }

  const safeSeriesId = sanitizeRouteId(seriesId);
  if (!safeSeriesId) {
    return normalizeInternalPath(`/test-ranking/${safeTestId}`);
  }

  const params = new URLSearchParams({ seriesId: decodeURIComponent(safeSeriesId) });
  return `/test-ranking/${safeTestId}?${params.toString()}`;
};

export const resolveSeriesId = (value) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    return (
      value.seriesId
      || value.testSeriesId
      || value.test?.testSeriesId
      || value.test?.series?.id
      || null
    );
  }

  return null;
};