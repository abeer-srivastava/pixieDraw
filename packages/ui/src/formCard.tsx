import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function FormCard({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {children}
          {footer && (
            <div className="text-center text-sm text-gray-600">{footer}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}