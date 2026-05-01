// kie.ai API Client Library
// Unified client for all kie.ai services

const KIE_BASE_URL = 'https://api.kie.ai';
const KIE_UPLOAD_URL = 'https://kieai.redpandaai.co';

function getApiKey(): string {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error('KIE_API_KEY environment variable is required');
  return key;
}

function headers() {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

// ─── Generic Task Polling ───────────────────────────────────────────
export type TaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface TaskResult {
  taskId: string;
  state: TaskState;
  successFlag?: number;
  resultUrls?: string[];
  resultJson?: string;
  failMsg?: string;
  [key: string]: unknown;
}

export async function createTask(endpoint: string, body: Record<string, unknown>): Promise<{ taskId: string }> {
  const res = await fetch(`${KIE_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.msg || 'Task creation failed');
  return { taskId: data.data.taskId };
}

export async function getTaskStatus(endpoint: string, taskId: string): Promise<TaskResult> {
  const res = await fetch(`${KIE_BASE_URL}${endpoint}?taskId=${taskId}`, {
    headers: { 'Authorization': `Bearer ${getApiKey()}` },
  });
  const data = await res.json();
  return data.data;
}

// ─── File Upload ────────────────────────────────────────────────────
export async function uploadFileUrl(fileUrl: string): Promise<string> {
  const res = await fetch(`${KIE_UPLOAD_URL}/api/file-url-upload`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ fileUrl }),
  });
  const data = await res.json();
  return data.data.fileUrl;
}

export async function uploadFileBuffer(buffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)]), fileName);
  const res = await fetch(`${KIE_UPLOAD_URL}/api/file-stream-upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getApiKey()}` },
    body: formData,
  });
  const data = await res.json();
  return data.data.fileUrl;
}

// ─── GPT-4o Image (Text to Image, Edit, Inpainting) ────────────────
export interface GptImageParams {
  prompt: string;
  size?: '1:1' | '3:2' | '2:3';
  filesUrl?: string[];
  maskUrl?: string;
  nVariants?: 1 | 2 | 4;
  isEnhance?: boolean;
  callBackUrl?: string;
}

export async function generateGptImage(params: GptImageParams) {
  return createTask('/api/v1/gpt4o-image/generate', {
    prompt: params.prompt,
    size: params.size || '1:1',
    ...(params.filesUrl && { filesUrl: params.filesUrl }),
    ...(params.maskUrl && { maskUrl: params.maskUrl }),
    ...(params.nVariants && { nVariants: params.nVariants }),
    ...(params.isEnhance && { isEnhance: params.isEnhance }),
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getGptImageStatus(taskId: string) {
  return getTaskStatus('/api/v1/gpt4o-image/record-info', taskId);
}

// ─── Flux Kontext (Image Generation/Edit) ───────────────────────────
export interface FluxParams {
  prompt: string;
  aspectRatio?: string;
  model?: 'flux-kontext-pro' | 'flux-kontext-max';
  inputImage?: string;
  enableTranslation?: boolean;
  callBackUrl?: string;
}

export async function generateFluxImage(params: FluxParams) {
  return createTask('/api/v1/flux/kontext/generate', {
    prompt: params.prompt,
    aspectRatio: params.aspectRatio || '16:9',
    model: params.model || 'flux-kontext-pro',
    enableTranslation: params.enableTranslation ?? true,
    ...(params.inputImage && { inputImage: params.inputImage }),
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getFluxImageStatus(taskId: string) {
  return getTaskStatus('/api/v1/flux/kontext/record-info', taskId);
}

// ─── Market APIs (Kling, Seedance, Topaz, ElevenLabs, etc.) ─────────
export interface MarketTaskParams {
  model: string;
  input: Record<string, unknown>;
  callBackUrl?: string;
}

export async function createMarketTask(params: MarketTaskParams) {
  return createTask('/api/v1/jobs/createTask', {
    model: params.model,
    input: params.input,
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getMarketTaskStatus(taskId: string) {
  return getTaskStatus('/api/v1/jobs/recordInfo', taskId);
}

// ─── Runway (Video Generation) ──────────────────────────────────────
export interface RunwayParams {
  prompt: string;
  duration: 5 | 10;
  quality: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  imageUrl?: string;
  callBackUrl?: string;
}

export async function generateRunwayVideo(params: RunwayParams) {
  return createTask('/api/v1/runway/generate', {
    prompt: params.prompt,
    duration: params.duration,
    quality: params.quality,
    aspectRatio: params.aspectRatio,
    ...(params.imageUrl && { imageUrl: params.imageUrl }),
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getRunwayStatus(taskId: string) {
  return getTaskStatus('/api/v1/runway/record-detail', taskId);
}

// ─── Veo 3 (Google Video Generation) ───────────────────────────────
export interface Veo3Params {
  prompt: string;
  model?: 'veo3' | 'veo3_fast';
  aspect_ratio?: string;
  imageUrls?: string[];
  callBackUrl?: string;
}

export async function generateVeo3Video(params: Veo3Params) {
  return createTask('/api/v1/veo/generate', {
    prompt: params.prompt,
    model: params.model || 'veo3',
    aspect_ratio: params.aspect_ratio || '16:9',
    ...(params.imageUrls && { imageUrls: params.imageUrls }),
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getVeo3Status(taskId: string) {
  return getTaskStatus('/api/v1/veo/record-info', taskId);
}

// ─── Suno (Music Generation) ───────────────────────────────────────
export interface SunoParams {
  prompt: string;
  customMode: boolean;
  instrumental: boolean;
  model: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5' | 'V5_5';
  style?: string;
  title?: string;
  callBackUrl?: string;
}

export async function generateSunoMusic(params: SunoParams) {
  return createTask('/api/v1/generate', {
    prompt: params.prompt,
    customMode: params.customMode,
    instrumental: params.instrumental,
    model: params.model,
    ...(params.style && { style: params.style }),
    ...(params.title && { title: params.title }),
    ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
  });
}

export async function getSunoStatus(taskId: string) {
  return getTaskStatus('/api/v1/generate/record-info', taskId);
}

// ─── Seedance 2 (Bytedance Video) ──────────────────────────────────
export interface SeedanceParams {
  prompt: string;
  first_frame_url?: string;
  reference_image_urls?: string[];
  reference_video_urls?: string[];
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9' | 'adaptive';
  duration?: number;
  resolution?: '480p' | '720p' | '1080p';
  generate_audio?: boolean;
  callBackUrl?: string;
}

export async function generateSeedanceVideo(params: SeedanceParams) {
  return createMarketTask({
    model: 'bytedance/seedance-2',
    input: {
      prompt: params.prompt,
      ...(params.first_frame_url && { first_frame_url: params.first_frame_url }),
      ...(params.reference_image_urls && { reference_image_urls: params.reference_image_urls }),
      ...(params.reference_video_urls && { reference_video_urls: params.reference_video_urls }),
      aspect_ratio: params.aspect_ratio || '16:9',
      duration: params.duration || 5,
      resolution: params.resolution || '720p',
      generate_audio: params.generate_audio ?? true,
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── ElevenLabs TTS ────────────────────────────────────────────────
export interface ElevenLabsTTSParams {
  text: string;
  voice: string;
  stability?: number;
  similarity_boost?: number;
  speed?: number;
  language_code?: string;
  callBackUrl?: string;
}

export async function generateTTS(params: ElevenLabsTTSParams) {
  return createMarketTask({
    model: 'elevenlabs/text-to-speech-multilingual-v2',
    input: {
      text: params.text,
      voice: params.voice,
      ...(params.stability !== undefined && { stability: params.stability }),
      ...(params.similarity_boost !== undefined && { similarity_boost: params.similarity_boost }),
      ...(params.speed !== undefined && { speed: params.speed }),
      ...(params.language_code && { language_code: params.language_code }),
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── Kling Video ───────────────────────────────────────────────────
export interface KlingImageToVideoParams {
  prompt: string;
  image_urls: string[];
  sound?: boolean;
  duration?: '5' | '10';
  callBackUrl?: string;
}

export async function generateKlingVideo(params: KlingImageToVideoParams) {
  return createMarketTask({
    model: 'kling-2.6/image-to-video',
    input: {
      prompt: params.prompt,
      image_urls: params.image_urls,
      sound: params.sound ?? false,
      duration: params.duration || '5',
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── Topaz Upscale ─────────────────────────────────────────────────
export interface TopazUpscaleParams {
  image_url: string;
  upscale_factor: '1' | '2' | '4' | '8';
  callBackUrl?: string;
}

export async function generateTopazUpscale(params: TopazUpscaleParams) {
  return createMarketTask({
    model: 'topaz/image-upscale',
    input: {
      image_url: params.image_url,
      upscale_factor: params.upscale_factor,
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── Recraft (Remove Background) ───────────────────────────────────
export async function removeBackground(imageUrl: string, callBackUrl?: string) {
  return createMarketTask({
    model: 'recraft/remove-background',
    input: { image: imageUrl },
    callBackUrl,
  });
}

// ─── Kling AI Avatar ───────────────────────────────────────────────
export interface KlingAvatarParams {
  prompt: string;
  image_url: string;
  callBackUrl?: string;
}

export async function generateKlingAvatar(params: KlingAvatarParams) {
  return createMarketTask({
    model: 'kling/ai-avatar-standard',
    input: {
      prompt: params.prompt,
      image_url: params.image_url,
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── Infinitalk (Lip Sync from Audio) ──────────────────────────────
export interface InfinitalkParams {
  image_url: string;
  audio_url: string;
  callBackUrl?: string;
}

export async function generateInfinitalk(params: InfinitalkParams) {
  return createMarketTask({
    model: 'infinitalk/from-audio',
    input: {
      image_url: params.image_url,
      audio_url: params.audio_url,
    },
    callBackUrl: params.callBackUrl,
  });
}

// ─── Chat API (Agent Scene Planning) ───────────────────────────────
export async function agentChat(prompt: string, context?: string): Promise<string> {
  const res = await fetch(`${KIE_BASE_URL}/api/v1/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'gpt-5.4',
      messages: [
        {
          role: 'system',
          content: `You are a video production AI agent. Break down user stories into scene plans with timestamps. Each scene should have: title, description, duration, camera direction, lighting, and style notes. Format as JSON array of scenes. ${context ? `Context: ${context}` : ''}`,
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Universal Poll Helper ─────────────────────────────────────────
export type StatusChecker = (taskId: string) => Promise<TaskResult>;

export const statusCheckers: Record<string, StatusChecker> = {
  'gpt-image': getGptImageStatus,
  'flux': getFluxImageStatus,
  'runway': getRunwayStatus,
  'veo3': getVeo3Status,
  'suno': getSunoStatus,
  'market': getMarketTaskStatus,
};

export async function waitForTask(
  checker: StatusChecker,
  taskId: string,
  maxWaitMs = 600000,
  pollIntervalMs = 5000
): Promise<TaskResult> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const result = await checker(taskId);
    if (result.state === 'success' || result.successFlag === 1) {
      return { ...result, state: 'success' };
    }
    if (result.state === 'fail' || result.successFlag === 2 || result.successFlag === 3) {
      return { ...result, state: 'fail' };
    }
    await new Promise(r => setTimeout(r, pollIntervalMs));
  }
  throw new Error('Task timed out');
}
