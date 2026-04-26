import { Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSubmitTest } from "../../hooks/useTests";
import { QuestionPalette } from "../../components/tests/QuestionPalette";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Icons } from "../../lib/icons";
import type { TestDetail } from "../../types";

interface SubmitState {
  testData: TestDetail;
  answers: Record<string, number>;
  skipped: string[];
  elapsedSeconds: number;
  timeLeft: number;
  isAutoSubmit?: boolean;
}

export function SubmitConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SubmitState | null;
  const submitMutation = useSubmitTest();

  if (!state?.testData) {
    return <Navigate to={`/app/tests/${id}`} replace />;
  }

  const { testData, answers, skipped, elapsedSeconds, timeLeft, isAutoSubmit } = state;
  const questions = testData.questions;
  const skippedSet = new Set(skipped);

  const answeredCount = Object.keys(answers).length;
  const skippedCount = skipped.length;
  const unansweredCount = questions.length - answeredCount - skippedCount;

  function handleReview(jumpIndex = 0) {
    navigate(`/app/tests/${id}/live`, {
      state: {
        testData,
        restoredAnswers: answers,
        restoredSkipped: skipped,
        restoredIndex: jumpIndex,
        restoredTimeLeft: timeLeft,
      },
      replace: true,
    });
  }

  function handleJump(index: number) {
    handleReview(index);
  }

  function handleSubmit() {
    submitMutation.mutate(
      { testId: id!, answers, time_taken_seconds: elapsedSeconds },
      {
        onSuccess: (result) => {
          navigate(`/app/tests/${id}/results`, {
            state: {
              testData,
              result,
              answers,
              skipped,
              elapsedSeconds,
            },
            replace: true,
          });
        },
        onError: () => toast.error("Submission failed. Please try again."),
      },
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-ink/5">
        {!isAutoSubmit && (
          <button
            onClick={() => handleReview(0)}
            className="p-1.5 rounded-xl hover:bg-bg"
          >
            <Icon name={Icons.back} size={20} className="text-ink" aria-hidden />
          </button>
        )}
        <h1 className="font-display font-bold text-lg text-ink">
          {isAutoSubmit ? "Time's Up!" : "Submit Test?"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isAutoSubmit && (
          <div className="bg-rose/10 border border-rose/20 rounded-2xl p-3 flex items-center gap-2">
            <Icon name={Icons.warning} size={16} className="text-rose flex-shrink-0" aria-hidden />
            <p className="font-body text-sm font-semibold text-rose">
              Time is up — your test will be submitted now.
            </p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 text-center border border-ink/5 shadow-sm">
            <p className="font-display font-bold text-teal text-2xl">{answeredCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Answered</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border border-ink/5 shadow-sm">
            <p className="font-display font-bold text-amber text-2xl">{skippedCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Skipped</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border border-ink/5 shadow-sm">
            <p className="font-display font-bold text-rose text-2xl">{unansweredCount}</p>
            <p className="font-body text-[11px] text-ink-3 mt-0.5">Unanswered</p>
          </div>
        </div>

        {/* All answered banner */}
        {unansweredCount === 0 && skippedCount === 0 ? (
          <div className="bg-forest/10 border border-forest/20 rounded-2xl p-3 flex items-center gap-2">
            <Icon name={Icons.checkCircle} size={16} className="text-forest flex-shrink-0" aria-hidden />
            <p className="font-body text-sm font-semibold text-forest">
              All questions answered — good to go!
            </p>
          </div>
        ) : unansweredCount > 0 && !isAutoSubmit ? (
          <div className="bg-amber-pale border border-amber/30 rounded-2xl p-3 flex items-start gap-2">
            <Icon name={Icons.warning} size={16} className="text-amber flex-shrink-0 mt-0.5" aria-hidden />
            <p className="font-body text-sm text-ink-2">
              You have <span className="font-semibold text-rose">{unansweredCount} unanswered</span> question
              {unansweredCount !== 1 ? "s" : ""}. Tap a bubble below to go back and attempt them.
            </p>
          </div>
        ) : null}

        {/* Question palette */}
        <div>
          <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
            Question overview
          </p>
          <div className="bg-white rounded-2xl border border-ink/5 p-4">
            <QuestionPalette
              questions={questions}
              answers={answers}
              skipped={skippedSet}
              currentIndex={-1}
              onJump={isAutoSubmit ? () => {} : handleJump}
              layout="grid"
              mode="review"
            />
          </div>
        </div>
      </div>

      {/* Sticky bottom actions */}
      <div className="bg-white border-t border-ink/5">
        <div
          className="max-w-[430px] mx-auto px-4 pt-3 flex gap-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          {!isAutoSubmit && (
            <Button variant="secondary" onClick={() => handleReview(0)} className="flex-shrink-0">
              <Icon name={Icons.back} size={16} className="mr-1" aria-hidden />
              Review
            </Button>
          )}
          <Button
            fullWidth
            variant="danger"
            size="lg"
            loading={submitMutation.isPending}
            onClick={handleSubmit}
          >
            {submitMutation.isPending ? "Submitting…" : "Submit Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}
