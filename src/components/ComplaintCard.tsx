import React from 'react';
import { Complaint } from '../types';
import { CATEGORIES_CONFIG } from '../data/savarData';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { SafeImage } from './SafeImage';

interface ComplaintCardProps {
  complaint: Complaint;
  onOpenDetails: () => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onOpenDetails }) => {
  const { language, toggleUpvote, currentUser } = useApp();
  const catConfig = CATEGORIES_CONFIG[complaint.category] || CATEGORIES_CONFIG.other;

  const hasUpvoted = currentUser ? complaint.upvotedByUserIds?.includes(currentUser.id) : false;

  const getStatusBadge = () => {
    switch (complaint.status) {
      case 'pending':
        return {
          label: language === 'bn' ? 'অপেক্ষমাণ (পর্যালোচনা)' : 'Pending Review',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
        };
      case 'approved':
        return {
          label: language === 'bn' ? 'অনুমোদিত ও পাবলিক' : 'Approved & Public',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: CheckCircle,
        };
      case 'in_progress':
        return {
          label: language === 'bn' ? 'কাজ চলমান' : 'In Progress',
          className: 'bg-orange-100 text-orange-900 border-orange-300',
          icon: Clock,
        };
      case 'solved':
        return {
          label: language === 'bn' ? 'সমাধান হয়েছে' : 'Resolved',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
          icon: CheckCircle2,
        };
      case 'rejected':
        return {
          label: language === 'bn' ? 'বাতিল' : 'Rejected',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: AlertCircle,
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString(
    language === 'bn' ? 'bn-BD' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group">
      
      {/* Image Preview & Badges */}
      <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={onOpenDetails}>
        <SafeImage
          src={complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
          alt={complaint.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          containerClassName="w-full h-full"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Metadata Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium">
          <span className={`flex items-center gap-1.5 ${statusBadge.className.replace(/bg-.* text-.* border-.*|font-bold/g, '').trim()} text-white/90`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusBadge.label}
          </span>
          <span className="text-white/70 font-mono tracking-wide">
            {complaint.trackingCode}
          </span>
        </div>

        {/* Category tag - now clean unboxed text */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="text-white text-xs font-semibold drop-shadow-md">
            {language === 'bn' ? catConfig.labelBn : catConfig.labelEn}
          </div>
          {complaint.status === 'solved' && (
            <div className="text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 drop-shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সমাধানকৃত' : 'Resolved'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col grow">
        
        {/* Ward & Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{complaint.ward}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate">{complaint.area}</span>
        </div>

        {/* Title */}
        <h4 
          onClick={onOpenDetails}
          className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 transition-colors line-clamp-2 mb-2 cursor-pointer"
        >
          {complaint.title}
        </h4>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 grow leading-relaxed">
          {complaint.description}
        </p>

        {/* Assigned Department or Note if available */}
        {complaint.department && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3 text-[11px] text-slate-700 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="font-semibold">{complaint.department}</span>
              {complaint.assignedOfficer && (
                <span className="text-slate-500"> ({complaint.assignedOfficer})</span>
              )}
            </div>
          </div>
        )}

        {/* Card Footer: Upvote, Comments, Details button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          
          {/* Upvote button */}
          <button
            onClick={() => toggleUpvote(complaint.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title={language === 'bn' ? 'আমিও ভুক্তভোগী / সমর্থন দিন' : 'Support this report'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
            <span>{complaint.upvotes}</span>
            <span className="hidden sm:inline text-[11px] font-normal">
              {language === 'bn' ? 'ভুক্তভোগী' : 'Affected'}
            </span>
          </button>

          {/* Comments count */}
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{complaint.comments?.length || 0}</span>
          </div>

          {/* View details button */}
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs ml-auto cursor-pointer hover:underline"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বিস্তারিত' : 'View'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
