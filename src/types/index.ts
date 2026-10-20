export type ComplaintStatus = 'pending' | 'approved' | 'in_progress' | 'solved' | 'rejected';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export type ProblemCategory = 
  | 'roads' 
  | 'drainage' 
  | 'waste' 
  | 'streetlights' 
  | 'water' 
  | 'encroachment' 
  | 'mosquito' 
  | 'other';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  area: string;
  ward?: string;
  email?: string;
  role: 'citizen' | 'admin';
  registeredAt: string;
}

export interface ComplaintComment {
  id: string;
  userName: string;
  userArea: string;
  comment: string;
  createdAt: string;
  isAuthority?: boolean;
}

export interface Complaint {
  id: string;
  trackingCode: string; // e.g. "SAV-8421"
  title: string;
  description: string;
  category: ProblemCategory;
  area: string;
  ward: string;
  exactLocation: string; // landmark or street name
  urgency: UrgencyLevel;
  imageUrl?: string;
  solvedImageUrl?: string;
  reporterName: string;
  reporterMobile: string;
  reporterId: string;
  status: ComplaintStatus;
  upvotes: number;
  upvotedByUserIds: string[];
  department?: string; // Assigned authority unit e.g. "সড়ক বিভাগ"
  assignedOfficer?: string;
  adminNote?: string;
  solutionDetails?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  solvedAt?: string;
  comments: ComplaintComment[];
  estimatedDays?: number;
}

export interface SavarWardInfo {
  wardNumber: string;
  areaName: string;
  banglaName: string;
  zone: string;
  description: string;
  councilorName: string;
  contactNumber: string;
  coordinates: { x: number; y: number }; // Relative percentage on visual map
}
