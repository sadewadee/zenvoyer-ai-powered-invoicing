import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePageTitle } from '@/hooks/use-page-title';
import { AIChatAssistant } from '@/components/AIChatAssistant';
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const title = usePageTitle();
  const location = useLocation();
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 p-6 md:p-8 lg:p-10"
          >
            {children}
          </motion.div>
          <footer className="p-4 text-center text-xs text-muted-foreground border-t">
            <p>
              © {new Date().getFullYear()} Zenvoyer. All rights reserved. Built with ❤️ at Cloudflare.
            </p>
            <p className="mt-1">
              AI capabilities have usage limits across all users. Please use them responsibly.
            </p>
          </footer>
        </main>
      </div>
      <AIChatAssistant />
    </div>
  );
}