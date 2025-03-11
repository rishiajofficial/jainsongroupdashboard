
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
    const { responses, questions } = await req.json();
    
    if (!responses || !questions) {
      throw new Error('Missing required data: responses or questions');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Format the responses and questions for analysis
    const formattedData = questions.map((q: any, index: number) => {
      const response = responses.find((r: any) => r.question_id === q.id) || {};
      return {
        questionType: q.question_type,
        questionText: q.question_text,
        evaluationCriteria: q.evaluation_criteria,
        responseText: response.text_response || "No response",
        selectedOption: response.selected_option_id 
          ? (q.options || []).find((o: any) => o.id === response.selected_option_id)?.option_text 
          : null
      };
    });

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
            content: `You are an expert sales assessment analyzer who evaluates sales candidates based on their responses to assessment questions.
            
            Analyze each response against its question and the provided evaluation criteria.
            For each response, provide a score (1-10) and specific feedback.
            
            Evaluate the candidate on these sales skills:
            1. Prospecting Ability
            2. Objection Handling
            3. Closing Skills
            4. Product Knowledge Application
            5. Customer Relationship Management
            
            Return your analysis in JSON format with the following structure:
            {
              "questionAnalysis": [
                {
                  "questionId": "index number",
                  "score": 0,
                  "feedback": "Specific feedback for this response"
                }
              ],
              "skillScores": {
                "prospectingAbility": 0,
                "objectionHandling": 0,
                "closingSkills": 0,
                "productKnowledge": 0,
                "customerRelationship": 0
              },
              "overallScore": 0,
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "feedback": "Detailed qualitative feedback about the candidate's sales abilities"
            }`
          },
          { role: 'user', content: JSON.stringify(formattedData) }
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
    console.error("Error analyzing assessment:", error);
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
