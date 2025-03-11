
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, questionContext } = await req.json();
    
    if (!transcription) {
      throw new Error('No video transcription provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert sales coach who evaluates video sales pitches and responses.
            
            Analyze the transcription of the video in the context of the question: "${questionContext || 'Sales pitch or response'}".
            
            Evaluate the candidate on these presentation skills:
            1. Verbal Communication 
            2. Confidence and Presence
            3. Clarity of Message
            4. Persuasiveness
            5. Structure and Organization
            
            Return your analysis in JSON format with the following structure:
            {
              "scores": {
                "verbalCommunication": 0,
                "confidencePresence": 0,
                "clarityOfMessage": 0,
                "persuasiveness": 0,
                "structureOrganization": 0
              },
              "overallScore": 0,
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "feedback": "Detailed qualitative feedback about the presentation"
            }`
          },
          { role: 'user', content: transcription }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse the JSON from the response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error("Error parsing JSON from OpenAI:", e);
      console.log("Raw response:", analysisText);
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error analyzing video:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
