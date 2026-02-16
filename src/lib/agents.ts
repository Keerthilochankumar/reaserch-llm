import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import axios from "axios";
import * as cheerio from "cheerio";
import { 
  intentPrompt, 
  researcherPrompt, 
  synthesisPrompt, 
  parseYAMLFrontmatter, 
  extractMarkdownSections,
  parseTOON
} from "./prompts";
import { distillationPipeline } from "./distillation";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// User Agent to avoid bot detection
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

const workerModel = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3
});

const synthesizerModel = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  maxTokens: 2048
});

// --- Types ---
export interface IntentResult {
  topic: string;
  searchQueries: string[];
  urls: string[];
  depth: "brief" | "medium" | "deep";
}

export interface ResearchData {
  summary: string;
  keyPoints: string[];
  claims: string[];
  snippets: string[];
  reliability: string;
}

export interface ResearchResult {
  data: ResearchData;
  metadata: {
    tokensUsed: number;
    processingTimeMs: number;
    contentLength: number;
    distilledLength: number;
    compressionRatio: number;
    modelUsed: string;
  };
}

export interface SynthesisResult {
  topicTitle: string;
  overallSummary: string;
  detailedAnalysis: string;
  keyPoints: { point: string; citation: string; snippet: string }[];
  conflictingClaims: { topic: string; claimA: string; claimB: string; urls: string }[];
  tags: string[];
  verificationChecklist: string[];
  sourceUsage: { url: string; reliability: string; contribution: string }[];
  rawMarkdown: string;
}

// --- Helpers ---

/**
 * Heuristic URL matcher to repair hallucinated or shortened URLs
 */
function matchUrl(target: string, validUrls: string[], indexHint: number): string {
  const trimmed = target?.trim().toLowerCase();
  if (!trimmed || trimmed === 'url' || trimmed === 'citation') return '';
  
  // 1. Direct index fallback for placeholders
  if (trimmed.includes('example.com') || trimmed.includes('wellness.com') || trimmed.length < 5) {
    return validUrls[indexHint] || validUrls[0] || target;
  }
  
  // 2. Exact or substring match
  const match = validUrls.find(v => v.toLowerCase().includes(trimmed) || trimmed.includes(v.toLowerCase()));
  return match || target;
}

/**
 * remove markdown noise for clean text fields
 */
