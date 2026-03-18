export const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || "8000";
export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
export const WS_URL = `ws://127.0.0.1:${BACKEND_PORT}/ws`;
