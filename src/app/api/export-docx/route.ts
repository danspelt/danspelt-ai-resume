import { NextRequest, NextResponse } from "next/server";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Parse the content to create structured document
    const lines = content.split("\n");
    const children: Paragraph[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        // Add empty paragraph for spacing
        children.push(new Paragraph({ text: "" }));
        continue;
      }

      // Detect headings based on common patterns
      const isHeading =
        /^[A-Z][A-Z\s\-]{2,}$/.test(trimmedLine) || // ALL CAPS HEADINGS
        trimmedLine.endsWith(":") || // Lines ending with colon
        /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|CONTACT|PROFESSIONAL)/i.test(trimmedLine);

      if (isHeading) {
        children.push(
          new Paragraph({
            text: trimmedLine,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      } else {
        // Check if line starts with bullet point
        const bulletMatch = trimmedLine.match(/^[\s]*[\-\*\u2022\u25E6\u25AA]\s*/);
        if (bulletMatch) {
          children.push(
            new Paragraph({
              text: trimmedLine.substring(bulletMatch[0].length).trim(),
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                }),
              ],
              spacing: { before: 60, after: 60 },
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="optimized-resume.docx"',
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX file" },
      { status: 500 }
    );
  }
}
