import "server-only";

function cleanExtractedText(value: string) {
  return value
    .replace(/\0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function decodeLatin1(bytes: Uint8Array) {
  return new TextDecoder("latin1", { fatal: false }).decode(bytes);
}

function extractPdfText(bytes: Uint8Array) {
  const raw = decodeLatin1(bytes);
  const matches = Array.from(raw.matchAll(/\(([^()]{2,400})\)/g)).map((match) =>
    match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\"),
  );

  return cleanExtractedText(matches.join("\n"));
}

function extractDocxText(bytes: Uint8Array) {
  const raw = decodeLatin1(bytes);
  const documentXmlMatch = raw.match(/word\/document\.xml([\s\S]*?)(?:PK|$)/i);
  const xml = documentXmlMatch?.[1] ?? raw;
  const text = xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  return cleanExtractedText(text);
}

function extractLegacyDocText(bytes: Uint8Array) {
  const raw = decodeLatin1(bytes);
  const text = Array.from(raw.matchAll(/[A-Za-z0-9][A-Za-z0-9 ,.:;()_\-\/'"%&]{4,}/g))
    .map((match) => match[0])
    .join("\n");
  return cleanExtractedText(text);
}

export async function extractTextFromFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return extractTextFromBytes(bytes, file.type, file.name);
}

export function extractTextFromBytes(bytes: Uint8Array, fileType: string, fileName: string) {
  const lowerName = fileName.toLowerCase();

  if (fileType.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return cleanExtractedText(decodeUtf8(bytes));
  }

  if (fileType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdfText(bytes);
  }

  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return extractDocxText(bytes);
  }

  if (fileType === "application/msword" || lowerName.endsWith(".doc")) {
    return extractLegacyDocText(bytes);
  }

  return "";
}
