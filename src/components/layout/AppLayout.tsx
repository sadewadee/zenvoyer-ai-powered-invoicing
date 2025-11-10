import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            {children}
          </div>
          <footer className="p-4 text-center text-xs text-muted-foreground border-t">
            <p>
              © {new Date().getFullYear()} Zenitho. All rights reserved. Built with ❤️ at Cloudflare.
            </p>
            <p className="mt-1">
              AI capabilities have usage limits across all users. Please use them responsibly.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}