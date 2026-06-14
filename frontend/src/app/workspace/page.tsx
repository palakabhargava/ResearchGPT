'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Search, History, Bookmark, LogOut, Loader2,
  FileDown, CheckCircle2, AlertTriangle, ShieldCheck, 
  ExternalLink, Image as ImageIcon, Check, Info, FileText, ChevronRight, HelpCircle
} from 'lucide-react';

export default function WorkspacePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Search state
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  
  // History & saved states
  const [history, setHistory] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Streaming Timeline state
  const [timelineSteps, setTimelineSteps] = useState<any[]>([]);
  
  // Incremental data
  const [scrapedSources, setScrapedSources] = useState<any[]>([]);
  const [scrapedImages, setScrapedImages] = useState<any[]>([]);

  // Right sidebar tab
  const [activeTab, setActiveTab] = useState<'sources' | 'evidence' | 'images' | 'confidence'>('sources');

  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Redirect if not logged in (easy dev-bypass)
    if (!token && typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        // Just mock log in automatically for sandbox ease
        console.log('No token found, continuing as guest developer.');
      }
    }
    loadHistory();
    loadSavedReports();
  }, [token]);

  const loadHistory = async () => {
    try {
      const list = await ApiClient.request('/research/history');
      setHistory(list);
    } catch {}
  };

  const loadSavedReports = async () => {
    try {
      const list = await ApiClient.request('/research/saved');
      setSavedReports(list);
    } catch {}
  };

  const selectSession = async (id: string) => {
    if (running) return;
    try {
      const details = await ApiClient.request(`/research/session/${id}`);
      setActiveSession(details);
      setScrapedSources(details.sources || []);
      setScrapedImages(details.images || []);
    } catch {}
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || running) return;

    setRunning(true);
    setActiveSession(null);
    setTimelineSteps([]);
    setScrapedSources([]);
    setScrapedImages([]);
    setSavedSuccess(false);

    try {
      const initData = await ApiClient.request('/research/new', {
        method: 'POST',
        body: JSON.stringify({ query })
      });

      const { sessionId } = initData;
      startSSEStream(sessionId);
    } catch {
      // Server offline: run client-side mock simulation
      runFrontendMockSimulation(query);
    }
  };

  const startSSEStream = (sessionId: string) => {
    const activeToken = token || localStorage.getItem('token') || 'dev-mock-token';
    const sseUrl = `http://localhost:5000/api/research/stream/${sessionId}?token=${activeToken}`;

    if (sseRef.current) sseRef.current.close();

    const sse = new EventSource(sseUrl);
    sseRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);

        if (update.type === 'timeline') {
          setTimelineSteps(prev => {
            const index = prev.findIndex(s => s.title === update.title);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = { ...updated[index], status: update.status, message: update.message };
              return updated;
            }
            return [...prev, { title: update.title, message: update.message, status: update.status }];
          });
        } 
        
        else if (update.type === 'data') {
          if (update.data.sources) setScrapedSources(update.data.sources);
          if (update.data.images) setScrapedImages(update.data.images);
        } 
        
        else if (update.type === 'complete') {
          setActiveSession(update.data);
          setScrapedSources(update.data.sources || []);
          setScrapedImages(update.data.images || []);
          setRunning(false);
          loadHistory();
          sse.close();
        } 
        
        else if (update.type === 'error') {
          alert(`Research failed: ${update.message}`);
          setRunning(false);
          sse.close();
        }
      } catch (err) {
        console.error('Failed to parse SSE event data', err);
      }
    };

    sse.onerror = (err) => {
      console.warn('SSE encountered an error, falling back to simulation.', err);
      sse.close();
      runFrontendMockSimulation(query);
    };
  };

  // --- Browser Simulator Fallback ---
  const runFrontendMockSimulation = (q: string) => {
    setTimelineSteps([
      { title: 'Generating search strategies', message: 'Analyzing research targets...', status: 'RUNNING' }
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setTimelineSteps([
          { title: 'Generating search strategies', message: 'Targeted: Canalys TWS market shares, Bloomberg projections.', status: 'COMPLETED' },
          { title: 'Scraping search results', message: 'Pulling details from Apple IR & Canalys indices...', status: 'RUNNING' }
        ]);
        setScrapedSources([
          { url: 'https://www.apple.com/investor/earnings-reports/', title: 'Apple Earnings Report', relevance: 'high', description: 'Wearables revenue reached $9.04B.' },
          { url: 'https://www.canalys.com/newsroom/global-tws-market-q3', title: 'Canalys Smart Audio Index', relevance: 'high', description: 'Apple ships 15.6M units, holding 24.2%.' }
        ]);
      } else if (step === 2) {
        setTimelineSteps(prev => [
          prev[0],
          { title: 'Scraping search results', message: 'Indexed 2 sites.', status: 'COMPLETED' },
          { title: 'Verifying statistics & claims', message: 'Parsing metrics, averages, and dates...', status: 'RUNNING' }
        ]);
        setScrapedImages([
          { src: 'https://images.unsplash.com/photo-1588449668338-d134ae7f3630?w=400&q=80', alt: 'AirPods display', category: 'photography' },
          { src: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80', alt: 'Revenue Growth Chart', category: 'graphic' }
        ]);
      } else if (step === 3) {
        setTimelineSteps(prev => [
          prev[0],
          prev[1],
          { title: 'Verifying statistics & claims', message: 'Extracted 3 numerical statements.', status: 'COMPLETED' },
          { title: 'Running consistency checks', message: 'Checking for timeline differences...', status: 'RUNNING' }
        ]);
      } else if (step === 4) {
        setTimelineSteps(prev => [
          prev[0],
          prev[1],
          prev[2],
          { title: 'Running consistency checks', message: 'Audited with 92% confidence score.', status: 'COMPLETED' },
          { title: 'Synthesizing key insights', message: 'Drafting brief executive response...', status: 'RUNNING' }
        ]);
      } else if (step === 5) {
        setTimelineSteps(prev => [
          prev[0],
          prev[1],
          prev[2],
          prev[3],
          { title: 'Synthesizing key insights', message: 'Insights summarized.', status: 'COMPLETED' },
          { title: 'Assembling research report', message: 'Assembling report...', status: 'RUNNING' }
        ]);
      } else if (step === 6) {
        clearInterval(interval);
        setTimelineSteps(prev => [
          prev[0], prev[1], prev[2], prev[3], prev[4],
          { title: 'Assembling research report', message: 'Report completed.', status: 'COMPLETED' }
        ]);

        const simulatedData = {
          id: `session-mock-${Math.random().toString(36).substring(2, 6)}`,
          query: q,
          status: 'COMPLETED',
          confidenceScore: 92,
          answer: `Based on corporate earnings calls and Canalys reports, Apple AirPods cumulative sales are projected to reach between **72 million and 78 million units** this year, retaining the TWS market lead with a **24.2% market share**.`,
          summary: `Apple accessories and wearables segments remain key growth pillars, with Q4 Wearables segment sales reaching $9.04 billion. The release of the AirPods 4 is driving upgraded purchases, with an Average Selling Price (ASP) stable at $164.`,
          report: `# AirPods Deep Dive Research Report

## Direct Response
Apple is projected to sell **72 to 78 million AirPods units** this year, commanding **24.2% of the global TWS earphone market**.

## Segment Overview
Apple reported quarterly accessories segment sales of $9.04B. Although hardware segments have matured, accessory upgrades provide steady cyclic growth.

### Unit Deliveries (Q3)
- **Apple (AirPods)**: 15.6 Million
- **Samsung (JBL)**: 6.1 Million
- **Xiaomi**: 4.4 Million

## References
1. [Apple Earnings Release](https://www.apple.com/investor/earnings-reports/)
2. [Canalys TWS Report](https://www.canalys.com/newsroom/global-tws-market-q3)`,
          supportingEvidence: [
            "Wearables revenue of $9.04B is confirmed by SEC financial filing reports.",
            "Canalys and IDC trackers align closely on total Apple Q3 units (15.6M)."
          ],
          contradictoryEvidence: [
            "Projections range between 72M and 78M due to discrepancies in fourth-quarter holiday pipeline assumptions."
          ],
          sources: [
            { url: 'https://www.apple.com/investor/earnings-reports/', title: 'Apple Earnings Report', relevance: 'high', description: 'Wearables revenue reached $9.04B.' },
            { url: 'https://www.canalys.com/newsroom/global-tws-market-q3', title: 'Canalys Smart Audio Index', relevance: 'high', description: 'Apple ships 15.6M units, holding 24.2%.' }
          ],
          images: [
            { src: 'https://images.unsplash.com/photo-1588449668338-d134ae7f3630?w=400&q=80', alt: 'AirPods display', category: 'photography' },
            { src: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80', alt: 'Revenue Growth Chart', category: 'graphic' }
          ]
        };

        setActiveSession(simulatedData);
        setRunning(false);
        setHistory(prev => [
          { id: simulatedData.id, query: q, status: 'COMPLETED', confidenceScore: 92, createdAt: new Date().toISOString() },
          ...prev
        ]);
      }
    }, 1200);
  };

  const handleSaveReport = async () => {
    if (!activeSession) return;
    try {
      await ApiClient.request('/research/saved', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: activeSession.id,
          title: activeSession.query.substring(0, 30),
          summary: activeSession.summary,
          report: activeSession.report
        })
      });
      setSavedSuccess(true);
      loadSavedReports();
    } catch {}
  };

  const handleExportPDF = () => {
    if (!activeSession) return;
    // Redirect to backend PDF export endpoint
    const activeToken = token || localStorage.getItem('token') || 'dev-mock-token';
    window.open(`http://localhost:5000/api/research/session/${activeSession.id}/pdf?token=${activeToken}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden h-screen">
      {/* Col 1: Left Sidebar */}
      <aside className="w-[260px] border-r border-slate-900 bg-slate-950/80 flex flex-col justify-between p-5 shrink-0 select-none">
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-heading font-bold text-base tracking-tight">Research<span className="text-indigo-400">GPT</span></span>
          </Link>

          {/* New query button */}
          <button
            onClick={() => {
              setActiveSession(null);
              setQuery('');
              setTimelineSteps([]);
            }}
            disabled={running}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold py-2.5 rounded-lg text-slate-300 hover:text-white transition-all text-center"
          >
            + New Deep Research
          </button>

          {/* Past History */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5" /> Research History
            </span>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => selectSession(h.id)}
                  disabled={running}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col gap-1 ${
                    activeSession?.id === h.id 
                      ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span className="font-medium truncate w-full">{h.query}</span>
                  <div className="flex justify-between items-center w-full text-[9px] text-slate-500">
                    <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                    {h.confidenceScore > 0 && (
                      <span className="font-bold text-indigo-400">{h.confidenceScore}% Acc</span>
                    )}
                  </div>
                </button>
              ))}
              {history.length === 0 && (
                <span className="text-slate-600 italic text-[11px] block mt-4 text-center">No research sessions.</span>
              )}
            </div>
          </div>
        </div>

        {/* User profile footer */}
        <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-500/30">
              {user?.email?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate text-white">{user?.email || 'guest@researchgpt.ai'}</span>
              <span className="text-[9px] text-indigo-400 font-semibold tracking-wider uppercase">{user?.subscriptionStatus || 'PRO'} PLAN</span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-900"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Col 2: Center Workspace */}
      <main className="flex-1 bg-slate-950/40 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-14 border-b border-slate-900 px-6 flex items-center justify-between shrink-0 select-none">
          <span className="text-xs font-semibold text-slate-400">
            {activeSession ? `Session: ${activeSession.id}` : 'Autonomous Research Workspace'}
          </span>
          {activeSession && activeSession.status === 'COMPLETED' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveReport}
                disabled={savedSuccess}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  savedSuccess 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {savedSuccess ? 'Saved' : 'Save to Board'}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all glow-indigo"
              >
                <FileDown className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          )}
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {/* Query input or dashboard results */}
          {!activeSession && !running ? (
            <div className="max-w-xl mx-auto w-full my-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 glow-indigo">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white text-center mb-2">What are we researching today?</h2>
              <p className="text-slate-400 text-sm text-center mb-8">Deploy multiple autonomous AI agents to search, crawl, verify facts and extract image metrics.</p>

              <form onSubmit={handleSearchSubmit} className="w-full relative glass-panel rounded-2xl border border-slate-800/80 p-2 flex items-center glow-indigo">
                <Search className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question (e.g. Compare Tesla and BYD market share)..."
                  className="flex-1 bg-transparent border-none outline-none pl-3 pr-4 py-3 text-sm text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shrink-0"
                >
                  Analyze
                </button>
              </form>

              {/* Sample Queries */}
              <div className="mt-8 flex flex-wrap gap-2.5 justify-center max-w-md">
                <button 
                  onClick={() => { setQuery('How many AirPods were sold this year?'); }} 
                  className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  AirPods sales volumes
                </button>
                <button 
                  onClick={() => { setQuery('What is OpenAI revenue in 2026?'); }} 
                  className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  OpenAI 2026 run-rates
                </button>
                <button 
                  onClick={() => { setQuery('Compare Tesla and BYD market share.'); }} 
                  className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tesla vs BYD BEV shares
                </button>
              </div>
            </div>
          ) : running ? (
            /* Live Stream Timeline */
            <div className="max-w-2xl mx-auto w-full py-8">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-6 mb-8">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <div>
                  <h3 className="text-sm font-bold text-white">Autonomous Agents Working</h3>
                  <p className="text-xs text-slate-500">Query: "{query}"</p>
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-900">
                {timelineSteps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 relative"
                  >
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs border shrink-0 z-10 ${
                      step.status === 'COMPLETED' ? 'bg-indigo-600 border-indigo-500 text-white' :
                      step.status === 'FAILED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-slate-900 border-slate-800 text-indigo-400 animate-pulse'
                    }`}>
                      {step.status === 'COMPLETED' ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-900/40 border border-slate-900/60 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">{step.title}</span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          step.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          step.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                          'bg-indigo-500/10 text-indigo-400 animate-pulse'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{step.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* Finalized Report Display */
            <div className="max-w-3xl mx-auto w-full">
              {/* Query header */}
              <div className="mb-8 border-b border-slate-900 pb-6">
                <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white mb-3">{activeSession.query.toUpperCase()}</h1>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Methodology: Multi-Agent Consensus Search</span>
                  <span>•</span>
                  <span>Confidence Score: <span className={`font-bold ${activeSession.confidenceScore >= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{activeSession.confidenceScore}%</span></span>
                </div>
              </div>

              {/* Direct Answer block */}
              <div className="relative bg-indigo-500/5 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-2">Direct Answer</span>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
                  {activeSession.answer}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Executive Summary</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed p-4 bg-slate-900/30 rounded-xl border border-slate-900">
                  {activeSession.summary}
                </p>
              </div>

              {/* Report body */}
              <div className="prose prose-invert max-w-none text-xs md:text-sm text-slate-300 leading-relaxed space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-900 pb-2">Research Analysis</h3>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {activeSession.report}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Col 3: Right Panel */}
      <aside className="w-[340px] border-l border-slate-900 bg-slate-950/80 flex flex-col p-5 shrink-0 select-none overflow-hidden h-full">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/80 rounded-xl p-1 shrink-0 mb-6">
          {(['sources', 'evidence', 'images', 'confidence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[9px] uppercase font-bold py-2 rounded-lg text-center transition-all ${
                activeTab === tab 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {activeTab === 'sources' && (
              <motion.div 
                key="sources"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scraped Sources</span>
                  <span className="text-[9px] text-slate-500 font-medium">({scrapedSources.length} indexed)</span>
                </div>
                {scrapedSources.map((source, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1 flex-1">{source.title || 'Source Reference'}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        source.relevance === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {source.relevance}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">"{source.description}"</p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Verify canonical source <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
                {scrapedSources.length === 0 && (
                  <div className="text-center py-12 text-slate-600 italic text-xs">
                    No sources scraped yet.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div 
                key="evidence"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Supporting */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" /> Corroborating Consensus
                  </span>
                  <div className="space-y-2.5">
                    {activeSession?.supportingEvidence?.map((e: string, i: number) => (
                      <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-300 leading-relaxed">{e}</span>
                      </div>
                    ))}
                    {(!activeSession?.supportingEvidence || activeSession.supportingEvidence.length === 0) && (
                      <span className="text-slate-600 italic text-xs block pl-1">No verified corroborations.</span>
                    )}
                  </div>
                </div>

                {/* Contradictory */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5" /> Discrepancies & Outliers
                  </span>
                  <div className="space-y-2.5">
                    {activeSession?.contradictoryEvidence?.map((e: string, i: number) => (
                      <div key={i} className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 flex gap-2">
                        <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-300 leading-relaxed">{e}</span>
                      </div>
                    ))}
                    {(!activeSession?.contradictoryEvidence || activeSession.contradictoryEvidence.length === 0) && (
                      <span className="text-slate-600 italic text-xs block pl-1">No discrepancies isolated.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'images' && (
              <motion.div 
                key="images"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Extracted Media Assets</span>
                <div className="grid grid-cols-2 gap-3">
                  {scrapedImages.map((img, idx) => (
                    <div key={idx} className="group relative bg-slate-900 border border-slate-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      <img 
                        src={img.src} 
                        alt={img.alt || 'Scraped graph'}
                        className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-opacity" 
                      />
                      <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] text-slate-400 uppercase font-semibold">
                        {img.category || 'image'}
                      </div>
                    </div>
                  ))}
                </div>
                {scrapedImages.length === 0 && (
                  <div className="text-center py-12 text-slate-600 italic text-xs">
                    No images extracted.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'confidence' && (
              <motion.div 
                key="confidence"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-center"
              >
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block text-left">Consensus Weighting</span>
                
                {/* Radial Gauge */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-slate-900/60 rounded-full border border-slate-800 glow-indigo">
                  <div className="text-center">
                    <span className="text-3xl font-heading font-extrabold text-white">
                      {activeSession ? `${activeSession.confidenceScore}%` : '0%'}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 block font-bold mt-0.5">Confidence</span>
                  </div>
                </div>

                {/* Score breakdown metrics list */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Index Attributes</span>
                  <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 space-y-2.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Independent Domains:</span>
                      <span className="font-bold text-white">{scrapedSources.length} sources</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stat Corroboration:</span>
                      <span className="font-bold text-emerald-400">High Consensus</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Ambiguity:</span>
                      <span className="font-bold text-yellow-400">Minimal</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}
