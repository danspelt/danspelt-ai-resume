import OpenAI from "openai";

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

Provide:
1. OPTIMIZED RESUME - Complete rewritten resume with:
   - Strong action verbs
   - Quantified achievements
   - ATS-friendly formatting
   - Professional summary
   - Skills section optimized for modern hiring

2. KEY IMPROVEMENTS MADE - Bullet point list of what was improved

3. KEYWORDS ADDED - List of important keywords for ATS systems

4. NEXT STEPS - Suggestions for further improvement
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
    });

    const optimizedResume = completion.choices[0]?.message?.content || "No optimized resume generated.";

    return Response.json({ optimizedResume });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to optimize resume." },
      { status: 500 }
    );
  }
}
