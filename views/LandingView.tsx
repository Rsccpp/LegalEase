import React from 'react';
import { ModalTab } from '../types';

interface LandingViewProps {
  onStart: () => void;
  onOpenInfo: (tab: ModalTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onOpenInfo }) => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Stop Signing Things You <span className="text-indigo-600">Don't Understand.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Legal documents are designed to be confusing. Use our AI decoder to translate jargon, identify hidden risks, and protect yourself in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105"
              >
                Decode Your First Document
              </button>
              <button 
                onClick={() => onOpenInfo('mission')}
                className="w-full sm:w-auto bg-white/60 backdrop-blur-sm text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-sm"
              >
                How It Works
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-60">
              <span className="text-sm font-bold tracking-widest uppercase">Trusted for</span>
              <div className="flex gap-6 items-center italic">
                <span>Rental Agreements</span>
                <span>•</span>
                <span>Employment Contracts</span>
                <span>•</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] opacity-40"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50/40 backdrop-blur-[1px] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">Knowledge is Power</h2>
            <p className="text-slate-600">Our tool scans every line to ensure you know exactly what you're agreeing to.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
              title="Jargon Translation"
              description="Instantly convert 'heretofore' and 'indemnification' into clear, simple English you actually speak."
            />
            <FeatureCard 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
              title="Risk Detection"
              description="Identify predatory clauses like unfair termination rights, hidden liability, and one-sided arbitration."
            />
            <FeatureCard 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              title="Hidden Fee Alert"
              description="Find that tiny font section that mentions service charges, automatic renewals, or late payment penalties."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600/95 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center border border-indigo-500/30">
            <div className="p-8 lg:p-16 flex-1 text-white">
              <h3 className="font-display text-3xl lg:text-4xl font-bold mb-6">Democratizing Legal Intelligence</h3>
              <p className="text-indigo-100 text-lg mb-8">
                Legal systems were built for lawyers. We built this for everyone else. By making complex documents accessible, we level the playing field for tenants, employees, and consumers everywhere.
              </p>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex-1 border border-white/10">
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-xs text-indigo-200 uppercase font-bold">Pages Scanned at Once</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex-1 border border-white/10">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-xs text-indigo-200 uppercase font-bold">Privacy Focused</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/5 h-64 lg:h-auto self-stretch">
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
                alt="Justice Gavel" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/80 backdrop-blur-[2px] p-8 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-slate-600 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);