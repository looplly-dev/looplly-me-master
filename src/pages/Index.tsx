import { Link } from 'react-router-dom';
import { LevelProgressDemo } from "@/components/dashboard/LevelProgressDemo";
import { Shield } from 'lucide-react';

const Index = () => {
  // Show the level progress demo for now
  return (
    <div className="relative">
      <LevelProgressDemo />
      
      {/* Subtle team login link in top right */}
      <Link 
        to="/admin/login"
        className="fixed top-4 right-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Shield className="h-3 w-3" />
        Team Login
      </Link>
    </div>
  );
};

export default Index;
