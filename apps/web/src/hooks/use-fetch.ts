import { useState, useCallback } from "react";
import useSWR from "swr";
import { get } from "@/lib/backend";

export function useFetch<T = unknown>(
  initialUrl: string,
  initialParams?: Record<string, string>,
  immediate = true,
) {
  const [url, setUrl] = useState(initialUrl);
  const [params, setParams] = useState(initialParams);
  const [shouldFetch, setShouldFetch] = useState(immediate);
  const [isLoading, setIsLoading] = useState(immediate);
  // refetchCount is used to force a re-fetch when the refetchCount changes
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, error } = useSWR<T>(
    shouldFetch ? [url, params, refetchCount] : null,
    async ([currentUrl, currentParams, currentRefetchCount]) => {
      setIsLoading(true);
      const response = await get(
        currentUrl,
        currentParams as Record<string, string>,
      );
      setIsLoading(false);
      return response;
    },
    {
      revalidateOnFocus: false,
    },
  );

  const refetch = useCallback(
    (newUrl?: string, newParams?: Record<string, string>) => {
      if (newUrl) setUrl(newUrl);
      if (newParams) setParams(newParams);
      setShouldFetch(true);
      setRefetchCount((prevCount) => prevCount + 1);
    },
    [],
  );

  return { data, isLoading, error, refetch };
}
