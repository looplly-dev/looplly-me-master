import { useState, useEffect } from "react";
import { AlertCircle, Database, Globe, X, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "looplly_env_indicator_hidden";

/**
 * Visual indicator showing the current environment (local/remote Supabase)
 * Displays a colored banner at the top of the app in development mode
 */
const EnvironmentIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  
  useEffect(() => {
    // Check if user previously dismissed the indicator
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (hiddenUntil) {
      const timestamp = parseInt(hiddenUntil, 10);
      if (timestamp > Date.now()) {
        setIsVisible(false);
        return;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    
    // Get Supabase URL from environment
    const url = import.meta.env.VITE_SUPABASE_URL || "";
    setSupabaseUrl(url);
  }, []);
  
  const handleDismiss = () => {
    // Hide for 1 hour
    const oneHourFromNow = Date.now() + (60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEY, oneHourFromNow.toString());
    setIsVisible(false);
  };

  // Don't show in production mode
  if (import.meta.env.MODE === "production") {
    return null;
  }

  // Don't show if user dismissed it
  if (!isVisible) {
    return null;
  }

  // Determine environment type
  const isLocal = supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");
  const isRemote = !isLocal && supabaseUrl.length > 0;
  
  // Don't show if no Supabase URL configured
  if (!supabaseUrl) {
    return null;
  }

  // Configuration for different environments
  const mode = import.meta.env.MODE;
  const isDevelopment = import.meta.env.DEV;
  
  const envConfig = {
    local: {
      bgColor: "bg-emerald-500",
      textColor: "text-white",
      borderColor: "border-emerald-600",
      icon: Database,
      label: "LOCAL DEVELOPMENT",
      description: "Connected to local Supabase",
      url: supabaseUrl,
      emoji: "🟢",
    },
    remote: {
      bgColor: "bg-amber-500",
      textColor: "text-white",
      borderColor: "border-amber-600",
      icon: Globe,
      label: "REMOTE DEVELOPMENT",
      description: "⚠️ Connected to remote Supabase",
      url: supabaseUrl,
      emoji: "🟠",
    },
  };

  const config = isLocal ? envConfig.local : envConfig.remote;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.textColor} ${config.borderColor} border-b-2 shadow-md sticky top-0 z-50`}
      role="banner"
      aria-label={`Environment indicator: ${config.label}`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Icon and main info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Icon className="h-5 w-5 flex-shrink-0 animate-pulse" />
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              <span className="font-bold text-sm tracking-wide whitespace-nowrap flex items-center gap-2">
                <span>{config.emoji}</span>
                {config.label}
              </span>
              
              <span className="text-xs opacity-90 flex items-center gap-2">
                <span className="hidden sm:inline">•</span>
                <span>{config.description}</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">Mode: {mode}</span>
              </span>
            </div>
          </div>

          {/* Right side: URL, expand/collapse, and close button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <code className="hidden md:block text-xs bg-black/20 px-2 py-1 rounded font-mono max-w-xs truncate">
              {config.url}
            </code>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-black/20 rounded p-1 transition-colors"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              title={isExpanded ? "Hide details" : "Show details"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <button
              onClick={handleDismiss}
              className="hover:bg-black/20 rounded p-1 transition-colors"
              aria-label="Dismiss environment indicator"
              title="Dismiss for 1 hour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="opacity-70 block mb-1">Mode</span>
                <code className="bg-black/20 px-2 py-1 rounded">{mode}</code>
              </div>
              <div>
                <span className="opacity-70 block mb-1">Dev Server</span>
                <code className="bg-black/20 px-2 py-1 rounded">{isDevelopment ? "Running" : "Production"}</code>
              </div>
              <div className="sm:col-span-2">
                <span className="opacity-70 block mb-1">Supabase URL</span>
                <code className="bg-black/20 px-2 py-1 rounded block truncate">{supabaseUrl}</code>
              </div>
            </div>
            
            {isLocal && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="opacity-70">Quick Links:</span>
                <a 
                  href="http://127.0.0.1:54323" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black/20 hover:bg-black/30 px-2 py-1 rounded transition-colors"
                >
                  Studio Dashboard
                </a>
                <a 
                  href="http://127.0.0.1:54324" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black/20 hover:bg-black/30 px-2 py-1 rounded transition-colors"
                >
                  Email Testing
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Warning message for remote development */}
        {isRemote && !isExpanded && (
          <div className="mt-2 pt-2 border-t border-amber-600/50">
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="opacity-90">
                <strong>Warning:</strong> You are connected to a remote Supabase instance. 
                Changes may affect production data. Use <code className="bg-black/20 px-1 rounded">npm run dev</code> for local development.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentIndicator;
