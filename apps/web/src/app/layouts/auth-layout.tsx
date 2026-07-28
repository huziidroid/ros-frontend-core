/**
 * Page chrome for the auth screens (login/register/otp): a centered card with
 * an optional back action and footer.
 */
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ros/ui-web';

export interface AuthLayoutProps {
  title: string;
  description?: string;
  backLabel?: string;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({
  title,
  description,
  backLabel,
  onBack,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 self-start text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            {backLabel ?? 'Back'}
          </Button>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer}
      </div>
    </div>
  );
}

export default AuthLayout;
