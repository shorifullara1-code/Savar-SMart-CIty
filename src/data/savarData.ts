import { Complaint, SavarWardInfo, ProblemCategory } from '../types';

export const SAVAR_WARDS: SavarWardInfo[] = [
  {
    wardNumber: 'Ward 1',
    areaName: 'Savar Bazar & Court Area',
    banglaName: '১ নং ওয়ার্ড (সাভার বাজার ও কোর্ট চত্বর)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'মেইন বাজার, কোর্ট চত্বর, পুরাতন সাভার ও নদীর ঘাট',
    councilorName: 'মো: মোশাররফ হোসেন (কাউন্সিলর ১ নং ওয়ার্ড)',
    contactNumber: '01711-234501',
    coordinates: { x: 44, y: 55 },
  },
  {
    wardNumber: 'Ward 2',
    areaName: 'Thana Road & Namabazar',
    banglaName: '২ নং ওয়ার্ড (থানা রোড ও নামাবাজার)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'সাভার মডেল থানা, বংশী নদী তীরবর্তী বাজার লেন',
    councilorName: 'হাজী নজরুল ইসলাম (কাউন্সিলর ২ নং ওয়ার্ড)',
    contactNumber: '01711-234502',
    coordinates: { x: 38, y: 51 },
  },
  {
    wardNumber: 'Ward 3',
    areaName: 'Bank Town & Aricha Highway',
    banglaName: '৩ নং ওয়ার্ড (ব্যাংক কলোনি ও ব্যাংক টাউন)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'আবাসিক এলাকা ও ঢাকা-আরিচা মহাসড়ক সংলগ্ন',
    councilorName: 'সুলতান আহমেদ (কাউন্সিলর ৩ নং ওয়ার্ড)',
    contactNumber: '01711-234503',
    coordinates: { x: 50, y: 47 },
  },
  {
    wardNumber: 'Ward 4',
    areaName: 'Shimultola & Majidpur',
    banglaName: '৪ নং ওয়ার্ড (শিমুলতলা ও মজিদপুর)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'সাভার কলেজ সংলগ্ন, আবাসিক ও ছাত্রাবাস অঞ্চল',
    councilorName: 'রফিকুল ইসলাম (কাউন্সিলর ৪ নং ওয়ার্ড)',
    contactNumber: '01711-234504',
    coordinates: { x: 46, y: 42 },
  },
  {
    wardNumber: 'Ward 5',
    areaName: 'Genda & Arapara',
    banglaName: '৫ নং ওয়ার্ড (গেন্ডা ও আনন্দপুর)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'গেন্ডা রেললাইন রোড, আনন্দপুর ও বাজার লেন',
    councilorName: 'আব্দুল কাদের (কাউন্সিলর ৫ নং ওয়ার্ড)',
    contactNumber: '01711-234505',
    coordinates: { x: 55, y: 53 },
  },
  {
    wardNumber: 'Ward 6',
    areaName: 'Ulail & Karnapara',
    banglaName: '৬ নং ওয়ার্ড (উলাইল ও কর্ণপাড়া)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'শিল্প এলাকা, গার্মেন্টস করিডোর ও ড্রেনেজ খাল',
    councilorName: 'হাজী সেলিম রেজা (কাউন্সিলর ৬ নং ওয়ার্ড)',
    contactNumber: '01711-234506',
    coordinates: { x: 62, y: 61 },
  },
  {
    wardNumber: 'Ward 7',
    areaName: 'Radio Colony & Sobhanbagh',
    banglaName: '৭ নং ওয়ার্ড (রেডিও কলোনি ও শোভনবাগ)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'বাংলাদেশ বেতার কেন্দ্র ও পাকিজা রোড',
    councilorName: 'মো: জহিরুল হক (কাউন্সিলর ৭ নং ওয়ার্ড)',
    contactNumber: '01711-234507',
    coordinates: { x: 51, y: 37 },
  },
  {
    wardNumber: 'Ward 8',
    areaName: 'Hemayetpur & Tetuljhora',
    banglaName: '৮ নং ওয়ার্ড (হেমায়েতপুর ও তেঁতুলঝোড়া)',
    zone: 'হেমায়েতপুর জোন (Hemayetpur Industrial)',
    description: 'চামড়া শিল্প নগরী মোড়, মহাসড়ক সংযোগ ও বাসস্ট্যান্ড',
    councilorName: 'কবির হোসেন বেপারী (কাউন্সিলর ৮ নং ওয়ার্ড)',
    contactNumber: '01711-234508',
    coordinates: { x: 70, y: 70 },
  },
  {
    wardNumber: 'Ward 9',
    areaName: 'C&B & Jahangirnagar Gate',
    banglaName: '৯ নং ওয়ার্ড (সিঅ্যান্ডবি ও জাহাঙ্গীরনগর বিশ্ববিদ্যালয়)',
    zone: 'সাভার পৌরসভা (Pourashava Core)',
    description: 'জাহাঙ্গীরনগর প্রধান ফটক, ডেইরি ফার্ম ও ইসলামনগর',
    councilorName: 'ইঞ্জিনিয়ার আমিনুল ইসলাম (কাউন্সিলর ৯ নং ওয়ার্ড)',
    contactNumber: '01711-234509',
    coordinates: { x: 42, y: 31 },
  },
  {
    wardNumber: 'Baipayl Zone',
    areaName: 'Baipayl Junction & Bus Terminal',
    banglaName: 'বাইপাইল মোড় ও বাস টার্মিনাল',
    zone: 'বাইপাইল জোন (Baipayl Hub)',
    description: 'বাইপাইল ত্রিমুখী মোড়, উত্তরবঙ্গ বাস টার্মিনাল, শ্রীপুর রোড',
    councilorName: 'ইউপি চেয়ারম্যান মো: সাইফুল ইসলাম (ধামসোনা)',
    contactNumber: '01712-990011',
    coordinates: { x: 30, y: 18 },
  },
  {
    wardNumber: 'Ashulia Zone',
    areaName: 'Ashulia Bazar & Beribadh',
    banglaName: 'আশুলিয়া বাজার ও বেড়িবাঁধ',
    zone: 'আশুলিয়া জোন (Ashulia Model Zone)',
    description: 'আশুলিয়া মডেল থানা মোড়, তুরাগ তীরবর্তী বেড়িবাঁধ রোড',
    councilorName: 'শাহাব উদ্দিন মাদবর (চেয়ারম্যান, আশুলিয়া ইউনিয়ন)',
    contactNumber: '01713-112233',
    coordinates: { x: 58, y: 16 },
  },
  {
    wardNumber: 'Nabinagar Zone',
    areaName: 'Nabinagar & National Memorial',
    banglaName: 'নবীনগর ও জাতীয় স্মৃতিসৌধ এলাকা',
    zone: 'সাভার জাতীয় ঐতিহ্য জোন',
    description: 'জাতীয় স্মৃতিসৌধ কমপ্লেক্স, নবীনগর গোলচত্বর ও সেনা পল্লি',
    councilorName: 'ক্যাপ্টেন (অব.) মো: সাখাওয়াত হোসেন',
    contactNumber: '01715-445566',
    coordinates: { x: 32, y: 26 },
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const CATEGORIES_CONFIG: Record<
  ProblemCategory,
  {
    labelEn: string;
    labelBn: string;
    icon: string;
    color: string;
    bgLight: string;
    departmentDefault: string;
  }
> = {
  roads: {
    labelEn: 'Damaged Roads & Potholes',
    labelBn: 'ভাঙা রাস্তা ও গর্ত',
    icon: 'Hammer',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-800',
    departmentDefault: 'রাস্তা ও গণপূর্ত প্রকৌশল বিভাগ (Roads & Works Dept)',
  },
  drainage: {
    labelEn: 'Drainage & Waterlogging',
    labelBn: 'ড্রেনেজ ও জলাবদ্ধতা',
    icon: 'Waves',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-800',
    departmentDefault: 'ড্রেনেজ ও স্যানিটেশন শাখা (Drainage & Sewerage)',
  },
  waste: {
    labelEn: 'Garbage & Waste Disposal',
    labelBn: 'ময়লা-আবর্জনা ও ডাস্টবিন',
    icon: 'Trash2',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    departmentDefault: 'বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা শাখা (Conservancy)',
  },
  streetlights: {
    labelEn: 'Faulty Streetlights & Electrical',
    labelBn: 'নষ্ট সড়ক বাতি ও বৈদ্যুতিক তার',
    icon: 'Lightbulb',
    color: 'text-yellow-600',
    bgLight: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    departmentDefault: 'বিদ্যুৎ ও সড়কবাতি শাখা (Streetlight & Electrical)',
  },
  water: {
    labelEn: 'Water Supply & Leakage',
    labelBn: 'খাবার পানি ও পাইপলাইন লিকেজ',
    icon: 'Droplets',
    color: 'text-cyan-700',
    bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    departmentDefault: 'পানি সরবরাহ ও পাম্প শাখা (Water Supply Dept)',
  },
  encroachment: {
    labelEn: 'Footpath Encroachment & Traffic',
    labelBn: 'ফুটপাত দখল ও অবৈধ পার্কিং',
    icon: 'ShieldAlert',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-800',
    departmentDefault: 'আইন ও এস্টেট শাখা (Magistrate & Law Wing)',
  },
  mosquito: {
    labelEn: 'Mosquito Breeding & Sanitation',
    labelBn: 'মশার উপদ্রব ও জীবাণুনাশক স্প্রে',
    icon: 'Bug',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-800',
    departmentDefault: 'স্বাস্থ্য ও মশক নিধন সেল (Public Health Wing)',
  },
  other: {
    labelEn: 'Other Civic Hazards',
    labelBn: 'অন্যান্য নাগরিক সমস্যা',
    icon: 'AlertCircle',
    color: 'text-slate-700',
    bgLight: 'bg-slate-100 border-slate-300 text-slate-800',
    departmentDefault: 'সাধারণ প্রশাসনিক সেল (General Administration)',
  },
};

export const MUNICIPAL_DEPARTMENTS = [
  'রাস্তা ও গণপূর্ত প্রকৌশল বিভাগ (Roads & Works Dept)',
  'ড্রেনেজ ও স্যানিটেশন শাখা (Drainage & Sewerage)',
  'বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা শাখা (Conservancy)',
  'বিদ্যুৎ ও সড়কবাতি শাখা (Streetlight & Electrical)',
  'পানি সরবরাহ ও পাম্প শাখা (Water Supply Dept)',
  'স্বাস্থ্য ও মশক নিধন সেল (Public Health Wing)',
  'আইন ও এস্টেট শাখা (Magistrate & Law Wing)',
  'উপজেলা স্থানীয় সরকার প্রকৌশল সেল (LGED & Upazila Engineering)',
  'নগর পরিকল্পনা ও তত্ত্বাবধায়ক শাখা (Town Planning)',
];

export const DEMO_PRESET_IMAGES = [
  {
    category: 'roads',
    label: 'ভাঙা রাস্তা ও গর্ত (Pothole/Cracked Road)',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'drainage',
    label: 'জলাবদ্ধতা ও খোলা ড্রেন (Waterlogging & Open Drain)',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'waste',
    label: 'ময়লার স্তূপ ও ডাস্টবিন উপচে পড়া (Garbage Pile)',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'streetlights',
    label: 'নষ্ট বা ভাঙা সড়কবাতি (Broken Streetlight)',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'water',
    label: 'পানির পাইপ লিকেজ ও অপচয় (Water Pipe Leak)',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'encroachment',
    label: 'ফুটপাত দখল ও যানজট (Footpath Encroached)',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
  },
];

export const SOLVED_PRESET_IMAGES = [
  {
    category: 'roads',
    label: 'মেরামতকৃত পিচঢালাই রাস্তা (Freshly Paved Asphalt)',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'drainage',
    label: 'পরিষ্কার ড্রেন ও স্ল্যাব স্থাপন (Cleaned Concrete Drain)',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'waste',
    label: 'পরিচ্ছন্ন রাস্তা ও ডাস্টবিন অপসারিত (Clean Sanitized Area)',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'streetlights',
    label: 'উজ্জ্বল এলইডি বাতি স্থাপন (New Bright LED Lights)',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1000&q=80',
  },
  {
    category: 'water',
    label: 'পাইপ সংস্কার ও শুষ্ক রাস্তা (Repaired Water Line)',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80',
  },
];

export const SAVAR_EMERGENCY_CONTACTS = [
  {
    serviceBn: 'সাভার পৌরসভা জরুরি হটলাইন',
    serviceEn: 'Savar Municipality Control Room',
    number: '02-7742111',
    mobile: '01711-200300',
    timing: '২৪ ঘণ্টা উন্মুক্ত',
    icon: 'Building2',
  },
  {
    serviceBn: 'সাভার মডেল থানা (পুলিশ)',
    serviceEn: 'Savar Model Police Station',
    number: '01320-038755',
    mobile: '999',
    timing: 'জরুরি সেবা',
    icon: 'Shield',
  },
  {
    serviceBn: 'আশুলিয়া মডেল থানা (পুলিশ)',
    serviceEn: 'Ashulia Model Police Station',
    number: '01320-038780',
    mobile: '999',
    timing: 'বাইপাইল ও আশুলিয়া জোন',
    icon: 'Shield',
  },
  {
    serviceBn: 'ডিইপিজেড ফায়ার স্টেশন (বাইপাইল)',
    serviceEn: 'DEPZ Fire Station (Baipayl)',
    number: '01730-002255',
    mobile: '02-7790119',
    timing: 'জরুরি রেসকিউ টিম',
    icon: 'Flame',
    },
  {
    serviceBn: 'সাভার ফায়ার সার্ভিস ও সিভিল ডিফেন্স',
    serviceEn: 'Savar Fire Service & Civil Defense',
    number: '01730-002244',
    mobile: '02-7742222',
    timing: 'পৌরসভা ও মহাসড়ক জোন',
    icon: 'Flame',
  },
  {
    serviceBn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স (হাসপাতাল)',
    serviceEn: 'Savar Upazila Health Complex',
    number: '01712-887766',
    mobile: '02-7743300',
    timing: 'জরুরি বিভাগ ২৪/৭',
    icon: 'HeartPulse',
  },
  {
    serviceBn: 'পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র (সাভার ও আশুলিয়া)',
    serviceEn: 'REB Power Complaint Cell',
    number: '01769-401122',
    mobile: '16999',
    timing: 'বিদ্যুৎ বিপর্যয় অভিযোগ',
    icon: 'Zap',
  },
];
