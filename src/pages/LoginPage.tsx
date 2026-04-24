import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ConfirmationResult } from "firebase/auth";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../lib/firebase";
import { useGoogleLogin, usePhoneVerifyOTP } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Phone } from "lucide-react";
import type { User } from "../types";

function OTPInput({ onComplete }: { onComplete: (otp: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[index] = val.slice(-1);
    setDigits(next);
    if (val && index < 5) inputs.current[index + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      inputs.current[5]?.focus();
      onComplete(pasted);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-12 text-center text-lg font-display font-bold text-ink border-2 border-ink/15 rounded-xl focus:border-teal focus:outline-none transition-colors bg-bg"
        />
      ))}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"google" | "phone">("google");
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [sending, setSending] = useState(false);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const googleLogin = useGoogleLogin();
  const phoneVerify = usePhoneVerifyOTP();

  const afterLogin = (user: User) => {
    if (user.current_class === null) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/app/dashboard", { replace: true });
    }
  };

  const handleGoogle = () => {
    googleLogin.mutate(undefined, {
      onSuccess: (data) => afterLogin(data.user),
      onError: () => toast.error("Google sign-in failed. Try again."),
    });
  };

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setSending(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const result = await signInWithPhoneNumber(auth, "+91" + digits, recaptchaRef.current);
      setConfirmation(result);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/too-many-requests") {
        toast.error("Too many attempts. Try again later.");
      } else if (code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number.");
      } else {
        toast.error("Failed to send OTP. Check your number.");
      }
      recaptchaRef.current = null;
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = (otp: string) => {
    if (!confirmation) return;
    phoneVerify.mutate(
      { confirmation, otp },
      {
        onSuccess: (data) => afterLogin(data.user),
        onError: () => toast.error("Invalid OTP. Please try again."),
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal to-teal-dark px-6 pt-16 pb-16 flex-shrink-0">
        <div className="max-w-[430px] mx-auto">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <span className="font-display font-black text-white text-2xl">E</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">Edyrix</h1>
          <p className="text-white/70 font-body text-sm mt-1">
            Kerala SCERT · Smart Study for Class 7–10
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col max-w-[430px] w-full mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-lg border border-ink/5 p-6">
          {/* Tabs */}
          <div className="flex bg-bg rounded-xl p-1 mb-6">
            {(["google", "phone"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setConfirmation(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all ${
                  tab === t ? "bg-white text-teal shadow-sm" : "text-ink-3"
                }`}
              >
                {t === "google" ? "Google" : "Phone OTP"}
              </button>
            ))}
          </div>

          {tab === "google" ? (
            <div>
              <p className="text-sm text-ink-3 font-body mb-5 text-center">
                Sign in with your Google account in one tap
              </p>
              <Button
                fullWidth
                variant="secondary"
                size="lg"
                loading={googleLogin.isPending}
                onClick={handleGoogle}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5 mr-2"
                  alt=""
                />
                Continue with Google
              </Button>
            </div>
          ) : (
            <div>
              {!confirmation ? (
                <div>
                  <p className="text-sm text-ink-3 font-body mb-4 text-center">
                    We&apos;ll send a 6-digit OTP to your mobile
                  </p>
                  <div className="flex gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-bg rounded-xl px-3 h-11 border border-ink/10 flex-shrink-0">
                      <span className="text-base">🇮🇳</span>
                      <span className="text-sm font-body font-semibold text-ink">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="flex-1 h-11 bg-bg rounded-xl border border-ink/10 px-3 font-body text-sm text-ink focus:border-teal focus:outline-none transition-colors"
                    />
                  </div>
                  <Button fullWidth size="lg" loading={sending} onClick={handleSendOTP}>
                    <Phone size={16} className="mr-2" />
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setConfirmation(null)}
                    className="flex items-center gap-1 text-sm text-ink-3 font-body mb-4 hover:text-ink transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Change number
                  </button>
                  <p className="text-sm text-ink-3 font-body mb-1 text-center">
                    Enter the 6-digit OTP sent to
                  </p>
                  <p className="text-sm font-body font-semibold text-ink text-center mb-5">
                    +91 {phone}
                  </p>
                  <OTPInput onComplete={handleVerifyOTP} />
                  {phoneVerify.isPending && (
                    <p className="text-xs text-ink-3 font-body text-center mt-3 animate-pulse">
                      Verifying…
                    </p>
                  )}
                  {phoneVerify.isError && (
                    <p className="text-xs text-rose font-body text-center mt-3">
                      Invalid OTP — please try again
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-ink-3 font-body text-center mt-5 px-4">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
