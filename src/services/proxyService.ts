import apiClient from './api'; // Assuming your central API client

// Placeholder for ProxyService
// In a typical setup, the actual proxying (to avoid CORS, hide API keys) happens server-side.
// This client-side service might be used to correctly formulate requests to your own backend proxy endpoint.


const PROXY_ENDPOINT_PREFIX = '/proxy'; // Example: your backend endpoint that handles the proxying

/**
 * Fetches data from a third-party API via your backend proxy.
 * @param targetUrl The actual URL of the third-party API.
 * @param params Optional query parameters for the target URL.
 * @param options Optional request options (e.g., headers for the proxy to forward).
 */
export const fetchViaProxy = async <T,>(targetUrl: string, params?: Record<string, any>, options?: RequestInit): Promise<T> => {
  try {
    // The client sends a request to your backend's proxy endpoint,
    // passing the target URL and any necessary parameters/headers.
    const response = await apiClient().post<T>(`${PROXY_ENDPOINT_PREFIX}/request`, {
      targetUrl,
      params, // Query parameters for the targetUrl
      method: options?.method || 'GET', // Method for the targetUrl
      headers: options?.headers, // Headers for the targetUrl
      body: options?.body, // Body for the targetUrl (if POST, PUT, etc.)
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${targetUrl} via proxy:`, error);
    throw error;
  }
};

// Example usage:
// const fetchSportsData = async () => {
//   try {
//     const data = await fetchViaProxy<any>(
//       'https://api.some-sports-data.com/v1/scores',
//       { gameDate: '2023-10-26' }, // Query params for the target API
//       { headers: { 'X-Client-Proxy-Header': 'some-value' } } // Headers that might be needed by your proxy or the target API
//     );
//     
//   } catch (e) {
//     // Handle error
//   }
// };

export const proxyService = {
  fetchViaProxy,
}; 