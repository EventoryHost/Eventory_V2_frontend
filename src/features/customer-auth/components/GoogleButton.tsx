import GoogleIcon from "./GoogleIcon";

export default function GoogleButton({
  onClick,
  loading,
  variant = "primary",
}: {
  onClick: () => void;
  loading: boolean;
  /** "primary" = modal's leading action. "secondary" = full-page's supporting action below OTP flow. */
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-3 rounded-xl border border-black/15 bg-white font-figtree font-semibold text-brand-950 transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary" ? "py-3 text-[15px]" : "py-2.5 text-[14px]"
      }`}
    >
      <GoogleIcon className="h-5 w-5" />
      Continue with Google
    </button>
  );
}
