import { NextRequest, NextResponse } from "next/server";

// Simple job description extraction - fetches HTML and tries to extract relevant text
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!["http:", "https:"].includes(validUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please provide a valid http or https URL." },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      // Special handling for sites that block automated requests
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: "This job site blocks automated access. Please switch to 'Paste Text' mode and copy-paste the job description directly from the page.",
            blocked: true 
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch the page: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Extract job description using multiple strategies
    const jobDescription = extractJobDescription(html, url);

    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { error: "Could not extract a meaningful job description from this URL. The page may require JavaScript to load, or the job description format is not recognized. Try copying and pasting the text directly." },
        { status: 422 }
      );
    }

    return NextResponse.json({ jobDescription });

  } catch (error) {
    console.error("Error fetching job description:", error);
    
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Request timed out. The website took too long to respond." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch job description. Please try again or paste the text directly." },
      { status: 500 }
    );
  }
}

function extractJobDescription(html: string, url: string): string {
  // Remove script and style tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");

  // Common job description selectors/patterns
  const jobSelectors = [
    // LinkedIn
    /class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*show-more-less-html[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Indeed
    /id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*jobsearch-jobDescriptionText[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Glassdoor
    /class="[^"]*jobDescriptionContent[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Greenhouse
    /class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Lever
    /class="[^"]*section-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*posting-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Workday
    /class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /data-automation-id="jobPostingDescription"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Generic patterns
    /class="[^"]*jd-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*position-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*role-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /class="[^"]*details[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    
    // Meta tags
    /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i,
  ];

  // Try to find job description using selectors
  for (const selector of jobSelectors) {
    const match = text.match(selector);
    if (match && match[1]) {
      const extracted = cleanHtml(match[1]);
      if (extracted.length > 200) {
        return extracted;
      }
    }
  }

  // Fallback: look for common job description sections in plain text
  const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyText = cleanHtml(bodyMatch[1]);
    
    // Look for job description keywords to find relevant section
    const jobKeywords = [
      "job description",
      "about the role",
      "about this role",
      "what you'll do",
      "responsibilities",
      "requirements",
      "qualifications",
      "the role",
      "position overview",
      "about the position",
    ];
    
    const lowerText = bodyText.toLowerCase();
    let bestStart = -1;
    
    for (const keyword of jobKeywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1 && (bestStart === -1 || index < bestStart)) {
        bestStart = index;
      }
    }
    
    if (bestStart !== -1) {
      // Extract from the best match onwards, up to 5000 chars
      const extracted = bodyText.substring(bestStart, bestStart + 5000).trim();
      if (extracted.length > 200) {
        return extracted;
      }
    }
    
    // Last resort: return body text if it's substantial
    if (bodyText.length > 500 && bodyText.length < 15000) {
      return bodyText.substring(0, 8000);
    }
  }

  // Very last resort: clean all HTML and return
  const allText = cleanHtml(text);
  if (allText.length > 200) {
    return allText.substring(0, 8000);
  }

  return "";
}

function cleanHtml(html: string): string {
  return html
    // Replace common block elements with newlines
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "—")
    .replace(/&bull;/g, "•")
    // Clean up whitespace
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}
