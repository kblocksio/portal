import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";

axios.defaults.baseURL = "http://localhost:3001"; // Replace with your server URL

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useFetch<T = unknown>(
  url: string,
  options?: AxiosRequestConfig,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!url) return; // Ensure the URL is valid before making a request

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<T>(url, options); // Make request using axios
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); // Re-fetch if URL or options change

  return { data, error, loading };
}
