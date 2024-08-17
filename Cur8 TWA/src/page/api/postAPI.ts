import { URL } from '../setup/config';

interface Post {
  title: string;
  description: string;
  tag: string;
  dateTime: string;
  userId: number | null;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function apiCall<T>(endpoint: string, method: string, data?: string): Promise<ApiResponse<T>> {
  const headers = {
    "accept": "application/json",
    "authorization": "Bearer my-secret",
    "Content-Type": "application/json"
  };

  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const responseData: T = await response.json();
    return { data: responseData };
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('API call error:', errorMessage);
    return { data: {} as T, error: errorMessage };
  }
}

// API methods
export const postAPI = {
  submit: async (post: Post): Promise<ApiResponse<string>> => {
    return apiCall('/post', 'POST', JSON.stringify(post));
  },

  searchCommunity: async (communityId: string): Promise<ApiResponse<Array<{ id: string, name: string }>>> => {
    return apiCall('/community', 'POST', JSON.stringify({ community: communityId }));
  },

  uploadImage: async (userId: number, imageBase64: string): Promise<ApiResponse<string>> => {
    return apiCall('/image', 'POST', JSON.stringify({ userId, image: imageBase64 }));
  }
};
