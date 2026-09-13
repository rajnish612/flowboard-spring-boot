import React from "react";
import { useLocation, useNavigate } from "react-router";
import { axiosIns } from "../utils/axiosInstance";
const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = React.useState<boolean>(true);
  const navigate = useNavigate();
  const hasOauthError = searchParams.get("error") === "oauth";
  React.useEffect(() => {
    // Checking whether the user is already logged in or not
    axiosIns
      .get("/api/auth/profile")
      .then((res) => {
        if (res.data) {
          navigate("/dashboard", { replace: true });
        }
      })
      .catch((err) => {
        console.log(
          "err in check logged in or not in Login component: /api/profile",
          err.message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-b-indigo-600" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-24 h-120 w-120 rounded-full bg-cyan-100/70 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between bg-linear-to-br from-indigo-700 via-indigo-600 to-cyan-600 p-10 text-white lg:flex xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7.5A2.5 2.5 0 016.5 5h3l1.6 2h6.4A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-wide">Flowboard</span>
            </div>

            <h1 className="mt-24 max-w-md text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
              Make progress visible.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-indigo-100">
              Bring your team, boards, and daily momentum into one calm workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Your workspace is ready when you are.
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
          <div className="mb-12 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7.5A2.5 2.5 0 016.5 5h3l1.6 2h6.4A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-wide text-slate-800">Flowboard</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Welcome back</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Sign in to continue.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Access your workspaces and pick up where your team left off.
            </p>

            <a
              href={`${AUTH_BASE_URL}/oauth2/authorization/google`}
              className="mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v4.1h5.8c-.25 1.32-1.78 3.87-5.8 3.87A6.17 6.17 0 015.83 12 6.17 6.17 0 0112 5.83c2.29 0 3.83.98 4.71 1.8l3.16-3.08C17.84 2.63 15.13 1.5 12 1.5A10.5 10.5 0 1022.5 12c0-.7-.08-1.23-.18-1.8H12z" />
              </svg>
              Continue with Google
            </a>

            {hasOauthError && (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                Sign-in failed. Please try again.
              </p>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Secure sign-in powered by Google OAuth.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
