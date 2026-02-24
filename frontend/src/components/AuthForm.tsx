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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === "register" && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder="Enter your full name"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          placeholder={
            mode === "register" ? "At least 6 characters" : "Enter your password"
          }
        />
      </div>

      {mode === "register" && (
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            I am a
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="customer">Customer</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
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
