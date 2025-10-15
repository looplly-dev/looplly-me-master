/**
 * Application Bootstrap
 * 
 * This module handles early application initialization, including:
 * - Environment configuration setup
 * - Remote configuration loading
 * - Error handling for deployment issues
 */

import { hybridEnv } from '@/config/hybridEnv';

/**
 * Initialize the application configuration
 * This should be called early in the app lifecycle
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Initializing application...');
    
    // Bootstrap core configuration (synchronous)
    const coreConfig = hybridEnv.getCore();
    console.log('✅ Core Supabase configuration loaded');
    
    // Initialize full configuration (asynchronous, loads from remote)
    const fullConfig = await hybridEnv.initialize();
    console.log('✅ Full application configuration loaded');
    
    // Log configuration status (without sensitive values)
    console.log('📋 Configuration status:', {
      environment: fullConfig.NODE_ENV,
      supabaseUrl: coreConfig.VITE_SUPABASE_URL,
      projectId: coreConfig.VITE_SUPABASE_PROJECT_ID,
      analytics: fullConfig.VITE_ENABLE_ANALYTICS,
      debug: fullConfig.VITE_ENABLE_DEBUG,
      platform: fullConfig.VITE_CAPACITOR_PLATFORM,
    });
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    
    // Show user-friendly error for deployment issues
    if (error instanceof Error && error.message.includes('Core Supabase configuration')) {
      showDeploymentError(error.message);
    } else {
      showGenericError(error);
    }
    
    throw error;
  }
}

/**
 * Show deployment-specific error message
 */
function showDeploymentError(message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
  `;
  
  errorDiv.innerHTML = `
    <div style="max-width: 600px; text-align: center;">
      <h1 style="margin: 0 0 1rem 0; font-size: 2rem; font-weight: 600;">
        🔧 Configuration Required
      </h1>
      <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem; line-height: 1.6;">
        This app needs environment variables to connect to Supabase.
      </p>
      <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: left;">
        <h3 style="margin: 0 0 1rem 0; color: #ffd700;">Required Environment Variables:</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin: 0.5rem 0;"><code>VITE_SUPABASE_URL</code></li>
          <li style="margin: 0.5rem 0;"><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
          <li style="margin: 0.5rem 0;"><code>VITE_SUPABASE_PROJECT_ID</code></li>
        </ul>
      </div>
      <p style="margin: 1.5rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">
        If you're deploying on Netlify, add these in Site Settings → Environment Variables
      </p>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
}

/**
 * Show generic error message
 */
function showGenericError(error: unknown): void {
  console.error('Application initialization error details:', error);
  
  // In development, show detailed error
  if (import.meta.env.NODE_ENV === 'development') {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4757;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.8rem;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    errorDiv.innerHTML = `
      <strong>Initialization Error:</strong><br/>
      ${error instanceof Error ? error.message : String(error)}
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }
}