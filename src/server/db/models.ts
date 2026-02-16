import mongoose, { Schema, Document } from "mongoose";

export interface IResearchTask extends Document {
  taskId: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: {
    summary: string;
    keyPoints: string[];
    claims: string[];
    snippets: string[];
    reliability: string;
  };
  metadata: {
    tokensUsed: number;
    processingTimeMs: number;
    contentLength: number;
    distilledLength: number;
    compressionRatio: number;
    modelUsed: string;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchTaskSchema = new Schema<IResearchTask>({
  taskId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  data: {
    summary: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    claims: { type: [String], default: [] },
    snippets: { type: [String], default: [] },
    reliability: { type: String, default: "Medium" }
  },
  metadata: {
    tokensUsed: { type: Number, default: 0 },
    processingTimeMs: { type: Number, default: 0 },
    contentLength: { type: Number, default: 0 },
    distilledLength: { type: Number, default: 0 },
    compressionRatio: { type: Number, default: 0 },
    modelUsed: { type: String, default: "" }
  },
  error: { type: String }
}, { timestamps: true });

export const ResearchTask = mongoose.models.ResearchTask || mongoose.model<IResearchTask>("ResearchTask", ResearchTaskSchema);

export interface IResearchBrief extends Document {
  briefId: string;
  input: string;
  intent: {
    topic: string;
    urls: string[];
    searchQueries: string[];
    depth: string;
  };
  synthesis: {
    topicTitle: string;
    overallSummary: string;
    detailedAnalysis: string;
    keyPoints: Array<{ point: string; citation: string; snippet: string }>;
    conflictingClaims: any[];
    tags: string[];
    verificationChecklist: string[];
    sourceUsage: Array<{ url: string; reliability: string; contribution: string }>;
    rawMarkdown: string;
  };
  taskIds: string[];
  metadata: {
    totalTokensUsed: number;
    totalProcessingTimeMs: number;
    sourceCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResearchBriefSchema = new Schema<IResearchBrief>({
  briefId: { type: String, required: true, unique: true },
  input: { type: String, required: true },
  intent: {
    topic: { type: String },
    urls: { type: [String] },
    searchQueries: { type: [String] },
    depth: { type: String }
  },
  synthesis: {
    topicTitle: { type: String },
    overallSummary: { type: String },
    detailedAnalysis: { type: String },
    keyPoints: [{ point: String, citation: String, snippet: String }],
    conflictingClaims: [Schema.Types.Mixed],
    tags: [String],
    verificationChecklist: [String],
    sourceUsage: [{ url: String, reliability: String, contribution: String }],
    rawMarkdown: { type: String }
  },
  taskIds: [String],
  metadata: {
    totalTokensUsed: { type: Number, default: 0 },
    totalProcessingTimeMs: { type: Number, default: 0 },
    sourceCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const ResearchBrief = mongoose.models.ResearchBrief || mongoose.model<IResearchBrief>("ResearchBrief", ResearchBriefSchema);
