import type { InputHTMLAttributes, ReactNode } from "react";

type IconFieldProps = {
  label: string;
  icon: ReactNode;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
};

type ChoiceCardProps = {
  highlighted?: boolean;
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, "type">;
  title: string;
  valueLabel: string;
  description: string;
  benefits: string[];
};

type ConsentRowProps = {
  children: ReactNode;
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, "type">;
};

type StatusLineProps = {
  tone?: "neutral" | "success" | "error";
  children: ReactNode;
};

function mergeClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function IconField({ label, icon, inputProps }: IconFieldProps) {
  return (
    <label className="block" data-ui="icon-field">
      <span className="sr-only">{label}</span>
      <div className="group relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/48 transition group-focus-within:border-violet-300/20 group-focus-within:bg-violet-500/[0.06] group-focus-within:text-violet-100"
        >
          {icon}
        </span>
        <input
          {...inputProps}
          className={mergeClassName(
            "field-input h-[58px] rounded-[20px] border-white/[0.09] bg-black/18 pl-[3.75rem] pr-4 text-[15px] placeholder:text-white/32 transition group-hover:border-white/[0.14] focus:border-violet-300/45 focus:bg-black/26",
            inputProps.className
          )}
        />
      </div>
    </label>
  );
}

export function ChoiceCard({
  highlighted = false,
  inputProps,
  title,
  valueLabel,
  description,
  benefits,
}: ChoiceCardProps) {
  return (
    <label
      data-ui="choice-card"
      className={mergeClassName(
        "group relative flex min-h-[196px] cursor-pointer flex-col overflow-hidden rounded-[22px] border p-4 transition duration-200 has-[:checked]:border-violet-300/55 has-[:checked]:bg-violet-500/[0.09] has-[:checked]:shadow-[inset_0_0_0_1px_rgba(196,181,253,0.08),0_16px_38px_rgba(0,0,0,0.16)] hover:border-white/[0.16] hover:bg-white/[0.025]",
        highlighted
          ? "border-violet-400/26 bg-violet-500/[0.045]"
          : "border-white/[0.09] bg-black/14"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(124,60,255,0.14),transparent_70%)] opacity-60 transition group-hover:opacity-90"
      />
      <input
        {...inputProps}
        type="radio"
        className={mergeClassName(
          "absolute right-3.5 top-3.5 h-4 w-4 accent-violet-500",
          inputProps.className
        )}
      />
      <div className="relative flex h-full flex-col">
        <p className="pr-7 text-[13px] font-semibold uppercase tracking-[0.08em] text-white/72">
          {title}
        </p>
        <p className="mt-3 font-display text-[2.25rem] leading-none tracking-[-0.035em] text-white">
          {valueLabel}
        </p>
        <p className="mt-3 text-xs leading-5 text-white/52">{description}</p>
        <ul className="mt-auto space-y-1.5 pt-4 text-xs leading-5 text-white/68">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-violet-300/80" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </label>
  );
}

export function ConsentRow({ children, inputProps }: ConsentRowProps) {
  return (
    <label
      data-ui="consent-row"
      className="group flex items-start gap-3 rounded-[20px] border border-white/[0.08] bg-black/12 px-4 py-3.5 text-sm leading-6 text-white/66 transition hover:border-white/[0.13] hover:bg-white/[0.018]"
    >
      <input
        {...inputProps}
        type="checkbox"
        className={mergeClassName(
          "mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 text-violet-500 accent-violet-500",
          inputProps.className
        )}
      />
      <span>{children}</span>
    </label>
  );
}

export function StatusLine({ tone = "neutral", children }: StatusLineProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      data-ui="status-line"
      className={mergeClassName(
        "rounded-[18px] border px-4 py-3 text-sm leading-6",
        tone === "success" && "border-emerald-300/15 bg-emerald-300/[0.045] text-emerald-200",
        tone === "error" && "border-rose-300/15 bg-rose-300/[0.045] text-rose-200",
        tone === "neutral" && "border-white/[0.07] bg-white/[0.018] text-white/52"
      )}
    >
      {children}
    </p>
  );
}
