import React, { useState } from "react";
import API, { setToken } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/api/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Section: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-surface-light dark:bg-background-dark">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">local_library</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Librarizz</h2>
        </div>

        {/* Segmented Control (Login / Register Toggle) */}
        <div className="mb-8 w-full max-w-md">
          <div className="flex h-12 w-full items-center justify-center rounded-xl bg-background-light dark:bg-surface-dark p-1 border border-border-light dark:border-border-dark">
            <div className="group relative flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg bg-white dark:bg-background-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10 px-4 text-sm font-semibold transition-all">
              <span className="truncate">Sign In</span>
            </div>
            <Link
              to="/register"
              className="group flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all hover:text-text-main-light dark:hover:text-white text-text-sub-light dark:text-text-sub-dark"
            >
              <span className="truncate">Register</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-md w-full">
          {/* Headings */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-text-main-light dark:text-white sm:text-4xl">
              Welcome Back 👋
            </h1>
            <p className="text-base font-normal text-text-sub-light dark:text-text-sub-dark">
              Login to your account and continue exploring.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="you@library.os"
                    type="email"
                    id="email"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light hover:text-text-main-light dark:hover:text-white transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark dark:bg-surface-dark"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm font-medium leading-none text-text-main-light dark:text-text-main-dark cursor-pointer" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <a className="text-sm font-semibold text-primary hover:underline hover:text-primary-hover" href="#">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-sm">
            <p className="text-text-sub-light dark:text-text-sub-dark">
              Don't have an account?{" "}
              <Link className="font-bold text-primary hover:underline" to="/register">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Visual / Hero */}
      <div className="relative hidden w-full lg:block lg:w-1/2">
        {/* Background Image */}
        <img
          alt="Modern bright library interior with bookshelves"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByQUUB6wGlhXluObx66gmVOirVDB7Pr7r5dF1vp6_zrETur6nKVvNM6MbWne-p-LQfmPm8kJH75ar2zeAWB_XMbS8jVImFpXx4de9YPjzn53hBKi7aYHBpYKzTndd6JLIkQl88kZCvmo71ROJMHba0116JqU9DLu5dKgdnzmWqLVDu0UR6PELcoof-rJCdQX60gfgD7KciWNm7B7OsEtLxPPkhjnFIAh_G91wXGuGUEYopzukHT3QNWm7TxtlOU7W9c2vrCc7OxR64"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-24">
          <blockquote className="space-y-6 max-w-lg">
            <div className="rounded-full bg-primary/20 backdrop-blur-sm px-4 py-1 w-fit border border-white/10">
              <span className="text-sm font-semibold text-white tracking-wide uppercase">Librarizz</span>
            </div>
            <p className="text-3xl font-bold leading-relaxed text-white">
              "The only thing that you absolutely have to know, is the location of the library."
            </p>
            <footer className="flex items-center gap-4">
              <div className="h-px w-8 bg-white/60"></div>
              <cite className="text-lg font-medium not-italic text-white/90">Albert Einstein</cite>
            </footer>
          </blockquote>
        </div>
        {/* Abstract Decorative Elements */}
        <div className="absolute top-12 right-12 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-white/20 backdrop-blur-md"></div>
          <div className="h-3 w-3 rounded-full bg-white/40 backdrop-blur-md"></div>
          <div className="h-3 w-3 rounded-full bg-white/60 backdrop-blur-md"></div>
        </div>
      </div>
    </div>
  );
}