import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUpdateMe } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Icons } from "../lib/icons";

const CLASSES = [7, 8, 9, 10];
const LANGUAGES = [
  { value: "english" as const, label: "English Medium", sub: "English" },
  { value: "malayalam" as const, label: "Malayalam Medium", sub: "മലയാളം" },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateMe = useUpdateMe();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? "");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "malayalam">("english");

  function handleStep0() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!selectedClass) {
      toast.error("Please select your class");
      return;
    }
    setStep(1);
  }

  function handleFinish() {
    updateMe.mutate(
      {
        name: name.trim(),
        current_class: selectedClass!,
        medium: selectedLanguage,
        onboarding_complete: true,
      },
      {
        onSuccess: () => navigate("/app/dashboard", { replace: true }),
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="bg-teal px-6 pt-14 pb-8">
        <div className="max-w-[430px] mx-auto">
          <div className="flex gap-2 mb-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  i <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            {step === 0 ? "Welcome to Edyrix" : "How do you prefer to study?"}
          </h1>
          <p className="text-white/70 text-sm font-body mt-1">
            {step === 0 ? "Tell us a bit about yourself" : "You can change this later in settings"}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-[430px] w-full mx-auto px-4 py-6 flex flex-col">
        {step === 0 && (
          <div className="flex-1 space-y-6">
            <div>
              <label className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2 block">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-12 px-4 rounded-2xl border border-ink/10 bg-white font-body text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <p className="font-body text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2">
                Your Class
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      selectedClass === cls
                        ? "border-teal bg-teal text-white"
                        : "border-ink/10 bg-white text-ink hover:border-teal/30"
                    }`}
                  >
                    <span className="font-display font-bold text-3xl">{cls}</span>
                    <span className="font-body text-[10px] mt-0.5 opacity-70">Class</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 space-y-3">
            {LANGUAGES.map(({ value, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedLanguage(value)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                  selectedLanguage === value
                    ? "border-teal bg-teal/5"
                    : "border-ink/10 bg-white"
                }`}
              >
                <div className="flex-1 text-left">
                  <p className="font-display font-bold text-ink text-base">{label}</p>
                  <p className="font-body text-sm text-ink-3 mt-0.5">{sub}</p>
                </div>
                {selectedLanguage === value && (
                  <Icon name={Icons.check} size={22} className="text-teal flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {step === 0 ? (
            <Button fullWidth size="lg" onClick={handleStep0}>
              Continue
              <Icon name={Icons.forward} size={16} className="ml-2" aria-hidden />
            </Button>
          ) : (
            <>
              <Button fullWidth size="lg" loading={updateMe.isPending} onClick={handleFinish}>
                Get Started
              </Button>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full text-ink-3 font-body text-sm py-2 hover:text-ink transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
