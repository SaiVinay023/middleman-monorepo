// src/lib/auditLog.ts
import { supabase } from '@/lib/supabase'; // ✅ Add this import

export const logAdminAction = async (
  adminId: string,
  action: string,
  resourceId: string,
  details: any
) => {
  // Simple way to get a placeholder or real IP if available
  const ipAddress = typeof window !== 'undefined' ? 'client-side' : 'server-side';

  const { error } = await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
    timestamp: new Date().toISOString()
  });

  if (error) {
    console.error("Failed to log admin action:", error);
  }
};