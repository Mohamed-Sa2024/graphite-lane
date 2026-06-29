"use client";

import * as React from "react";
import { cn, initials } from "@/lib/utils";
import type { CIStatus, ReviewDecision, User } from "@/types/pr";

/* --------------------------------- Button --------------------------------- */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:opacity-90",
  secondary:
    "bg-surface-2 text-fg border border-border hover:bg-[var(--border)]",
  ghost: "text-fg hover:bg-surface-2",
  outline: "border border-border text-fg hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
  success: "bg-success text-white hover:opacity-90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  icon: "h-8 w-8 justify-center",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

/* --------------------------------- Badge ---------------------------------- */

export function Badge({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const style = color
    ? {
        backgroundColor: `#${color}22`,
        color: `#${color}`,
        borderColor: `#${color}55`,
      }
    : undefined;
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium leading-none text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Status dot -------------------------------- */

const ciColor: Record<NonNullable<CIStatus>, string> = {
  SUCCESS: "var(--success)",
  FAILURE: "var(--danger)",
  PENDING: "var(--warning)",
  EXPECTED: "var(--muted)",
};

export function StatusDot({
  status,
  pulse,
  title,
}: {
  status: CIStatus;
  pulse?: boolean;
  title?: string;
}) {
  const color = status ? ciColor[status] : "var(--muted)";
  return (
    <span
      title={title ?? status ?? "no checks"}
      className="relative inline-flex h-2.5 w-2.5 shrink-0"
    >
      {pulse && status === "PENDING" && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: color }}
        />
      )}
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}

export function ReviewDot({ decision }: { decision: ReviewDecision }) {
  const map: Record<string, string> = {
    APPROVED: "var(--success)",
    CHANGES_REQUESTED: "var(--danger)",
    REVIEW_REQUIRED: "var(--warning)",
    COMMENTED: "var(--info)",
  };
  const color = decision ? map[decision] : "var(--muted)";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface)]"
      style={{ background: color }}
    />
  );
}

/* -------------------------------- Diff stat -------------------------------- */

export function DiffStat({ add, del }: { add: number; del: number }) {
  return (
    <span className="font-mono text-xs tabular-nums">
      <span className="text-success">+{add}</span>{" "}
      <span className="text-danger">−{del}</span>
    </span>
  );
}

/* --------------------------------- Avatar --------------------------------- */

export function Avatar({
  user,
  size = 22,
  className,
}: {
  user: User;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = React.useState(false);
  const dim = { width: size, height: size };
  if (!user.avatarUrl || errored) {
    return (
      <span
        style={{ ...dim, fontSize: size * 0.4 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-surface-2 font-medium text-muted ring-1 ring-border",
          className,
        )}
        title={user.login}
      >
        {initials(user.name ?? user.login)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatarUrl}
      alt={user.login}
      title={user.login}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={dim}
      className={cn("rounded-full ring-1 ring-border", className)}
    />
  );
}

export function AvatarStack({ users, max = 3 }: { users: User[]; max?: number }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((u, i) => (
        <span key={u.login} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar user={u} size={20} />
        </span>
      ))}
      {extra > 0 && (
        <span className="ml-1 text-[11px] text-muted">+{extra}</span>
      )}
    </span>
  );
}

/* --------------------------------- Inputs --------------------------------- */

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted focus:border-primary",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-primary resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-9 rounded-md border border-border bg-surface px-2.5 text-sm text-fg focus:border-primary",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

/* -------------------------------- Misc bits -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-2",
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary",
        className,
      )}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2 text-sm",
        className,
      )}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-fg"
            : "border-border bg-surface",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2.5 6.2l2.2 2.3 4.8-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}
