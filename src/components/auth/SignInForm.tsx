import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  EyeCloseIcon,
  EyeIcon,
  EnvelopeIcon,
  LockIcon,
  ErrorIcon,
  CheckCircleIcon,
} from "../../icons";
import { validateAdminCredential } from "../../services/authService";

export default function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as any)?.from?.pathname || "/";

  // Check if redirected because of 2-hour session timeout
  const searchParams = new URLSearchParams(location.search);
  const isSessionExpired = searchParams.get("expired") === "true" || Boolean((location.state as any)?.sessionExpired);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<boolean>(isSessionExpired);

  // Form State
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSessionExpiredNotice(false);

    const trimmedUser = emailOrUsername.trim();
    if (!trimmedUser) {
      setErrorMessage("Please enter your admin email or username.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const result: any = await validateAdminCredential(trimmedUser, password);

      if (result.success) {
        setSuccessMessage(result.message || "Authentication successful! Redirecting...");
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 500);
      } else {
        setErrorMessage(
          result.error || result.message || "Invalid administrator credentials. Please try again."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Unable to connect to authentication server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[370px] mx-auto">
      {/* Top Header: Back to Website */}
      <div className="flex justify-end mb-3">
        <a
          href="https://captiq.ignitolearn.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <span className="text-sm leading-none">&larr;</span> Back to Website
        </a>
      </div>

      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#111827] tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to your Admin Panel
        </p>
      </div>

      {/* Session Expired Alert */}
      {sessionExpiredNotice && !errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs animate-fadeIn"
        >
          <svg
            className="size-4 shrink-0 text-amber-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 font-normal leading-relaxed">
            Your admin session has expired after 2 hours. For security, please sign in again.
          </div>
          <button
            type="button"
            onClick={() => setSessionExpiredNotice(false)}
            className="text-amber-400 hover:text-amber-600 ml-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-fadeIn"
        >
          <ErrorIcon className="size-4 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1 font-normal leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 ml-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs animate-fadeIn"
        >
          <CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Email Address */}
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-semibold text-gray-700 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <EnvelopeIcon className="size-4" />
            </div>
            <input
              id="admin-email"
              type="text"
              autoComplete="username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D64F2]/20 focus:border-[#1D64F2] transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <LockIcon className="size-4" />
            </div>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full h-10.5 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D64F2]/20 focus:border-[#1D64F2] transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer z-10"
            >
              {showPassword ? (
                <EyeIcon className="size-5 fill-current" />
              ) : (
                <EyeCloseIcon className="size-5 fill-current" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="size-4 rounded border-gray-300 text-[#1D64F2] focus:ring-[#1D64F2] cursor-pointer"
            />
            <span className="text-xs text-gray-600">Remember me</span>
          </label>

          <button
            type="button"
            onClick={() =>
              alert("Please contact the Super Administrator to reset your admin credentials.")
            }
            className="text-xs font-medium text-[#1D64F2] hover:text-[#1746B0] transition-colors cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10.5 bg-[#1D64F2] hover:bg-[#1855D1] active:bg-[#1447B3] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#1D64F2]/25 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  className="size-4 ml-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Support Footer */}
      <p className="text-center text-xs text-gray-500 mt-5">
        Need help?{" "}
        <a
          href="mailto:support@ignitoverse.com"
          className="font-semibold text-[#1D64F2] hover:underline"
        >
          Contact Support
        </a>
      </p>
    </div>
  );
}
