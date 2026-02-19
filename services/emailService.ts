
/**
 * Smart Scalper Pro - Quantum Email Service
 * Credentials: xira030@gmail.com / ibhq phtw oasa vqaa
 * 
 * NOTE: Real email sending requires a backend proxy due to CORS restrictions.
 * This service now triggers a system event that the UI captures to show the OTP.
 */

export const emailService = {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendVerificationEmail(toEmail: string, otp: string): Promise<boolean> {
    console.log(`[SYSTEM] Dispatching encrypted transmission to ${toEmail}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Custom event to show OTP in the UI terminal for the user
    const event = new CustomEvent('quantum-mail-sent', { 
      detail: { to: toEmail, otp: otp, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);

    try {
      // Future implementation for real backend:
      /*
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: toEmail, otp, provider: 'gmail' })
      });
      return response.ok;
      */
      
      return true; // Return true for demo/interception purposes
    } catch (error) {
      console.error("Transmission failed:", error);
      return false;
    }
  }
};
