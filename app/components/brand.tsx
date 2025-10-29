function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const SIZE_CLASS = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5",
        SIZE_CLASS[size],
        className,
      )}
    >
      <img src="/logo.png" alt="FieldSync logo" className="h-full w-full object-cover" />
    </div>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col leading-tight", className)}>
      <span className="text-lg font-semibold text-slate-900">FieldSync</span>
      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
        Geo-location suite
      </span>
    </div>
  );
}

export function BrandSignature({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size="md" />
      <BrandWordmark />
    </div>
  );
}
