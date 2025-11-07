import { Database, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DevEnvironmentRibbon() {
  const [isLocalSupabase, setIsLocalSupabase] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    setIsLocalSupabase(
      supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1')
    );
  }, []);

  // Only show in development with local Supabase
  if (import.meta.env.NODE_ENV !== 'development' || !isLocalSupabase) {
    return null;
  }

  const supabaseLinks = [
    { name: 'Studio', url: 'http://127.0.0.1:54323', icon: Database },
    { name: 'API', url: 'http://127.0.0.1:54321' },
    { name: 'Mailpit', url: 'http://127.0.0.1:54324' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 py-1 shadow-lg">
      <div className="container mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          <span className="font-semibold">DEV MODE</span>
          <span className="opacity-90">Local Supabase @ {import.meta.env.VITE_SUPABASE_URL}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {supabaseLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              {link.icon && <link.icon className="h-3 w-3" />}
              <span>{link.name}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
