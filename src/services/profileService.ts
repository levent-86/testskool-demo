import api from './api';
import { ENDPOINTS } from '../constants/endpoints';
import { ContentType } from '../constants/headers';

export const submitProfileUpdate = async (formData: FormData) => {
  return await api.put(ENDPOINTS.EDIT_PROFILE, formData, {
    headers: {
      'Content-Type': ContentType.FORM_DATA
    }
  });
};
