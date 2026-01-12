// src/components/auth/PasswordStrength.jsx

import { useMemo } from "react";
import { Check, X } from "lucide-react";

const PasswordStrength = ({ password = "" }) => {
  const strength = useMemo(() => {
    const checks = {
      length: password.length >= 6,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    let level = "weak";
    let color = "bg-red-500";
    let width = "25%";

    if (passedChecks >= 4) {
      level = "strong";
      color = "bg-green-500";
      width = "100%";
    } else if (passedChecks >= 3) {
      level = "good";
      color = "bg-yellow-500";
      width = "75%";
    } else if (passedChecks >= 2) {
      level = "fair";
      color = "bg-orange-500";
      width = "50%";
    }

    return { checks, level, color, width, passedChecks };
  }, [password]);

  if (!password) return null;

  const requirements = [
    {
      key: "length",
      label: "At least 6 characters",
      passed: strength.checks.length,
    },
    {
      key: "letter",
      label: "Contains a letter",
      passed: strength.checks.letter,
    },
    {
      key: "number",
      label: "Contains a number",
      passed: strength.checks.number,
    },
    {
      key: "special",
      label: "Contains special character",
      passed: strength.checks.special,
    },
  ];

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-dark-400">Password strength</span>
          <span
            className={`font-medium capitalize ${
              strength.level === "strong"
                ? "text-green-400"
                : strength.level === "good"
                ? "text-yellow-400"
                : strength.level === "fair"
                ? "text-orange-400"
                : "text-red-400"
            }`}
          >
            {strength.level}
          </span>
        </div>
        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.passed ? "text-green-400" : "text-dark-500"
            }`}
          >
            {req.passed ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