function cleanMarkdown(text: string): string {
  const tableRegex = /\|(.+)\|(\s*\n)\s*\|([:-\s|]+)\|(\s*\n)(\s*\|(.+)\|(\s*\n)*)*/g;
  const toonBlockRegex = /\[TOON:[\w-]+\][\s\S]*?\[\/TOON\]/gi;
  const toonTagRegex = /\[\/?TOON:?\w*\]/gi;
  const headerRegex = /^(#+\s*|\*\*+)(Executive Summary|Key Findings|Conflicting Claims|Detailed Analysis|Source Audit|Verification Checklist|Tags)[\*\s:]*/gmi;
  
  return text
    .replace(toonBlockRegex, '')
    .replace(toonTagRegex, '')
    .replace(tableRegex, '')
    .replace(headerRegex, '')
    .trim();
}

export const agents = {
  /**
   * Intent Agent - Analyzes research request
   */
  async intent(input: string): Promise<IntentResult> {
    try {
      const chain = intentPrompt.pipe(synthesizerModel).pipe(new StringOutputParser());
      const result = await chain.invoke({ input });
      const parsed = parseYAMLFrontmatter(result);
      if (parsed && parsed.topic) return parsed as IntentResult;
      throw new Error("Failed to parse intent");
    } catch (e) {
      // Fallback
      return { topic: input, searchQueries: [input], urls: [], depth: "medium" };
    }
  },

  /**
   * searchAgent - Parallelized DuckDuckGo search
   */
  async search(queries: string[]): Promise<string[]> {
    const searchPromises = queries.map(async (query) => {
      try {
        // Fallback to html.duckduckgo.com - this is fragile and should ideally be replaced by a real SERP API
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
          headers: HEADERS,
          timeout: 5000
        });
        
        const rawHTML = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const $ = cheerio.load(rawHTML);
        const links: string[] = [];
        
        $('.result__a').each((i: number, el: any) => {
          if (i < 4) { // Increased limit slightly
            const link = $(el).attr('href');
            if (link && link.startsWith('http') && !link.includes('duckduckgo.com')) {
               links.push(link);
            }
          }
        });
        return links;
      } catch (err) {
        console.warn(`[SearchAgent] Failed for query "${query}":`, err instanceof Error ? err.message : err);
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    return [...new Set(results.flat())];
  },

  /**
   * researcherAgent - Fetches, cleans, and extracts data from a URL
   */
  async researcher(url: string): Promise<ResearchResult> {
    const startTime = Date.now();
    try {
      // 1. Fetch raw HTML directly
      const response = await axios.get(url, {
        headers: HEADERS,
        timeout: 10000 // Increased timeout
      });

      const rawHTML = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      if (!rawHTML || rawHTML.length < 50) throw new Error("Content too short or empty");

      // 2. Pre-clean JS/CSS and noise
      const $ = cheerio.load(rawHTML);
      $('script, style, noscript, svg, img, form, footer, nav, header').remove();
      const cleanedHTML = $('body').html() || "";

      // 3. Distillation Pipeline
      const { markdown, metadata: distillMetadata } = distillationPipeline.distill(cleanedHTML, url);
      const content = markdown.substring(0, 15000); // Increased context safety limit
      
      const chain = researcherPrompt.pipe(workerModel).pipe(new StringOutputParser());
      const result = await chain.invoke({ url, content });
      
      const sections = extractMarkdownSections(result);
      
      // Robust bullet extraction regex
      const extractBulletPoints = (text: string) => 
        (text || '').split('\n')
          .filter(l => l.trim().match(/^[-*]/))
          .map(l => l.trim().replace(/^[-*]\s*/, '').trim())
          .filter(l => l.length > 5);

      const snippets = (sections['Supporting Snippets'] || '').split('\n')
          .filter(l => l.trim().match(/^[>"-*]/) || l.trim().startsWith('"'))
          .map(l => l.trim().replace(/^([-*]\s*)?[>"\s]+|[>"\s]+$/g, '').trim())
          .filter(s => s.length > 20)
          .filter(s => !s.match(/const\s+|let\s+|var\s+|function\s*\(|{|}/));

      const data: ResearchData = {
        summary: sections['Summary'] || 'No summary available',
        keyPoints: extractBulletPoints(sections['Key Points']),
        claims: extractBulletPoints(sections['Claims & Assertions']),
        snippets: snippets.slice(0, 5),
        reliability: sections['Reliability Assessment']?.split('\n')[0]?.replace('Score:', '').trim() || 'Medium'
      };

      return {
        data,
        metadata: {
          tokensUsed: distillationPipeline.estimateTokens(content + result),
          processingTimeMs: Date.now() - startTime,
          contentLength: rawHTML.length,
          distilledLength: markdown.length,
          compressionRatio: distillMetadata.compressionRatio,
          modelUsed: 'llama-3.1-8b-instant'
        }
      };
    } catch (error: any) {
      console.warn(`[ResearcherAgent] Error processing ${url}:`, error.message);
      return {
        data: {
          summary: "Content not accessible or 404 Page not found for this URL.",
          keyPoints: ["Source unreachable"],
          claims: [],
          snippets: [],
          reliability: "N/A"
        },
        metadata: {
          tokensUsed: 0,
          processingTimeMs: Date.now() - startTime,
          contentLength: 0,
          distilledLength: 0,
          compressionRatio: 0,
          modelUsed: 'N/A'
        }
      };
    }
  },

  /**
   * synthesisAgent - Merges all research into a final brief
   */
  async synthesis(tasks: any[], topic: string): Promise<SynthesisResult> {
    const contributingTasks = tasks.filter(t => 
      t.status === 'completed' && 
      !t.data.summary.toLowerCase().includes("unreachable") && 
      !t.data.summary.toLowerCase().includes("404")
    );

    const sourcesContext = contributingTasks.map((t, i) => `
SOURCE ${i+1}: ${t.url} (Reliability: ${t.data.reliability})
SUMMARY: ${t.data.summary}
KEY POINTS: ${t.data.keyPoints.join('; ')}
CLAIMS: ${t.data.claims.join('; ')}
    `).join("\n\n---\n\n");

    const validUrls = contributingTasks.map(t => t.url);
    const validUrlsList = validUrls.join("\n");

    const chain = synthesisPrompt.pipe(synthesizerModel).pipe(new StringOutputParser());
    
    // Fallback if no sources
    if (contributingTasks.length === 0) {
      return {
        topicTitle: topic,
        overallSummary: "Unable to synthesize research as no valid sources were found.",
        detailedAnalysis: "Please check your input URLs or search queries.",
        keyPoints: [],
        conflictingClaims: [],
        tags: [],
        verificationChecklist: [],
        sourceUsage: [],
        rawMarkdown: ""
      };
    }

    const result = await chain.invoke({ sourcesContext, topic, validUrls: validUrlsList });
    
    const sections = extractMarkdownSections(result);
    const findings = parseTOON(result, 'findings'); 
    const sourcesAudit = parseTOON(result, 'sources');
    const conflicts = parseTOON(result, 'conflicts');

    // Extract tags (support both #tag and plain tag)
    const tags = result.match(/#(\w+)/g)?.map((t: string) => t.substring(1)) || 
                 sections['Tags']?.split(/[,#\s]+/).filter(Boolean) || [];
    
    // Extract verification checklist
    let verificationChecklist = result.match(/- \[ \] (.+)/g)?.map((c: string) => c.replace('- [ ] ', '')) || [];
    if (verificationChecklist.length === 0) {
      const verifySection = sections['Verification Checklist'] || sections['What to Verify'] || '';
      verificationChecklist = verifySection.split('\n')
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.replace(/^[-\s\*\[\]]+/, '').trim())
        .filter(Boolean);
    }

    return {
      topicTitle: topic,
      overallSummary: cleanMarkdown(sections['Executive Summary'] || ''),
      detailedAnalysis: cleanMarkdown(sections['Detailed Analysis'] || result),
      keyPoints: findings.map((f, i) => ({
        point: f.insight || f.point || '',
        citation: matchUrl(f.url || f.citation || '', validUrls, i),
        snippet: ''
      })),
      conflictingClaims: conflicts.map(c => ({
        topic: c.topic || '',
        claimA: c.source_a_claim || '',
        claimB: c.source_b_claim || '',
        urls: (c.urls || '').split(',').map((u: string, idx: number) => matchUrl(u.trim(), validUrls, idx)).filter(Boolean).join(', ')
      })),
      tags: [...new Set(tags)],
      verificationChecklist,
      sourceUsage: (sourcesAudit.length > 0 ? sourcesAudit : contributingTasks.map(t => ({ url: t.url, reliability: t.data.reliability, contribution: 'Analysis contribution' })))
        .map((s, i) => ({
          url: matchUrl(s.url || '', validUrls, i),
          reliability: s.reliability || 'Medium',
          contribution: s.contribution || ''
        })),
      rawMarkdown: cleanMarkdown(result)
    };
  }
};
