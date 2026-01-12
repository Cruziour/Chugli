// src/components/auth/AuthLayout.jsx

import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';

const AuthLayout = ({ 
  children, 
  title, 
  subtitle,
  showBackToHome = true 
}) => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Logo size="default" />
          </Link>
          
          {showBackToHome && (
            <Link 
              to="/"
              className="text-dark-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Title */}
            {title && (
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-dark-400 text-sm md:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-dark-500 text-sm">
          © {new Date().getFullYear()} Chugli. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;