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

// interface UseFetchResult<T> {
//   data: T | null;
//   error: Error | undefined;
//   loading: boolean;
// }

// export function useFetch<T = unknown>(
//   url: string,
//   options?: AxiosRequestConfig,
// ): UseFetchResult<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [error, setError] = useState<Error | undefined>();
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     if (!url) return; // Ensure the URL is valid before making a request

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get<T>(url, options); // Make request using axios
//         setData(response.data);
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error("An error occurred"));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [url]); // Re-fetch if URL or options change

//   return { data, error, loading };
// }
