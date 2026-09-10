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
  FileCheck,
  RotateCcw
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
  prohibited_claims_guard?: string[];
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

// Fallback seed articles ensuring 100% reliability even if database network is slow
const FALLBACK_ARTICLES: KBArticle[] = [
  {
    id: "f-1",
    slug: "how-to-enrol-and-register",
    category: "getting-started",
    title: "How do I enrol or register for an NIC programme?",
    short_answer: "You can enrol directly online on our Programs page by selecting your desired course, creating an account, and completing payment via Paystack.",
    content_markdown: "### How to Enrol in an NIC Programme\n\n1. **Browse Programmes:** Visit https://www.nicnigeria.org/programs to view available courses.\n2. **Select Your Pathway:** Choose Level 1 Fundamentals or a Level 2 Specialisation (e.g. Geriatrics & Gerontology).\n3. **Create Account:** Click 'Enroll Now' and create your student portal profile.\n4. **Complete Payment:** Pay securely online via debit card, USSD, or bank transfer using Paystack.\n5. **Instant Access:** Start your self-paced online modules immediately after payment confirmation."
  },
  {
    id: "f-2",
    slug: "certificates-and-transcripts-awarded",
    category: "certification",
    title: "What certificate and transcript will I receive upon completion?",
    short_answer: "You receive an official NIC Nursing Assistant Certificate and Academic Transcript featuring a digital QR code for instant global verification.",
    content_markdown: "### Official Credentials Issued\n\nUpon successful completion of training and clinical internship:\n1. **NIC Certificate:** Official Nursing Assistant / Caregiver Certificate issued by National Institute of Caregivers Nigeria.\n2. **Academic Transcript:** Documenting completed modules, learning hours, and practical competencies.\n3. **Digital Verification QR Code:** Embedded on every certificate, allowing third-party employers globally to verify your credential on our public registry at https://www.nicnigeria.org/verify."
  },
  {
    id: "f-3",
    slug: "total-fee-breakdown",
    category: "fees",
    title: "What is the total cost for the full Nursing Assistant Pathway?",
    short_answer: "Estimated total cost is ₦505,000 – ₦555,000, including Level 1 (₦200k), Level 2 (₦150k), Clinical Internship (₦150k-₦200k), and ₦5,000 Membership.",
    content_markdown: "### Complete Pathway Fee Breakdown\n\n- **Level 1 Fundamentals:** ₦200,000\n- **Level 2 Specialisation (Geriatrics):** ₦150,000\n- **Clinical Internship:** ₦150,000 – ₦200,000 (Abuja: ₦200k, Lagos: ₦150k, Uyo: ₦200k)\n- **NIC Professional Membership:** ₦5,000\n- **Total Estimated Cost:** ₦505,000 – ₦555,000\n\n**Transparency Guarantee:** Zero hidden fees for practical assessments or certificate issuance."
  },
  {
    id: "f-4",
    slug: "clinical-internship-details",
    category: "internship",
    title: "How does the Clinical Internship work and where is it conducted?",
    short_answer: "Supervised 3-month clinical placement in accredited healthcare facilities (capped at 20 students per cohort). Abuja (₦200k) is active; Lagos (₦150k), Uyo (₦200k) coming soon.",
    content_markdown: "### Clinical Internship Component & Scheduling\n\n- **Duration:** Exactly 3 Months per cohort.\n- **Cohort Capacity:** Maximum 20 students per cohort.\n- **Location Pricing:** Abuja (₦200,000 Active), Lagos (₦150,000), Uyo (₦200,000), Osun/Enugu/Kaduna TBD.\n- **Late-Join Window:** Students may join up to 30 days after start if space permits.\n- **Documentation:** Official Internship Completion Letter stating facility name, dates, total hours, and supervisor signature."
  },
  {
    id: "f-5",
    slug: "international-recognition-eb3-qqi",
    category: "international",
    title: "Is NIC certification recognised in the US, Ireland (QQI), or Australia?",
    short_answer: "NIC credentials are verifiable globally on our public registry. However, foreign employers/regulators determine equivalency; NIC is not automatically equivalent to US CNA or QQI Level 5.",
    content_markdown: "### Credential Verification vs. International Recognition\n\n- **Digital Verification:** Foreign employers, immigration agencies, and institutions can independently verify your certificate and transcript on NIC's public digital registry at https://www.nicnigeria.org/verify.\n- **US EB-3 Visa / CNA:** NIC training builds a verifiable professional profile. However, NIC does NOT guarantee EB-3 visa sponsorship or state CNA licensing.\n- **Ireland QQI Level 5:** NIC qualifications should NOT be presented as automatically equivalent to QQI Level 5. Acceptance depends on the specific Irish employer or evaluation authority."
  },
  {
    id: "f-6",
    slug: "admission-entry-requirements",
    category: "getting-started",
    title: "What are the entry and admission requirements?",
    short_answer: "No prior healthcare experience is required for Level 1. Open to O-Level (SSCE), ND, HND, BSc holders, and career changers.",
    content_markdown: "### Admission Requirements\n\n- **Foundational Caregiver (Level 1):** Open to all interested applicants. No prior medical or caregiving experience is required.\n- **Educational Background:** Minimum SSCE / O-Level, ND, HND, or Degree holders are welcome.\n- **Technical Requirements:** A smartphone, tablet, or laptop with internet access for self-paced online modules.\n- **International Applicants:** Eligible to study remotely from any country."
  },
  {
    id: "f-7",
    slug: "sample-certificates-and-transcripts-policy",
    category: "certification",
    title: "Can I get a sample/specimen certificate or transcript before enrolling?",
    short_answer: "NIC does not issue specimen or sample copies of certificates/transcripts to prospective applicants to safeguard document security.",
    content_markdown: "### Sample Certificate & Transcript Policy\n\nNIC **does not provide specimen or sample copies** of certificates, transcripts, or internship verification letters to prospective applicants.\n\n**Security & Assurance:** Official credentials featuring digital QR verification codes are issued upon course completion."
  }
];

