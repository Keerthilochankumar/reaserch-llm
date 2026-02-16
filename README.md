# DeepResearch Next.js Edition

DeepResearch is a high-performance deep research engine built with Next.js 15, MongoDB, and a Tiered LLM Strategy (Groq).

## 🚀 Key Features
- **Tiered Multi-Agent Strategy**: 8B models for extraction, 70B for synthesis.
- **HTML Distillation**: Intelligent noise reduction for web content.
- **Data Lineage**: Every claim is linked back to its source.
- **Premium UI**: Modern, glassmorphic dashboard with Framer Motion animations.
- **Identity Preservation**: Persistent storage of research tasks and briefs.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (Mongoose)
- **LLM Provider**: Groq (Llama 3.1 & 3.3)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## 🚦 Getting Started

1. **Clone and Install**:
   ```bash
   npm install

   or 

   npm install --legacy-peer-deps
   ```

2. **Environment Variables**:
   Create a `.env` file with:
   ```env
   GROQ_API_KEY=your_key_here
   MONGODB_URI=your_mongodb_uri
   NODE_ENV=development
   ```
   or 
   ```bash
   cp .env.example .env
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
