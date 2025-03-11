
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
    const { resumeAnalysis, assessmentAnalysis, videoAnalysis } = await req.json();
    
    if (!resumeAnalysis && !assessmentAnalysis && !videoAnalysis) {
      throw new Error('No analysis data provided');
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
            content: `You are an AI sales recruiting expert who evaluates candidates based on multiple assessment components.
            
            Generate a comprehensive evaluation by combining these analyses:
            1. Resume Analysis: ${resumeAnalysis ? JSON.stringify(resumeAnalysis) : "Not provided"}
            2. Assessment Analysis: ${assessmentAnalysis ? JSON.stringify(assessmentAnalysis) : "Not provided"}
            3. Video Analysis: ${videoAnalysis ? JSON.stringify(videoAnalysis) : "Not provided"}
            
            Calculate an overall score (1-100) by weighing:
            - Resume (30%): Experience, achievement, relevant background
            - Assessment (40%): Sales knowledge, approach, problem-solving
            - Video (30%): Presentation, communication, confidence
            
            Return your analysis in JSON format with the following structure:
            {
              "overallScore": 0,
              "categoryScores": {
                "resume": 0,
                "assessment": 0,
                "video": 0
              },
              "keyStrengths": ["strength1", "strength2", "strength3"],
              "developmentAreas": ["area1", "area2", "area3"],
              "hiringRecommendation": "Strong recommendation / Moderate recommendation / Not recommended",
              "feedback": "Comprehensive feedback on the candidate's sales potential"
            }`
          },
          { role: 'user', content: "Generate the overall evaluation" }
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
    console.error("Error generating overall score:", error);
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
