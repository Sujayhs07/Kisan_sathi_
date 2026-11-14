/**
 * Murf AI Studio Text-to-Speech (TTS) Integration Service
 * 
 * Provides ultra-natural, studio-quality generative human voices with 
 * customizable Indian accents, pitch, style, and speech cadence.
 */

export interface MurfSpeechOptions {
  text: string;
  voiceId?: string;
  voice_id?: string;
  gender?: 'male' | 'female';
  style?: string;
  model?: string;
  modelVersion?: string;
  pitch?: number;
  rate?: number;
  locale?: string;
  format?: 'MP3' | 'WAV' | 'FLAC';
}

export interface MurfSpeechResult {
  success: boolean;
  configured: boolean;
  audioUrl?: string;
  encodedAudio?: string;
  audioLengthInSeconds?: number;
  voiceUsed?: string;
  accentUsed?: string;
  modelUsed?: string;
  styleUsed?: string;
  error?: string;
}

/**
 * Returns whether Murf AI is configured via MURF_API_KEY in .env
 */
export function isMurfConfigured(): boolean {
  return Boolean(process.env.MURF_API_KEY && process.env.MURF_API_KEY.trim().length > 0);
}

/**
 * Default fallback voice and accent configurations.
 * Configured specifically for authentic native Kannada:
 * - Male: Harman (kn-IN, Falcon 2.1, Conversation)
 * - Female: Pooja (kn-IN, Falcon 2.1, Conversation)
 */
export function getMurfDefaultConfig() {
  return {
    apiKey: process.env.MURF_API_KEY?.trim() || '',
    voiceId: process.env.MURF_VOICE_ID?.trim() || 'Harman', // Male Kannada
    femaleVoiceId: process.env.MURF_VOICE_ID_FEMALE?.trim() || 'Pooja', // Female Kannada
    maleVoiceId: process.env.MURF_VOICE_ID_MALE?.trim() || process.env.MURF_VOICE_ID?.trim() || 'Harman',
    locale: process.env.MURF_LOCALE?.trim() || 'kn-IN',
    style: process.env.MURF_STYLE?.trim() || 'Conversation',
    model: process.env.MURF_MODEL?.trim() || 'Falcon 2.1',
    pitch: process.env.MURF_PITCH ? Number(process.env.MURF_PITCH) : 0,
    rate: process.env.MURF_RATE ? Number(process.env.MURF_RATE) : 0,
    format: (process.env.MURF_FORMAT?.trim() || 'MP3') as 'MP3' | 'WAV'
  };
}

/**
 * Generate natural speech from text using Murf AI API
 */
