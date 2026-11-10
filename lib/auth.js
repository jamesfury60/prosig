"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./axios";

export function useMe() {
  return useQuery({
    queryKey: ["session"],

    queryFn: async () => {
      const { data } = await api.get("/auth/session.php");
      return data;
    },

    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
