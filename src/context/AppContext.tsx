import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, ProblemCategory, UserProfile, UrgencyLevel, SavarWardInfo } from '../types';
import { INITIAL_COMPLAINTS, SAVAR_WARDS } from '../data/savarData';
import { errorHandler } from '../services/errorHandler';
import { loadBalancer } from '../services/loadBalancer';
import { supabase } from '../services/supabaseClient';

interface AppContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  complaints: Complaint[];
  activeView: 'feed' | 'my-reports' | 'admin-portal' | 'map-view' | 'emergency';
  setActiveView: (view: 'feed' | 'my-reports' | 'admin-portal' | 'map-view' | 'emergency') => void;
  
  // Modals
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
  isNewComplaintOpen: boolean;
  setIsNewComplaintOpen: (open: boolean) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  isLoadBalancerOpen: boolean;
  setIsLoadBalancerOpen: (open: boolean) => void;
  
  // User actions
  registerUser: (data: { name: string; mobile: string; area: string; ward?: string }) => void;
  logoutUser: () => void;
  toggleAdminRole: () => void;
  loginAsDemoCitizen: () => void;
  
  // Complaint actions
  submitComplaint: (data: {
    title: string;
    description: string;
    category: ProblemCategory;
    area: string;
    ward: string;
    exactLocation: string;
    urgency: UrgencyLevel;
    imageUrl?: string;
  }) => string; // returns tracking code
  
  approveComplaint: (id: string, department?: string, assignedOfficer?: string, adminNote?: string) => void;
  rejectComplaint: (id: string, reason: string) => void;
  updateComplaintStatus: (
    id: string, 
    status: ComplaintStatus, 
    department?: string, 
    assignedOfficer?: string, 
    adminNote?: string
  ) => void;
  markComplaintAsSolved: (id: string, details: { solutionDetails: string; solvedImageUrl?: string }) => void;
  toggleUpvote: (id: string) => void;
  addComment: (id: string, text: string) => void;
  deleteComplaint: (id: string) => void;

  // Notification / Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clearToast: () => void;

  // Filter state
  filterCategory: ProblemCategory | 'all';
  setFilterCategory: (c: ProblemCategory | 'all') => void;
  filterArea: string;
  setFilterArea: (area: string) => void;
  filterStatus: ComplaintStatus | 'all';
  setFilterStatus: (s: ComplaintStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Ward management
  wards: SavarWardInfo[];
  updateWard: (wardNumber: string, updatedInfo: Partial<SavarWardInfo>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'savar_service_hub_user_v1';
const STORAGE_KEY_COMPLAINTS = 'savar_service_hub_complaints_v1';
const STORAGE_KEY_LANG = 'savar_service_hub_lang_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'bn' | 'en'>('bn');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [activeView, setActiveView] = useState<'feed' | 'my-reports' | 'admin-portal' | 'map-view' | 'emergency'>('feed');
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isLoadBalancerOpen, setIsLoadBalancerOpen] = useState(false);

  const [filterCategory, setFilterCategory] = useState<ProblemCategory | 'all'>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [wards, setWards] = useState<SavarWardInfo[]>(() => {
    try {
      const saved = localStorage.getItem('savar_service_hub_wards_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SAVAR_WARDS;
  });

  const updateWard = (wardNumber: string, updatedInfo: Partial<SavarWardInfo>) => {
    const updated = wards.map((w) => (w.wardNumber === wardNumber ? { ...w, ...updatedInfo } : w));
    setWards(updated);
    try {
      localStorage.setItem('savar_service_hub_wards_v1', JSON.stringify(updated));
      showToast(language === 'bn' ? 'ওয়ার্ডের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Ward information updated successfully!', 'success');
    } catch {
      showToast('Error updating ward', 'warning');
    }
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Initialize from LocalStorage & Setup Global Error Handlers
  useEffect(() => {
    // Activate global error listeners for uncaught errors and promise rejections
    errorHandler.initGlobalListeners();

    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // default to guest or sample citizen for easy testing
        const defaultCitizen: UserProfile = {
          id: 'user-default-101',
          name: 'তানভীর আহমেদ',
          mobile: '01712-458921',
          area: 'Genda & Arapara',
          ward: 'Ward 5',
          role: 'citizen',
          registeredAt: new Date().toISOString(),
        };
        setCurrentUser(defaultCitizen);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultCitizen));
      }

      const savedComplaints = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (savedComplaints) {
        const parsed: Complaint[] = JSON.parse(savedComplaints);
        const existingIds = new Set(parsed.map((c) => c.id));
        const merged = [...parsed];
        for (const init of INITIAL_COMPLAINTS) {
          if (!existingIds.has(init.id)) {
            merged.push(init);
          }
        }
        setComplaints(merged);
        localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(merged));
      } else {
        setComplaints(INITIAL_COMPLAINTS);
        localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
      }

      const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
      if (savedLang === 'bn' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveComplaints = (newComplaints: Complaint[]) => {
    setComplaints(newComplaints);
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(newComplaints));
    } catch (err) {
      errorHandler.logError({
        message: `লোকাল স্টোরেজ সেভ ব্যর্থ: ${err instanceof Error ? err.message : String(err)}`,
        category: 'runtime',
        severity: 'warning',
        context: 'AppContext:saveComplaints',
      });
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToast(null);

  const setLanguage = (lang: 'bn' | 'en') => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
      // ignore
    }
  };

  const registerUser = (data: { name: string; mobile: string; area: string; ward?: string }) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      area: data.area,
      ward: data.ward || SAVAR_WARDS[0].wardNumber,
      role: 'citizen',
      registeredAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    setIsRegisterOpen(false);
    showToast(
      language === 'bn' 
        ? `স্বাগতম ${newUser.name}! সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে।` 
        : `Welcome ${newUser.name}! Registration successful.`
    );
  };

  const loginAsDemoCitizen = () => {
    const demoUser: UserProfile = {
      id: 'demo-citizen-1',
      name: 'মো: সাজ্জাদ হোসেন (নাগরিক)',
      mobile: '01819-332110',
      area: 'Thana Road & Namabazar',
      ward: 'Ward 2',
      role: 'citizen',
      registeredAt: new Date().toISOString(),
    };
    setCurrentUser(demoUser);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
    showToast(language === 'bn' ? 'নাগরিক প্রোফাইলে লগইন করা হয়েছে' : 'Logged in as Demo Citizen');
  };

  const toggleAdminRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === 'admin' ? 'citizen' : 'admin';
    const updated = { ...currentUser, role: newRole as 'citizen' | 'admin' };
    setCurrentUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (newRole === 'admin') {
      setActiveView('admin-portal');
      showToast(
        language === 'bn' 
          ? 'পৌরসভা অ্যাডমিন মোড সক্রিয় হয়েছে (অডিট ও সমাধান প্যানেল)' 
          : 'Savar Municipality Admin Mode activated'
      );
    } else {
      setActiveView('feed');
      showToast(
        language === 'bn' ? 'নাগরিক মোডে ফিরে আসা হয়েছে' : 'Switched back to Citizen mode'
      );
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // ignore
    }
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out');
  };

  const submitComplaint = (data: {
    title: string;
    description: string;
    category: ProblemCategory;
    area: string;
    ward: string;
    exactLocation: string;
    urgency: UrgencyLevel;
    imageUrl?: string;
  }) => {
    const trackingNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `SAV-${trackingNum}`;
    
    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      trackingCode,
      title: data.title,
      description: data.description,
      category: data.category,
      area: data.area,
      ward: data.ward,
      exactLocation: data.exactLocation,
      urgency: data.urgency,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
      reporterName: currentUser?.name || 'সাভার নাগরিক',
      reporterMobile: currentUser?.mobile || '01700-000000',
      reporterId: currentUser?.id || 'guest',
      status: 'pending', // Starts as pending - needs admin approval to be public!
      upvotes: 1,
      upvotedByUserIds: currentUser ? [currentUser.id] : [],
      createdAt: new Date().toISOString(),
      comments: [],
    };

    const updated = [newComplaint, ...complaints];
    saveComplaints(updated);
    setIsNewComplaintOpen(false);

    // Dispatch asynchronous citizen request through the multi-node load balancer cluster
    loadBalancer.dispatchRequest({
      action: `নাগরিক রিপোর্ট সাবমিট: [${data.ward}] ${data.title.slice(0, 25)}`,
      locationContext: `${data.area} ${data.ward}`,
      priority: data.urgency === 'emergency' ? 'emergency' : 'normal',
    }).catch(() => {
      // Handled gracefully in load balancer
    });

    showToast(
      language === 'bn'
        ? `অভিযোগ সফলভাবে জমা হয়েছে! ট্র্যাকিং কোড: ${trackingCode} (লোড ব্যালেন্সার নোডে সিঙ্ক সম্পন্ন)।`
        : `Complaint submitted! Tracking ID: ${trackingCode} (Synced through Load Balancer Node).`,
      'info'
    );
    return trackingCode;
  };

  const approveComplaint = (id: string, department?: string, assignedOfficer?: string, adminNote?: string) => {
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'approved' as ComplaintStatus,
          approvedAt: new Date().toISOString(),
          department: department || comp.department || 'পৌরসভা গণপূর্ত শাখা',
          assignedOfficer: assignedOfficer || comp.assignedOfficer || 'দায়িত্বপ্রাপ্ত পরিদর্শক',
          adminNote: adminNote || 'অভিযোগটি যাচাই করে পাবলিক ফিডে প্রকাশের অনুমোদন দেওয়া হলো।',
        };
      }
      return comp;
    });
    saveComplaints(updated);
    showToast(
      language === 'bn' ? 'অভিযোগটি অনুমোদিত হয়েছে এবং পাবলিক ফিডে প্রকাশ করা হয়েছে!' : 'Complaint approved and published to public feed!'
    );
  };

  const rejectComplaint = (id: string, reason: string) => {
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'rejected' as ComplaintStatus,
          rejectionReason: reason || 'পর্যাপ্ত তথ্য বা সত্যতা না থাকায় বাতিল করা হয়েছে।',
        };
      }
      return comp;
    });
    saveComplaints(updated);
    showToast(
      language === 'bn' ? 'অভিযোগটি বাতিল করা হয়েছে' : 'Complaint rejected',
      'warning'
    );
  };

  const updateComplaintStatus = (
    id: string, 
    status: ComplaintStatus, 
    department?: string, 
    assignedOfficer?: string, 
    adminNote?: string
  ) => {
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status,
          department: department !== undefined ? department : comp.department,
          assignedOfficer: assignedOfficer !== undefined ? assignedOfficer : comp.assignedOfficer,
          adminNote: adminNote !== undefined ? adminNote : comp.adminNote,
        };
      }
      return comp;
    });
    saveComplaints(updated);
    showToast(
      language === 'bn' ? 'অভিযোগের স্ট্যাটাস ও বিভাগ আপডেট করা হয়েছে!' : 'Complaint status updated successfully!'
    );
  };

  const markComplaintAsSolved = (id: string, details: { solutionDetails: string; solvedImageUrl?: string }) => {
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'solved' as ComplaintStatus,
          solvedAt: new Date().toISOString(),
          solutionDetails: details.solutionDetails,
          solvedImageUrl: details.solvedImageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80',
        };
      }
      return comp;
    });
    saveComplaints(updated);
    showToast(
      language === 'bn' ? 'সাফল্যের সাথে সমস্যা সমাধান চিহ্নিত (Solved) করা হয়েছে!' : 'Complaint marked as successfully Solved!'
    );
  };

  const toggleUpvote = (id: string) => {
    if (!currentUser) {
      setIsRegisterOpen(true);
      showToast(
        language === 'bn' ? 'ভোট বা সমর্থন দিতে দয়া করে রেজিস্ট্রেশন বা লগইন করুন' : 'Please register to support this complaint',
        'info'
      );
      return;
    }

    const userId = currentUser.id;
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        const hasVoted = comp.upvotedByUserIds?.includes(userId);
        const upvotedByUserIds = hasVoted
          ? comp.upvotedByUserIds.filter((uid) => uid !== userId)
          : [...(comp.upvotedByUserIds || []), userId];
        const upvotes = Math.max(0, comp.upvotes + (hasVoted ? -1 : 1));
        return { ...comp, upvotes, upvotedByUserIds };
      }
      return comp;
    });
    saveComplaints(updated);
  };

  const addComment = (id: string, text: string) => {
    if (!text.trim()) return;
    if (!currentUser) {
      setIsRegisterOpen(true);
      return;
    }
    const newComment = {
      id: `comm-${Date.now()}`,
      userName: currentUser.name,
      userArea: currentUser.area || 'Savar',
      comment: text.trim(),
      createdAt: new Date().toISOString(),
      isAuthority: currentUser.role === 'admin',
    };

    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          comments: [...(comp.comments || []), newComment],
        };
      }
      return comp;
    });
    saveComplaints(updated);
    showToast(language === 'bn' ? 'আপনার মন্তব্য প্রকাশ হয়েছে' : 'Comment posted');
  };

  const deleteComplaint = (id: string) => {
    const updated = complaints.filter((comp) => comp.id !== id);
    saveComplaints(updated);
    if (selectedComplaintId === id) setSelectedComplaintId(null);
    showToast(language === 'bn' ? 'অভিযোগটি মুছে ফেলা হয়েছে' : 'Complaint deleted');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        language,
        setLanguage,
        complaints,
        activeView,
        setActiveView,
        isRegisterOpen,
        setIsRegisterOpen,
        isNewComplaintOpen,
        setIsNewComplaintOpen,
        selectedComplaintId,
        setSelectedComplaintId,
        isLoadBalancerOpen,
        setIsLoadBalancerOpen,
        registerUser,
        logoutUser,
        toggleAdminRole,
        loginAsDemoCitizen,
        submitComplaint,
        approveComplaint,
        rejectComplaint,
        updateComplaintStatus,
        markComplaintAsSolved,
        toggleUpvote,
        addComment,
        deleteComplaint,
        toast,
        showToast,
        clearToast,
        filterCategory,
        setFilterCategory,
        filterArea,
        setFilterArea,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        wards,
        updateWard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
