/**
 * Dummy Email Service
 * TODO: Replace with actual email service (Resend, SendGrid, etc.)
 */

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  console.log('📧 [MOCK] Password reset email would be sent to:', email);
  console.log('🔗 [MOCK] Reset link:', resetLink);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
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
