interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center sm:p-16">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <span className="text-2xl">{icon}</span>
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mb-8 max-w-md text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

