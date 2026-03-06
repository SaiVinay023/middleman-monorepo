export interface Gig {
  id: string;
  title: string;
  description?: string;
  category: string;
  pay_amount: number;
  status: 'pending_admin' | 'awaiting_payment' | 'available' | 'assigned' | 'in_progress' | 'pending_review' | 'completed';
  technician_id?: string;
  company_id: string;
  scheduled_at: string;
  claimed_at?: string;
  completion_photo_url?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'technician' | 'admin';
  verified: boolean;
}
