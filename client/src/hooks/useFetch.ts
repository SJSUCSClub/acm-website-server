import { paths } from "@/types/schema.v1";
import createFetchClient, { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { useNavigate } from "@tanstack/react-router";

const api = createFetchClient<paths>({
  baseUrl: '/api/'
});

const middleware: Middleware = {
  async onResponse({  response }) {
    console.log("API middleware response url: ", response.url, ", status: ", response.status);
    if (!response.ok) {
      if (response.status >= 500 && response.status < 600) {
        const navigate = useNavigate();
        navigate({ to: "/internalError" })
      }
    //   if (response.status === 401) {
    //     throw redirect({
    //       to: "/login"
    //     });
    //   }
    //   else if (response.status === 403) {
    //     throw redirect({
    //       to: "/login"
    //     });
    //   }
    }
    return response;
  },
  async onError({error}) {
    console.log("API middleware error: ", error);
    return;
  }
}

api.use(middleware);
const $api = createClient(api);

export const useQuery = $api.useQuery;
export const useMutation = $api.useMutation;

