import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useUser } from "./useUser";

export interface Profile {
  user_id: string;
  username: string | null;
  source_language: string;
  target_language: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  completed_questions?: number[];
  // completed_questions?: Record<string, number[]>;
}

const DEFAULTS: Omit<Profile, "user_id"> = {
  username: null,
  source_language: "Python",
  target_language: "Rust",
  xp: 0,
  current_streak: 0,
  longest_streak: 0,
  last_completed_date: null,
  completed_questions: [],
};

export function useProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No profile yet — create one
      const fresh = { user_id: user!.id, ...DEFAULTS };
      const { data: created, error: createError } = await (supabase as any)
        .from("profiles")
        .insert(fresh)
        .select()
        .single();
      if (createError) setError(createError.message);
      else setProfile(created);
    } else if (error) {
      setError(error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }

  async function updateProfile(updates: Partial<Omit<Profile, "user_id">>) {
    if (!user || !profile) return;
    const { data, error } = await (supabase as any)
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) setError(error.message);
    else setProfile(data);
  }

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
