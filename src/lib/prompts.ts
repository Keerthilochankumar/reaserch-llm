import { PromptTemplate } from "@langchain/core/prompts";

export const intentPrompt = PromptTemplate.fromTemplate(`
You are the Intent Analysis Agent for a Deep Research system.
Your goal is to analyze the user's research request and decompose it into:
1. A clear, concise topic title.
2. A list of specific search queries to find high-quality information.
3. Any explicit URLs provided by the user.
4. The requested research depth (brief, medium, or deep).

FORMAT YOUR RESPONSE AS YAML FRONTMATTER.

---
topic: "A clear title"
searchQueries:
  - "query 1"
  - "query 2"
urls:
  - "optional url"
depth: "medium"
---

USER INPUT: {input}
`);

export const researcherPrompt = PromptTemplate.fromTemplate(`
You are an expert Researcher Agent. Your task is to extract structured, high-fidelity information from the provided web content.
Focus on data lineage: every claim must be supported by the text.

URL: {url}
CONTENT:
{content}

---
Extract the following sections in Markdown:

# Summary
A 3-4 sentence overview of the source.

# Key Points
- Point 1
- Point 2

# Claims & Assertions
- Explicit claim from text

# Supporting Snippets
> "Exact quote or close paraphrasing supporting a major claim"

# Reliability Assessment
Score: Low/Medium/High
Reasoning: Why this score?
---

CRITICAL: If the content is an error page (404), a "JavaScript required" page, or purely technical code/metadata, do NOT attempt to summarize it. Instead, for # Summary, write "Source Unreachable: [Reason]". Set # Key Points and # Claims to an empty list.
Response must be valid Markdown.
`);

export const synthesisPrompt = PromptTemplate.fromTemplate(`
You are the Synthesis Model (Llama 3.3 70B). Your task is to produce a masterpiece research brief by cross-referencing multiple sources.

TOPIC: {topic}

VALID URLS (ONLY USE THESE):
{validUrls}

SOURCES CONTENT:
{sourcesContext}

---
STRICT URL ADHERENCE RULES:
1. USE ONLY the URLs provided in the "VALID URLS" list.
2. NEVER use placeholder URLs like "example.com", "wellness.com", or "site.com".
3. Every claim in "Key Findings" and "Source Audit" MUST be attributed to a real URL from the list.
4. If a source provided in the context is not used, do not list it.

Your brief MUST use standard Markdown headers (# ) for each section.
1. # Executive Summary
   A high-level overview.
2. # Key Findings
   Place exactly one TOON table here:
   [TOON:findings]
   | insight | url |
   |---------|-----|
   [/TOON]
3. # Conflicting Claims
   Highlight direct contradictions between sources using the TOON format:
   [TOON:conflicts]
   | topic | source_a_claim | source_b_claim | urls |
   [/TOON]
4. # Detailed Analysis
   A multi-paragraph deep dive using professional, narrative language.
5. # Source Audit
   List every source used in this synthesis:
   [TOON:sources]
   | url | reliability | contribution |
   [/TOON]
6. # Verification Checklist
   List items as bullet points starting with - [ ].
7. # Tags
   Relevant #tags.

IMPORTANT: Keep narrative sections (# Executive Summary and # Detailed Analysis) PURE. Do NOT include markdown tables, TOON tags, or technical markers inside them.
Use professional, EXTRA CONCISE language. Emphasize actionable insights only.
---
`);

/**
 * Utility to parse YAML frontmatter
 */
export function parseYAMLFrontmatter(text: string) {
  const match = text.match(/^---([\s\S]+?)---/);
  if (!match) return null;
  
  const content = match[1];
  const obj: any = {};
  
  const lines = content?.split('\n') || [];
  let currentKey = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.includes(':') && !trimmed.startsWith('-')) {
      const [key, ...vals] = trimmed.split(':');
      currentKey = key?.trim() || '';
      const val = vals.join(':').trim();
      
      if (val) {
        if (val.startsWith('"') && val.endsWith('"')) {
          obj[currentKey] = val.substring(1, val.length - 1);
        } else {
          obj[currentKey] = val;
        }
      } else {
        obj[currentKey] = [];
      }
    } else if (trimmed.startsWith('-') && currentKey) {
      const val = trimmed.substring(1).trim();
      if (Array.isArray(obj[currentKey])) {
        if (val.startsWith('"') && val.endsWith('"')) {
          obj[currentKey].push(val.substring(1, val.length - 1));
        } else {
          obj[currentKey].push(val);
        }
      }
    }
  }
  
  return obj;
}

