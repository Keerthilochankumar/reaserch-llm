# AI Implementation Notes

This application uses a **Tiered LLM Strategy** to balance speed, cost, and reasoning quality.

## resources 
```markdown
- **Langchain (framework)**
- **MongoDB (database)**
- **Groq (llm provider)**
- **Llama 3.1 8B (worker model)**
- **Llama 3.3 70B (synthesis model)**
- **duckduckgo - web search**
```


## Architecture
- **Worker Model (Llama 3.1 8B)**: Used for high-throughput, low-latency extraction from individual URLs. It is optimized for parsing distilled Markdown and extracting structured signals (claims, summaries, snippets).
- **Synthesis Model (Llama 3.3 70B)**: Used for final report generation. This model excels at cross-referencing multiple sources, identifying conflicts, and maintaining a coherent narrative.

## Data Lineage
We enforce "Identity Preservation" by:
1. Distilling HTML into clean Markdown before processing.
2. Requiring the Worker model to extract "Supporting Snippets" (direct quotes).
3. Utilizing the Synthesis model to link key findings back to their source URLs via the `findings` table.

## Processing Pipeline
- **Distillation**: Custom pipeline that strips 70-90% of noise (ads, scripts) to maximize the LLM context window.
- **Concurrency**: Bounded concurrency (limit: 3) to prevent rate-limiting on Groq while maintaining high throughput.
- **Persistence**: MongoDB stores every task state, allowing for auditability and history tracking.


```markdown
## AI Usage & Human Verification
- **AI Responsibilities**: AI handles the high-volume tasks of distilling raw HTML, extracting structured signals from multiple URLs, and synthesizing complex reports that cross-reference disparate data points.
- **Human Oversight**: Humans designed the tiered architecture, authored the grounding prompts to ensure "Identity Preservation," and manually audited the synthesis model's output for factual consistency against the "Supporting Snippets."
- **Model & Provider Rationale**:
  - **Groq**: Selected as the provider for its LPU (Language Processing Unit) inference speed, which is essential for real-time multi-source research.
  - **Llama 3.1/3.3**: These models were chosen for their industry-leading open-weights performance. The 8B model provides a cost-effective solution for high-throughput extraction, while the 70B model offers the deep reasoning required for complex synthesis and conflict resolution.
```
