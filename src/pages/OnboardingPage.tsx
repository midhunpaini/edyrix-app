import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useSubjects } from "../hooks/useContent";
import { useUpdateMe } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

const CLASSES = [7, 8, 9, 10];

const LANGUAGES = [
  { value: "english" as const, label: "English", sublabel: "English Medium" },
  { value: "malayalam" as const, label: "Malayalam", sublabel: "മലയാളം മീഡിയം" },
];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current ? "w-6 h-2 bg-teal" : "w-2 h-2 bg-ink/20"
          }`}
        />
      ))}
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "malayalam">("english");

  const { data: subjects, isLoading: subjectsLoading } = useSubjects(selectedClass);
  const updateMe = useUpdateMe();

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    if (step === 0 && !selectedClass) {
      toast.error("Please select your class");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (!selectedClass) return;
    updateMe.mutate(
      { current_class: selectedClass, medium: selectedLanguage },
      {
        onSuccess: () => navigate("/app/dashboard", { replace: true }),
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="bg-teal px-6 pt-14 pb-8">
        <div className="max-w-[430px] mx-auto">
          <h1 className="font-display font-bold text-2xl text-white">
            {step === 0 && "Select your class"}
            {step === 1 && "Your subjects"}
            {step === 2 && "Study language"}
          </h1>
          <p className="text-white/70 text-sm font-body mt-1">
            {step === 0 && "We'll personalise your experience"}
            {step === 1 && "Class " + selectedClass + " subjects"}
            {step === 2 && "How would you like to study?"}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-[430px] w-full mx-auto px-4 py-6 flex flex-col">
        {/* Step dots */}
        <StepDots current={step} total={3} />

        <div className="flex-1 mt-6 min-h-0 overflow-y-auto">
          {/* Step 0: Class selector */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    selectedClass === cls
                      ? "border-teal bg-teal text-white"
                      : "border-ink/10 bg-white text-ink hover:border-teal/30"
                  }`}
                >
                  <span className="font-display font-bold text-4xl">
                    {cls}
                  </span>
                  <span className="font-body text-sm mt-1 opacity-80">Class {cls}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Subject picker */}
          {step === 1 && (
            <div>
              {subjectsLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(subjects ?? []).map((subject) => {
                    const selected = selectedSubjects.has(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? "border-teal bg-teal/5"
                            : "border-ink/10 bg-white"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: subject.color + "20" }}
                        >
                          {subject.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-body font-semibold text-ink text-sm">{subject.name}</p>
                          <p className="font-body text-xs text-ink-3">{subject.name_ml}</p>
                        </div>
                        {selected && <CheckCircle2 size={20} className="text-teal flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {subjects?.length === 0 && (
                    <p className="text-ink-3 font-body text-sm text-center py-8">
                      No subjects found for Class {selectedClass}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Language */}
          {step === 2 && (
            <div className="space-y-3">
              {LANGUAGES.map(({ value, label, sublabel }) => (
                <button
                  key={value}
                  onClick={() => setSelectedLanguage(value)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    selectedLanguage === value
                      ? "border-teal bg-teal/5"
                      : "border-ink/10 bg-white"
                  }`}
                >
                  <div className="flex-1 text-left">
                    <p className="font-display font-bold text-ink text-base">{label}</p>
                    <p className="font-body text-sm text-ink-3 mt-0.5">{sublabel}</p>
                  </div>
                  {selectedLanguage === value && (
                    <CheckCircle2 size={22} className="text-teal flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            fullWidth
            size="lg"
            loading={updateMe.isPending}
            onClick={handleNext}
          >
            {step < 2 ? "Continue" : "Get Started"}
          </Button>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full text-ink-3 font-body text-sm py-2 hover:text-ink transition-colors"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
