const getApiBaseUrl = () => {
  // If we're on localhost, use the local bridge
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // In production, the API is hosted on the same domain under /api
  return window.location.origin + '/api';
};

export const API_BASE_URL = getApiBaseUrl();
