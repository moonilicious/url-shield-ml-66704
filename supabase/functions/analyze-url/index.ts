import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Feature extraction functions
function calculateEntropy(str: string): number {
  const len = str.length;
  const frequencies: { [key: string]: number } = {};
  
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const freq of Object.values(frequencies)) {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

function extractFeatures(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    const fullUrl = url;
    
    // Basic metrics
    const urlLength = fullUrl.length;
    const hostnameLength = hostname.length;
    const numDots = (hostname.match(/\./g) || []).length;
    const numHyphens = (hostname.match(/-/g) || []).length;
    const numDigits = (fullUrl.match(/\d/g) || []).length;
    const numSpecialChars = (fullUrl.match(/[^a-zA-Z0-9.-]/g) || []).length;
    
    // Entropy calculations
    const entropyHost = calculateEntropy(hostname);
    const entropyUrl = calculateEntropy(fullUrl);
    
    // Pattern detection
    const hasIpPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname);
    const usesHttps = urlObj.protocol === 'https:';
    const hasEncodedChars = /%[0-9A-Fa-f]{2}/.test(fullUrl);
    
    // Ratios
    const digitRatio = numDigits / urlLength;
    const specialCharRatio = numSpecialChars / urlLength;
    const hyphenRatio = numHyphens / hostnameLength;
    
    // Subdomain analysis
    const parts = hostname.split('.');
    const subdomainCount = Math.max(0, parts.length - 2);
    
    // TLD analysis
    const tld = parts[parts.length - 1]?.toLowerCase() || '';
    const tldLength = tld.length;
    
    // Domain name (without TLD)
    const domainName = parts.length >= 2 ? parts[parts.length - 2] : '';
    const domainLength = domainName.length;
    
    // High-risk TLDs
    const highRiskTlds = ['shop', 'top', 'xyz', 'cn', 'ru', 'tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'cc', 'ws'];
    const isHighRiskTld = highRiskTlds.includes(tld);
    
    // Brand keywords that are often abused
    const brandKeywords = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'instagram', 'netflix', 'bank', 'secure'];
    const hasBrandKeyword = brandKeywords.some(brand => hostname.toLowerCase().includes(brand));
    
    // Suspicious keywords
    const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'free', 'bonus', 'prize', 'click', 'win', 'urgent'];
    const hasSuspiciousKeyword = suspiciousKeywords.some(keyword => fullUrl.toLowerCase().includes(keyword));
    
    // Randomness score (combination of entropy and character patterns)
    const randomnessScore = (entropyHost / 5) * digitRatio * (specialCharRatio + 0.1);
    
    // Path complexity
    const pathDepth = pathname.split('/').filter(p => p.length > 0).length;
    const numParameters = urlObj.searchParams.size;
    
    return {
      urlLength,
      hostnameLength,
      numDots,
      numHyphens,
      numDigits,
      numSpecialChars,
      entropyHost,
      entropyUrl,
      hasIpPattern,
      usesHttps,
      hasEncodedChars,
      digitRatio,
      specialCharRatio,
      hyphenRatio,
      subdomainCount,
      tldLength,
      hasSuspiciousKeyword,
      pathDepth,
      numParameters,
      tld,
      isHighRiskTld,
      domainName,
      domainLength,
      hasBrandKeyword,
      randomnessScore
    };
  } catch (error) {
    console.error('Feature extraction error:', error);
    return null;
  }
}

