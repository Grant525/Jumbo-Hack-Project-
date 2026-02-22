import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import { useUser } from "./useUser";

export interface LessonProgress {
  lesson_id: string;
  source_language: string;
  target_language: string;
  completed_at: string;
}

export function useLessonProgress(sourceLang: string, targetLang: string) {
  const { user } = useUser();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data, error } = await (supabase as any)
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("source_language", sourceLang)
      .eq("target_language", targetLang);

    if (error) {
      setError(error.message);
    } else {
      setCompletedLessons(new Set(data.map((r: LessonProgress) => r.lesson_id)));
    }
    setLoading(false);
  }, [user, sourceLang, targetLang]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  async function completeLesson(lessonId: string) {
    if (!user) return;

    const { error } = await (supabase as any)
      .from("user_lesson_progress")
      .upsert(
        {
          user_id: user.id,
          source_language: sourceLang,
          target_language: targetLang,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,source_language,target_language,lesson_id" }
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
