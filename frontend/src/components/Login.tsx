import React from "react";
import { Link, useLocation } from "react-router";

const AUTH_BASE_URL = "http://localhost:8081";

const Login: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const hasOauthError = searchParams.get("error") === "oauth";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
              Team Collaboration Space
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Welcome back.
            </h1>

            <p className="mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
              Sign in to manage boards, track progress, and keep your workspace
              synced in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`${AUTH_BASE_URL}/oauth2/authorization/google`}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue with Google
              </a>

              <Link
                to="/home/boards"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Explore Demo
              </Link>
            </div>

            {hasOauthError && (
              <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Sign-in failed. Please try again.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-cyan-800 p-6 text-slate-100 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Live Snapshot
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-semibold">Board Velocity</p>
                <p className="mt-1 text-2xl font-black">+24%</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-semibold">Active Members</p>
                <p className="mt-1 text-2xl font-black">18 Online</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-semibold">Sprint Health</p>
                <p className="mt-1 text-2xl font-black text-emerald-200">
                  On Track
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
