import { useQuery } from "@tanstack/react-query";
import { supabase } from "../config/supabase";

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });
};
