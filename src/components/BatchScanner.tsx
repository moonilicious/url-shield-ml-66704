import { useState } from 'react';
import { Upload, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BatchResult {
  url: string;
  prediction: string;
  confidence: number;
  category?: string;
  error?: string;
}

export const BatchScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }

    setFileName(file.name);
    const text = await file.text();
    const urls = text
      .split(/[\n,]/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('http') ? false : true)
      .slice(0, 100); // Limit to 100 URLs

    if (urls.length === 0) {
      toast.error('No valid URLs found in file');
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('batch-analyze', {
        body: { urls }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('AI usage limit reached. Please add credits.');
        } else {
          toast.error('Batch analysis failed');
        }
        return;
      }

      setResults(data.results);
      toast.success(`Analyzed ${data.results.length} URLs`);
    } catch (error) {
      console.error('Batch analysis error:', error);
      toast.error('An error occurred during batch analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    const csv = [
      'URL,Prediction,Confidence,Category',
      ...results.map(r => 
        `"${r.url}","${r.prediction}",${r.confidence},"${r.category || 'N/A'}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malguard-results-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSafeCount = () => results.filter(r => r.prediction === 'safe').length;
  const getMaliciousCount = () => results.filter(r => r.prediction === 'malicious').length;
  const getSuspiciousCount = () => results.filter(r => r.prediction === 'suspicious').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-8 backdrop-blur-sm bg-card/50 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Batch URL Analysis</h2>
          </div>
          <p className="text-muted-foreground">
            Upload a CSV or TXT file with URLs (one per line, max 100)
          </p>
          
          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                disabled={isProcessing}
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              >
                <Upload className="mr-2 h-5 w-5" />
                {fileName || 'Choose File'}
              </Button>
            </label>
            
            {results.length > 0 && (
              <Button
                onClick={downloadResults}
                variant="outline"
                className="px-6"
              >
                <Download className="mr-2 h-5 w-5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isProcessing && (
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Analyzing URLs...</p>
        </Card>
      )}

      {results.length > 0 && !isProcessing && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6 bg-safe/10 border-safe">
              <div className="text-4xl font-bold text-safe">{getSafeCount()}</div>
              <div className="text-sm text-muted-foreground">Safe URLs</div>
            </Card>
            <Card className="p-6 bg-yellow-500/10 border-yellow-500">
              <div className="text-4xl font-bold text-yellow-500">{getSuspiciousCount()}</div>
              <div className="text-sm text-muted-foreground">Suspicious</div>
            </Card>
            <Card className="p-6 bg-malicious/10 border-malicious">
              <div className="text-4xl font-bold text-malicious">{getMaliciousCount()}</div>
              <div className="text-sm text-muted-foreground">Malicious</div>
            </Card>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4">Results</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    result.prediction === 'safe'
                      ? 'bg-safe/5 border-safe/30'
                      : result.prediction === 'suspicious'
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-malicious/5 border-malicious/30'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm break-all flex-1">{result.url}</span>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        result.prediction === 'safe'
                          ? 'text-safe'
                          : result.prediction === 'suspicious'
                          ? 'text-yellow-500'
                          : 'text-malicious'
                      }`}>
                        {result.prediction.toUpperCase()}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {result.confidence}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
