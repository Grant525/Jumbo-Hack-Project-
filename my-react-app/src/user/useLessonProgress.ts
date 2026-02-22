import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import { useUser } from "./useUser";

export function useLessonProgress() {
  const { user } = useUser();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("completed_lessons")
      .select("lesson_id")
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
    } else {
      setCompletedLessons(new Set(data.map((r: any) => r.lesson_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  async function completeLesson(lessonId: string) {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("completed_lessons")
      .upsert(
        { user_id: user.id, lesson_id: lessonId },
        { onConflict: "user_id,lesson_id" }
      );
    if (error) {
      setError(error.message);
    } else {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
    }
  }

  function isCompleted(lessonId: string) {
    return completedLessons.has(lessonId);
  }

  return { completedLessons, loading, error, completeLesson, isCompleted, refetch: fetchProgress };
}
