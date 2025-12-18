import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

export default function Register({ setUser }) {
  const [role, setRole] = useState("member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/api/register", {
        name,
        email,
        password,
        role,
      });

      if (res.status === 201 || res.status === 200) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Section: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-surface-light dark:bg-background-dark">
        {/* Header / Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark whitespace-nowrap">Librarizz</h2>
        </div>

        {/* Segmented Control (Login / Register Toggle) */}
        <div className="mb-8 w-full max-w-md">
          <div className="flex h-12 w-full items-center justify-center rounded-xl bg-background-light dark:bg-surface-dark p-1 border border-border-light dark:border-border-dark">
            <Link
              to="/login"
              className="group flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all hover:text-text-main-light dark:hover:text-white text-text-sub-light dark:text-text-sub-dark"
            >
              <span className="truncate">Sign In</span>
            </Link>
            <div className="group relative flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg bg-white dark:bg-background-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10 px-4 text-sm font-semibold transition-all">
              <span className="truncate">Register</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-md w-full">
          {/* Headings */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-text-main-light dark:text-white sm:text-4xl">
              Create an account
            </h1>
            <p className="text-base font-normal text-text-sub-light dark:text-text-sub-dark">
              Join your local library community today.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Success / Error Message */}
            {message && (
              <div
                className={`p-4 rounded-lg border ${
                  message.includes("successful")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    message.includes("successful")
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Member Option */}
                <label className="relative flex cursor-pointer flex-col rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-surface-dark p-4 transition-all hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <div className="flex justify-between items-start mb-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>
                      person
                    </span>
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

                {/* Librarian Option */}
                <label className="relative flex cursor-pointer flex-col rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-surface-dark p-4 transition-all hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <div className="flex justify-between items-start mb-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>
                      admin_panel_settings
                    </span>
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
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    id="name"
                    placeholder="John Doe"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    id="email"
                    placeholder="you@library.os"
                    required
                    type="email"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-sub-light">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-text-main-light dark:text-text-main-dark" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    id="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
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
                  id="terms"
                  type="checkbox"
                  required
                />
                <label
                  className="text-sm font-medium leading-none text-text-sub-light dark:text-text-sub-dark peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="terms"
                >
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
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center text-sm">
            <p className="text-text-sub-light dark:text-text-sub-dark">
              Already have an account?{" "}
              <Link className="font-bold text-primary hover:underline" to="/login">
                Sign In
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