export default function PublicFAQPage() {
  const [articles, setArticles] = useState<KBArticle[]>(FALLBACK_ARTICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchArticlesFromDatabase();
  }, []);

  async function fetchArticlesFromDatabase() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("kb_articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setArticles(data);
      }
    } catch (err) {
      console.warn("Using fallback articles due to fetch error:", err);
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setExpandedId(null);
  };

  // Advanced Tokenized Search & Synonym Matching
  const getFilteredArticles = () => {
    const rawQuery = searchQuery.trim().toLowerCase();

    if (!rawQuery) {
      if (selectedCategory === "all") return articles;
      return articles.filter((art) => art.category === selectedCategory);
    }

    // Tokenize search query and normalize common synonyms/words
    const normalizedQuery = rawQuery
      .replace(/enrolment|enrollment|enrolling|enrolled|registration|register/g, "enrol enroll register join apply")
      .replace(/certificates|certificate|certification|transcripts|transcript/g, "certificate cert transcript credential")
      .replace(/programmes|programs|courses|course|training/g, "programme program course training level")
      .replace(/cost|price|pricing|fees|fee|pay/g, "cost fee price tuition payment");

    const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 1);

    const scored = articles.map((art) => {
      const title = art.title.toLowerCase();
      const shortAns = art.short_answer.toLowerCase();
      const content = art.content_markdown.toLowerCase();
      const category = art.category.toLowerCase();
      const slug = art.slug.toLowerCase();

      let score = 0;

      queryTokens.forEach((token) => {
        if (title.includes(token)) score += 6;
        if (shortAns.includes(token)) score += 4;
        if (slug.includes(token)) score += 3;
        if (category.includes(token)) score += 2;
        if (content.includes(token)) score += 1;
      });

      // Bonus if explicitly selected category matches
      if (selectedCategory !== "all" && art.category === selectedCategory) {
        score += 2;
      }

      return { article: art, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.article);
  };

  const filteredArticles = getFilteredArticles();

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
            Frequently Asked Questions & Admissions Knowledge
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Verified answers on Nursing Assistant certification, clinical internships in Abuja & Lagos, fees, and international qualification verification.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4 relative">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search queries (e.g. Certificate, enrol, fees, internship, Abuja, EB-3)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white/95 text-slate-900 pl-12 pr-10 py-3.5 text-base shadow-lg focus:ring-2 focus:ring-emerald-400 outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={handleResetFilters}
                  className="absolute right-4 top-3.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery(""); // Reset search query when picking a topic tab
                }}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory !== "all"
                  ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                  : "Frequently Asked Questions"}{" "}
                <span className="text-sm text-slate-500 font-normal">({filteredArticles.length})</span>
              </h2>

              {(searchQuery || selectedCategory !== "all") && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filters
                </button>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-slate-500 space-y-4 shadow-sm">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No matching questions found for "{searchQuery}".</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try searching with keywords like <strong>"enrol"</strong>, <strong>"certificate"</strong>, <strong>"fees"</strong>, <strong>"internship"</strong>, or <strong>"Abuja"</strong>.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> View All Questions
                </button>
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
