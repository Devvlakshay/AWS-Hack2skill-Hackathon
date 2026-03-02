"use client";

/**
 * AuthForm component for FitView AI.
 * Handles login and registration flows.
 * Design: Luxury editorial — clean ink inputs with gold focus ring.
 */

import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const inputClass =
  "w-full bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm rounded-xl px-4 py-3 placeholder:text-[#C4BFB4] focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 transition-all";

export default function AuthForm({
  mode,
  onSubmit,
  isLoading,
  error,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      await onSubmit({ name, email, password, role });
    } else {
      await onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Full Name (register only) */}
      {mode === "register" && (
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-[#6B6B6B] tracking-wide mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className={inputClass}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-[#6B6B6B] tracking-wide mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-[#6B6B6B] tracking-wide mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={inputClass}
          placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </div>

      {/* Role (register only) */}
      {mode === "register" && (
        <div>
          <label htmlFor="role" className="block text-xs font-medium text-[#6B6B6B] tracking-wide mb-1.5">
            I am a
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
          >
            <option value="customer">Customer</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1a1a1a] text-white text-sm font-medium py-3 px-6 rounded-xl hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {isLoading
          ? "Please wait\u2026"
          : mode === "login"
          ? "Sign In"
          : "Create Account"}
      </button>
    </form>
  );
}
