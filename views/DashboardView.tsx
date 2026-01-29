
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { analyzeLegalDocument, compareDocuments, createChatSession } from '../services/geminiService';
import { AnalysisResult, ComparisonResult, HistoryItem, ChatMessage } from '../types';

const STORAGE_KEY = 'legalease_history_v3';

export const DashboardView: React.FC = () => {
  const [mode, setMode] = useState<'Analysis' | 'Comparison'>('Analysis');
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize history from localStorage safely
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history:", e);
      return [];
    }
  });
  
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSession, setChatSession] = useState<any>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleAction = async () => {
    if (!file1) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    try {
      const b64_1 = await convertToBase64(file1);
      
      if (mode === 'Analysis') {
        const data = await analyzeLegalDocument(b64_1, file1.type);
        setResult(data);
        const session = createChatSession(b64_1, file1.type);
        setChatSession(session);
        
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file1.name,
          timestamp: Date.now(),
          result: data,
          type: 'Analysis'
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } else if (mode === 'Comparison' && file2) {
        const b64_2 = await convertToBase64(file2);
        const data = await compareDocuments(
          { data: b64_1, mime: file1.type, name: file1.name },
          { data: b64_2, mime: file2.type, name: file2.name }
        );
        setResult(data);
        
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file1.name,
          secondFilename: file2.name,
          timestamp: Date.now(),
          result: data,
          type: 'Comparison'
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process document.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSession || isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);
    try {
      const resp = await chatSession.sendMessage({ message: msg });
      setChatMessages(prev => [...prev, { role: 'model', text: resp.text }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Error communicating with AI assistant." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setMode(item.type);
    if (item.type === 'Analysis') {
       setChatSession(null);
       setChatMessages([{ role: 'model', text: "Re-upload document to enable live chat session." }]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    // Prevent the parent card's onClick from firing
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Delete this report from your history permanently?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const reset = () => {
    setFile1(null); setFile2(null); setResult(null); setChatSession(null); setChatMessages([]); setError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!result) return;
    
    let mdContent = '';
    if ('complexityScore' in result) {
      const res = result as AnalysisResult;
      mdContent = `# LegalEase Analysis Report: ${file1?.name || 'Document'}\n\n`;
      mdContent += `## Executive Summary\n${language === 'en' ? res.summary.en : res.summary.hi}\n\n`;
      mdContent += `**Complexity Score:** ${res.complexityScore}/10\n`;
      mdContent += `**Verdict:** ${res.verdict}\n\n`;
      mdContent += `## Risk Radar\n\n`;
      res.risks?.forEach(risk => {
        mdContent += `### ${risk.category} (${risk.severity} Risk)\n`;
        mdContent += `- **Issue:** ${risk.description}\n`;
        mdContent += `- **Clause:** "${risk.clause}"\n`;
        mdContent += `- **Recommendation:** ${risk.recommendation}\n\n`;
      });
      mdContent += `## Jargon Decoder\n\n`;
      res.jargonTranslator?.forEach(item => {
        mdContent += `- **${item.term}:** ${item.plainEnglish}\n`;
      });
    } else {
      const res = result as ComparisonResult;
      mdContent = `# LegalEase Comparison Report\n\n`;
      mdContent += `**Baseline:** ${res.baselineName}\n`;
      mdContent += `**Comparison:** ${res.comparisonName}\n\n`;
      mdContent += `## Summary\n${res.summary}\n\n`;
      mdContent += `## Risk Profile Shift\n${res.riskShift}\n\n`;
      mdContent += `## Key Changes\n\n`;
      res.changes?.forEach(change => {
        mdContent += `### ${change.type}: ${change.description} (${change.impact} Impact)\n`;
        if (change.originalText) mdContent += `**Original:** ${change.originalText}\n`;
        if (change.newText) mdContent += `**New:** ${change.newText}\n`;
        mdContent += `\n`;
      });
    }

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LegalEase_Report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 no-print text-left">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900">LegalEase Lab</h1>
          <p className="text-slate-500 mt-2">Professional document simplification & risk assessment.</p>
        </div>
        {!result && !analyzing && (
          <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl">
            <button 
              onClick={() => setMode('Analysis')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${mode === 'Analysis' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Analyze
            </button>
            <button 
              onClick={() => setMode('Comparison')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${mode === 'Comparison' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Compare
            </button>
          </div>
        )}
        {result && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleDownloadMarkdown} 
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
              title="Download as Markdown file"
            >
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download .MD
            </button>
            <button 
              onClick={handlePrint} 
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
              title="Save as PDF or Print"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Save PDF
            </button>
            <button onClick={reset} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105">
              New Document
            </button>
          </div>
        )}
      </div>

      {!result && !analyzing && (
        <div className="space-y-12">
          {/* Uploaders */}
          <div className={`grid grid-cols-1 ${mode === 'Comparison' ? 'md:grid-cols-2' : ''} gap-8 animate-in fade-in duration-500`}>
            <div 
              className={`group relative p-12 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer ${file1 ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-400'}`}
              onClick={() => fileInputRef1.current?.click()}
            >
              <input type="file" ref={fileInputRef1} className="hidden" accept="application/pdf" onChange={(e) => setFile1(e.target.files?.[0] || null)} />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{file1 ? file1.name : mode === 'Comparison' ? 'Base Document (PDF)' : 'Legal Document (PDF)'}</h3>
              <p className="text-slate-500 text-sm">{file1 ? `${(file1.size/1024/1024).toFixed(2)} MB` : 'Drop PDF here or click to browse'}</p>
              {file1 && <button onClick={(e) => { e.stopPropagation(); setFile1(null); }} className="mt-4 text-xs font-black text-rose-500 uppercase tracking-widest hover:underline">Remove</button>}
            </div>

            {mode === 'Comparison' && (
              <div 
                className={`group relative p-12 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer ${file2 ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-400'}`}
                onClick={() => fileInputRef2.current?.click()}
              >
                <input type="file" ref={fileInputRef2} className="hidden" accept="application/pdf" onChange={(e) => setFile2(e.target.files?.[0] || null)} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{file2 ? file2.name : 'Document to Compare (PDF)'}</h3>
                <p className="text-slate-500 text-sm">{file2 ? `${(file2.size/1024/1024).toFixed(2)} MB` : 'Compare against another version'}</p>
                {file2 && <button onClick={(e) => { e.stopPropagation(); setFile2(null); }} className="mt-4 text-xs font-black text-rose-500 uppercase tracking-widest hover:underline">Remove</button>}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              disabled={!file1 || (mode === 'Comparison' && !file2)}
              onClick={handleAction}
              className="w-full max-w-lg py-5 bg-indigo-600 text-white rounded-3xl font-bold text-xl hover:bg-indigo-700 disabled:opacity-50 shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              {mode === 'Analysis' ? 'Run Deep Decoder Analysis' : 'Run Version Comparison'}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </button>
            <p className="text-[10px] text-slate-400 italic">Processing powered by Gemini 3 Pro Long-Context Reasoning</p>
          </div>

          {/* History */}
          {history && history.length > 0 && (
            <div className="mt-20 text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Recent Activity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.slice(0, 9).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group hover:border-indigo-200 relative overflow-hidden flex flex-col justify-between h-48"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{item.type}</div>
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(item.timestamp).toLocaleDateString()}</span>
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-2 -mr-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all z-30 relative shrink-0"
                            aria-label="Delete report"
                            title="Delete this record"
                          >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 truncate text-left">{item.filename}</h4>
                      {item.secondFilename && <p className="text-xs text-slate-400 mb-2 truncate text-left italic">vs {item.secondFilename}</p>}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      View Analysis Report
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analyzing && (
        <div className="py-24 text-center animate-pulse">
          <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">AI Decoder at Work...</h2>
          <p className="text-slate-500 italic max-w-sm mx-auto">Evaluating legal logic, identifying risks, and generating plain-English translations.</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 font-medium flex items-center gap-3 text-left">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-8 space-y-8">
            {/* Analysis Result Display */}
            {('complexityScore' in result) ? (
              <>
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-0"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{(result as AnalysisResult).persona} Targeting</span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          (result as AnalysisResult).verdict === 'Safe' ? 'bg-emerald-100 text-emerald-700' : 
                          (result as AnalysisResult).verdict === 'Caution' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>{(result as AnalysisResult).verdict} Verdict</span>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl no-print">
                        <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>English</button>
                        <button onClick={() => setLanguage('hi')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>हिन्दी</button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="flex-1 text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Plain-English Decoder</h2>
                        <p className="text-xl text-slate-600 leading-relaxed font-medium italic">
                          {language === 'en' ? (result as AnalysisResult).summary?.en : (result as AnalysisResult).summary?.hi}
                        </p>
                      </div>
                      <div className="w-full md:w-48 shrink-0">
                         <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Complexity</span>
                            <div className="text-6xl font-display font-bold text-indigo-600 mb-1">{(result as AnalysisResult).complexityScore}</div>
                            <span className="text-[10px] font-bold text-slate-500">out of 10</span>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
                      {(result as AnalysisResult).clauseCards?.map((card, i) => (
                        <div key={i} className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-white transition-all group text-left">
                           <div className="font-bold text-slate-900 text-xs mb-1 group-hover:text-indigo-600">{card.title}</div>
                           <p className="text-[10px] text-slate-500 leading-relaxed">{card.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 px-2 text-left">Risk Radar & Red Flags</h3>
                  {((result as AnalysisResult).risks || []).map((risk, i) => (
                    <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                      <div className="p-8 text-left">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full animate-pulse ${
                                risk.severity === 'High' ? 'bg-rose-500' : risk.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}></div>
                              <h4 className="text-xl font-bold text-slate-900">{risk.category}</h4>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                             risk.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                           }`}>{risk.severity} Severity</span>
                        </div>
                        <p className="text-slate-600 mb-6">{risk.description}</p>
                        <div className="bg-slate-50 p-6 rounded-2xl text-xs font-mono text-slate-500 border border-slate-100 mb-6 italic leading-relaxed">
                          "{risk.clause}"
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50">
                             <div className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-2">⚠️ Why this is risky</div>
                             <p className="text-xs text-amber-800 leading-relaxed font-medium">{risk.whyRisky}</p>
                          </div>
                          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                             <div className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-2">✅ Action Recommendation</div>
                             <p className="text-xs text-emerald-800 leading-relaxed font-bold mb-3">{risk.recommendation}</p>
                             {risk.alternativeClause && (
                               <div className="p-3 bg-white/60 border border-emerald-200 rounded-lg text-[10px] font-mono select-all cursor-help" title="Copy this safer language">
                                 {risk.alternativeClause}
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Comparison Result Display */
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-left">
                 <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Comparison</h2>
                 <p className="text-slate-500 mb-8">Comparing <span className="text-indigo-600 font-bold">{(result as ComparisonResult).baselineName}</span> vs <span className="text-indigo-600 font-bold">{(result as ComparisonResult).comparisonName}</span></p>
                 
                 <div className="p-8 bg-slate-900 rounded-3xl text-white mb-10">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 011.512-.306c.386.03.707.224.946.51.281.338.446.775.446 1.277 0 .501-.165.939-.446 1.277-.239.286-.56.48-.946.51a2.64 2.64 0 01-1.512-.306c.05.62.132 1.25.244 1.901.164.946.386 1.903.67 2.86.19.644.405 1.248.66 1.742.302.585.691 1.096 1.228 1.41a1 1 0 101.032-1.714c-.167-.1-.339-.277-.491-.571-.211-.408-.393-.93-.564-1.508a31.132 31.132 0 01-.694-2.484c-.033-.174-.075-.42-.11-.737a4.64 4.64 0 002.321.372c.703-.053 1.353-.351 1.847-.84.522-.518.848-1.242.848-2.037 0-.795-.326-1.519-.848-2.037a3.136 3.136 0 00-1.847-.84 4.64 4.64 0 00-2.321.372c.038-.382.083-.733.14-1.036.216-.867.481-1.727.774-2.512.197-.528.423-.923.645-1.216.202-.267.312-.339.332-.341a1 1 0 00.315-1.747z" clipRule="evenodd"></path></svg>
                       Risk Profile Shift
                    </h3>
                    <p className="text-slate-300 leading-relaxed font-medium italic">"{(result as ComparisonResult).riskShift}"</p>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {((result as ComparisonResult).changes || []).map((change, i) => (
                      <div key={i} className={`p-8 rounded-3xl border text-left ${
                        change.impact === 'Positive' ? 'bg-emerald-50 border-emerald-100' : 
                        change.impact === 'Negative' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                      } relative overflow-hidden`}>
                         <div className={`absolute top-0 left-0 w-2 h-full ${
                           change.impact === 'Positive' ? 'bg-emerald-500' : change.impact === 'Negative' ? 'bg-rose-500' : 'bg-slate-300'
                         }`}></div>
                         <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                               change.type === 'Added' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>{change.type}</span>
                            <span className="text-xs font-bold text-slate-400">{change.impact} Impact</span>
                         </div>
                         <h4 className="text-lg font-bold text-slate-900 mb-4">{change.description}</h4>
                         {change.originalText && (
                            <div className="bg-white/40 p-4 rounded-xl border border-slate-200/50 mb-3 line-through text-slate-400 text-xs">
                               "{change.originalText}"
                            </div>
                         )}
                         {change.newText && (
                            <div className="bg-white/60 p-4 rounded-xl border border-indigo-200/50 text-indigo-900 font-medium text-xs">
                               "{change.newText}"
                            </div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 no-print sticky top-24">
            {/* Contextual Document Chat */}
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-800">
               <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-white font-bold text-sm tracking-tight">Ask Document Assistant</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">RAG Engine</div>
               </div>

               <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12 px-6">
                       <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                       </div>
                       <p className="text-slate-500 text-sm italic text-center leading-relaxed">"Can I terminate this agreement anytime?" or "What's the late payment penalty?"</p>
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-left ${
                        m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none'
                      } text-sm leading-relaxed shadow-sm`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                       <div className="bg-slate-800 text-slate-500 p-4 rounded-3xl animate-pulse italic text-sm">Gemini is searching...</div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
               </div>

               <div className="p-6 bg-slate-800/20 border-t border-slate-800">
                  <div className="relative group text-left">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your question..."
                      disabled={!chatSession}
                      className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button 
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isChatLoading || !chatSession}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </div>
                  {!chatSession && <p className="text-[10px] text-slate-600 mt-3 text-center">Chat disabled in history view mode</p>}
               </div>
            </div>

            {/* Jargon Dictionary */}
            {(result && 'jargonTranslator' in result) && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                   Jargon Dictionary
                </h3>
                <div className="space-y-6">
                  {((result as AnalysisResult).jargonTranslator || []).map((item, i) => (
                    <div key={i}>
                       <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.term}</div>
                       <div className="text-sm font-bold text-slate-700">{item.plainEnglish}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer & Trust */}
            <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-lg text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4">
                  AI Legal Disclaimer
               </div>
               <p className="text-[10px] text-amber-600 leading-relaxed italic font-medium">
                 LegalEase analysis is generated by AI and does not constitute formal legal advice. While highly accurate, always consult a qualified lawyer for critical agreements.
               </p>
               <div className="mt-6 flex items-center justify-center gap-6">
                  <div className="text-center">
                     <div className="text-lg font-bold text-amber-800">96.4%</div>
                     <div className="text-[8px] font-bold text-amber-600 uppercase">Consistency</div>
                  </div>
                  <div className="w-px h-8 bg-amber-200"></div>
                  <div className="text-center">
                     <div className="text-lg font-bold text-amber-800">Gemini 3</div>
                     <div className="text-[8px] font-bold text-amber-600 uppercase">Analysis Engine</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
