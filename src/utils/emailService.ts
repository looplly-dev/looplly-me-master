/**
 * Email Service
 * Note: Password reset emails are handled by Supabase Auth's built-in email system.
 * This service is for other application emails only.
 */

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  // Password resets are now handled by Supabase Auth
  // This function is kept for backward compatibility but does nothing
  console.log('📧 [INFO] Password reset handled by Supabase Auth for:', email);
  
  return {
    success: true,
    messageId: `supabase-auth-${Date.now()}`,
  };
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  console.log('📧 [MOCK] Welcome email would be sent to:', email);
  console.log('👋 [MOCK] User name:', name);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
};
