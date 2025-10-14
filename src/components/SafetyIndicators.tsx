import { Shield, AlertTriangle, CheckCircle, Lock, Link2, Hash, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Indicator {
  label: string;
  value: string | number;
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
      label: 'HTTPS Security',
      value: features.ssl_final_state === 1 ? 'Enabled' : 'Missing',
      status: features.ssl_final_state === 1 ? 'safe' : 'danger',
      icon: <Lock className="w-4 h-4" />
    },
    {
      label: 'URL Length',
      value: features.url_length > 75 ? 'Suspicious' : 'Normal',
      status: features.url_length > 75 ? 'warning' : 'safe',
      icon: <Link2 className="w-4 h-4" />
    },
    {
      label: 'IP Address',
      value: features.having_ip === 1 ? 'Present' : 'None',
      status: features.having_ip === 1 ? 'danger' : 'safe',
      icon: <Hash className="w-4 h-4" />
    },
    {
      label: 'URL Shortening',
      value: features.shortening_service === 1 ? 'Detected' : 'None',
      status: features.shortening_service === 1 ? 'warning' : 'safe',
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: 'Suspicious Symbols',
      value: features.has_at_symbol === 1 ? 'Detected' : 'None',
      status: features.has_at_symbol === 1 ? 'danger' : 'safe',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      label: 'Subdomain Count',
      value: features.subdomain_count === 1 ? 'Multiple' : 'Standard',
      status: features.subdomain_count === 1 ? 'warning' : 'safe',
      icon: <Shield className="w-4 h-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-safe/20 text-safe border-safe/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'danger':
        return 'bg-malicious/20 text-malicious border-malicious/50';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'danger':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Security Analysis Breakdown
      </h4>

      {/* Visual Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getStatusColor(indicator.status)} transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-left-4`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {indicator.icon}
                <span className="font-medium text-sm">{indicator.label}</span>
              </div>
              {getStatusIcon(indicator.status)}
            </div>
            <div className="text-lg font-bold">{indicator.value}</div>
          </div>
        ))}
      </div>

      {/* Risk Factors Tags */}
      {riskFactors.length > 0 && (
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-semibold text-malicious flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Risk Indicators
          </h5>
          <div className="flex flex-wrap gap-2">
            {riskFactors.map((factor, index) => (
              <Badge
                key={index}
                variant="destructive"
                className="bg-malicious/20 text-malicious border-malicious/50 animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Safety Factors Tags */}
      {safetyFactors.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-safe flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Safety Indicators
          </h5>
          <div className="flex flex-wrap gap-2">
            {safetyFactors.map((factor, index) => (
              <Badge
                key={index}
                className="bg-safe/20 text-safe border-safe/50 animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
