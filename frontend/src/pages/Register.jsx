import React, { useState } from "react";
import API, { setToken } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register({ setUser }) {
  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Register State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [showPassword, setShowPassword] = useState(false);

  // Common State
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // "signin" or "register"

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await API.post("/api/login", { email: signInEmail, password: signInPassword });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch {
      setMessage("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await API.post("/api/register", { name, email, password, role });
      setMessage("Registration successful! Redirecting to sign in...");
      setTimeout(() => {
        setAuthMode("signin");
        setEmail("");
        setPassword("");
        setName("");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Section: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-8 lg:w-1/2 lg:px-12 xl:px-20 bg-surface-light dark:bg-background-dark">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">local_library</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Library OS</h2>
        </div>

        {/* Auth Mode Toggle */}
        <div className="mb-5 w-full max-w-md">
          <div className="flex h-12 w-full items-center justify-center rounded-xl bg-background-light dark:bg-surface-dark p-1 border border-border-light dark:border-border-dark">
            <label className={`group relative flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all ${authMode === "signin" ? "bg-white dark:bg-background-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-white"}`}>
              <span className="truncate">Sign In</span>
              <input
                checked={authMode === "signin"}
                onChange={() => setAuthMode("signin")}
                className="sr-only"
                name="auth-toggle"
                type="radio"
                value="signin"
              />
            </label>
            <label className={`group relative flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all ${authMode === "register" ? "bg-white dark:bg-background-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-white"}`}>
              <span className="truncate">Register</span>
              <input
                checked={authMode === "register"}
                onChange={() => setAuthMode("register")}
                className="sr-only"
                name="auth-toggle"
                type="radio"
                value="register"
              />
            </label>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-md w-full">
          {/* Sign In Form */}
          {authMode === "signin" && (
            <>
              <div className="mb-4 space-y-1">
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text-main-light dark:text-white sm:text-3xl">
                  Welcome back
                </h1>
                <p className="text-sm font-normal text-text-sub-light dark:text-text-sub-dark">
                  Please enter your details to sign in.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                {message && (
                  <div className={`p-4 rounded-lg border ${message.includes("Invalid") ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"}`}>
                    <p className={`text-sm font-medium ${message.includes("Invalid") ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"}`}>
                      {message}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="signin-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="you@library.os"
                        type="email"
                        id="signin-email"
                        required
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="signin-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="••••••••"
                        type={showSignInPassword ? "text" : "password"}
                        id="signin-password"
                        required
                      />
                      <button
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light hover:text-text-main-light dark:hover:text-white transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showSignInPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
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

                <button
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  type="submit"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-light dark:border-border-dark"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-light dark:bg-background-dark px-2 text-text-sub-light dark:text-text-sub-dark font-semibold">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main-light dark:text-white shadow-sm transition-colors hover:bg-background-light dark:hover:bg-border-dark hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                    type="button"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main-light dark:text-white shadow-sm transition-colors hover:bg-background-light dark:hover:bg-border-dark hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">school</span>
                    University ID
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Register Form */}
          {authMode === "register" && (
            <>
              <div className="mb-4 space-y-1">
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text-main-light dark:text-white sm:text-3xl">
                  Create an account ✨
                </h1>
                <p className="text-sm font-normal text-text-sub-light dark:text-text-sub-dark">
                  Join your local library community today.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                {message && (
                  <div className={`p-4 rounded-lg border ${message.includes("successful") ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
                    <p className={`text-sm font-medium ${message.includes("successful") ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Role Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative flex cursor-pointer flex-col rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-surface-dark p-4 transition-all hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                      <div className="flex justify-between items-start mb-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>person</span>
                        <input
                          checked={role === "member"}
                          onChange={(e) => setRole(e.target.value)}
                          className="sr-only"
                          name="role"
                          type="radio"
                          value="member"
                        />
                        <div className="h-4 w-4 rounded-full border border-primary opacity-0 transition-opacity has-[:checked]:opacity-100 ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark bg-primary flex items-center justify-center"></div>
                      </div>
                      <span className="font-bold text-text-main-light dark:text-white">Member</span>
                      <span className="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">Borrow books & track returns</span>
                    </label>

                    <label className="relative flex cursor-pointer flex-col rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-surface-dark p-4 transition-all hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                      <div className="flex justify-between items-start mb-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>admin_panel_settings</span>
                        <input
                          checked={role === "librarian"}
                          onChange={(e) => setRole(e.target.value)}
                          className="sr-only"
                          name="role"
                          type="radio"
                          value="librarian"
                        />
                        <div className="h-4 w-4 rounded-full border border-primary opacity-0 transition-opacity has-[:checked]:opacity-100 ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark bg-primary flex items-center justify-center"></div>
                      </div>
                      <span className="font-bold text-text-main-light dark:text-white">Librarian</span>
                      <span className="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">Manage catalog & inventory</span>
                    </label>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="reg-name">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="John Doe"
                        id="reg-name"
                        required
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="reg-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="you@library.os"
                        type="email"
                        id="reg-email"
                        required
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="reg-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        id="reg-password"
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
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark pt-1 pl-1">Must be at least 8 characters long.</p>
                  </div>
                </div>

                {/* Terms & Submit */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark dark:bg-surface-dark"
                      id="reg-terms"
                      type="checkbox"
                      required
                    />
                    <label className="text-sm font-medium leading-none text-text-sub-light dark:text-text-sub-dark peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="reg-terms">
                      I agree to the{" "}
                      <a className="text-primary hover:underline font-semibold" href="#">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a className="text-primary hover:underline font-semibold" href="#">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                  <button
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    type="submit"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-light dark:border-border-dark"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-light dark:bg-background-dark px-2 text-text-sub-light dark:text-text-sub-dark font-semibold">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main-light dark:text-white shadow-sm transition-colors hover:bg-background-light dark:hover:bg-border-dark hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                    type="button"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main-light dark:text-white shadow-sm transition-colors hover:bg-background-light dark:hover:bg-border-dark hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">school</span>
                    University ID
                  </button>
                </div>
              </form>
            </>
          )}
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
              <span className="text-sm font-semibold text-white tracking-wide uppercase">Library OS</span>
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
