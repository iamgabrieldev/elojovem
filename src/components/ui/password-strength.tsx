"use client";

import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
}

type StrengthLevel = {
  level: "weak" | "fair" | "good" | "strong";
  label: string;
  color: string;
  percentage: number;
  feedback: string[];
};

function calculateStrength(password: string): StrengthLevel {
  if (!password) {
    return {
      level: "weak",
      label: "Muito fraca",
      color: "bg-red-500",
      percentage: 0,
      feedback: ["Digite uma senha"],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Feedback
  if (password.length < 8) feedback.push("Mínimo 8 caracteres");
  if (!/[A-Z]/.test(password)) feedback.push("Adicione letras maiúsculas");
  if (!/[0-9]/.test(password)) feedback.push("Adicione números");
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push("Adicione símbolos especiais");

  // Determine level
  if (score <= 2) {
    return {
      level: "weak",
      label: "Fraca",
      color: "bg-red-500",
      percentage: 25,
      feedback: feedback.length > 0 ? feedback : ["Senha muito fraca"],
    };
  }

  if (score <= 4) {
    return {
      level: "fair",
      label: "Razoável",
      color: "bg-amber-500",
      percentage: 50,
      feedback: feedback.length > 0 ? feedback : ["Pode melhorar"],
    };
  }

  if (score <= 6) {
    return {
      level: "good",
      label: "Boa",
      color: "bg-blue-500",
      percentage: 75,
      feedback: feedback.length > 0 ? feedback : ["Senha boa"],
    };
  }

  return {
    level: "strong",
    label: "Muito forte",
    color: "bg-emerald-500",
    percentage: 100,
    feedback: ["Excelente senha!"],
  };
}

export function PasswordStrengthIndicator({
  password,
  showLabel = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <span className="text-xs font-medium text-[hsl(var(--muted))]">
            Força da senha:
          </span>
        )}
        <span className={`text-xs font-semibold ${
          strength.level === "weak" ? "text-red-600" :
          strength.level === "fair" ? "text-amber-600" :
          strength.level === "good" ? "text-blue-600" :
          "text-emerald-600"
        }`}>
          {strength.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[hsl(var(--border))] overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-out`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="space-y-1">
          {strength.feedback.map((item, idx) => (
            <li key={idx} className="text-xs text-[hsl(var(--muted))] flex items-start gap-1.5">
              <span className="mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