export async function generateMurfSpeech(options: MurfSpeechOptions): Promise<MurfSpeechResult> {
  const config = getMurfDefaultConfig();

  if (!config.apiKey) {
    return {
      success: false,
      configured: false,
      error: 'Murf AI is not configured. Please add MURF_API_KEY to your .env file.'
    };
  }

  const cleanText = (options.text || '').trim();
  if (!cleanText) {
    return {
      success: false,
      configured: true,
      error: 'Text to synthesize cannot be empty.'
    };
  }

  // Resolve voice by explicit ID or gender persona
  let selectedVoiceId = options.voiceId || options.voice_id;
  if (!selectedVoiceId) {
    selectedVoiceId = options.gender === 'female' ? config.femaleVoiceId : config.maleVoiceId;
  }

  const selectedLocale = options.locale || config.locale;
  const selectedStyle = options.style || config.style;
  const selectedModel = options.model || options.modelVersion || config.model;
  const selectedPitch = options.pitch !== undefined ? options.pitch : config.pitch;
  const selectedRate = options.rate !== undefined ? options.rate : config.rate;
  const selectedFormat = options.format || config.format;

  // Normalize model identifier
  const isFalconModel = !selectedModel || 
    selectedModel.toLowerCase().includes('falcon') || 
    selectedVoiceId === 'Harman' || 
    selectedVoiceId === 'Pooja';

  try {
    if (isFalconModel) {
      // 1. Ultra-Low Latency Murf Falcon 2.1 Streaming Endpoint
      const falconPayload: Record<string, any> = {
        text: cleanText,
        voiceId: selectedVoiceId,
        model: 'falcon-2.1',
        locale: selectedLocale || 'kn-IN',
        style: selectedStyle || 'Conversation',
        format: selectedFormat === 'WAV' ? 'WAV' : 'MP3'
      };

      if (selectedPitch !== 0) falconPayload.pitch = selectedPitch;
      if (selectedRate !== 0) falconPayload.rate = selectedRate;

      const response = await fetch('https://global.api.murf.ai/v1/speech/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'token': config.apiKey
        },
        body: JSON.stringify(falconPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Murf Falcon TTS Notice] HTTP ${response.status}:`, errText);
        return {
          success: false,
          configured: true,
          error: errText || `Murf Falcon API error (${response.status})`
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

      return {
        success: true,
        configured: true,
        audioUrl,
        encodedAudio: base64Audio,
        voiceUsed: selectedVoiceId,
        accentUsed: selectedLocale || 'kn-IN',
        modelUsed: 'falcon-2.1',
        styleUsed: selectedStyle || 'Conversation'
      };
    } else {
      // 2. Standard Murf Gen2/Gen3 API Fallback
      const payload: Record<string, any> = {
        voiceId: selectedVoiceId,
        text: cleanText,
        format: selectedFormat,
        channelType: 'MONO',
        encodeAsBase64: false,
        modelVersion: selectedModel === 'GEN3' ? 'GEN3' : 'GEN2'
      };

      if (selectedPitch !== 0) payload.pitch = selectedPitch;
      if (selectedRate !== 0) payload.rate = selectedRate;
      if (selectedStyle) payload.style = selectedStyle;
      if (selectedLocale) payload.locale = selectedLocale;

      const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'token': config.apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn(`[Murf AI TTS Notice] HTTP ${response.status}:`, JSON.stringify(data));
        const errMsg = data.message || data.error || data.errorMessage || JSON.stringify(data) || `Murf API error (${response.status})`;
        return {
          success: false,
          configured: true,
          error: errMsg
        };
      }

      const audioUrl = data.audioFile || data.audioUrl || data.url;
      return {
        success: true,
        configured: true,
        audioUrl,
        encodedAudio: data.encodedAudio,
        audioLengthInSeconds: data.audioLengthInSeconds || data.duration,
        voiceUsed: selectedVoiceId,
        accentUsed: selectedLocale,
        modelUsed: selectedModel,
        styleUsed: selectedStyle
      };
    }
  } catch (err: any) {
    console.error('[Murf AI Network Error]:', err);
    return {
      success: false,
      configured: true,
      error: err.message || 'Network communication error connecting to Murf AI.'
    };
  }
}

/**
 * Fetch list of available voices from Murf AI (filtered by locale / accent if provided)
 */
export async function getMurfAvailableVoices(localeFilter?: string) {
  const config = getMurfDefaultConfig();
  if (!config.apiKey) {
    return {
      success: false,
      configured: false,
      voices: [],
      error: 'MURF_API_KEY is not set in .env'
    };
  }

  try {
    const response = await fetch('https://api.murf.ai/v1/speech/voices', {
      headers: {
        'api-key': config.apiKey,
        'token': config.apiKey
      }
    });

    const data = await response.json().catch(() => []);
    if (!response.ok) {
      return {
        success: false,
        configured: true,
        voices: [],
        error: data.message || `Failed to fetch Murf voices (${response.status})`
      };
    }

    let voices = Array.isArray(data) ? data : (data.voices || []);
    if (localeFilter) {
      voices = voices.filter((v: any) =>
        v.locale?.toLowerCase().includes(localeFilter.toLowerCase()) ||
        v.accent?.toLowerCase().includes(localeFilter.toLowerCase())
      );
    }

    return {
      success: true,
      configured: true,
      voices
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      voices: [],
      error: err.message
    };
  }
}
