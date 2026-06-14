'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Shield, CheckCircle, BarChart3, Clock, 
  FileDown, ChevronRight, Sparkles, ArrowRight, 
  Layers, Database, Zap, Quote, Star
} from 'lucide-react';

export default function LandingPage() {
  const [activeDemoQuery, setActiveDemoQuery] = useState('');
  const [demoStage, setDemoStage] = useState(0);
  const [demoMessages, setDemoMessages] = useState<string[]>([]);
  const [simulatedReport, setSimulatedReport] = useState('');

  const demoQueries = [
    { text: 'How many AirPods were sold this year?', key: 'airpods' },
    { text: 'What is OpenAI revenue in 2026?', key: 'openai' },
    { text: 'Compare Tesla and BYD market share.', key: 'ev' }
  ];

  useEffect(() => {
    if (!activeDemoQuery) return;

    // Simulate Agent Steps
    setDemoStage(1);
    setDemoMessages(['[Search Agent] Generating queries...', '[Search Agent] Accessing Google & Context.dev API...']);
    setSimulatedReport('');

    const t1 = setTimeout(() => {
      setDemoStage(2);
      setDemoMessages(prev => [...prev, '[Verification Agent] Scraped 4 matching pages.', '[Verification Agent] Analyzing tables and numerical data points...']);
    }, 1800);

    const t2 = setTimeout(() => {
      setDemoStage(3);
      setDemoMessages(prev => [...prev, '[Fact Checker] Verifying assertions.', '[Fact Checker] Cross-checking Tesla Q1 deliveries. Confidence Score: 94%.']);
    }, 3600);

    const t3 = setTimeout(() => {
      setDemoStage(4);
      setDemoMessages(prev => [...prev, '[Summarization Agent] Generating direct response & executive briefing.']);
    }, 5400);

    const t4 = setTimeout(() => {
      setDemoStage(5);
      setDemoMessages(prev => [...prev, '[Report Generator] Structuring final PDF & Markdown layout...']);
      
      if (activeDemoQuery === 'airpods') {
        setSimulatedReport(`# AirPods Market Share Analysis
## Direct Response
Apple is projected to sell **72 to 78 million AirPods units** this year, commanding **24.2% of the global TWS earphone market**.

## Key Statistics
- **Wearables Q4 Revenue**: $9.04 Billion.
- **Q3 Shipments**: 15.6 Million units (Canalys).
- **Average Price (ASP)**: $164 due to AirPods Pro 2 demand.`);
      } else if (activeDemoQuery === 'openai') {
        setSimulatedReport(`# OpenAI Revenue Trajectory
## Direct Response
OpenAI is on track to hit **$11.6 billion in revenue by 2026**, scaling up from its current annualized run-rate of **$3.4 billion**.

## Key Statistics
- **ChatGPT Plus Subscriptions**: $1.9 Billion (58% of total).
- **API & Enterprise Sales**: $1.0 Billion (30% of total).
- **Current Valuation**: $157 Billion post-money.`);
      } else {
        setSimulatedReport(`# Tesla & BYD Global BEV Comparison
## Direct Response
**Tesla lead pure BEVs in Q1 with 19% global share** (386,810 deliveries), followed by **BYD with 15% share** (300,114 deliveries).

## Key Statistics
- **Tesla BEV Deliveries**: 386,810 units.
- **BYD BEV Deliveries**: 300,114 units.
- **BYD Total Electrified Share**: 21% (including hybrids).`);
      }
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeDemoQuery]);

  const triggerDemo = (queryKey: string) => {
    setActiveDemoQuery(queryKey);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">Research<span className="text-indigo-400">GPT</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/workspace" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all glow-indigo hover:scale-[1.02] active:scale-[0.98]">
            Launch Workspace
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Agent Autonomous Deep Research Engine
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-gradient"
        >
          Verify the Web. <br />Research Autonomously.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
        >
          Don't just search. ResearchGPT deploys a network of specialized agents to crawl, scrape, verify data tables, fact-check contradictions, and compile beautiful PDF briefings.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/workspace" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all glow-indigo hover:scale-[1.03] flex items-center justify-center gap-2 group">
            Start Autonomous Research
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#demo" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
            Watch Live Demo
          </a>
        </motion.div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Autonomous Agent Simulator</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Select a complex question below to watch our 5-agent pipeline scrape, verify, and compile insights in real time.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Query Selection Left */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-4">
            {demoQueries.map((q) => (
              <button
                key={q.key}
                onClick={() => triggerDemo(q.key)}
                className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between ${
                  activeDemoQuery === q.key 
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/5' 
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium text-sm md:text-base">{q.text}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
            {!activeDemoQuery && (
              <div className="text-center text-xs text-slate-500 italic mt-2">
                Click a query above to start the simulator.
              </div>
            )}
          </div>

          {/* Timeline & Output Right */}
          <div className="lg:col-span-3 glass-panel rounded-2xl p-6 relative min-h-[400px] flex flex-col border border-slate-800 glow-indigo">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-slate-500 font-mono">Agent Orchestrator Log</span>
            </div>

            {/* Simulated Streams */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="font-mono text-xs text-slate-400 space-y-2.5 overflow-y-auto max-h-[220px] mb-4">
                {activeDemoQuery ? (
                  <>
                    {demoMessages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        key={i} 
                        className={
                          msg.includes('Search') ? 'text-blue-400' :
                          msg.includes('Verification') ? 'text-purple-400' :
                          msg.includes('Fact Checker') ? 'text-emerald-400' : 'text-slate-300'
                        }
                      >
                        {msg}
                      </motion.div>
                    ))}
                    {demoStage < 5 && (
                      <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                        <Zap className="w-3 h-3 animate-bounce" />
                        <span>Processing next agent layer...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 italic py-16">
                    Waiting for simulator trigger...
                  </div>
                )}
              </div>

              {/* Simulated Report Output */}
              <AnimatePresence>
                {simulatedReport && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl max-h-[200px] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Scraped & Verified Report</span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Consensus Audited
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {simulatedReport}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Elite Deep Research Toolbox</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Unlike basic search apps, ResearchGPT connects structural scraper APIs with deep cognitive checkers.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">5-Agent Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Runs search, claim verification, discrepancy checking, summarization, and compilation agents sequentially.</p>
          </div>
          {/* Feature 2 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Context.dev Scraper</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Leverages advanced scrapers, website crawlers, image extractors, and structured JSON tools natively.</p>
          </div>
          {/* Feature 3 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Confidence Audits</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Computes consensus indexes based on source metrics, contradictions, and information detail metrics.</p>
          </div>
          {/* Feature 4 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Evidence Explorer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Audits supporting evidence against contradictory projections and lets users trace facts to source URLs.</p>
          </div>
          {/* Feature 5 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Timeline Trackers</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Provides interactive progress streams showing what each agent is researching in real-time.</p>
          </div>
          {/* Feature 6 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Styled PDF Exports</h3>
            <h4 className="sr-only">PDF Exports</h4>
            <p className="text-sm text-slate-400 leading-relaxed">Generate beautiful, branded executive reports complete with statistics tables, logos, and indexes.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Flexible Subscription Models</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Access multi-agent deep research credits matching your business operational requirements.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Free Starter</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-heading font-extrabold">$0</span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">Basic research queries using standard search crawls.</p>
              <ul className="mt-8 space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> 10 queries per month</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Single agent lookups</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Standard web citation logs</li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-8 w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-center py-2.5 rounded-lg text-sm font-medium transition-all">
              Try Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="glass-panel rounded-2xl p-8 border-2 border-indigo-500 relative flex flex-col justify-between glow-indigo">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg">
              Most Popular
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Professional Research</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-heading font-extrabold">$49</span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">Complete multi-agent pipeline with deep scrapes.</p>
              <ul className="mt-8 space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Unlimited research queries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Full 5-Agent parallel orchestrator</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Context.dev advanced markdown scrape</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> High-res images & chart extraction</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Clean PDF downloads & saves</li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2.5 rounded-lg text-sm font-medium transition-all glow-indigo">
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Enterprise Scale</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-heading font-extrabold">Custom</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">Custom API integrations and Dedicated scraper crawlers.</p>
              <ul className="mt-8 space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> All Pro features included</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Custom JSON extraction schemas</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Dedicated support desk</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Team workspaces & audit logs</li>
              </ul>
            </div>
            <button className="mt-8 w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 py-2.5 rounded-lg text-sm font-medium transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Endorsed by Top Analysts</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Read how venture capitalists and investment managers verify intelligence timelines using ResearchGPT.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-indigo-400 fill-indigo-400" />)}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "ResearchGPT cut our competitor delivery audits from hours to seconds. The Verification agent isolates statistical outliers and highlights table inconsistencies automatically."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                AM
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Alex Mercer</h4>
                <p className="text-xs text-slate-500">VC Partner, Alpha Ventures</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-indigo-400 fill-indigo-400" />)}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "Finding market share data with Context.dev scraped directly to markdown makes compiling investment briefings extremely seamless. The PDF layouts look beautiful."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                SC
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sarah Chen</h4>
                <p className="text-xs text-slate-500">Equity Researcher, Apex Capital</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-indigo-400 fill-indigo-400" />)}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "Having direct source links mapped to every single number generated has completely eliminated AI hallucination concerns. It is the ultimate tool for corporate research."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                DB
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">David Byrne</h4>
                <p className="text-xs text-slate-500">Director of Strategy, Vercel Inc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight">Research<span className="text-indigo-400">GPT</span></span>
          </div>
          <span className="text-xs text-slate-500">© 2026 ResearchGPT. Designed for Advanced Agentic Coding.</span>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
