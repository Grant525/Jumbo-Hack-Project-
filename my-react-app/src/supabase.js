import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://cqkvwrslybwnmxtuxzni.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3Z3cnNseWJ3bm14dHV4em5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTEyNDksImV4cCI6MjA4NzI2NzI0OX0.Cz9yuEMENywXWUvqrW26LcR7W1fmsOpp2_iqB5FBsNo"
);
