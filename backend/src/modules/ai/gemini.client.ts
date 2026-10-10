import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

class GeminiClientWrapper {
  private client: GoogleGenAI | null = null;
  private isKeyConfigured: boolean = false;
  private modelName: string;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const apiKey = env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0 && !apiKey.includes('<local-secret>') && !apiKey.startsWith('PLACEHOLDER')) {
      try {
        this.client = new GoogleGenAI({ apiKey: apiKey.trim() });
        this.isKeyConfigured = true;
        logger.info({ model: this.modelName }, '✨ Gemini GenAI Client initialized successfully');
      } catch (err: any) {
        logger.warn({ error: err.message }, 'Failed to initialize Google GenAI client');
        this.client = null;
        this.isKeyConfigured = false;
      }
    } else {
      logger.info('Gemini API key not configured or set to placeholder. Operating in deterministic tool-grounded mode.');
    }
  }

  public isAvailable(): boolean {
    return this.isKeyConfigured && this.client !== null;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public getClient(): GoogleGenAI | null {
    return this.client;
  }

  public getStatus() {
    return {
      configured: this.isAvailable(),
      model: this.modelName,
      sdk: '@google/genai',
      groundedToolsEnabled: true,
      mode: this.isAvailable() ? 'HYBRID_LLM_TOOLS' : 'DETERMINISTIC_TOOLS_FALLBACK',
    };
  }
}

export const geminiClient = new GeminiClientWrapper();
