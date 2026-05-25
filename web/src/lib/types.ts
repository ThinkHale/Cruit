export type UserRole = 'employer' | 'candidate';

export interface UserProfile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface EmployerProfile {
  id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  location: string | null;
  website: string | null;
  plan: 'per_post' | 'unlimited';
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  full_name: string;
  title: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  experience_years: number;
  availability: 'immediate' | '2_weeks' | '1_month' | 'flexible';
  updated_at: string;
}

export interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  shift: string | null;
  pay_rate: string | null;
  location: string | null;
  requirements: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  // joined from employer_profiles
  employer_profiles?: Pick<EmployerProfile, 'company_name' | 'industry' | 'company_size'>;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  target_id: string;
  target_type: 'job' | 'candidate';
  direction: 'left' | 'right';
  created_at: string;
}

export interface Match {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  // joined
  employer_profiles?: Pick<EmployerProfile, 'company_name'>;
  candidate_profiles?: Pick<CandidateProfile, 'full_name' | 'title'>;
  job_postings?: Pick<JobPosting, 'title' | 'pay_rate' | 'location'>;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
