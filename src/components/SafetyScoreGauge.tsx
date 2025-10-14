import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SafetyScoreGaugeProps {
  score: number; // 0-100
  prediction: 'safe' | 'suspicious' | 'malicious';
}

export const SafetyScoreGauge = ({ score, prediction }: SafetyScoreGaugeProps) => {
  const gaugeData = [
    { value: score, fill: 'url(#scoreGradient)' },
    { value: 100 - score, fill: 'hsl(var(--muted) / 0.2)' }
  ];

  const getScoreColor = () => {
    if (score >= 70) return 'text-safe';
    if (score >= 40) return 'text-yellow-500';
    return 'text-malicious';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'Safe';
    if (score >= 40) return 'Caution';
    return 'Dangerous';
  };

  const getNeedleRotation = () => {
    return -90 + (score * 1.8);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto py-8">
      {/* Gauge Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--malicious))" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="hsl(var(--safe))" />
            </linearGradient>
          </defs>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius="75%"
            outerRadius="95%"
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
        className="absolute bottom-[22%] left-1/2 w-0.5 h-20 bg-foreground/80 origin-bottom transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translateX(-50%) rotate(${getNeedleRotation()}deg)`,
        }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground border-2 border-background shadow-lg" />
      </div>

      {/* Score Display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
        <div className={`text-6xl font-bold ${getScoreColor()} transition-colors duration-500 mb-1`}>
          {score.toFixed(0)}
        </div>
        <div className={`text-base font-semibold ${getScoreColor()} mb-1`}>
          {getScoreLabel()}
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Safety Score
        </div>
      </div>

      {/* Scale Labels - Minimized */}
      <div className="absolute bottom-[18%] left-0 right-0 flex justify-between px-2 text-[10px] text-muted-foreground/60">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
};
