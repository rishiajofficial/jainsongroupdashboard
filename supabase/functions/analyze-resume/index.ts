
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
    const { resumeText } = await req.json();
    
    if (!resumeText) {
      throw new Error('No resume text provided');
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
            content: `You are an expert sales recruiter who evaluates sales candidates based on their resume.
            Analyze the resume for sales skills, relevant experience, achievements, and education.
            Identify strengths and weaknesses in the candidate's sales background.
            Score each of the following categories from 1-10:
            1. Sales Experience
            2. Communication Skills
            3. Technical Knowledge
            4. Achievement History
            5. Education & Certifications
            
            Return your analysis in JSON format with the following structure:
            {
              "scores": {
                "salesExperience": 0,
                "communicationSkills": 0,
                "technicalKnowledge": 0,
                "achievementHistory": 0,
                "educationCertifications": 0
              },
              "overallScore": 0,
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "feedback": "Detailed qualitative feedback about the candidate"
            }`
          },
          { role: 'user', content: resumeText }
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
    console.error("Error analyzing resume:", error);
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
