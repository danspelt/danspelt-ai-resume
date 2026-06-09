import OpenAI from "openai";

interface OptimizationResponse {
  optimizedResume: string;
  keywordsAdded: string[];
  improvements: string[];
  nextSteps: string[];
}

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText) {
      return Response.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are an expert resume writer and career coach specializing in ATS optimization.

ORIGINAL RESUME:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\nOptimize this resume specifically for the job description above, matching keywords and emphasizing relevant experience.` : "Optimize this resume for general professional appeal and ATS compatibility."}

Return a JSON response with this exact structure:
{
  "optimizedResume": "The complete rewritten resume text with ATS-friendly formatting...",
  "keywordsAdded": ["keyword1", "keyword2", "keyword3"],
  "improvements": ["Improvement description 1", "Improvement description 2"],
  "nextSteps": ["Suggestion 1", "Suggestion 2"]
}

Requirements:
- optimizedResume: Complete rewritten resume with strong action verbs, quantified achievements, ATS-friendly formatting, professional summary, and optimized skills section
- keywordsAdded: Array of 5-10 important ATS keywords that were added or emphasized
- improvements: Array of 4-6 specific improvements made to the resume
- nextSteps: Array of 2-3 actionable suggestions for the user
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: "No response from AI model." },
        { status: 500 }
      );
    }

    let result: OptimizationResponse;
    try {
      result = JSON.parse(content);
    } catch {
      // Fallback: return raw content as optimized resume
      result = {
        optimizedResume: content,
        keywordsAdded: [],
        improvements: [],
        nextSteps: [],
      };
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error optimizing resume:", error);

    return Response.json(
      { error: "Failed to optimize resume." },
      { status: 500 }
    );
  }
}
