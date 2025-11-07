import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service or the console
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // FIX: Destructure props and state from 'this' to resolve type inference issue.
    const { hasError } = this.state;
    const { children, fallbackMessage } = this.props;

    if (hasError) {
      const t = i18n.t; // Use i18n instance directly in class component
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t('errorBoundary.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">
              {fallbackMessage || t('errorBoundary.message')}
            </p>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
