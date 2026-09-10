"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Search,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  DollarSign,
  Globe,
  Award,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface KBArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  short_answer: string;
  content_markdown: string;
  prohibited_claims_guard: string[];
}

const CATEGORIES = [
  { id: "all", name: "All Topics", icon: HelpCircle },
  { id: "getting-started", name: "Getting Started", icon: BookOpen },
  { id: "programmes", name: "Programmes & Pathways", icon: Award },
  { id: "internship", name: "Clinical Internship", icon: FileCheck },
  { id: "fees", name: "Fees & Pricing", icon: DollarSign },
  { id: "certification", name: "Certificates & Transcripts", icon: ShieldCheck },
  { id: "international", name: "International Recognition", icon: Globe }
];

export default function PublicFAQPage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fee Calculator State
  const [includeLevel1, setIncludeLevel1] = useState(true);
  const [includeLevel2, setIncludeLevel2] = useState(true);
  const [includeInternship, setIncludeInternship] = useState(true);
  const [includeMembership, setIncludeMembership] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("kb_articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setArticles(data || []);
    } catch (err: any) {
      console.error("Error loading FAQs:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.short_answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content_markdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFeedback = async (articleId: string, isHelpful: boolean) => {
    if (feedbackGiven[articleId]) return;

    try {
      const supabase = createClient();
      await supabase.from("kb_feedback").insert({
        article_id: articleId,
        is_helpful: isHelpful
      });

      setFeedbackGiven({ ...feedbackGiven, [articleId]: true });
      toast.success(isHelpful ? "Thank you for your feedback!" : "Thanks! We'll improve this answer.");
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  // Fee Calculation Logic
  const level1Cost = includeLevel1 ? 200000 : 0;
  const level2Cost = includeLevel2 ? 150000 : 0;
  const minInternshipCost = includeInternship ? 150000 : 0;
  const maxInternshipCost = includeInternship ? 200000 : 0;
  const membershipCost = includeMembership ? 5000 : 0;

  const totalMin = level1Cost + level2Cost + minInternshipCost + membershipCost;
  const totalMax = level1Cost + level2Cost + maxInternshipCost + membershipCost;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero Banner */}
        <div className="text-center space-y-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> NIC Knowledge Hub & Admissions Guide
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
            Everything You Need to Know About NIC Pathways & Admissions
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Verified, accurate information on Nursing Assistant certification, clinical internships in Abuja & Lagos, fees, and international qualification verification.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4 relative">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search queries (e.g. fees, clinical internship, US EB-3, QQI Ireland)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white/95 text-slate-900 pl-12 pr-4 py-3.5 text-base shadow-lg focus:ring-2 focus:ring-emerald-400 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main FAQ Accordion List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              Frequently Asked Questions ({filteredArticles.length})
            </h2>

            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading verified answers...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-slate-500 space-y-3">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No matching questions found.</p>
                <p className="text-xs text-slate-500">
                  Try searching for terms like "fees", "internship", "Abuja", "certificate", or "EB-3".
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((art) => {
                  const isExpanded = expandedId === art.id;
                  return (
                    <div
                      key={art.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm hover:border-slate-300"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : art.id)}
                        className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {art.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {art.title}
                          </h3>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-4 animate-in fade-in duration-200">
                          {/* Short Answer Preview */}
                          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5 text-xs text-emerald-950 font-medium">
                            <strong>Quick Summary:</strong> {art.short_answer}
                          </div>

                          {/* Full Markdown Body */}
                          <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed space-y-2">
                            {art.content_markdown.split("\n\n").map((paragraph, idx) => (
                              <p key={idx}>{paragraph}</p>
                            ))}
                          </div>

                          {/* Prohibited Claim Notice if any */}
                          {art.prohibited_claims_guard && art.prohibited_claims_guard.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                              <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Official Policy Note: </span>
                                NIC credentials are verifiable online. NIC does not guarantee visas or state-issued equivalence for overseas authorities.
                              </div>
                            </div>
                          )}

                          {/* Feedback Section */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
                            <span>Was this answer helpful?</span>
                            {feedbackGiven[art.id] ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Feedback Received
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleFeedback(art.id, true)}
                                  className="px-2.5 py-1 rounded bg-white border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors flex items-center gap-1 font-medium"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" /> Yes
                                </button>
                                <button
                                  onClick={() => handleFeedback(art.id, false)}
                                  className="px-2.5 py-1 rounded bg-white border hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors flex items-center gap-1 font-medium"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" /> No
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Dynamic Pathway Cost Calculator & WhatsApp Agent Banner */}
          <div className="space-y-6">
            {/* Dynamic Pathway Fee Calculator Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Calculator className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold">Pathway Cost Calculator</h3>
              </div>
              <p className="text-xs text-slate-500">
                Select your intended pathway components to calculate the official transparent total cost:
              </p>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={includeLevel1}
                      onChange={(e) => setIncludeLevel1(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    Level 1 Fundamentals (120 hrs)
                  </div>
                  <span className="text-xs font-bold text-slate-900">₦200,000</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={includeLevel2}
                      onChange={(e) => setIncludeLevel2(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    Level 2 Geriatrics (54 hrs)
                  </div>
                  <span className="text-xs font-bold text-slate-900">₦150,000</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={includeInternship}
                      onChange={(e) => setIncludeInternship(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    Clinical Internship (Abuja/Lagos)
                  </div>
                  <span className="text-xs font-bold text-slate-900">₦150k - ₦200k</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={includeMembership}
                      onChange={(e) => setIncludeMembership(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    NIC Professional Membership
                  </div>
                  <span className="text-xs font-bold text-slate-900">₦5,000</span>
                </label>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Total Estimated Fee
                </span>
                <div className="text-2xl font-black text-white">
                  ₦{totalMin.toLocaleString()} {minInternshipCost !== maxInternshipCost ? `- ₦${totalMax.toLocaleString()}` : ""}
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  ✓ Includes examinations, practical assessments & certificate generation. Zero hidden charges.
                </p>
              </div>

              <Link
                href="/programs"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
              >
                Enroll in Pathway <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* WhatsApp AI Assistant Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden border border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">WhatsApp AI Agent</h4>
                  <p className="text-xs text-emerald-300">Instant 24/7 Admissions Support</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Have specific questions about intake dates, clinical internship in Abuja, or admission requirements? Chat directly with our AI Admissions Agent on WhatsApp.
              </p>

              <a
                href="https://wa.me/2347025018079?text=Hello%20NIC%20Admissions,%20I%20have%20questions%20about%20the%20Nursing%20Assistant%20Pathway."
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30"
              >
                Chat on WhatsApp <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
