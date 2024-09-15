import axios from "axios";
import useSWR from "swr";

axios.defaults.baseURL = "http://localhost:3001"; // Replace with your server URL

export function useFetch<T = unknown>(
  url: string,
  params?: Record<string, string>,
) {
  const key = JSON.stringify({ url, params });
  return useSWR<T>(key, async () => {
    return axios.get<T>(url, { params }).then((res) => res.data);
  });
}
