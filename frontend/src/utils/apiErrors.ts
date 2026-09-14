export type ApiError = {
  message: string;
  status?: number;
};

type ErrorListener = (error: ApiError) => void;

const listeners = new Set<ErrorListener>();

// Components subscribe here so API errors can reach the UI without a browser-global event.
export const subscribeToApiErrors = (listener: ErrorListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const publishApiError = (error: ApiError) => {
  listeners.forEach((listener) => listener(error));
};
