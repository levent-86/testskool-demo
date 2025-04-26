/* Create axios instance */

import axios, { AxiosInstance } from 'axios';
import { ContentType } from '../constants/headers';
import { BaseURLS } from '../constants/base-urls';

const api: AxiosInstance = axios.create({
  baseURL: BaseURLS.API,
  headers: {
    'Content-Type': ContentType.JSON,
  },
});

export default api;
