import { useEffect } from "react";
import { supabase } from "../config/supabase";
import { useQueryClient } from "@tanstack/react-query";

export const useAuthSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        queryClient.invalidateQueries({ queryKey: ["session"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [queryClient]);
};
