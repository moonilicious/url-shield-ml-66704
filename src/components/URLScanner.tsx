import { useState } from 'react';
import { Shield, Loader2, AlertTriangle, CheckCircle, Info, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { analyzeURL, type AnalysisResult } from '@/lib/urlAnalysis';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const URLScanner = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to analyze');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setAiResult(null);

    try {
      // Local analysis
      const localAnalysis = analyzeURL(url);
      setResult(localAnalysis);

      // AI-enhanced analysis
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url }
      });

      if (error) {
        console.error('AI analysis error:', error);
        if (error.message.includes('429')) {
          toast.warning('Rate limit reached. Showing local analysis only.');
        } else if (error.message.includes('402')) {
          toast.warning('AI credits depleted. Showing local analysis only.');
        }
      } else {
        setAiResult(data);
      }
      
      if (localAnalysis.prediction === 'malicious' || data?.prediction === 'malicious') {
        toast.error('Warning: This URL appears to be malicious!');
      } else if (localAnalysis.prediction === 'suspicious' || data?.prediction === 'suspicious') {
        toast.warning('Caution: This URL shows suspicious indicators');
      } else {
        toast.success('This URL appears to be safe');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Error analyzing URL. Please check the format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Input Section */}
      <Card className="p-8 backdrop-blur-sm bg-card/50 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Enter URL to Analyze</h2>
          </div>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-12 text-lg bg-secondary/50 border-primary/30 focus:border-primary"
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="lg"
              className="px-8 glow-primary"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Check Safety'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Result Card */}
          <Card
            className={`p-8 border-2 ${
              result.prediction === 'safe'
                ? 'bg-safe/10 border-safe glow-safe'
                : result.prediction === 'suspicious'
                ? 'bg-yellow-500/10 border-yellow-500'
                : 'bg-malicious/10 border-malicious glow-malicious'
            }`}
          >
            <div className="flex items-start gap-6">
              <div
                className={`p-4 rounded-full ${
                  result.prediction === 'safe' 
                    ? 'bg-safe/20' 
                    : result.prediction === 'suspicious'
                    ? 'bg-yellow-500/20'
                    : 'bg-malicious/20'
                }`}
              >
                {result.prediction === 'safe' ? (
                  <CheckCircle className="w-12 h-12 text-safe" />
                ) : result.prediction === 'suspicious' ? (
                  <AlertTriangle className="w-12 h-12 text-yellow-500" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-malicious" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-2">
                  {result.prediction === 'safe' 
                    ? 'Safe URL' 
                    : result.prediction === 'suspicious'
                    ? 'Suspicious URL'
                    : 'Malicious URL Detected'}
                </h3>
                <p className="text-lg text-muted-foreground mb-4">
                  {result.prediction === 'safe'
                    ? 'This URL appears to be legitimate and safe to visit.'
                    : result.prediction === 'suspicious'
                    ? 'This URL shows some suspicious indicators. Exercise caution.'
                    : 'This URL shows multiple indicators of being potentially harmful.'}
                </p>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    Confidence Score: {result.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-malicious" />
                Risk Indicators Detected
              </h4>
              <ul className="space-y-2">
                {result.riskFactors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-malicious-foreground/80"
                  >
                    <span className="text-malicious mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Safety Factors */}
          {result.safetyFactors.length > 0 && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-safe" />
                Safety Indicators
              </h4>
              <ul className="space-y-2">
                {result.safetyFactors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-safe-foreground/80"
                  >
                    <span className="text-safe mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* AI Analysis Results */}
          {aiResult && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI-Enhanced Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Prediction:</span>
                  <span className={`font-bold ${
                    aiResult.prediction === 'safe' 
                      ? 'text-safe' 
                      : aiResult.prediction === 'suspicious'
                      ? 'text-yellow-500'
                      : 'text-malicious'
                  }`}>
                    {aiResult.prediction?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Confidence:</span>
                  <span className="font-medium">{aiResult.confidence}%</span>
                </div>
                {aiResult.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Threat Category:</span>
                    <span className="font-medium capitalize">{aiResult.category}</span>
                  </div>
                )}
                {aiResult.reasoning && aiResult.reasoning.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold mb-2">AI Reasoning:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {aiResult.reasoning.map((reason: string, idx: number) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Technical Details */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h4 className="text-xl font-bold mb-4">Technical Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">URL Length:</span>
                <span className="ml-2 font-medium">{result.features.url_length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">HTTPS:</span>
                <span className="ml-2 font-medium">
                  {result.features.ssl_final_state ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">IP Address:</span>
                <span className="ml-2 font-medium">
                  {result.features.having_ip ? '✗ Present' : '✓ None'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Shortening:</span>
                <span className="ml-2 font-medium">
                  {result.features.shortening_service ? '✗ Yes' : '✓ No'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Subdomains:</span>
                <span className="ml-2 font-medium">
                  {result.features.subdomain_count ? 'Multiple' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">@ Symbol:</span>
                <span className="ml-2 font-medium">
                  {result.features.has_at_symbol ? '✗ Present' : '✓ None'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
