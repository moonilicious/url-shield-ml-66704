export interface URLFeatures {
  url: string;
  // Basic URL properties
  url_length: number;
  host_length: number;
  path_length: number;
  
  // Character analysis
  num_digits: number;
  digits_ratio: number;
  longest_digit_run: number;
  num_hyphens: number;
  num_underscores: number;
  num_asterisks: number;
  
  // Domain analysis
  subdomain_count: number;
  tld_length: number;
  uncommon_tld: number;
  
  // Suspicious indicators
  has_at_symbol: number;
  has_ip_like_host: number;
  label_mixed_digits_letters: number;
  entropy_host: number;
  contains_obfuscation_chars: number;
  long_alnum_sequence: number;
  
  // Traditional features
  having_ip: number;
  shortening_service: number;
  double_slash_redirecting: number;
  prefix_suffix: number;
  ssl_final_state: number;
  domain_registration_length: number;
  port: number;
  https_token: number;
  abnormal_url: number;
}

export interface AnalysisResult {
  features: URLFeatures;
  prediction: 'safe' | 'malicious' | 'suspicious';
  confidence: number;
  riskFactors: string[];
  safetyFactors: string[];
  threshold: number;
  topFeatures: Array<[string, number]>;
}

// Feature extraction functions
const hasIP = (url: string): number => {
  const ipPattern = /(\d{1,3}\.){3}\d{1,3}/;
  return ipPattern.test(url) ? 1 : 0;
};

const getURLLength = (url: string): number => {
  return url.length;
};

const isShortening = (url: string): number => {
  const shorteningServices = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly'];
  return shorteningServices.some(service => url.includes(service)) ? 1 : 0;
};

const hasAtSymbol = (url: string): number => {
  return url.includes('@') ? 1 : 0;
};

const hasDoubleSlash = (url: string): number => {
  const position = url.indexOf('//');
  return position > 7 ? 1 : 0;
};

const hasPrefixSuffix = (url: string): number => {
  try {
    const domain = new URL(url).hostname;
    return domain.includes('-') ? 1 : 0;
  } catch {
    return 1;
  }
};

const countSubdomains = (url: string): number => {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return parts.length > 2 ? 1 : 0;
  } catch {
    return 1;
  }
};

const hasSSL = (url: string): number => {
  return url.startsWith('https://') ? 1 : 0;
};

const getDomainAge = (url: string): number => {
  // Simplified - in real ML this would check WHOIS data
  try {
    const hostname = new URL(url).hostname;
    const commonDomains = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'github', 'stackoverflow'];
    return commonDomains.some(d => hostname.includes(d)) ? 1 : 0;
  } catch {
    return 0;
  }
};

const hasPort = (url: string): number => {
  try {
    const urlObj = new URL(url);
    return urlObj.port ? 1 : 0;
  } catch {
    return 1;
  }
};

