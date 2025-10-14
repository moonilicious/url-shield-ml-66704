import { Card } from '@/components/ui/card';
import { Brain, Database, Target, Zap } from 'lucide-react';

export const InfoSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'ML Algorithm',
      description: 'Trained on 5000+ malicious and legitimate URLs',
      color: 'text-primary',
    },
    {
      icon: Database,
      title: '19 Features',
      description: 'Analyzes URL structure, SSL, domain age, and more',
      color: 'text-safe',
    },
    {
      icon: Target,
      title: 'High Accuracy',
      description: 'Detects phishing, IP-based URLs, and suspicious patterns',
      color: 'text-malicious',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Real-time analysis with confidence scoring',
      color: 'text-accent',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
