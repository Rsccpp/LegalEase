
import React from 'react';
import { ModalTab } from '../types';

interface PlatformInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
}

export const PlatformInfoModal: React.FC<PlatformInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
  if (!isOpen) return null;

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'mission', label: 'Mission' },
    { id: 'tech', label: 'Technology' },
    { id: 'features', label: 'Features' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-8 md:p-10 text-left">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">Platform Intelligence</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'mission' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">The Mission</h4>
                <p className="text-slate-600 leading-relaxed mb-6">
                  LegalEase Decoder was built with a high social impact mission: to democratize legal intelligence. We empower regular people—tenants, employees, and consumers—to understand complex contracts that are often designed to confuse.
                </p>
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-700 text-sm font-medium italic">
                    "Our goal is to eliminate the 'Knowledge Gap' that predatory corporations use to take advantage of individuals."
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">The Technology</h4>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our platform leverages <span className="font-bold text-slate-800">Gemini 3 Pro</span>, utilizing its massive context window to process multi-page documents (up to 50+ pages) in a single pass.
                </p>
                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-indigo-600 shrink-0">1</div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Deep Reasoning</h5>
                      <p className="text-xs text-slate-500">The model identifies logical inconsistencies and missing clauses that standard OCR ignores.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-indigo-600 shrink-0">2</div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Pattern Matching</h5>
                      <p className="text-xs text-slate-500">Scans against thousands of predatory clause patterns used in rental and employment agreements.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Platform Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureItem 
                    title="Jargon Decoder" 
                    desc="Translates archaic legal terms into clear, actionable advice." 
                  />
                  <FeatureItem 
                    title="Risk Radar" 
                    desc="Categorizes risks by severity so you know what to negotiate first." 
                  />
                  <FeatureItem 
                    title="Cost Analysis" 
                    desc="Uncovers hidden subscription fees and one-time penalties." 
                  />
                  <FeatureItem 
                    title="Historical Tracking" 
                    desc="Store and compare previous analyses to see document trends." 
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Security & Privacy</h4>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Your documents are processed with ephemeral logic. We do not store original files after analysis is complete, and your data is never used to train external AI models.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                    256-bit Document Encryption
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                    SOC2 Compliant Infrastructure
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Close Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <div className="font-bold text-slate-900 text-sm mb-1">{title}</div>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
