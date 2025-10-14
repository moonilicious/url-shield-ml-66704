import { useState } from 'react';
import { Header } from '@/components/Header';
import { URLScanner } from '@/components/URLScanner';
import { InfoSection } from '@/components/InfoSection';
import { BatchScanner } from '@/components/BatchScanner';
import { InsightsPage } from '@/components/InsightsPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-12">
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="scanner">Single URL</TabsTrigger>
              <TabsTrigger value="batch">Batch Scan</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scanner">
              <URLScanner />
              <InfoSection />
            </TabsContent>
            
            <TabsContent value="batch">
              <BatchScanner />
            </TabsContent>
            
            <TabsContent value="insights">
              <InsightsPage />
            </TabsContent>
          </Tabs>
        </main>
        <footer className="text-center py-8 mt-12 text-sm text-muted-foreground border-t border-border/50">
          <p>MalGuard AI - Protecting users from malicious URLs with Machine Learning</p>
          <p className="mt-2">© 2025 Advanced Cybersecurity Solution</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
