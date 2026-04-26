import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import { ChapterListPage } from "./pages/ChapterListPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DoubtsPage } from "./pages/DoubtsPage";
import { LessonListPage } from "./pages/LessonListPage";
import { LessonPlayerPage } from "./pages/LessonPlayerPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PricingPage } from "./pages/PricingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SubjectListPage } from "./pages/SubjectListPage";
import { AnswerReviewPage } from "./pages/test/AnswerReviewPage";
import { LiveTestPage } from "./pages/test/LiveTestPage";
import { PracticeTestPage } from "./pages/test/PracticeTestPage";
import { PreTestPage } from "./pages/test/PreTestPage";
import { SubmitConfirmPage } from "./pages/test/SubmitConfirmPage";
import { TestResultsPage } from "./pages/test/TestResultsPage";
import { TestsListPage } from "./pages/test/TestsListPage";
import { useAuthStore } from "./store/authStore";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const token = useAuthStore((s) => s.token);
  return <Navigate to={token ? "/app/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          }
        />

        {/* App shell — pages with bottom nav */}
        <Route
          path="/app"
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="subjects" element={<SubjectListPage />} />
          <Route path="subjects/:id" element={<ChapterListPage />} />
          <Route path="chapters/:id" element={<LessonListPage />} />
          <Route path="lessons/:id" element={<LessonPlayerPage />} />
          <Route path="tests" element={<TestsListPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="doubts" element={<DoubtsPage />} />
        </Route>

        {/* Full-screen test flow — no bottom nav */}
        <Route
          path="/app/tests/:id"
          element={
            <AuthGuard>
              <PreTestPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/tests/:id/live"
          element={
            <AuthGuard>
              <LiveTestPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/tests/:id/submit"
          element={
            <AuthGuard>
              <SubmitConfirmPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/tests/:id/results"
          element={
            <AuthGuard>
              <TestResultsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/tests/:id/review"
          element={
            <AuthGuard>
              <AnswerReviewPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/chapters/:id/practice"
          element={
            <AuthGuard>
              <PracticeTestPage />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
