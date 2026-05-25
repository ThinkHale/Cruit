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
  employer_profiles?: { company_name: string; industry: string | null; company_size: string | null };
}

export interface Match {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  employer_profiles?: { company_name: string };
  candidate_profiles?: { full_name: string; title: string | null };
  job_postings?: { title: string; pay_rate: string | null; location: string | null };
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
