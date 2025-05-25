import type { Database } from "~/types/supabase";

export const useTypedSupabaseClient = () => {
  return useSupabaseClient<Database>();
};

export const useTypedSupabaseUser = () => {
  return useSupabaseUser();
};
