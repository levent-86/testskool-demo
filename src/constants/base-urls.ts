interface BaseURLSTypes {
  API: string;
  MEDIA: string;
}

export const BaseURLS: BaseURLSTypes = {
  API: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  MEDIA: import.meta.env.VITE_MEDIA_URL || 'http://127.0.0.1:8000/media/',
};
