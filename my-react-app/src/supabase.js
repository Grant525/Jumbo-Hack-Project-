import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://cqkvwrslybwnmxtuxzni.supabase.co",
  "https://jumbo-hack-project.vercel.app/"
);
