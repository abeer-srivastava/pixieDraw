import { cn } from "./utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Section({ children, className, title, ...props }: SectionProps) {
  return (
    <section className={cn("px-6 py-20 max-w-6xl mx-auto", className)} {...props}>
      {title && (
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">{title}</h2>
      )}
      {children}
    </section>
  );
}
