"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  HelpCircle,
  Plus,
  Search,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  RotateCcw,
  Sparkles,
  Save,
  X,
  FileText,
  Tag,
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

interface KBArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  short_answer: string;
  content_markdown: string;
  prohibited_claims_guard: string[];
  is_published: boolean;
  published_version_number: number;
  created_at: string;
  updated_at: string;
}

interface KBVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  short_answer: string;
  content_markdown: string;
  change_summary: string;
  created_at: string;
}

interface KBEscalation {
  id: string;
  channel: string;
  user_identifier: string;
  user_name: string;
  query_text: string;
  bot_response: string;
  reason: string;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "getting-started", name: "Getting Started" },
  { id: "programmes", name: "Programmes & Pathways" },
  { id: "internship", name: "Clinical Internship" },
  { id: "certification", name: "Certification & Transcripts" },
  { id: "fees", name: "Fees & Pricing" },
  { id: "international", name: "International Recognition" }
];

export default function AdminKnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<"articles" | "versions" | "escalations">("articles");
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [escalations, setEscalations] = useState<KBEscalation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<KBArticle> | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [guardInput, setGuardInput] = useState("");

  // Version Diff State
  const [selectedArticleVersions, setSelectedArticleVersions] = useState<KBVersion[]>([]);
  const [selectedArticleForVersions, setSelectedArticleForVersions] = useState<KBArticle | null>(null);
  const [diffVersionA, setDiffVersionA] = useState<KBVersion | null>(null);
  const [diffVersionB, setDiffVersionB] = useState<KBVersion | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: articlesData, error: articlesErr } = await supabase
        .from("kb_articles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (articlesErr) throw articlesErr;
      setArticles(articlesData || []);

      const { data: escData, error: escErr } = await supabase
        .from("kb_escalations")
        .select("*")
        .order("created_at", { ascending: false });

      if (escErr) console.error("Escalations error:", escErr);
      setEscalations(escData || []);
    } catch (err: any) {
      toast.error("Failed to load knowledge base articles: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.short_answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenNewArticle = () => {
    setEditingArticle({
      slug: "",
      category: "getting-started",
      title: "",
      short_answer: "",
      content_markdown: "",
      prohibited_claims_guard: [],
      is_published: true,
      published_version_number: 1
    });
    setChangeSummary("Initial creation");
    setIsEditorOpen(true);
  };

  const handleEditArticle = (art: KBArticle) => {
    setEditingArticle({ ...art });
    setChangeSummary(`Update article v${art.published_version_number + 1}`);
    setIsEditorOpen(true);
  };

  const handleAddGuard = () => {
    if (!guardInput.trim() || !editingArticle) return;
    const currentGuards = editingArticle.prohibited_claims_guard || [];
    setEditingArticle({
      ...editingArticle,
      prohibited_claims_guard: [...currentGuards, guardInput.trim()]
    });
    setGuardInput("");
  };

  const handleRemoveGuard = (index: number) => {
    if (!editingArticle) return;
    const currentGuards = editingArticle.prohibited_claims_guard || [];
    setEditingArticle({
      ...editingArticle,
      prohibited_claims_guard: currentGuards.filter((_, i) => i !== index)
    });
  };

  const handleSaveArticle = async (publishNewVersion: boolean = true) => {
    if (!editingArticle?.title || !editingArticle?.slug || !editingArticle?.content_markdown) {
      toast.error("Please fill in Title, Slug, and Markdown Content.");
      return;
    }

    try {
      const supabase = createClient();
      let articleId = editingArticle.id;
      let versionNum = (editingArticle.published_version_number || 0) + (publishNewVersion && articleId ? 1 : 0);
      if (!articleId) versionNum = 1;

      const payload = {
        slug: editingArticle.slug.toLowerCase().trim().replace(/\s+/g, "-"),
        category: editingArticle.category || "getting-started",
        title: editingArticle.title,
        short_answer: editingArticle.short_answer || "",
        content_markdown: editingArticle.content_markdown,
        prohibited_claims_guard: editingArticle.prohibited_claims_guard || [],
        is_published: editingArticle.is_published ?? true,
        published_version_number: versionNum,
        updated_at: new Date().toISOString()
      };

      if (articleId) {
        const { error } = await supabase.from("kb_articles").update(payload).eq("id", articleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("kb_articles").insert(payload).select().single();
        if (error) throw error;
        articleId = data.id;
      }

      // Record Version History
      if (publishNewVersion) {
        await supabase.from("kb_versions").insert({
          article_id: articleId,
          version_number: versionNum,
          title: editingArticle.title,
          short_answer: editingArticle.short_answer || "",
          content_markdown: editingArticle.content_markdown,
          change_summary: changeSummary || `Version ${versionNum} published`
        });
      }

      toast.success(publishNewVersion ? `Version ${versionNum} Published!` : "Article Draft Saved!");
      setIsEditorOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Error saving article: " + err.message);
    }
  };

  const handleViewVersions = async (art: KBArticle) => {
    setSelectedArticleForVersions(art);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("kb_versions")
        .select("*")
        .eq("article_id", art.id)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setSelectedArticleVersions(data || []);
      if (data && data.length > 1) {
        setDiffVersionA(data[1]); // previous version
        setDiffVersionB(data[0]); // latest version
      } else if (data && data.length === 1) {
        setDiffVersionA(data[0]);
        setDiffVersionB(data[0]);
      }
      setActiveTab("versions");
    } catch (err: any) {
      toast.error("Failed to load versions: " + err.message);
    }
  };

  const handleRollback = async (ver: KBVersion) => {
    if (!selectedArticleForVersions) return;
    if (!confirm(`Are you sure you want to rollback "${selectedArticleForVersions.title}" to Version ${ver.version_number}?`)) return;

    try {
      const supabase = createClient();
      const newVersionNum = selectedArticleForVersions.published_version_number + 1;

      await supabase.from("kb_articles").update({
        title: ver.title,
        short_answer: ver.short_answer,
        content_markdown: ver.content_markdown,
        published_version_number: newVersionNum,
        updated_at: new Date().toISOString()
      }).eq("id", selectedArticleForVersions.id);

      await supabase.from("kb_versions").insert({
        article_id: selectedArticleForVersions.id,
        version_number: newVersionNum,
        title: ver.title,
        short_answer: ver.short_answer,
        content_markdown: ver.content_markdown,
        change_summary: `Rolled back to Version ${ver.version_number}`
      });

      toast.success(`Rolled back successfully to Version ${ver.version_number}!`);
      fetchData();
      setActiveTab("articles");
    } catch (err: any) {
      toast.error("Rollback failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admissions Knowledge Base Engine
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Single Source of Truth powering Website FAQs, WhatsApp AI Bot, and Versioned Documentation.
          </p>
        </div>

        <button
          onClick={handleOpenNewArticle}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Article
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "articles"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          Knowledge Articles ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "versions"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <History className="h-4 w-4" />
          Version History & Diff
        </button>
        <button
          onClick={() => setActiveTab("escalations")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "escalations"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          AI Escalations ({escalations.length})
        </button>
      </div>

      {/* TAB 1: ARTICLES LIST */}
      {activeTab === "articles" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, topics, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Table */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading knowledge base articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border border-dashed p-8 text-center text-slate-500">
              No articles found. Click "Create New Article" to add your first knowledge item.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                        {art.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                        v{art.published_version_number}
                      </span>
                      {art.is_published ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Clock className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900">{art.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{art.short_answer}</p>

                    {art.prohibited_claims_guard && art.prohibited_claims_guard.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-slate-500">AI Guards:</span>
                        {art.prohibited_claims_guard.map((g, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-xs rounded-full"
                          >
                            🚫 {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleViewVersions(art)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <History className="h-3.5 w-3.5 text-slate-500" />
                      History
                    </button>
                    <button
                      onClick={() => handleEditArticle(art)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit & Release
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSIONS & DIFF */}
      {activeTab === "versions" && (
        <div className="space-y-6">
          {!selectedArticleForVersions ? (
            <div className="bg-slate-50 border rounded-xl p-8 text-center text-slate-600">
              Select an article from the "Knowledge Articles" tab and click **History** to view its version trail and perform diffs.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                <div>
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    {selectedArticleForVersions.category}
                  </span>
                  <h2 className="text-xl font-bold">{selectedArticleForVersions.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedArticleForVersions(null)}
                  className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20"
                >
                  Back to Articles
                </button>
              </div>

              {/* Versions List */}
              <div className="grid gap-4">
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-600" /> Version History Audit Log
                </h3>

                {selectedArticleVersions.map((ver) => (
                  <div
                    key={ver.id}
                    className="bg-white border rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white text-xs font-bold font-mono">
                          v{ver.version_number}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(ver.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{ver.change_summary}</p>
                      <p className="text-xs text-slate-600 italic">"{ver.short_answer}"</p>
                    </div>

                    <button
                      onClick={() => handleRollback(ver)}
                      className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore Version {ver.version_number}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI ESCALATIONS & UNANSWERED QUERIES */}
      {activeTab === "escalations" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI Admissions Escalations & Guardrail Logs</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Questions asked on WhatsApp or Website that triggered AI guardrails (e.g., EB-3 visa requests, sample certificate requests, or unconfirmed fees). Use these to create new KB articles.
              </p>
            </div>
          </div>

          {escalations.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border p-8 text-center text-slate-500">
              No unanswered queries or escalations currently logged.
            </div>
          ) : (
            <div className="grid gap-3">
              {escalations.map((esc) => (
                <div key={esc.id} className="bg-white border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      Channel: {esc.channel.toUpperCase()} ({esc.user_name || esc.user_identifier || "Anonymous"})
                    </span>
                    <span>{new Date(esc.created_at).toLocaleString()}</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-2.5 rounded border">
                    "{esc.query_text}"
                  </p>

                  {esc.bot_response && (
                    <p className="text-xs text-slate-600 bg-emerald-50/50 p-2 rounded">
                      <strong>AI Guarded Output:</strong> {esc.bot_response}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDITOR MODAL */}
      {isEditorOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 text-white p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold">
                  {editingArticle.id ? `Edit Article (v${editingArticle.published_version_number})` : "Create New Knowledge Article"}
                </h3>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Article Title *</label>
                  <input
                    type="text"
                    value={editingArticle.title || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    placeholder="e.g. Level 1 Caregiver Fees"
                    className="w-full mt-1 rounded-lg border p-2.5 text-sm focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">URL Slug *</label>
                  <input
                    type="text"
                    value={editingArticle.slug || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    placeholder="e.g. level-1-fees"
                    className="w-full mt-1 rounded-lg border p-2.5 text-sm font-mono focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={editingArticle.category || "getting-started"}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="w-full mt-1 rounded-lg border p-2.5 text-sm focus:ring-emerald-500 outline-none"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Short Answer / WhatsApp Agent Summary (1-2 sentences)
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.short_answer || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, short_answer: e.target.value })}
                  placeholder="Compact answer sent directly by WhatsApp AI and displayed in quick preview cards."
                  className="w-full mt-1 rounded-lg border p-2.5 text-sm focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Full Article Content (Markdown) *
                </label>
                <textarea
                  rows={8}
                  value={editingArticle.content_markdown || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content_markdown: e.target.value })}
                  placeholder="Detailed markdown content for website knowledge base page..."
                  className="w-full mt-1 rounded-lg border p-2.5 text-sm font-mono focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Prohibited Claims Guard */}
              <div className="border rounded-xl p-4 bg-amber-50/50 space-y-2">
                <label className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  AI Prohibited Claims Guard (Zero Hallucination Rules)
                </label>
                <p className="text-xs text-amber-800">
                  Specify exact statements or promises the AI agent must NEVER make when answering queries related to this topic.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guardInput}
                    onChange={(e) => setGuardInput(e.target.value)}
                    placeholder="e.g. NIC guarantees an EB-3 visa"
                    className="flex-1 rounded-lg border p-2 text-xs focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleAddGuard}
                    type="button"
                    className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Add Rule
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(editingArticle.prohibited_claims_guard || []).map((guard, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs flex items-center gap-1"
                    >
                      🚫 {guard}
                      <button onClick={() => handleRemoveGuard(idx)} className="hover:text-red-700 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Change Log Summary</label>
                <input
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="e.g. Updated fee schedule for 2026 admissions"
                  className="w-full mt-1 rounded-lg border p-2.5 text-sm focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 bg-slate-50 p-4 border-t">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveArticle(true)}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
              >
                <Save className="h-4 w-4" />
                Publish Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
