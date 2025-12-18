export type TestRow = {
  id: string;
  title: string;
  description: string | null;
  time_limit_seconds: number;
  max_attempts: number;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type QuestionRow = {
  id: string;
  test_id: string;
  prompt: string;
  position: number;
};

export type OptionRow = {
  id: string;
  question_id: string;
  text: string;
  position: number;
};

export type AttemptRow = {
  id: string;
  student_id: string;
  test_id: string;
  status: "in_progress" | "submitted" | "expired";
  started_at: string;
  finished_at: string | null;
  score: number | null;
  answers: Record<string, string>;
};
