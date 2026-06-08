type PageShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl flex-col px-4 py-8 sm:py-12">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-pitch">
          Skill-Based Competition
        </p>
        <h1 className="text-3xl font-bold text-night sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
        ) : null}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}
