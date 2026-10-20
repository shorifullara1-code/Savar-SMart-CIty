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
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  
  // User actions
  registerUser: (data: { name: string; mobile: string; area: string; ward?: string }) => void;
  logoutUser: () => void;
  toggleAdminRole: () => void;
  loginAsDemoCitizen: () => void;
  loginUser: (data: { mobile: string }) => Promise<boolean>;
  loginAdmin: (data: { idOrEmail: string; password: string }) => Promise<boolean>;
  
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
const STORAGE_KEY_CITIZENS = 'savar_registered_citizens_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'bn' | 'en'>('bn');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [activeView, setActiveView] = useState<'feed' | 'my-reports' | 'admin-portal' | 'map-view' | 'emergency'>('feed');
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isLoadBalancerOpen, setIsLoadBalancerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [filterCategory, setFilterCategory] = useState<ProblemCategory | 'all'>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [wards, setWards] = useState<SavarWardInfo[]>([]);

  // Fetch wards from Supabase
  useEffect(() => {
    const fetchWards = async () => {
      const { data, error } = await supabase.from('wards').select('*');
      if (error) {
        console.error('Error fetching wards:', error);
        setWards(SAVAR_WARDS); // Fallback
      } else {
        setWards(data.map(w => ({
          wardNumber: w.ward_number,
          areaName: w.area_name,
          banglaName: w.bangla_name,
          zone: w.zone,
          description: w.description,
          councilorName: w.councilor_name,
          contactNumber: w.contact_number,
          coordinates: { x: 0, y: 0 } // Default for now
        })));
      }
    };
    fetchWards();
  }, []);

  const updateWard = async (wardNumber: string, updatedInfo: Partial<SavarWardInfo>) => {
    // Optimistic update
    setWards(prev => prev.map(w => w.wardNumber === wardNumber ? { ...w, ...updatedInfo } : w));

    // Persist to Supabase
    const { error } = await supabase
      .from('wards')
      .update({
        area_name: updatedInfo.areaName,
        bangla_name: updatedInfo.banglaName,
        councilor_name: updatedInfo.councilorName,
        contact_number: updatedInfo.contactNumber
      })
      .eq('ward_number', wardNumber);

    if (error) {
      showToast(language === 'bn' ? 'ওয়ার্ড আপডেট ব্যর্থ হয়েছে!' : 'Ward update failed!', 'warning');
      // Revert if error
    } else {
      showToast(language === 'bn' ? 'ওয়ার্ডের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Ward information updated successfully!', 'success');
    }
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Initialize from LocalStorage & Setup Global Error Handlers
  useEffect(() => {
    // Activate global error listeners for uncaught errors and promise rejections
    errorHandler.initGlobalListeners();

    // Listen to Supabase Auth changes (for official municipal admin accounts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const isAdminEmail = session.user.email?.toLowerCase().includes('admin') || session.user.email === 'admin@savarsmartcity.gov.bd';
        if (isAdminEmail) {
          setCurrentUser({
            id: session.user.id,
            name: 'সাভার পৌরসভা ও আশুলিয়া জোন (অ্যাডমিন)',
            mobile: '02-7742111',
            area: 'Savar Municipality Core',
            ward: 'All Wards',
            email: session.user.email,
            role: 'admin',
            registeredAt: session.user.created_at,
          });
        }
      }
    });

    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // default to sample citizen for easy testing
        const defaultCitizen: UserProfile = {
          id: 'user-default-101',
          name: 'তানভীর আহমেদ',
          mobile: '01712458921',
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

      // Fetch latest complaints from Supabase DB asynchronously
      const fetchDbComplaints = async () => {
        try {
          const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mappedDb: Complaint[] = data.map((d: any) => ({
              id: d.id,
              trackingCode: d.tracking_code || `SAV-${d.id.slice(-4)}`,
              title: d.title,
              description: d.description,
              category: d.category as ProblemCategory,
              area: d.area,
              ward: d.ward,
              exactLocation: d.exact_location || d.area,
              urgency: d.urgency as UrgencyLevel,
              imageUrl: d.image_url,
              solvedImageUrl: d.solved_image_url,
              reporterName: d.reporter_name || 'সাভার নাগরিক',
              reporterMobile: d.reporter_mobile || '017xxxxxxxx',
              reporterId: d.reporter_id || 'citizen-unknown',
              status: d.status as ComplaintStatus,
              upvotes: d.upvotes || 0,
              upvotedByUserIds: d.upvoted_by_user_ids || [],
              department: d.department,
              assignedOfficer: d.assigned_officer,
              adminNote: d.admin_note,
              solutionDetails: d.solution_details,
              rejectionReason: d.rejection_reason,
              createdAt: d.created_at,
              approvedAt: d.approved_at,
              solvedAt: d.solved_at,
              comments: [],
            }));

            setComplaints((current) => {
              const dbIds = new Set(mappedDb.map((c) => c.id));
              const localOnly = current.filter((c) => !dbIds.has(c.id));
              const combined = [...mappedDb, ...localOnly];
              try {
                localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(combined));
              } catch {
                // ignore
              }
              return combined;
            });
          }
        } catch (err) {
          console.warn('Supabase complaints sync notice (using local data):', err);
        }
      };
      fetchDbComplaints();

      const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
      if (savedLang === 'bn' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    } catch {
      // ignore
    }
    return () => subscription.unsubscribe();
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

  const registerUser = async (data: { name: string; mobile: string; area: string; ward?: string }) => {
    const cleanMobile = data.mobile.trim().replace(/\s+/g, '');
    const cleanName = data.name.trim();

    if (!cleanName) {
      showToast(language === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.', 'warning');
      return;
    }

    if (!cleanMobile || cleanMobile.length < 10) {
      showToast(language === 'bn' ? 'সঠিক ১১ বা ১০ ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter a valid mobile number.', 'warning');
      return;
    }

    const citizenId = `citizen-${cleanMobile}`;
    const newUser: UserProfile = {
      id: citizenId,
      name: cleanName,
      mobile: cleanMobile,
      area: data.area || 'Savar',
      ward: data.ward || (wards.length > 0 ? wards[0].wardNumber : 'Ward 1'),
      role: 'citizen',
      registeredAt: new Date().toISOString(),
    };

    // 1. Persist to Supabase `citizens` table if available
    try {
      await supabase.from('citizens').upsert({
        id: citizenId,
        mobile: cleanMobile,
        name: cleanName,
        area: newUser.area,
        ward: newUser.ward,
        role: 'citizen',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'mobile' });
    } catch (err) {
      console.warn('Supabase citizens sync:', err);
    }

    // 2. Persist to Local Citizens Directory for instant offline & list access
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY_CITIZENS);
      const existingList: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = existingList.filter((u) => u.mobile.replace(/\s+/g, '') !== cleanMobile);
      updatedList.unshift(newUser);
      localStorage.setItem(STORAGE_KEY_CITIZENS, JSON.stringify(updatedList));
    } catch (e) {
      // ignore
    }

    // 3. Set active logged-in citizen
    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch {
      // ignore
    }

    setIsRegisterOpen(false);
    showToast(
      language === 'bn' 
        ? `স্বাগতম ${newUser.name}! সফলভাবে নাগরিক রেজিস্ট্রেশন সম্পন্ন হয়েছে।` 
        : `Welcome ${newUser.name}! Citizen registration successful.`,
      'success'
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

  const loginUser = async (data: { mobile: string }) => {
    const cleanMobile = data.mobile.trim().replace(/\s+/g, '');
    if (!cleanMobile) {
      showToast(language === 'bn' ? 'দয়া করে মোবাইল নম্বর দিন।' : 'Please enter your mobile number.', 'warning');
      return false;
    }

    let foundUser: UserProfile | null = null;

    // 1. Check Supabase `citizens` table
    try {
      const { data: dbUser, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('mobile', cleanMobile)
        .maybeSingle();

      if (dbUser && !error) {
        foundUser = {
          id: dbUser.id || `citizen-${cleanMobile}`,
          name: dbUser.name || 'Citizen',
          mobile: dbUser.mobile,
          area: dbUser.area || 'Savar',
          ward: dbUser.ward || (wards.length > 0 ? wards[0].wardNumber : 'Ward 1'),
          role: 'citizen',
          registeredAt: dbUser.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Supabase citizen login lookup:', err);
    }

    // 2. Check local citizens directory if not in DB or offline
    if (!foundUser) {
      try {
        const localRaw = localStorage.getItem(STORAGE_KEY_CITIZENS);
        if (localRaw) {
          const list: UserProfile[] = JSON.parse(localRaw);
          const matched = list.find((u) => u.mobile.replace(/\s+/g, '') === cleanMobile);
          if (matched) {
            foundUser = { ...matched, role: 'citizen' };
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. Log in if found
    if (foundUser) {
      foundUser.role = 'citizen'; // Enforce citizen role
      setCurrentUser(foundUser);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
      } catch {
        // ignore
      }
      setIsRegisterOpen(false);
      showToast(
        language === 'bn' 
          ? `স্বাগতম ${foundUser.name}! আপনার নাগরিক অ্যাকাউন্টে সফলভাবে লগইন হয়েছে।` 
          : `Welcome ${foundUser.name}! Logged in to citizen account successfully.`,
        'success'
      );
      return true;
    }

    // 4. Not found
    showToast(
      language === 'bn' 
        ? 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' 
        : 'No citizen account found with this number. Please register with your name first.',
      'warning'
    );
    return false;
  };

  const loginAdmin = async (data: { idOrEmail: string; password: string }) => {
    const rawId = (data.idOrEmail || '').trim();
    const cleanId = rawId.toLowerCase();
    const password = (data.password || '').trim();

    if (!cleanId || !password) {
      showToast(language === 'bn' ? 'অ্যাডমিন আইডি এবং পাসওয়ার্ড উভয়ই পূরণ করুন।' : 'Please enter both Admin ID and password.', 'warning');
      return false;
    }

    // 1. Match Official Savar Municipality Credentials
    const isOfficialMatch = 
      (cleanId === 'admin' || 
       cleanId === 'admin@savarsmartcity.gov.bd' || 
       cleanId === 'savaradmin' || 
       cleanId === 'pouroshova' || 
       cleanId === 'savar' || 
       cleanId === '01938041064') && 
      (password === 'SavarAdmin@2026!' || password === 'admin123' || password === '123456');

    if (isOfficialMatch) {
      const adminUser: UserProfile = {
        id: 'admin-savar-auth-1',
        name: 'সাভার পৌরসভা ও আশুলিয়া জোন (প্রধান অ্যাডমিন)',
        mobile: '01938041064',
        area: 'Savar Municipality Core',
        ward: 'All Wards',
        email: 'admin@savarsmartcity.gov.bd',
        role: 'admin',
        registeredAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
      } catch {
        // ignore
      }
      setActiveView('admin-portal');
      showToast(
        language === 'bn' 
          ? 'সাভার পৌরসভা অ্যাডমিন প্যানেলে স্বাগতম!' 
          : 'Welcome to Savar Municipality Admin Portal!',
        'success'
      );
      return true;
    }

    // 2. Also attempt Supabase Auth if email format was entered
    if (cleanId.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: password,
        });

        if (!authError && authData.user) {
          const adminUser: UserProfile = {
            id: authData.user.id,
            name: 'সাভার পৌরসভা ও আশুলিয়া জোন (অ্যাডমিন)',
            mobile: '02-7742111',
            area: 'Savar Municipality Core',
            ward: 'All Wards',
            email: authData.user.email,
            role: 'admin',
            registeredAt: authData.user.created_at,
          };
          setCurrentUser(adminUser);
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
          } catch {
            // ignore
          }
          setActiveView('admin-portal');
          showToast(
            language === 'bn' 
              ? 'সাভার পৌরসভা অ্যাডমিন প্যানেলে স্বাগতম!' 
              : 'Welcome to Savar Municipality Admin Portal!',
            'success'
          );
          return true;
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. Check Supabase citizens table for role = 'admin'
    try {
      const { data: dbAdmin } = await supabase
        .from('citizens')
        .select('*')
        .eq('mobile', cleanId)
        .eq('role', 'admin')
        .maybeSingle();

      if (dbAdmin) {
        const adminUser: UserProfile = {
          id: dbAdmin.id,
          name: dbAdmin.name || 'পৌরসভা অ্যাডমিন',
          mobile: dbAdmin.mobile,
          area: dbAdmin.area || 'Savar Municipality Core',
          ward: dbAdmin.ward || 'All Wards',
          role: 'admin',
          registeredAt: dbAdmin.created_at || new Date().toISOString(),
        };
        setCurrentUser(adminUser);
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
        } catch {
          // ignore
        }
        setActiveView('admin-portal');
        showToast(
          language === 'bn' 
            ? 'সাভার পৌরসভা অ্যাডমিন প্যানেলে স্বাগতম!' 
            : 'Welcome to Savar Municipality Admin Portal!',
          'success'
        );
        return true;
      }
    } catch {
      // ignore
    }

    showToast(
      language === 'bn' 
        ? 'ভুল অ্যাডমিন আইডি বা পাসওয়ার্ড! সঠিক তথ্য দিন।' 
        : 'Invalid Admin ID or Password! Please verify credentials.',
      'warning'
    );
    return false;
  };

  const toggleAdminRole = () => {
    if (currentUser?.role === 'admin') {
      // Allow authenticated admin to switch view back to normal citizen
      const updated: UserProfile = { ...currentUser, role: 'citizen' };
      setCurrentUser(updated);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      } catch {
        // ignore
      }
      setActiveView('feed');
      showToast(
        language === 'bn' ? 'নাগরিক মোডে ফিরে আসা হয়েছে' : 'Switched back to Citizen mode',
        'info'
      );
    } else {
      // Regular user cannot become admin without entering password!
      setIsAdminLoginOpen(true);
      showToast(
        language === 'bn'
          ? 'অ্যাডমিন প্যানেলে প্রবেশের জন্য পাসওয়ার্ড দিয়ে লগইন করুন।'
          : 'Please login with admin password to access.',
        'info'
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

    // Asynchronously insert into Supabase `complaints` table
    supabase.from('complaints').insert({
      id: newComplaint.id,
      tracking_code: newComplaint.trackingCode,
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category,
      area: newComplaint.area,
      ward: newComplaint.ward,
      exact_location: newComplaint.exactLocation,
      urgency: newComplaint.urgency,
      image_url: newComplaint.imageUrl,
      reporter_name: newComplaint.reporterName,
      reporter_mobile: newComplaint.reporterMobile,
      reporter_id: newComplaint.reporterId,
      status: newComplaint.status,
      upvotes: newComplaint.upvotes,
      upvoted_by_user_ids: newComplaint.upvotedByUserIds,
      created_at: newComplaint.createdAt,
      updated_at: newComplaint.createdAt,
    }).then(({ error }) => {
      if (error) console.warn('Supabase complaint insert sync notice:', error);
    });

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
        ? `অভিযোগ সফলভাবে জমা হয়েছে! ট্র্যাকিং কোড: ${trackingCode}`
        : `Complaint submitted! Tracking ID: ${trackingCode}`,
      'info'
    );
    return trackingCode;
  };

  const approveComplaint = (id: string, department?: string, assignedOfficer?: string, adminNote?: string) => {
    const dept = department || 'পৌরসভা গণপূর্ত শাখা';
    const officer = assignedOfficer || 'দায়িত্বপ্রাপ্ত পরিদর্শক';
    const note = adminNote || 'অভিযোগটি যাচাই করে পাবলিক ফিডে প্রকাশের অনুমোদন দেওয়া হলো।';

    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'approved' as ComplaintStatus,
          approvedAt: new Date().toISOString(),
          department: dept,
          assignedOfficer: officer,
          adminNote: note,
        };
      }
      return comp;
    });
    saveComplaints(updated);

    // Sync to Supabase
    supabase.from('complaints').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      department: dept,
      assigned_officer: officer,
      admin_note: note,
      updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase approve sync notice:', error);
    });

    showToast(
      language === 'bn' ? 'অভিযোগটি অনুমোদিত হয়েছে এবং পাবলিক ফিডে প্রকাশ করা হয়েছে!' : 'Complaint approved and published to public feed!'
    );
  };

  const rejectComplaint = (id: string, reason: string) => {
    const rReason = reason || 'পর্যাপ্ত তথ্য বা সত্যতা না থাকায় বাতিল করা হয়েছে।';
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'rejected' as ComplaintStatus,
          rejectionReason: rReason,
        };
      }
      return comp;
    });
    saveComplaints(updated);

    // Sync to Supabase
    supabase.from('complaints').update({
      status: 'rejected',
      rejection_reason: rReason,
      updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase reject sync notice:', error);
    });

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

    // Sync to Supabase
    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (department !== undefined) payload.department = department;
    if (assignedOfficer !== undefined) payload.assigned_officer = assignedOfficer;
    if (adminNote !== undefined) payload.admin_note = adminNote;

    supabase.from('complaints').update(payload).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase status update sync notice:', error);
    });

    showToast(
      language === 'bn' ? 'অভিযোগের স্ট্যাটাস ও বিভাগ আপডেট করা হয়েছে!' : 'Complaint status updated successfully!'
    );
  };

  const markComplaintAsSolved = (id: string, details: { solutionDetails: string; solvedImageUrl?: string }) => {
    const solvedImg = details.solvedImageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80';
    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          status: 'solved' as ComplaintStatus,
          solvedAt: new Date().toISOString(),
          solutionDetails: details.solutionDetails,
          solvedImageUrl: solvedImg,
        };
      }
      return comp;
    });
    saveComplaints(updated);

    // Sync to Supabase
    supabase.from('complaints').update({
      status: 'solved',
      solved_at: new Date().toISOString(),
      solution_details: details.solutionDetails,
      solved_image_url: solvedImg,
      updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase solve sync notice:', error);
    });

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
    let newUpvotes = 0;
    let newUpvotedBy: string[] = [];

    const updated = complaints.map((comp) => {
      if (comp.id === id) {
        const hasVoted = comp.upvotedByUserIds?.includes(userId);
        newUpvotedBy = hasVoted
          ? comp.upvotedByUserIds.filter((uid) => uid !== userId)
          : [...(comp.upvotedByUserIds || []), userId];
        newUpvotes = Math.max(0, comp.upvotes + (hasVoted ? -1 : 1));
        return { ...comp, upvotes: newUpvotes, upvotedByUserIds: newUpvotedBy };
      }
      return comp;
    });
    saveComplaints(updated);

    // Sync to Supabase
    supabase.from('complaints').update({
      upvotes: newUpvotes,
      upvoted_by_user_ids: newUpvotedBy,
      updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase upvote sync notice:', error);
    });
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

    // Sync to Supabase `comments` table
    supabase.from('comments').insert({
      id: newComment.id,
      complaint_id: id,
      user_name: newComment.userName,
      user_area: newComment.userArea,
      user_role: currentUser.role,
      text: newComment.comment,
      created_at: newComment.createdAt,
    }).then(({ error }) => {
      if (error) console.warn('Supabase comment sync notice:', error);
    });

    showToast(language === 'bn' ? 'আপনার মন্তব্য প্রকাশ হয়েছে' : 'Comment posted');
  };

  const deleteComplaint = (id: string) => {
    const updated = complaints.filter((comp) => comp.id !== id);
    saveComplaints(updated);
    if (selectedComplaintId === id) setSelectedComplaintId(null);

    // Sync to Supabase
    supabase.from('complaints').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase delete sync notice:', error);
    });

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
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        registerUser,
        logoutUser,
        toggleAdminRole,
        loginAsDemoCitizen,
        loginUser,
        loginAdmin,
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
