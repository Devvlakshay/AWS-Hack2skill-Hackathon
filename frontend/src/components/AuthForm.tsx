"use client";

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
      {error && (
        <div className="glass-card border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {mode === "register" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="glass-input"
            placeholder="Enter your full name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="glass-input"
          placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
        />
      </div>

      {mode === "register" && (
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
            I am a
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="glass-input"
          >
            <option value="customer">Customer</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Please wait..."
          : mode === "login"
          ? "Sign In"
          : "Create Account"}
      </button>
    </form>
  );
}
