import { useState } from "react";
import { MessageCircle, MessageSquare, Send } from "lucide-react";
import { useDoubts, useSubmitDoubt } from "../hooks/useDoubts";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

export function DoubtsPage() {
  const [question, setQuestion] = useState("");
  const { data: doubts, isLoading } = useDoubts();
  const submitDoubt = useSubmitDoubt();

  function handleSubmit() {
    const text = question.trim();
    if (!text || submitDoubt.isPending) return;
    submitDoubt.mutate(
      { question_text: text },
      { onSuccess: () => setQuestion("") }
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-white border-b border-ink/5">
        <h1 className="font-display font-bold text-xl text-ink">Ask a Doubt</h1>
        <p className="font-body text-xs text-ink-3 mt-0.5">
          Our teachers answer within 24 hours
        </p>
      </div>

      {/* Submit form */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question… (e.g. What is Newton's second law?)"
            rows={4}
            className="w-full font-body text-sm text-ink placeholder:text-ink/30 resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-2 pt-2 border-t border-ink/5">
            <Button
              size="sm"
              disabled={!question.trim() || submitDoubt.isPending}
              onClick={handleSubmit}
            >
              {submitDoubt.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={13} />
                  Ask
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Doubts list */}
      <div className="px-4 space-y-3">
        <h2 className="font-display font-bold text-sm text-ink">Your Doubts</h2>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : !doubts?.length ? (
          <div className="text-center py-16">
            <MessageCircle size={40} className="text-ink/10 mx-auto mb-3" />
            <p className="font-body text-ink-3 text-sm">No doubts yet.</p>
            <p className="font-body text-ink-3 text-xs mt-1">Ask your first question above!</p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <div
              key={doubt.id}
              className="bg-white rounded-2xl border border-ink/5 shadow-sm p-4"
            >
              <div className="flex items-start gap-2">
                <MessageSquare size={14} className="text-ink-3 mt-0.5 flex-shrink-0" />
                <p className="font-body text-sm text-ink">{doubt.question_text}</p>
              </div>

              {doubt.status === "answered" && doubt.answer_text ? (
                <div className="bg-teal/5 border border-teal/10 rounded-xl p-3 mt-3">
                  <p className="font-body text-xs font-semibold text-teal mb-1">
                    Teacher's Answer
                  </p>
                  <p className="font-body text-sm text-ink leading-relaxed">
                    {doubt.answer_text}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber" />
                  <p className="font-body text-xs text-amber font-semibold">
                    Waiting for answer
                  </p>
                </div>
              )}

              <p className="font-body text-xs text-ink/30 mt-2">
                {new Date(doubt.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
