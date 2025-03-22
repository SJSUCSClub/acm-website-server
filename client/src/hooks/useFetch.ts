import { paths } from '@/types/schema.v1';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

export const api = createFetchClient<paths>({
  baseUrl: '/api/',
  credentials: 'include',
});

const $api = createClient(api);

export const useQuery = $api.useQuery;
export const useMutation = $api.useMutation;
