import createFetchClient from 'openapi-fetch';
import { paths } from '@/types/schema.v1';

export const api = createFetchClient<paths>({
  baseUrl: '/api/',
  credentials: 'include',
});
