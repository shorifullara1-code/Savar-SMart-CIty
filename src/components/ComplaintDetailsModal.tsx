import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_CONFIG, SAVAR_WARDS, SOLVED_PRESET_IMAGES } from '../data/savarData';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  AlertTriangle,
  User,
  Phone,
  Calendar,
  CheckCircle,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { SafeImage } from './SafeImage';

export const ComplaintDetailsModal: React.FC = () => {
  const {
    selectedComplaintId,
    setSelectedComplaintId,
    complaints,
    language,
    toggleUpvote,
    addComment,
    currentUser,
    isAdmin,
    approveComplaint,
    markComplaintAsSolved,
    updateComplaintStatus,
    showToast,
  } = useApp();

  const [commentInput, setCommentInput] = useState('');
  const [showAdminActionBox, setShowAdminActionBox] = useState(false);
  const [solutionInput, setSolutionInput] = useState('');
  const [solvedImageSelect, setSolvedImageSelect] = useState(SOLVED_PRESET_IMAGES[0].url);
  const [assignedDept, setAssignedDept] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [adminNote, setAdminNote] = useState('');

  if (!selectedComplaintId) return null;

  const complaint = complaints.find((c) => c.id === selectedComplaintId);
  if (!complaint) return null;

  const catConfig = CATEGORIES_CONFIG[complaint.category] || CATEGORIES_CONFIG.other;
  const hasUpvoted = currentUser ? complaint.upvotedByUserIds?.includes(currentUser.id) : false;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(complaint.id, commentInput);
    setCommentInput('');
  };

  const handleQuickApprove = () => {
    approveComplaint(complaint.id, assignedDept, assignedOfficer, adminNote);
    setShowAdminActionBox(false);
  };

  const handleMarkSolved = () => {
    if (!solutionInput.trim()) {
      showToast(
        language === 'bn' ? 'দয়া করে সমাধানের বিবরণ ও পদক্ষেপ লিখুন' : 'Please provide resolution details',
        'warning'
      );
      return;
    }
    markComplaintAsSolved(complaint.id, {
      solutionDetails: solutionInput.trim(),
      solvedImageUrl: solvedImageSelect,
    });
    setShowAdminActionBox(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(language === 'bn' ? 'লিংক কপি করা হয়েছে' : 'Link copied to clipboard');
    }
  };

  // Timeline progress calculation
  const getTimelineSteps = () => {
    const steps = [
      {
        titleBn: 'অভিযোগ দাখিল',
        titleEn: 'Submitted',
        desc: complaint.createdAt 
          ? new Date(complaint.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US') 
          : '',
        completed: true,
        current: complaint.status === 'pending',
      },
      {
        titleBn: 'পৌরসভা অনুমোদন',
        titleEn: 'Admin Approved',
        desc: complaint.approvedAt 
          ? new Date(complaint.approvedAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US') 
          : (complaint.status === 'pending' ? 'যাচাই চলছে' : 'অনুমোদিত'),
        completed: ['approved', 'in_progress', 'solved'].includes(complaint.status),
        current: complaint.status === 'approved',
      },
      {
        titleBn: 'কাজ চলমান',
        titleEn: 'In Progress',
        desc: complaint.department ? complaint.department.split('(')[0] : 'দায়িত্ব বণ্টন',
        completed: ['in_progress', 'solved'].includes(complaint.status),
        current: complaint.status === 'in_progress',
      },
      {
        titleBn: 'সমাধান সম্পন্ন',
        titleEn: 'Resolved',
        desc: complaint.solvedAt 
          ? new Date(complaint.solvedAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US') 
          : 'অপেক্ষমাণ',
        completed: complaint.status === 'solved',
        current: complaint.status === 'solved',
      },
    ];
    return steps;
  };

  const timelineSteps = getTimelineSteps();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              {complaint.trackingCode}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(complaint.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'bn' ? 'প্রিন্ট বা পিডিএফ রসিদ সেভ করুন' : 'Print or save PDF receipt'}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Share report"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedComplaintId(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">
          
          {/* Status Alert Banner */}
          {complaint.status === 'pending' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {language === 'bn' 
                    ? 'এই অভিযোগটি বর্তমানে পৌরসভার পর্যালোচনায় রয়েছে। অ্যাডমিন অনুমোদন করলে এটি পাবলিক ফিডে প্রদর্শিত হবে।' 
                    : 'This report is awaiting Savar Municipal review. Once approved, it will be visible publicly.'}
                </span>
              </div>
              {isAdmin && (
                <button
                  onClick={handleQuickApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer shrink-0"
                >
                  {language === 'bn' ? 'এখনই অনুমোদন করুন' : 'Approve Now'}
                </button>
              )}
            </div>
          )}

          {/* Title & Category Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${catConfig.bgLight}`}>
                {language === 'bn' ? catConfig.labelBn : catConfig.labelEn}
              </span>

              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium border border-slate-200">
                {complaint.ward}
              </span>

              {complaint.urgency === 'emergency' && (
                <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md font-bold border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'জরুরি পরিস্থিতি' : 'Critical Hazard'}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {complaint.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{complaint.exactLocation}</span>
              <span className="text-slate-300">•</span>
              <span>{complaint.area}</span>
            </div>
          </div>

          {/* Stepper Progress Timeline */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'সমাধান অগ্রগতির ধাপসমূহ' : 'Resolution Progress Timeline'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timelineSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    step.current
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium ring-1 ring-emerald-400'
                      : step.completed
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-slate-100/60 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">ধাপ {idx + 1}</span>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="font-semibold text-xs truncate">
                    {language === 'bn' ? step.titleBn : step.titleEn}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photos: Before & After Comparison if Solved */}
          {complaint.status === 'solved' && complaint.solvedImageUrl ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'পূর্বের অবস্থা বনাম সমাধানের পর (Before & After)' : 'Before vs After Resolution'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-rose-200 relative group">
                  <SafeImage 
                    src={complaint.imageUrl} 
                    alt="Before" 
                    className="w-full h-48 sm:h-56 object-cover" 
                    containerClassName="w-full h-48 sm:h-56"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {language === 'bn' ? 'পূর্বের ক্ষতিগ্রস্ত অবস্থা' : 'Before / Problem'}
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-emerald-300 relative group">
                  <SafeImage 
                    src={complaint.solvedImageUrl} 
                    alt="After" 
                    className="w-full h-48 sm:h-56 object-cover" 
                    containerClassName="w-full h-48 sm:h-56"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পৌরসভা কর্তৃক সমাধানের পর' : 'After / Resolved'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-100 relative">
              <SafeImage
                src={complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'}
                alt={complaint.title}
                className="w-full h-full max-h-72 object-cover"
                containerClassName="w-full max-h-72"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'bn' ? 'অভিযোগের বিবরণ' : 'Description'}
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Official Municipal Response / Solved Details */}
          {(complaint.solutionDetails || complaint.adminNote || complaint.department) && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>{language === 'bn' ? 'পৌরসভা কর্তৃপক্ষের পদক্ষেপ ও মন্তব্য' : 'Official Savar Pourashava Action'}</span>
              </div>

              {complaint.department && (
                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-emerald-900">{language === 'bn' ? 'দায়িত্বপ্রাপ্ত শাখা:' : 'Assigned Dept:'} </span>
                  {complaint.department}
                  {complaint.assignedOfficer && (
                    <span className="text-slate-600"> • {complaint.assignedOfficer}</span>
                  )}
                </div>
              )}

              {complaint.adminNote && (
                <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  <span className="font-semibold text-slate-900">{language === 'bn' ? 'অ্যাডমিন নোট:' : 'Admin Note:'} </span>
                  {complaint.adminNote}
                </div>
              )}

              {complaint.solutionDetails && (
                <div className="text-xs text-emerald-950 bg-white p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'চূড়ান্ত সমাধান প্রতিবেদন:' : 'Final Resolution Summary:'}</span>
                  </div>
                  {complaint.solutionDetails}
                </div>
              )}
            </div>
          )}

          {/* Reporter & Contact Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>{language === 'bn' ? 'দাখিলকারী:' : 'Reported By:'} <strong>{complaint.reporterName}</strong></span>
              {isAdmin && (
                <span className="font-mono text-emerald-700 ml-2 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {complaint.reporterMobile}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleUpvote(complaint.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  hasUpvoted
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আমিও ভুক্তভোগী' : 'Me Too'}</span>
                <span>({complaint.upvotes})</span>
              </button>
            </div>
          </div>

          {/* Authority Quick Actions if Admin is viewing */}
          {isAdmin && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  {language === 'bn' ? 'পৌরসভা অ্যাডমিন নিয়ন্ত্রণ' : 'Pourashava Authority Controls'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdminActionBox(!showAdminActionBox)}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  {showAdminActionBox 
                    ? (language === 'bn' ? 'প্যানেল লুকান' : 'Hide Controls') 
                    : (language === 'bn' ? 'স্ট্যাটাস ও সমাধান সম্পাদন' : 'Edit Status & Solve')}
                </button>
              </div>

              {showAdminActionBox && (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'স্ট্যাটাস পরিবর্তন করুন' : 'Change Status'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'approved', 'in_progress', 'solved'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateComplaintStatus(complaint.id, st)}
                          className={`px-3 py-1.5 rounded-lg border font-semibold capitalize cursor-pointer ${
                            complaint.status === st
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {complaint.status !== 'solved' && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="font-semibold text-emerald-800">
                        {language === 'bn' ? 'সমস্যার সমাধান (Mark as Solved) সম্পন্ন করুন:' : 'Complete & Mark as Solved:'}
                      </div>
                      <textarea
                        rows={2}
                        value={solutionInput}
                        onChange={(e) => setSolutionInput(e.target.value)}
                        placeholder={
                          language === 'bn'
                            ? 'কীভাবে সমাধান করা হয়েছে লিখুন (যেমন: নতুন বিটুমিন ঢালাই সম্পন্ন, ড্রেন পরিষ্কার করা হয়েছে)...'
                            : 'Explain how the issue was resolved...'
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />

                      <div>
                        <span className="block text-[11px] text-slate-500 mb-1">
                          {language === 'bn' ? 'সমাধানের পর বাস্তব ছবি (After Photo):' : 'Pick Solved After Photo:'}
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {SOLVED_PRESET_IMAGES.map((img, i) => (
                            <img
                              key={i}
                              src={img.url}
                              alt={img.label}
                              onClick={() => setSolvedImageSelect(img.url)}
                              className={`h-12 w-full object-cover rounded border cursor-pointer ${
                                solvedImageSelect === img.url ? 'ring-2 ring-emerald-600' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={img.label}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleMarkSolved}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        {language === 'bn' ? 'সমাধান সম্পন্ন করুন ও প্রকাশ করুন' : 'Confirm & Mark as Solved'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Citizen Comments & Updates Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'bn' 
                  ? `নাগরিক মন্তব্য ও মাঠপর্যায়ের আপডেট (${complaint.comments?.length || 0})` 
                  : `Citizen Updates & Feedback (${complaint.comments?.length || 0})`}
              </span>
            </h4>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'আপনার মতামত বা এলাকার বর্তমান পরিস্থিতি জানান...'
                    : 'Share on-the-ground update or feedback...'
                }
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'পোস্ট' : 'Send'}</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      comm.isAuthority
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {comm.isAuthority ? (
                          <span className="flex items-center gap-1 text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {comm.userName} (পৌরসভা কর্তৃপক্ষ)
                          </span>
                        ) : (
                          <span>{comm.userName}</span>
                        )}
                        <span className="text-[10px] font-normal text-slate-400">• {comm.userArea}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{comm.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  {language === 'bn' ? 'এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।' : 'No comments yet. Be the first to post an update.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            {language === 'bn' ? 'সাভার পৌরসভা ডিজিটাল নাগরিক সেবা' : 'Savar Pourashava Digital Citizen Service'}
          </div>
          <button
            onClick={() => setSelectedComplaintId(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
