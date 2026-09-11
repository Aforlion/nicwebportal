'use client';

import React, { useState } from 'react';

interface ProfileGateModalProps {
  isOpen: boolean;
  userId: string;
  enrollmentId: string;
  courseTitle: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProfileGateModal({
  isOpen,
  userId,
  enrollmentId,
  courseTitle,
  onSuccess,
  onClose,
}: ProfileGateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('Abuja FCT');
  const [lga, setLga] = useState('');
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [entryCategory, setEntryCategory] = useState('CAREER_SWITCHER');
  const [priorIndustry, setPriorIndustry] = useState('Education');
  const [priorOccupation, setPriorOccupation] = useState('');
  const [preTrainingMonthlyIncome, setPreTrainingMonthlyIncome] = useState('<₦50k');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          enrollmentId,
          gender,
          dob,
          stateOfOrigin,
          lga,
          educationLevel,
          entryCategory,
          priorIndustry,
          priorOccupation,
          preTrainingMonthlyIncome,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile verification');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 dark:border-slate-800 my-8">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full mb-1">
              Final Verification Step
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Unlock Your Official Certificate
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-semibold"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          🔒 <strong>National Caregiver Registry Notice:</strong> To issue your verified digital credential and national registry ID, please complete this brief demographic and career verification.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State of Origin *
              </label>
              <input
                type="text"
                value={stateOfOrigin}
                onChange={(e) => setStateOfOrigin(e.target.value)}
                placeholder="e.g. Abuja FCT, Lagos, Akwa Ibom"
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highest Education Qualification *
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="SSCE / WASSCE">SSCE / WASSCE</option>
                <option value="Diploma / OND / HND">Diploma / OND / HND</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Postgraduate / Master's">Postgraduate / Master's</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Career Pathway & Origin
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  How did you enter Caregiving? *
                </label>
                <select
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="FRESH_STARTER">Fresh Starter (First Job)</option>
                  <option value="CAREER_SWITCHER">Career Switcher (From Other Sector)</option>
                  <option value="UNEMPLOYED_CAREGIVER">Unemployed Caregiver</option>
                  <option value="PRACTICING_CAREGIVER">Practicing Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prior Industry / Sector
                </label>
                <select
                  value={priorIndustry}
                  onChange={(e) => setPriorIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="None">None (Fresh Student/Graduate)</option>
                  <option value="Education">Education / Teaching</option>
                  <option value="Hospitality">Hospitality / Customer Service</option>
                  <option value="Retail">Retail / Commerce</option>
                  <option value="Civil Service">Civil Service / Public Sector</option>
                  <option value="Informal Sector">Informal Sector / Freelance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prior Role / Occupation Title
                </label>
                <input
                  type="text"
                  value={priorOccupation}
                  onChange={(e) => setPriorOccupation(e.target.value)}
                  placeholder="e.g. Nursery Teacher, Sales Agent, N/A"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pre-Training Monthly Income *
                </label>
                <select
                  value={preTrainingMonthlyIncome}
                  onChange={(e) => setPreTrainingMonthlyIncome(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="₦0">₦0 (Unemployed / Dependent)</option>
                  <option value="<₦50k">Less than ₦50,000</option>
                  <option value="₦50k-₦100k">₦50,000 - ₦100,000</option>
                  <option value="₦100k+">Above ₦100,000</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Submit & Claim Certificate 🎓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
