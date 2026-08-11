import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  UserCheck,
  UserX,
  FileText,
  Phone,
  Mail,
  Calendar,
  Award,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('verdits_admin_user') || '{}');

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/auth/admin/lawyers');
      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error('Failed to fetch lawyers:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('verdits_admin_token');
        localStorage.removeItem('verdits_admin_user');
        navigate('/');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load lawyer records. Ensure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('verdits_admin_token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchLawyers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('verdits_admin_token');
    localStorage.removeItem('verdits_admin_user');
    navigate('/');
  };

  const handleUpdateStatus = async (lawyerId, nextStatus) => {
    const actionLabel = nextStatus === 'approved' ? 'Approve' : 'Reject';
    const confirmMessage = nextStatus === 'approved'
      ? "Are you sure you want to Approve this lawyer's account?"
      : "Are you sure you want to Reject and remove this lawyer registration application?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(lawyerId);
      const { data } = await api.patch(`/auth/admin/lawyers/${lawyerId}/status`, { status: nextStatus });

      if (nextStatus === 'rejected' || data.deleted) {
        setLawyers((prev) => prev.filter((l) => String(l._id || l.id) !== String(lawyerId)));
        if (selectedLawyer && String(selectedLawyer._id || selectedLawyer.id) === String(lawyerId)) {
          setSelectedLawyer(null);
        }
      } else {
        const updatedLawyer = data.lawyer || {};
        const updatedStatus = 'active';
        const updatedIsVerified = true;

        setLawyers((prev) =>
          prev.map((l) =>
            String(l._id || l.id) === String(lawyerId)
              ? {
                  ...l,
                  accountStatus: updatedStatus,
                  isVerified: updatedIsVerified,
                  lawyerProfile: {
                    ...(l.lawyerProfile || {}),
                    isVerified: updatedIsVerified,
                  },
                }
              : l
          )
        );

        if (selectedLawyer && String(selectedLawyer._id || selectedLawyer.id) === String(lawyerId)) {
          setSelectedLawyer((prev) => ({
            ...prev,
            accountStatus: updatedStatus,
            isVerified: updatedIsVerified,
            lawyerProfile: {
              ...(prev?.lawyerProfile || {}),
              isVerified: updatedIsVerified,
            },
          }));
        }
      }
    } catch (err) {
      console.error(`Failed to update lawyer status to ${nextStatus}:`, err);
      alert(err.response?.data?.message || `Failed to ${actionLabel.toLowerCase()} lawyer.`);
    } finally {
      setActionLoadingId('');
    }
  };

  // Filter calculations
  const pendingLawyers = useMemo(
    () => lawyers.filter((l) => l.accountStatus === 'pending_approval' || (l.accountStatus !== 'active' || l.isVerified !== true)),
    [lawyers]
  );

  const approvedLawyers = useMemo(
    () => lawyers.filter((l) => l.accountStatus === 'active' && l.isVerified === true),
    [lawyers]
  );

  const filteredLawyers = useMemo(() => {
    let list = lawyers;

    if (activeTab === 'pending') {
      list = pendingLawyers;
    } else if (activeTab === 'approved') {
      list = approvedLawyers;
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      list = list.filter((l) =>
        (l.name || '').toLowerCase().includes(query) ||
        (l.email || '').toLowerCase().includes(query) ||
        (l.phone || '').toLowerCase().includes(query) ||
        (l.barEnrollmentNumber || l.barId || '').toLowerCase().includes(query) ||
        (l.specialization || '').toLowerCase().includes(query)
      );
    }

    return list;
  }, [lawyers, activeTab, pendingLawyers, approvedLawyers, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-[#161b22]/90 backdrop-blur-md border-b border-[#30363d] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f1d15f] to-[#d6a400] text-zinc-950 flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(241,209,95,0.25)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">VERDiTS</span>
                <span className="bg-[#f1d15f]/10 text-[#f1d15f] border border-[#f1d15f]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-zinc-400">Lawyer Verification & Credentials Management</p>
            </div>
          </div>

          {/* External Verification Quick Link & Admin Info */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.telanganabarcouncil.org/search-by-enrollment-number/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1117] hover:bg-[#1c2128] border border-[#f1d15f]/40 text-[#f1d15f] text-xs font-bold transition hover:border-[#f1d15f] shadow-sm"
              title="Open Official Telangana Bar Council Verification Tool"
            >
              <span>Telangana Bar Council Search</span>
              <ExternalLink size={14} />
            </a>

            <div className="h-8 w-px bg-[#30363d] hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white">{adminUser.firstName || 'Administrator'}</p>
                <p className="text-[11px] text-zinc-400">{adminUser.email || 'admin@verdits.com'}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-950/20 text-xs font-bold text-red-400 transition-all hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm active:scale-[0.98]"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab('pending')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-950/30 border-[#f1d15f] shadow-[0_0_20px_rgba(241,209,95,0.15)]'
                : 'bg-[#161b22] border-[#30363d] hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Pending Approval</span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{pendingLawyers.length}</p>
            <p className="text-xs text-zinc-400 mt-1">Requires Bar Enrollment verification</p>
          </div>

          <div
            onClick={() => setActiveTab('approved')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-[#161b22] border-[#30363d] hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Approved Lawyers</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{approvedLawyers.length}</p>
            <p className="text-xs text-zinc-400 mt-1">Active & verified accounts</p>
          </div>

          <div
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              activeTab === 'all'
                ? 'bg-blue-950/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : 'bg-[#161b22] border-[#30363d] hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">Total Registrations</span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Award size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{lawyers.length}</p>
            <p className="text-xs text-zinc-400 mt-1">All lawyer accounts in system</p>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-[#f1d15f] text-zinc-950 shadow-md'
                  : 'bg-[#0d1117] text-zinc-400 hover:text-white border border-[#30363d]'
              }`}
            >
              <span>Pending Requests</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'pending' ? 'bg-zinc-950 text-[#f1d15f]' : 'bg-[#30363d] text-zinc-300'}`}>
                {pendingLawyers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-[#0d1117] text-zinc-400 hover:text-white border border-[#30363d]'
              }`}
            >
              <span>Approved Lawyers</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-[#30363d] text-zinc-300'}`}>
                {approvedLawyers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-zinc-700 text-white shadow-md'
                  : 'bg-[#0d1117] text-zinc-400 hover:text-white border border-[#30363d]'
              }`}
            >
              <span>All Records</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'all' ? 'bg-zinc-900 text-zinc-300' : 'bg-[#30363d] text-zinc-300'}`}>
                {lawyers.length}
              </span>
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search enrollment #, name, email..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#f1d15f]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchLawyers}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-zinc-400 hover:text-[#f1d15f] hover:border-[#f1d15f] transition disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Lawyer Table / Cards Section */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={32} className="animate-spin text-[#f1d15f]" />
              <p className="text-sm font-semibold">Loading lawyer verification records...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400 flex flex-col items-center justify-center gap-3">
              <AlertCircle size={36} />
              <p className="text-sm font-bold">{error}</p>
              <button
                type="button"
                onClick={fetchLawyers}
                className="mt-2 px-4 py-2 bg-[#f1d15f] text-zinc-950 font-bold rounded-xl text-xs"
              >
                Retry
              </button>
            </div>
          ) : filteredLawyers.length === 0 ? (
            <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-zinc-500">
                <FileText size={32} />
              </div>
              <p className="text-base font-bold text-white">No Lawyer Records Found</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                {searchTerm
                  ? `No lawyer records matching "${searchTerm}".`
                  : activeTab === 'pending'
                  ? 'There are currently no lawyer verification requests awaiting review.'
                  : activeTab === 'approved'
                  ? 'No approved lawyer accounts found.'
                  : 'No rejected lawyer accounts found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] bg-[#0d1117]/60 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <th className="py-4 px-6">Lawyer Details</th>
                    <th className="py-4 px-6">Bar Council Enrollment #</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Registration Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d] text-sm">
                  {filteredLawyers.map((lawyer) => {
                    const lawyerId = lawyer._id || lawyer.id;
                    const isPending = lawyer.accountStatus === 'pending_approval' || (!lawyer.accountStatus && !lawyer.isVerified);
                    const isApproved = lawyer.accountStatus === 'active' || lawyer.isVerified === true;
                    const isRejected = lawyer.accountStatus === 'rejected';

                    return (
                      <tr key={lawyerId} className="hover:bg-[#1c2128]/50 transition-colors group">
                        {/* Name & Role */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f1d15f] to-[#d6a400] text-zinc-950 font-extrabold text-sm flex items-center justify-center shrink-0">
                              {(lawyer.name || lawyer.firstName || 'L').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-[#f1d15f] transition-colors">
                                {lawyer.name || `${lawyer.firstName || ''} ${lawyer.lastName || ''}`}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {lawyer.specialization || 'Advocate'} {lawyer.experienceYears ? `• ${lawyer.experienceYears} yrs exp` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Bar Council Enrollment # */}
                        <td className="py-4 px-6 font-mono font-bold text-[#f1d15f]">
                          {lawyer.barEnrollmentNumber || lawyer.barId ? (
                            <span className="bg-[#f1d15f]/10 border border-[#f1d15f]/30 px-3 py-1 rounded-lg">
                              {lawyer.barEnrollmentNumber || lawyer.barId}
                            </span>
                          ) : (
                            <span className="text-zinc-500 italic text-xs">Not Specified</span>
                          )}
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-6 text-xs text-zinc-300">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 truncate max-w-[200px]" title={lawyer.email}>
                              <Mail size={12} className="text-zinc-500 shrink-0" />
                              <span className="truncate">{lawyer.email || 'N/A'}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-zinc-400">
                              <Phone size={12} className="text-zinc-500 shrink-0" />
                              <span>{lawyer.phone || 'N/A'}</span>
                            </p>
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-6 text-xs text-zinc-400 whitespace-nowrap">
                          {formatDate(lawyer.createdAt)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock size={12} />
                              Pending Approval
                            </span>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              <XCircle size={12} />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLawyer(lawyer)}
                              className="px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#0d1117] text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-500 transition"
                            >
                              View Details
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoadingId === lawyerId}
                                  onClick={() => handleUpdateStatus(lawyerId, 'approved')}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <UserCheck size={14} />
                                  <span>Approve</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoadingId === lawyerId}
                                  onClick={() => handleUpdateStatus(lawyerId, 'rejected')}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/60 hover:border-red-600 text-xs font-bold transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                                >
                                  <UserX size={14} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                disabled={actionLoadingId === lawyerId}
                                onClick={() => handleUpdateStatus(lawyerId, 'rejected')}
                                className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/40 text-xs font-bold transition disabled:opacity-50"
                              >
                                Revoke Approval
                              </button>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                disabled={actionLoadingId === lawyerId}
                                onClick={() => handleUpdateStatus(lawyerId, 'approved')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800/40 text-xs font-bold transition disabled:opacity-50"
                              >
                                Re-Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Lawyer Details Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#f1d15f] to-[#d6a400] text-zinc-950 font-extrabold text-xl flex items-center justify-center">
                  {(selectedLawyer.name || selectedLawyer.firstName || 'L').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedLawyer.name || `${selectedLawyer.firstName || ''} ${selectedLawyer.lastName || ''}`}
                  </h3>
                  <p className="text-xs text-[#f1d15f] font-semibold">{selectedLawyer.specialization || 'Lawyer'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Verification Link Warning Box */}
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#f1d15f]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#f1d15f]">
                  Bar Council Enrollment Verification
                </span>
                <span className="font-mono text-sm font-bold text-white px-2.5 py-1 rounded bg-[#161b22] border border-[#30363d]">
                  {selectedLawyer.barEnrollmentNumber || selectedLawyer.barId || 'Not Provided'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Verify this enrollment number directly on the official Telangana Bar Council search page before granting dashboard access.
              </p>
              <a
                href="https://www.telanganabarcouncil.org/search-by-enrollment-number/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#f1d15f] hover:bg-[#d6a400] text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Verify on Telangana Bar Council Search Page</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Profile Fields */}
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Email Address</span>
                  <span className="font-semibold text-white truncate block">{selectedLawyer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Mobile Phone</span>
                  <span className="font-semibold text-white block">{selectedLawyer.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Years of Experience</span>
                  <span className="font-semibold text-white block">{selectedLawyer.experienceYears || 0} Years</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Registered Date</span>
                  <span className="font-semibold text-white block">{formatDate(selectedLawyer.createdAt)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                <span className="text-zinc-500 block mb-0.5">Current Account Status</span>
                <span className="font-bold text-white capitalize">{selectedLawyer.accountStatus || 'pending_approval'}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-[#30363d] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="px-4 py-2.5 rounded-xl border border-[#30363d] text-xs font-bold text-zinc-400 hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedLawyer._id || selectedLawyer.id, 'rejected');
                }}
                className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold transition"
              >
                Reject Application
              </button>

              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedLawyer._id || selectedLawyer.id, 'approved');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
              >
                Approve & Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
