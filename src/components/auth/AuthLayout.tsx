import React from 'react';
import { Sparkles } from 'lucide-react';
interface AuthLayoutProps {
  children: React.ReactNode;
}
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-50">
            Welcome to Zenvoyer
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional Invoice Management Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}