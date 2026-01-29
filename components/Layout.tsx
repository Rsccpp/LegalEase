
import React, { useState } from 'react';
import { AppView, ModalTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: AppView) => void;
  onOpenInfo: (tab: ModalTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onOpenInfo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileAction = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop & Mobile Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate(AppView.LANDING)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-800">LegalEase</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onOpenInfo('mission')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => onOpenInfo('features')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all hover:shadow-indigo-200"
            >
              Analyze Document
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <span className="font-display font-bold text-slate-900">Navigation</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex-grow p-6 space-y-4">
              <button 
                onClick={() => handleMobileAction(() => onOpenInfo('mission'))}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                How it Works
              </button>
              
              <button 
                onClick={() => handleMobileAction(() => onOpenInfo('features'))}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                Platform Features
              </button>

              <button 
                onClick={() => handleMobileAction(() => onNavigate(AppView.DASHBOARD))}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-left"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                Analyze Document
              </button>
            </div>

            <div className="p-8 border-t border-slate-100">
              <p className="text-xs text-slate-400 leading-relaxed text-center italic">
                Empowering individuals against complex legal systems.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-left">
                <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="font-display text-lg font-bold text-white tracking-tight">LegalEase Decoder</span>
              </div>
              <p className="max-w-xs mb-6 text-sm leading-relaxed text-left">
                Empowering everyday people with AI-driven legal clarity. We believe complex language shouldn't be a barrier to justice.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onOpenInfo('features')} className="hover:text-white transition-colors text-left">Capabilities</button></li>
                <li><button onClick={() => onOpenInfo('security')} className="hover:text-white transition-colors text-left">Security</button></li>
                <li><button onClick={() => onOpenInfo('mission')} className="hover:text-white transition-colors text-left">Our Mission</button></li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-center md:text-left">
            <p>&copy; 2026 LegalEase Decoder.</p>
            <p>Disclaimer: Not a replacement for professional legal advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
