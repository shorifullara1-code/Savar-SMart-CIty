import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAVAR_WARDS, CATEGORIES_CONFIG, DEMO_PRESET_IMAGES } from '../data/savarData';
import { ProblemCategory, UrgencyLevel } from '../types';
import { 
  X, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Check, 
  Image as ImageIcon,
  Clock,
  Sparkles
} from 'lucide-react';

export const NewComplaintModal: React.FC = () => {
  const {
    isNewComplaintOpen,
    setIsNewComplaintOpen,
    currentUser,
    setIsRegisterOpen,
    submitComplaint,
    language,
    showToast,
    wards,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('roads');
  const [area, setArea] = useState<string>(currentUser?.area || wards[0].areaName);
  const [ward, setWard] = useState<string>(currentUser?.ward || wards[0].wardNumber);
  const [exactLocation, setExactLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [imageUrl, setImageUrl] = useState<string>(DEMO_PRESET_IMAGES[0].url);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [customImageInput, setCustomImageInput] = useState('');

  if (!isNewComplaintOpen) return null;

  const handleAreaChange = (selectedArea: string) => {
    setArea(selectedArea);
    const matched = wards.find((w) => w.areaName === selectedArea);
    if (matched) {
      setWard(matched.wardNumber);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setIsCustomImage(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast(
        language === 'bn' ? 'অভিযোগ জমা দিতে প্রথমে নাম ও মোবাইল দিয়ে রেজিস্ট্রেশন করুন' : 'Please register with name and mobile to submit',
        'warning'
      );
      setIsRegisterOpen(true);
      return;
    }

    if (!title.trim() || !description.trim() || !exactLocation.trim()) {
      showToast(
        language === 'bn' ? 'দয়া করে শিরোনাম, স্থান ও বিস্তারিত বিবরণ পূরণ করুন' : 'Please fill all required fields',
        'warning'
      );
      return;
    }

    const finalImage = isCustomImage && customImageInput.trim() ? customImageInput.trim() : imageUrl;

    submitComplaint({
      title: title.trim(),
      description: description.trim(),
      category,
      area,
      ward,
      exactLocation: exactLocation.trim(),
      urgency,
      imageUrl: finalImage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 relative shrink-0">
          <button
            onClick={() => setIsNewComplaintOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {language === 'bn' ? 'সাভার নাগরিক সমস্যা রিপোর্ট করুন' : 'Submit Savar Civic Complaint'}
              </h3>
              <p className="text-xs text-emerald-100">
                {language === 'bn' 
                  ? 'রাস্তাঘাট, ড্রেন, ময়লা বা অন্যান্য সমস্যার তথ্য পৌরসভাকে জানান' 
                  : 'Report roads, drainage, garbage, or civic hazards directly to authorities'}
              </p>
            </div>
          </div>
        </div>

        {/* Notice of Moderation (User constraint: admin approve korle public hobe) */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-2.5 flex items-center gap-2.5 text-xs text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {language === 'bn' 
              ? 'নিয়মাবলী: আপনার অভিযোগটি জমা হওয়ার পর পৌরসভা অ্যাডমিন যাচাই করে অনুমোদন দিলে এটি পাবলিক ফিডে প্রদর্শিত হবে।' 
              : 'Notice: Your report will be verified and approved by Savar Municipal Admin before appearing on public feed.'}
          </span>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto grow">
          
          {/* User Info Bar */}
          {currentUser ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">{language === 'bn' ? 'অভিযোগকারী:' : 'Reporter:'} </span>
                <span className="font-semibold text-slate-800">{currentUser.name}</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-slate-600 font-mono">{currentUser.mobile}</span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                {currentUser.area}
              </span>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-xs text-rose-800">
              <span>{language === 'bn' ? 'অভিযোগ জমা দিতে প্রথমে প্রোফাইল রেজিস্টার করুন' : 'Please register profile first'}</span>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium cursor-pointer"
              >
                {language === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}
              </button>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'bn' ? 'সমস্যার ধরন / বিভাগ নির্বাচন করুন' : 'Problem Category'} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES_CONFIG) as ProblemCategory[]).map((catKey) => {
                const conf = CATEGORIES_CONFIG[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategory(catKey);
                      const matchingPreset = DEMO_PRESET_IMAGES.find((p) => p.category === catKey);
                      if (matchingPreset && !isCustomImage) {
                        setImageUrl(matchingPreset.url);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {language === 'bn' ? conf.labelBn : conf.labelEn}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-1 self-end" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অভিযোগের সংক্ষিপ্ত শিরোনাম' : 'Complaint Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'bn' 
                  ? 'যেমন: গেন্ডা বাজার প্রধান সড়কের পিচ উঠে গিয়ে বড় গর্তের সৃষ্টি' 
                  : 'e.g. Broken road surface with deep potholes causing accidents'
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              required
            />
          </div>

          {/* Area & Ward Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'সাভার, বাইপাইল বা আশুলিয়ার এলাকা' : 'Savar, Baipail or Ashulia Area'} *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white cursor-pointer font-medium text-slate-800"
                >
                  <optgroup label="সাভার পৌরসভা (ওয়ার্ড ১-৯)">
                    {wards.filter(w => w.wardNumber.startsWith('Ward')).map((w) => (
                      <option key={w.areaName} value={w.areaName}>
                        {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="বাইপাইল ও ডিইপিজেড জোন">
                    {wards.filter(w => w.wardNumber.includes('Baipayl')).map((w) => (
                      <option key={w.areaName} value={w.areaName}>
                        {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="আশুলিয়া ও জামগড়া জোন">
                    {wards.filter(w => w.wardNumber.includes('Ashulia')).map((w) => (
                      <option key={w.areaName} value={w.areaName}>
                        {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="স্মৃতিসৌধ, বিরুলিয়া ও অন্যান্য সংলগ্ন এলাকা">
                    {wards.filter(w => !w.wardNumber.startsWith('Ward') && !w.wardNumber.includes('Baipayl') && !w.wardNumber.includes('Ashulia')).map((w) => (
                      <option key={w.areaName} value={w.areaName}>
                        {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'নির্দিষ্ট স্থান / ল্যান্ডমার্ক / সড়ক নাম' : 'Exact Landmark / Street'} *
              </label>
              <input
                type="text"
                value={exactLocation}
                onChange={(e) => setExactLocation(e.target.value)}
                placeholder={
                  language === 'bn' 
                    ? 'যেমন: সাভার থানা সংলগ্ন মসজিদ মোড়, ২ নং গলি' 
                    : 'e.g. Near Savar Model Thana South Gate'
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                required
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'bn' ? 'জরুরিতা মাত্রা (Urgency)' : 'Urgency Level'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'low', labelBn: 'সাধারণ', labelEn: 'Normal', color: 'border-slate-300 hover:bg-slate-50' },
                { key: 'medium', labelBn: 'মাঝারি', labelEn: 'Medium', color: 'border-amber-300 text-amber-900 bg-amber-50/50' },
                { key: 'high', labelBn: 'জরুরি', labelEn: 'Urgent', color: 'border-orange-300 text-orange-900 bg-orange-50/50' },
                { key: 'emergency', labelBn: 'মারাত্মক ঝুঁকিপূর্ণ', labelEn: 'Critical Hazard', color: 'border-rose-400 text-rose-900 bg-rose-50/60' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setUrgency(item.key as UrgencyLevel)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                    urgency === item.key
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                      : item.color
                  }`}
                >
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'সমস্যার বিস্তারিত বিবরণ' : 'Detailed Description'} *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'সমস্যাটি কতদিন ধরে বিদ্যমান, এর ফলে কী ধরণের ক্ষতি হচ্ছে বা জনদুর্ভোগ হচ্ছে তা বিস্তারিত লিখুন...'
                  : 'Describe how long this issue has persisted, how it affects citizens, and what needs immediate attention...'
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              required
            />
          </div>

          {/* Photo attachment & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>{language === 'bn' ? 'সমস্যার বাস্তব ছবি / প্রমাণ' : 'Photo Proof of Issue'}</span>
              <span className="text-[11px] text-slate-500">{language === 'bn' ? 'ডিভাইস থেকে আপলোড অথবা প্রিসেট বাছাই' : 'Upload or pick realistic preset'}</span>
            </label>

            {/* Current Selected Image Preview */}
            <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-100 flex items-center justify-center">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Issue preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded">
                    {language === 'bn' ? 'নির্বাচিত ছবি' : 'Selected Photo'}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-1 text-xs">
                  <ImageIcon className="w-6 h-6" />
                  <span>{language === 'bn' ? 'ছবি যুক্ত নেই' : 'No photo chosen'}</span>
                </div>
              )}
            </div>

            {/* Options to upload or pick presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-50/50 hover:bg-emerald-50/50 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড' : 'Upload from device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsCustomImage(!isCustomImage)}
                  className="py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ছবির লিংক (URL)' : 'Paste URL'}
                </button>
              </div>

              {isCustomImage && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageInput}
                    onChange={(e) => {
                      setCustomImageInput(e.target.value);
                      setImageUrl(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden font-mono"
                  />
                </div>
              )}

              {/* Realistic Preset Pickers */}
              <div>
                <p className="text-[11px] text-slate-500 mb-1">
                  {language === 'bn' ? 'অথবা দ্রুত বাছাই করুন বাস্তব সাভার সমস্যার প্রিসেট ছবি:' : 'Or pick a realistic demo problem photo:'}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {DEMO_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setIsCustomImage(false);
                      }}
                      className={`relative rounded-lg overflow-hidden border h-14 cursor-pointer transition-all ${
                        imageUrl === preset.url ? 'ring-2 ring-emerald-600 border-transparent scale-95' : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {imageUrl === preset.url && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === 'bn' ? 'অভিযোগ জমা দিন (অ্যাডমিন পর্যালোচনার জন্য)' : 'Submit Complaint for Admin Review'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              {language === 'bn' 
                ? 'সাভার পৌরসভা সার্ভিস হাবে জমা হওয়া প্রতিটি অভিযোগ ট্র্যাক করা হয়।' 
                : 'All issues submitted are audited by Savar Pourashava for swift action.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
