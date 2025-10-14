import { Shield, Lock } from 'lucide-react';

export const Header = () => {
  return (
    <header className="w-full py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <Shield className="w-12 h-12 text-primary glow-primary" />
            <Lock className="w-5 h-5 text-safe absolute -bottom-1 -right-1" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            MalGuard AI
          </h1>
        </div>
        <p className="text-center text-xl text-muted-foreground max-w-2xl mx-auto">
          Advanced Machine Learning-Powered URL Security Analysis
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            Real-time Analysis
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            ML-Powered Detection
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            19+ Security Indicators
          </span>
        </div>
      </div>
    </header>
  );
};
