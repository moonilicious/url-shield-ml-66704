import { Card } from '@/components/ui/card';
import { BarChart3, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export const InsightsPage = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 mt-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Dataset Insights & Model Performance</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          MalGuard AI uses advanced feature extraction and AI-powered analysis to detect malicious URLs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <BarChart3 className="w-8 h-8 text-primary mb-3" />
          <div className="text-3xl font-bold mb-1">32+</div>
          <div className="text-sm text-muted-foreground">Feature Dimensions</div>
        </Card>
        
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <Shield className="w-8 h-8 text-safe mb-3" />
          <div className="text-3xl font-bold mb-1">AI-Powered</div>
          <div className="text-sm text-muted-foreground">Google Gemini Analysis</div>
        </Card>
        
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <TrendingUp className="w-8 h-8 text-primary mb-3" />
          <div className="text-3xl font-bold mb-1">Real-time</div>
          <div className="text-sm text-muted-foreground">Instant Detection</div>
        </Card>
        
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <AlertTriangle className="w-8 h-8 text-malicious mb-3" />
          <div className="text-3xl font-bold mb-1">Multi-layer</div>
          <div className="text-sm text-muted-foreground">Detection System</div>
        </Card>
      </div>

      <Card className="p-8 bg-card/50 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-6">Key Features Analyzed</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-primary">URL Structure Analysis</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• URL length and path complexity</li>
              <li>• Domain and subdomain patterns</li>
              <li>• IP address detection</li>
              <li>• Port and protocol analysis</li>
              <li>• TLD (top-level domain) verification</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-primary">Content Pattern Detection</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Character frequency analysis</li>
              <li>• Obfuscation technique detection</li>
              <li>• Mixed alphanumeric patterns</li>
              <li>• Entropy calculation</li>
              <li>• URL shortening service detection</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-primary">Security Indicators</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• HTTPS/SSL certificate presence</li>
              <li>• Phishing pattern recognition</li>
              <li>• Domain age and reputation</li>
              <li>• Redirect chain analysis</li>
              <li>• Suspicious character sequences</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semobold mb-3 text-primary">AI Enhancement</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Contextual threat analysis</li>
              <li>• Known malicious pattern matching</li>
              <li>• Typosquatting detection</li>
              <li>• Homograph attack identification</li>
              <li>• Real-time threat intelligence</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-card/50 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-6">Detection Methodology</h3>
        <div className="space-y-4 text-muted-foreground">
          <p>
            MalGuard AI combines rule-based feature extraction with AI-powered analysis using Google's Gemini model.
            The system processes each URL through multiple layers:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>
              <strong className="text-foreground">Feature Extraction:</strong> 32+ numerical features are extracted
              from the URL structure, content, and patterns
            </li>
            <li>
              <strong className="text-foreground">Rule-based Analysis:</strong> Critical obfuscation patterns trigger
              immediate high-risk classification
            </li>
            <li>
              <strong className="text-foreground">AI Analysis:</strong> Google Gemini evaluates domain reputation,
              typosquatting, and contextual threats
            </li>
            <li>
              <strong className="text-foreground">Confidence Scoring:</strong> Results are calibrated with confidence
              levels for actionable insights
            </li>
          </ol>
          <p className="pt-4">
            This multi-layered approach ensures high accuracy while minimizing false positives, providing reliable
            protection against evolving phishing and malware threats.
          </p>
        </div>
      </Card>
    </div>
  );
};
