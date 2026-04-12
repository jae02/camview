import { Check, X } from "lucide-react";

interface BadgeProps {
  /** Whether the feature is supported */
  value: boolean;
  /** Optional label — defaults to "예" / "아니오" */
  trueLabel?: string;
  falseLabel?: string;
}

/**
 * Premium boolean badge with icon:
 * - Green check for `true`
 * - Muted "x" for `false`
 */
export function BooleanBadge({
  value,
  trueLabel = "예",
  falseLabel = "아니오",
}: BadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        background: value ? "rgba(34, 197, 94, 0.12)" : "rgba(100, 116, 139, 0.12)",
        color: value ? "var(--success)" : "var(--text-tertiary)",
        border: `1px solid ${value ? "rgba(34, 197, 94, 0.2)" : "var(--border-subtle)"}`,
      }}
    >
      {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </span>
  );
}

interface TagProps {
  label: string;
  variant?: "default" | "accent" | "brand";
}

/**
 * Small tag/chip component for categories, mounts, etc.
 */
export function Tag({ label, variant = "default" }: TagProps) {
  const styles = {
    default: {
      background: "var(--bg-tertiary)",
      color: "var(--text-secondary)",
      border: "var(--border-subtle)",
    },
    accent: {
      background: "rgba(99, 102, 241, 0.1)",
      color: "var(--accent-tertiary)",
      border: "rgba(99, 102, 241, 0.2)",
    },
    brand: {
      background: "rgba(139, 92, 246, 0.1)",
      color: "#c4b5fd",
      border: "rgba(139, 92, 246, 0.2)",
    },
  };

  const s = styles[variant];

  return (
    <span
      className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap"
      style={{
        background: s.background,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label}
    </span>
  );
}
