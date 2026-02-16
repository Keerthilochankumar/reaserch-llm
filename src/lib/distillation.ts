import * as cheerio from "cheerio";

export const distillationPipeline = {
  /**
   * Strips noise from HTML and converts to clean Markdown-ish text
   */
  distill(html: string, url: string) {
    const $ = cheerio.load(html);
    
    // Remove boilerplate and elements that often contain JS/code
    $('script, style, nav, footer, header, .ads, #ads, .sidebar, aside, noscript, iframe, svg, canvas, .menu, .nav, .footer, .header, .sidebar, .ad-unit, .social-share').remove();
    
    // Extract main content areas
    const contentAreas = $('article, main, [role="main"], .content, #content, .post, .article-body, .entry-content');
    let target = contentAreas.length ? contentAreas : $('body');
    
    // Convert basic tags to markdown-ish
    target.find('h1, h2, h3, h4, h5, h6').each((_: number, el: any) => $(el).replaceWith(`\n# ${$(el).text()}\n`));
    target.find('p').each((_: number, el: any) => $(el).replaceWith(`\n${$(el).text()}\n`));
    target.find('li').each((_: number, el: any) => $(el).replaceWith(`\n- ${$(el).text()}`));
    
    let text = target.text();

    // Check for "JavaScript Required" or Anti-Bot challenges
    const isBlocked = /enable javascript|javascript is required|browser challenge|cloudflare|verify you are a human|access denied|scrolling is disabled/i.test(text);
    if (isBlocked && text.length < 2000) {
      return {
        markdown: "ERROR: Access Blocked or JavaScript Required for this URL.",
        metadata: { compressionRatio: 0, originalLength: html.length, distilledLength: 0 }
      };
    }

    // Strip JS and CSS patterns aggressively
    text = text.replace(/const\s+[\w$]+\s*=.+?;/g, ''); // const x = ...;
    text = text.replace(/let\s+[\w$]+\s*=.+?;/g, '');   // let x = ...;
    text = text.replace(/var\s+[\w$]+\s*=.+?;/g, '');   // var x = ...;
    text = text.replace(/function\s*[\w$]*\s*\(.*?\)\s*\{[\s\S]*?\}/g, ''); // function handlers
    text = text.replace(/\{[\s\S]*?\}/g, (match) => match.includes(';') || match.includes(':') ? '' : match); // Remove CSS/JS blocks but keep potential text in braces
    text = text.replace(/\.[\w-]+\s*\{[\s\S]*?\}/g, ''); // CSS classes
    
    text = text.replace(/\n\s*\n/g, '\n\n').trim();
    
    const compressionRatio = Math.round((text.length / html.length) * 100);
    
    return {
      markdown: text,
      metadata: {
        compressionRatio,
        originalLength: html.length,
        distilledLength: text.length
      }
    };
  },
  
  /**
   * Simple token estimation (approx 4 chars per token)
   */
  estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
  }
};
