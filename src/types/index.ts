export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "student";
  current_class: number | null;
  medium: "english" | "malayalam";
  free_trial_expires_at: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  name_ml: string;
  slug: string;
  icon: string;
  color: string;
  chapter_count: number;
  monthly_price_paise: number;
  has_access: boolean;
  watch_percentage: number;
}

export interface ChapterSummary {
  id: string;
  chapter_number: number;
  title: string;
  title_ml: string;
  lesson_count: number;
  has_test: boolean;
  watch_percentage: number;
  is_completed: boolean;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  lessons: LessonSummary[];
  has_notes: boolean;
  test_id: string | null;
}

export interface LessonSummary {
  id: string;
  title: string;
  duration_seconds: number | null;
  is_free: boolean;
  is_locked: boolean;
  thumbnail_url: string | null;
  watch_percentage: number;
  is_completed: boolean;
  test: LessonTestSummary | null;
}

export interface LessonTestSummary {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
  is_unlocked: boolean;
  unlock_reason: "complete_lesson" | "subscription_required" | null;
  last_attempt: LastAttempt | null;
}

export interface LessonPlay {
  youtube_video_id: string;
  title: string;
  duration_seconds: number | null;
  watch_percentage: number;
  resume_at_seconds: number;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  plan_type: "single_subject" | "bundle" | "complete" | "seasonal" | "full_access" | "lifetime";
  billing_cycle: "monthly" | "quarterly" | "yearly" | "one_time";
  price_paise: number;
  original_price_paise: number | null;
  is_featured: boolean;
  features: string[];
  description: string | null;
}

export interface Subscription {
  id: string;
  plan: Plan;
  status: "active" | "expired" | "cancelled";
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
}

export interface SubscriptionStatus {
  subscription: Subscription | null;
  free_trial: {
    active: boolean;
    expires_at: string | null;
  };
}

export interface TestQuestion {
  id: string;
  text: string;
  text_ml: string;
  options: string[];
  marks: number;
}

export interface TestSummary {
  id: string;
  title: string;
  subject_id: string | null;
  subject_name: string | null;
  chapter_id: string;
  chapter_number: number | null;
  chapter_title: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
  is_unlocked: boolean;
  unlock_reason: "complete_lesson" | "subscription_required" | null;
  last_attempt: LastAttempt | null;
}

export interface LastAttempt {
  score: number;
  total_marks: number | null;
  percentage: number;
  completed_at: string;
}

export interface AvailableTest {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  lesson_id: string;
  lesson_title: string;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
  is_unlocked: boolean;
  unlock_reason: "complete_lesson" | "subscription_required" | null;
  last_attempt: LastAttempt | null;
}

export interface TestDetail {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  lesson_id: string;
  lesson_title: string;
  duration_minutes: number;
  total_marks: number;
  questions: TestQuestion[];
}

export interface TestResult {
  score: number;
  total_marks: number;
  percentage: number;
  results: {
    question_id: string;
    your_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

export interface Doubt {
  id: string;
  question_text: string;
  status: "pending" | "answered";
  answer_text: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface WatchProgress {
  lesson_id: string;
  watch_percentage: number;
  is_completed: boolean;
}

export interface SubjectDetail extends Subject {
  chapters: ChapterSummary[];
}

export interface ClassSummary {
  class_number: number;
  label: string;
  subject_count: number;
}

export interface UserStats {
  videos_completed: number;
  tests_taken: number;
  avg_test_score: number;
  streak_days: number;
  subjects_active: string[];
}