const hasHTTPSToken = (url: string): number => {
  const withoutProtocol = url.replace(/^https?:\/\//, '');
  return withoutProtocol.includes('https') ? 1 : 0;
};

// Enhanced feature extraction functions
const calculateEntropy = (str: string): number => {
  const freq = new Map<string, number>();
  for (const char of str) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  
  let entropy = 0;
  const len = str.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

const countDigits = (url: string): { count: number; ratio: number; longestRun: number } => {
  const digits = url.match(/\d/g) || [];
  const digitRuns = url.match(/\d+/g) || [];
  const longestRun = digitRuns.length > 0 
    ? Math.max(...digitRuns.map(run => run.length))
    : 0;
  
  return {
    count: digits.length,
    ratio: url.length > 0 ? digits.length / url.length : 0,
    longestRun
  };
};

const hasObfuscationChars = (url: string): number => {
  const obfuscationChars = /[\*\[\]\{\}\\~\|]/;
  return obfuscationChars.test(url) ? 1 : 0;
};

const checkMixedAlphaNum = (url: string): number => {
  try {
    const hostname = new URL(url).hostname;
    const labels = hostname.split('.');
    for (const label of labels) {
      if (/\d/.test(label) && /[a-z]/i.test(label)) {
        return 1;
      }
    }
    return 0;
  } catch {
    return 1;
  }
};

const getLongestAlnumSequence = (url: string): number => {
  const sequences = url.match(/[a-z0-9]+/gi) || [];
  return sequences.length > 0 
    ? Math.max(...sequences.map(seq => seq.length))
    : 0;
};

const checkUncommonTLD = (url: string): number => {
  const commonTLDs = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'ai'];
  try {
    const hostname = new URL(url).hostname;
    const tld = hostname.split('.').pop()?.toLowerCase() || '';
    return commonTLDs.includes(tld) ? 0 : 1;
  } catch {
    return 1;
  }
};

// Extract all features from URL
export const extractFeatures = (url: string): URLFeatures => {
  // Normalize URL
  let normalizedUrl = url.trim().toLowerCase();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  const urlLength = getURLLength(normalizedUrl);
  const digitStats = countDigits(normalizedUrl);
  const hyphens = (normalizedUrl.match(/-/g) || []).length;
  const underscores = (normalizedUrl.match(/_/g) || []).length;
  const asterisks = (normalizedUrl.match(/\*/g) || []).length;
  
  let hostLength = 0;
  let pathLength = 0;
  let entropyHost = 0;
  let tldLength = 0;
  
  try {
    const urlObj = new URL(normalizedUrl);
    hostLength = urlObj.hostname.length;
    pathLength = urlObj.pathname.length;
    entropyHost = calculateEntropy(urlObj.hostname);
    const tld = urlObj.hostname.split('.').pop() || '';
    tldLength = tld.length;
  } catch {
    // Invalid URL
  }
  
  return {
    url: normalizedUrl,
    
    // Basic properties
    url_length: urlLength,
    host_length: hostLength,
    path_length: pathLength,
    
    // Character analysis
    num_digits: digitStats.count,
    digits_ratio: digitStats.ratio,
    longest_digit_run: digitStats.longestRun,
    num_hyphens: hyphens,
    num_underscores: underscores,
    num_asterisks: asterisks,
    
    // Domain analysis
    subdomain_count: countSubdomains(normalizedUrl),
    tld_length: tldLength,
    uncommon_tld: checkUncommonTLD(normalizedUrl),
    
    // Suspicious indicators
    has_at_symbol: hasAtSymbol(normalizedUrl),
    has_ip_like_host: hasIP(normalizedUrl),
    label_mixed_digits_letters: checkMixedAlphaNum(normalizedUrl),
    entropy_host: entropyHost,
    contains_obfuscation_chars: hasObfuscationChars(normalizedUrl),
    long_alnum_sequence: getLongestAlnumSequence(normalizedUrl) >= 15 ? 1 : 0,
    
    // Traditional features
    having_ip: hasIP(normalizedUrl),
    shortening_service: isShortening(normalizedUrl),
    double_slash_redirecting: hasDoubleSlash(normalizedUrl),
    prefix_suffix: hasPrefixSuffix(normalizedUrl),
    ssl_final_state: hasSSL(normalizedUrl),
    domain_registration_length: getDomainAge(normalizedUrl),
    port: hasPort(normalizedUrl),
    https_token: hasHTTPSToken(normalizedUrl),
    abnormal_url: urlLength > 100 ? 1 : 0,
  };
};

// ML-inspired scoring algorithm with feature importance
export const analyzeURL = (url: string): AnalysisResult => {
  const features = extractFeatures(url);
  const riskFactors: string[] = [];
  const safetyFactors: string[] = [];
  const topFeatures: Array<[string, number]> = [];
  
  let riskScore = 0;
  let maxScore = 0;
  
  // Short-circuit for critical obfuscation indicators
  if (features.contains_obfuscation_chars || features.longest_digit_run >= 7 || 
      (features.has_ip_like_host && features.label_mixed_digits_letters)) {
    return {
      features,
      prediction: 'malicious',
      confidence: 95,
      riskFactors: [
        'Critical obfuscation detected',
        features.contains_obfuscation_chars ? 'Contains obfuscation characters (*, {}, [], etc.)' : '',
        features.longest_digit_run >= 7 ? `Suspicious digit sequence (${features.longest_digit_run} consecutive)` : '',
        features.has_ip_like_host && features.label_mixed_digits_letters ? 'IP-like host with mixed alphanumeric patterns' : ''
      ].filter(Boolean),
      safetyFactors: [],
      threshold: 0.4,
      topFeatures: [
        ['contains_obfuscation_chars', features.contains_obfuscation_chars],
        ['longest_digit_run', features.longest_digit_run / 10],
        ['has_ip_like_host', features.has_ip_like_host]
      ]
    };
  }

  // Weighted feature analysis (inspired by Random Forest feature importance)
  if (features.having_ip) {
    riskScore += 3;
    riskFactors.push('IP address in URL (high risk)');
  } else {
    safetyFactors.push('No IP address detected');
  }
  maxScore += 3;

  if (features.url_length > 75) {
    riskScore += 2;
    riskFactors.push('Unusually long URL');
  } else {
    safetyFactors.push('Normal URL length');
  }
  maxScore += 2;

  if (features.shortening_service) {
    riskScore += 2;
    riskFactors.push('URL shortening service detected');
  } else {
    safetyFactors.push('Direct URL (not shortened)');
  }
  maxScore += 2;

  if (features.has_at_symbol) {
    riskScore += 2.5;
    riskFactors.push('@ symbol in URL (phishing indicator)');
  }
  maxScore += 2.5;

  if (features.double_slash_redirecting) {
    riskScore += 2;
    riskFactors.push('Suspicious redirect pattern');
  }
  maxScore += 2;

  if (features.prefix_suffix) {
    riskScore += 1.5;
    riskFactors.push('Hyphen in domain name');
  }
  maxScore += 1.5;

  if (features.subdomain_count) {
    riskScore += 1;
    riskFactors.push('Multiple subdomains detected');
  }
  maxScore += 1;

  if (!features.ssl_final_state) {
    riskScore += 3;
    riskFactors.push('No HTTPS encryption');
  } else {
    safetyFactors.push('HTTPS encryption enabled');
  }
  maxScore += 3;

  if (!features.domain_registration_length) {
    riskScore += 1.5;
    riskFactors.push('Unknown or new domain');
  } else {
    safetyFactors.push('Established domain');
  }
  maxScore += 1.5;

  if (features.port) {
    riskScore += 1.5;
    riskFactors.push('Non-standard port detected');
  }
  maxScore += 1.5;

  if (features.https_token) {
    riskScore += 2.5;
    riskFactors.push('HTTPS in domain (deceptive)');
  }
  maxScore += 2.5;

  if (features.abnormal_url) {
    riskScore += 1;
    riskFactors.push('Abnormal URL structure');
    topFeatures.push(['abnormal_url', 1]);
  }
  maxScore += 1;
  
  // Enhanced feature checks
  if (features.entropy_host > 4.5) {
    riskScore += 2;
    riskFactors.push('High entropy in hostname (randomized characters)');
    topFeatures.push(['entropy_host', features.entropy_host / 5]);
  }
  maxScore += 2;
  
  if (features.longest_digit_run >= 4) {
    riskScore += 1.5;
    riskFactors.push(`Long digit sequence detected (${features.longest_digit_run} digits)`);
    topFeatures.push(['longest_digit_run', features.longest_digit_run / 10]);
  }
  maxScore += 1.5;
  
  if (features.label_mixed_digits_letters) {
    riskScore += 1.5;
    riskFactors.push('Mixed alphanumeric patterns in domain labels');
    topFeatures.push(['label_mixed_digits_letters', 1.5]);
  }
  maxScore += 1.5;
  
  if (features.uncommon_tld) {
    riskScore += 1;
    riskFactors.push('Uncommon top-level domain');
    topFeatures.push(['uncommon_tld', 1]);
  } else {
    safetyFactors.push('Common top-level domain');
  }
  maxScore += 1;

  // Calculate confidence based on risk score
  const riskPercentage = (riskScore / maxScore) * 100;
  const threshold = 0.4;
  
  // Decision logic with suspicious category
  let prediction: 'safe' | 'malicious' | 'suspicious';
  if (riskPercentage > 60) {
    prediction = 'malicious';
  } else if (riskPercentage > 35) {
    prediction = 'suspicious';
  } else {
    prediction = 'safe';
  }
  
  // Confidence calculation (higher certainty at extremes)
  let confidence: number;
  if (riskPercentage > 70 || riskPercentage < 20) {
    confidence = Math.min(95, 75 + Math.abs(riskPercentage - 50));
  } else {
    confidence = 60 + Math.abs(riskPercentage - 50) * 0.5;
  }

  // Sort and take top 5 features
  const sortedFeatures = topFeatures
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5);

  return {
    features,
    prediction,
    confidence: Math.round(confidence * 10) / 10,
    riskFactors,
    safetyFactors,
    threshold,
    topFeatures: sortedFeatures,
  };
};
