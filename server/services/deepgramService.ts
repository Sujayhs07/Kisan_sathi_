/**
 * Deepgram Speech-to-Text (STT) Integration Service
 * 
 * Provides fast, accurate audio transcription with multilingual support
 * (Kannada, Indian English, Hindi) and agricultural entity recognition.
 */

export interface DeepgramTranscriptionOptions {
  audioBuffer?: Buffer;
  audioUrl?: string;
  mimeType?: string;
  language?: string; // 'en-IN', 'kn', 'hi', or undefined for auto/detect
  model?: string;    // 'nova-2' (recommended)
}

export interface DeepgramTranscriptionResult {
  success: boolean;
  configured: boolean;
  transcript?: string;
  confidence?: number;
  detectedLanguage?: string;
  words?: Array<{ word: string; start: number; end: number; confidence: number }>;
  error?: string;
}

/**
 * Returns whether Deepgram STT is configured via DEEPGRAM_API_KEY in .env
 */
export function isDeepgramConfigured(): boolean {
  return Boolean(process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY.trim().length > 0);
}

/**
 * Transcribe speech to text using Deepgram Nova-2 API
 */
export async function transcribeAudio(
  options: DeepgramTranscriptionOptions
): Promise<DeepgramTranscriptionResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY?.trim();

  if (!apiKey) {
    return {
      success: false,
      configured: false,
      error: 'Deepgram is not configured. Please add DEEPGRAM_API_KEY to your .env file.'
    };
  }

  const model = options.model || 'nova-2';
  const queryParams = new URLSearchParams({
    model,
    smart_format: 'true',
    punctuate: 'true'
  });

  if (options.language) {
    queryParams.set('language', options.language);
  } else {
    queryParams.set('detect_language', 'true');
  }

  const deepgramUrl = `https://api.deepgram.com/v1/listen?${queryParams.toString()}`;

  try {
    let body: any;
    const headers: Record<string, string> = {
      'Authorization': `Token ${apiKey}`
    };

    if (options.audioBuffer) {
      body = options.audioBuffer;
      headers['Content-Type'] = options.mimeType || 'audio/webm';
    } else if (options.audioUrl) {
      body = JSON.stringify({ url: options.audioUrl });
      headers['Content-Type'] = 'application/json';
    } else {
      return {
        success: false,
        configured: true,
        error: 'No audio data or URL provided for transcription.'
      };
    }

    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data.err_msg || data.message || `Deepgram STT API returned ${response.status}`;
      console.warn(`[Deepgram STT Warning] ${errMsg}`);
      return {
        success: false,
        configured: true,
        error: errMsg
      };
    }

    const channel = data.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    const transcript = alternative?.transcript || '';
    const confidence = alternative?.confidence;
    const detectedLanguage = channel?.detected_language || options.language;

    return {
      success: true,
      configured: true,
      transcript: transcript.trim(),
      confidence,
      detectedLanguage,
      words: alternative?.words
    };
  } catch (err: any) {
    console.error('[Deepgram STT Error]:', err);
    return {
      success: false,
      configured: true,
      error: err.message || 'Network error communicating with Deepgram API.'
    };
  }
}
