import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'URLs array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (urls.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Maximum 100 URLs allowed per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Batch analyzing ${urls.length} URLs`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Process URLs in parallel batches of 10
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (url: string) => {
        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [
                {
                  role: 'system',
                  content: 'Analyze URLs for security threats. Return JSON with: prediction (safe/suspicious/malicious), confidence (0-100), category.'
                },
                {
                  role: 'user',
                  content: `Analyze: ${url}`
                }
              ],
              response_format: { type: 'json_object' }
            }),
          });

          if (!aiResponse.ok) {
            return {
              url,
              error: `Analysis failed: ${aiResponse.status}`,
              prediction: 'error',
              confidence: 0
            };
          }

          const aiData = await aiResponse.json();
          const aiResult = JSON.parse(aiData.choices[0].message.content);

          return {
            url,
            prediction: aiResult.prediction,
            confidence: aiResult.confidence,
            category: aiResult.category || null
          };
        } catch (error) {
          console.error(`Error analyzing ${url}:`, error);
          return {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            prediction: 'error',
            confidence: 0
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Batch analysis complete: ${results.length} URLs processed`);

    return new Response(
      JSON.stringify({
        total: urls.length,
        results,
        analyzed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-analyze function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