// SVM-inspired scoring algorithm with non-linear penalties
function calculateMaliciousScore(features: any): { score: number; featureImportance: any } {
  let score = 0;
  const featureImportance: any = {};
  
  // TLD Risk Weight (0-20 points) - HIGH PRIORITY
  const tldScore = features.isHighRiskTld ? 20 : 0;
  score += tldScore;
  featureImportance.risky_tld = parseFloat((tldScore / 20).toFixed(2));
  
  // Non-linear entropy scoring (0-25 points) - Aggressive for high entropy
  const entropyScore = features.entropyHost > 3.5 
    ? 25 
    : Math.min(25, Math.pow(features.entropyHost / 3.5, 1.5) * 25);
  score += entropyScore;
  featureImportance.entropy = parseFloat((entropyScore / 25).toFixed(2));
  
  // HTTPS factor (0-15 points) - Strong penalty for non-HTTPS
  const httpsScore = features.usesHttps ? -5 : 15;
  score += httpsScore;
  featureImportance.https_missing = parseFloat((Math.max(0, httpsScore) / 15).toFixed(2));
  
  // Domain length penalty (0-15 points) - Very short domains are suspicious
  const domainLengthScore = features.domainLength < 6 
    ? 15 
    : features.domainLength < 8 
      ? 8 
      : 0;
  score += domainLengthScore;
  featureImportance.short_domain = parseFloat((domainLengthScore / 15).toFixed(2));
  
  // Digit ratio (0-12 points) - Non-linear penalty
  const digitScore = features.numDigits > 3 
    ? 12 
    : Math.min(12, Math.pow(features.digitRatio, 0.7) * 12);
  score += digitScore;
  featureImportance.digit_ratio = parseFloat((digitScore / 12).toFixed(2));
  
  // Special characters (0-10 points)
  const specialCharScore = features.numSpecialChars > 2 
    ? 10 
    : features.specialCharRatio * 10;
  score += specialCharScore;
  featureImportance.special_chars = parseFloat((specialCharScore / 10).toFixed(2));
  
  // IP address detection (0-25 points) - CRITICAL
  const ipScore = features.hasIpPattern ? 25 : 0;
  score += ipScore;
  featureImportance.ip_address = parseFloat((ipScore / 25).toFixed(2));
  
  // Subdomain penalty (0-15 points)
  const subdomainScore = features.subdomainCount > 2 
    ? 15 
    : features.subdomainCount * 5;
  score += subdomainScore;
  featureImportance.subdomain_count = parseFloat((subdomainScore / 15).toFixed(2));
  
  // Randomness score (0-10 points)
  const randomnessScorePoints = features.randomnessScore > 0.5 
    ? 10 
    : features.randomnessScore * 20;
  score += randomnessScorePoints;
  featureImportance.randomness = parseFloat((randomnessScorePoints / 10).toFixed(2));
  
  // Brand keyword abuse (0-12 points)
  const brandScore = features.hasBrandKeyword ? 12 : 0;
  score += brandScore;
  featureImportance.brand_abuse = parseFloat((brandScore / 12).toFixed(2));
  
  // Suspicious keywords (0-10 points)
  const keywordScore = features.hasSuspiciousKeyword ? 10 : 0;
  score += keywordScore;
  featureImportance.suspicious_keywords = parseFloat((keywordScore / 10).toFixed(2));
  
  // Hyphen ratio (0-8 points)
  const hyphenScore = features.hyphenRatio > 0.2 ? 8 : features.hyphenRatio * 40;
  score += hyphenScore;
  featureImportance.hyphen_usage = parseFloat((hyphenScore / 8).toFixed(2));
  
  // Encoded characters (0-5 points)
  const encodedScore = features.hasEncodedChars ? 5 : 0;
  score += encodedScore;
  featureImportance.url_encoding = parseFloat((encodedScore / 5).toFixed(2));
  
  // URL length penalty (0-8 points)
  const lengthScore = features.urlLength > 75 
    ? Math.min(8, (features.urlLength - 75) / 15) 
    : 0;
  score += lengthScore;
  featureImportance.url_length = parseFloat((lengthScore / 8).toFixed(2));
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  return { score: normalizedScore, featureImportance };
}

function classifyUrl(score: number): 'safe' | 'suspicious' | 'malicious' {
  if (score <= 40) return 'safe';
  if (score <= 65) return 'suspicious';
  return 'malicious';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing URL:', url);

    // Extract features
    const features = extractFeatures(url);
    if (!features) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract URL features' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate ML-inspired score
    const { score, featureImportance } = calculateMaliciousScore(features);
    const classification = classifyUrl(score);
    
    console.log('ML Score:', score, 'Classification:', classification);

    // Use Lovable AI for enhanced contextual analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a cybersecurity expert providing human-readable explanations for URL security analysis. 
Based on the extracted features and ML score, provide:
- reasoning: array of 2-4 concise strings explaining why this URL received its score
- threat_indicators: specific patterns that contributed to the score

Consider the feature analysis: entropy=${features.entropyHost.toFixed(2)}, digits=${(features.digitRatio * 100).toFixed(1)}%, https=${features.usesHttps}, subdomains=${features.subdomainCount}, ip=${features.hasIpPattern}, tld=${features.tld}, domain_length=${features.domainLength}, risky_tld=${features.isHighRiskTld}`
          },
          {
            role: 'user',
            content: `Explain why this ${classification} URL scored ${score.toFixed(1)}/100: ${url}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    let aiExplanation = { reasoning: [], threat_indicators: [] };
    
    if (aiResponse.ok) {
      try {
        const aiData = await aiResponse.json();
        aiExplanation = JSON.parse(aiData.choices[0].message.content);
      } catch (error) {
        console.error('AI explanation parsing error:', error);
      }
    } else {
      console.warn('AI analysis failed, using fallback explanation');
    }

    return new Response(
      JSON.stringify({
        url,
        score: parseFloat(score.toFixed(1)),
        classification,
        confidence: Math.round((classification === 'safe' ? (40 - score) / 40 : score / 100) * 100),
        reasoning: aiExplanation.reasoning || [],
        threat_indicators: aiExplanation.threat_indicators || [],
        featureImportance,
        features: {
          entropy: parseFloat(features.entropyHost.toFixed(2)),
          https: features.usesHttps,
          has_ip: features.hasIpPattern,
          subdomain_count: features.subdomainCount,
          digit_ratio: parseFloat((features.digitRatio * 100).toFixed(1)),
          suspicious_keywords: features.hasSuspiciousKeyword,
          tld: features.tld,
          risky_tld: features.isHighRiskTld,
          domain_length: features.domainLength,
          randomness_score: parseFloat(features.randomnessScore.toFixed(2))
        },
        analyzed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-url function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
