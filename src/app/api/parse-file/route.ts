import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        // Dynamic import for pdf-parse - use class-based API
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        text = textResult.text;
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword" ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        // Dynamic import for mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        text = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse file. Please try a different file or paste text manually." },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from file. The file may be empty or contain only images." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, fileName: file.name, fileType });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
