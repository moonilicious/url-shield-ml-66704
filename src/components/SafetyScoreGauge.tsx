import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SafetyScoreGaugeProps {
  score: number; // 0-100
  prediction: 'safe' | 'suspicious' | 'malicious';
}

export const SafetyScoreGauge = ({ score, prediction }: SafetyScoreGaugeProps) => {
  // Create gauge data - semicircle from 0 to 100
  const gaugeData = [
    { value: score, fill: 'url(#scoreGradient)' },
    { value: 100 - score, fill: 'hsl(var(--muted))' }
  ];

  const getScoreColor = () => {
    if (score <= 30) return 'text-safe';
    if (score <= 70) return 'text-yellow-500';
    return 'text-malicious';
  };

  const getScoreLabel = () => {
    if (score <= 30) return 'Safe';
    if (score <= 70) return 'Caution';
    return 'Dangerous';
  };

  const getNeedleRotation = () => {
    // Rotate from -90 (left) to 90 (right)
    return -90 + (score * 1.8);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Gauge Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--safe))" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="hsl(var(--malicious))" />
            </linearGradient>
          </defs>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Needle */}
      <div 
        className="absolute bottom-[15%] left-1/2 w-1 h-24 bg-foreground origin-bottom transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translateX(-50%) rotate(${getNeedleRotation()}deg)`,
        }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground shadow-lg" />
      </div>

      {/* Score Display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
        <div className={`text-5xl font-bold ${getScoreColor()} transition-colors duration-500`}>
          {score.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Safety Score
        </div>
        <div className={`text-lg font-semibold ${getScoreColor()}`}>
          {getScoreLabel()}
        </div>
      </div>

      {/* Scale Labels */}
      <div className="absolute bottom-[8%] left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
        <span className="text-safe font-medium">0</span>
        <span className="text-yellow-500 font-medium">50</span>
        <span className="text-malicious font-medium">100</span>
      </div>

      {/* Zone Labels */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-8 text-xs font-medium">
        <span className="text-safe">Safe</span>
        <span className="text-yellow-500">Caution</span>
        <span className="text-malicious">Dangerous</span>
      </div>
    </div>
  );
};
