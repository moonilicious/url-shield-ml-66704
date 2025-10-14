import { Shield, AlertTriangle, CheckCircle, Lock, Link2, Hash, Zap, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Indicator {
  label: string;
  value: string;
  status: 'safe' | 'warning' | 'danger';
  icon: React.ReactNode;
}

interface SafetyIndicatorsProps {
  features: {
    url_length: number;
    ssl_final_state: number;
    having_ip: number;
    shortening_service: number;
    subdomain_count: number;
    has_at_symbol: number;
    [key: string]: any;
  };
  riskFactors: string[];
  safetyFactors: string[];
}

export const SafetyIndicators = ({ features, riskFactors, safetyFactors }: SafetyIndicatorsProps) => {
  const indicators: Indicator[] = [
    {
      label: 'HTTPS',
      value: features.ssl_final_state === 1 ? 'Secure' : 'Insecure',
      status: features.ssl_final_state === 1 ? 'safe' : 'danger',
      icon: <Lock className="w-4 h-4" />
    },
    {
      label: 'Length',
      value: features.url_length > 75 ? 'Long' : 'Normal',
      status: features.url_length > 75 ? 'warning' : 'safe',
      icon: <Link2 className="w-4 h-4" />
    },
    {
      label: 'IP Address',
      value: features.having_ip === 1 ? 'Detected' : 'Clean',
      status: features.having_ip === 1 ? 'danger' : 'safe',
      icon: <Hash className="w-4 h-4" />
    },
    {
      label: 'Shortener',
      value: features.shortening_service === 1 ? 'Yes' : 'No',
      status: features.shortening_service === 1 ? 'warning' : 'safe',
      icon: <Zap className="w-4 h-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'border-safe/30 bg-safe/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'danger':
        return 'border-malicious/30 bg-malicious/5';
      default:
        return 'border-muted bg-muted/5';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'safe':
        return <div className="w-2 h-2 rounded-full bg-safe" />;
      case 'warning':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'danger':
        return <div className="w-2 h-2 rounded-full bg-malicious" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      {/* Quick Indicators */}
      <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-muted-foreground">Quick Analysis</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getStatusColor(indicator.status)} transition-all duration-300 animate-in fade-in zoom-in-95`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground/60">
                  {indicator.icon}
                </div>
                {getStatusIndicator(indicator.status)}
              </div>
              <div className="text-xs font-medium text-muted-foreground mb-0.5">
                {indicator.label}
              </div>
              <div className="text-sm font-semibold">
                {indicator.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Factors */}
      {(riskFactors.length > 0 || safetyFactors.length > 0) && (
        <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/10">
          <div className="space-y-4">
            {riskFactors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-malicious" />
                  <h5 className="text-sm font-semibold">Risk Factors</h5>
                </div>
                <ul className="space-y-2">
                  {riskFactors.slice(0, 3).map((factor, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2 animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-malicious mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {safetyFactors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-safe" />
                  <h5 className="text-sm font-semibold">Safety Factors</h5>
                </div>
                <ul className="space-y-2">
                  {safetyFactors.slice(0, 3).map((factor, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2 animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-safe mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