/**
 * Extract Markdown sections (handles # Header and **Header**)
 */
export function extractMarkdownSections(text: string) {
  const sections: Record<string, string> = {};
  
  // Regex to find all headers and their content
  // Matches headers like "# Header", "## Header", "1. # Header"
  const headerRegex = /^(?:\d+\.\s*)?#+\s+([^\n]+)\n([\s\S]*?)(?=\n(?:\d+\.\s*)?#+|$)/gm;
  const matches = Array.from(text.matchAll(headerRegex));
  
  for (const match of matches) {
    const title = match[1]?.trim()?.replace(/^[#\*\s]+|[#\*\s]+$/g, '');
    if (title) {
      sections[title] = match[2]?.trim() || '';
    }
  }
  
  // Also try matching **Section** specifically for common ones if they aren't found in # format
  const commonHeaders = ['Executive Summary', 'Key Findings', 'Conflicting Claims', 'Detailed Analysis', 'Source Audit', 'Verification Checklist'];
  for (const header of commonHeaders) {
    if (!sections[header]) {
      const regex = new RegExp(`\\*\\*${header}\\*\\*:?\\s*([\\s\\S]+?)(?=\\n\\*\\*|\\n#|$)`, 'i');
      const match = text.match(regex);
      if (match?.[1]) {
        sections[header] = match[1].trim();
      }
    }
  }
  
  return sections;
}

/**
 * Parse Markdown Tables (TOON pattern)
 * More robust implementation that handles varying pipe styles and optional outer pipes.
 */
export function parseMarkdownTable(text: string): any[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let tableStartIndex = -1;
  
  // Find the header by looking for a separator line below it
  for (let i = 0; i < lines.length - 1; i++) {
    const nextLine = lines[i + 1];
    // Separator line: |---|---| or ---|--- or :---:|:---:
    if (nextLine && /^\|?[:\s-]+\|[:\s-|]*$/.test(nextLine)) {
      tableStartIndex = i;
      break;
    }
  }
  
  if (tableStartIndex === -1) return [];
  
  // Parse headers: normalize to lowercase and replace spaces/hyphens with underscores
  const rawHeaders = lines[tableStartIndex]!.split('|').map(s => s.trim()).filter(Boolean);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[\s-]+/g, '_'));
  
  const rows: any[] = [];
  
  // Parse data rows starting 2 lines after the header (skipping separator)
  for (let i = tableStartIndex + 2; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.includes('|')) break; // Stop if it doesn't look like a table row anymore
    
    const cells = line.split('|').map(s => s.trim());
    // Handle optional outer pipes
    let actualCells = cells;
    if (line.startsWith('|')) actualCells = actualCells.slice(1);
    if (line.endsWith('|')) actualCells = actualCells.slice(0, -1);
    
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = actualCells[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse TOON (Token-Oriented Object Notation) blocks
 * Extracts content between [TOON:tag] and [/TOON] and parses the markdown table within.
 */
export function parseTOON(text: string, tag: string): any[] {
  // Support [TOON:tag], [TOON: tag], [TOON : tag]
  const regex = new RegExp(`\\[TOON\\s*:\\s*${tag}\\s*\\]([\\s\\S]+?)\\[\\/TOON\\]`, 'i');
  const match = text.match(regex);
  
  if (!match) {
    // If tag is missing, fallback to searching for any table in the text 
    // This is useful if the LLM followed the table format but forgot the TOON wrapper
    return parseMarkdownTable(text);
  }
  
  return parseMarkdownTable(match[1] || "");
}
