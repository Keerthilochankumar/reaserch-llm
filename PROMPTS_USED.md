## Development & Implementation Prompts

The following prompts were used during the construction of this system:

1. **LLM Functionality**: Implementing LLM functionality as an agent using LangChain.

2. **Multimodal Structure**: Implementing the multimodal agentic structure for data collection and analysis.

3. **Browser Tooling**: Implementing the browser tool using DuckDuckGo search for URL content fetching.

4. **Agent Output Structure**: Modifying the agent prompt to include a structured summary:
    - Key points
    - Conflicting claims (if any)
    - "What to verify" checklist
    - Citations (link back to source + snippet)
    - Source listing page with metadata
    - Topic tags and a "compare sources" view.

5. **Guardrails**: Implementing safety guardrails for LLM usage to prevent bias and hallucinations.

6. **Backend Infrastructure**: Implementing rate limiting and MongoDB storage using the `model.ts` schema.

7. **API Layer**: Implementing **TOON (Token-Oriented Object Notation)** for the LLM and JSON API request handling using tRPC.

8. **Frontend UI**: Creating a usable interface using **Shadcn UI** and **Framer Motion**, including a Dashboard and System Health status (Total Tokens, Briefs Generated, Sources Analyzed, etc.).

9. **Reliability & Type Safety**: Implementing safety nets and fallback features for 404 status codes, invalid inputs, and end-to-end type safety with **Zod**.

10. **General Debugging**: Various prompts for troubleshooting issues (e.g., investigating 500 errors and environment configuration).
