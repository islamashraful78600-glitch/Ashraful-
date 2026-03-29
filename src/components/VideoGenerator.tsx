import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Play, 
  Loader2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Key
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Extend window for AI Studio API
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface VideoGenerationState {
  status: 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'error';
  error?: string;
  videoUrl?: string;
  operationId?: string;
}

export default function VideoGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [animationStyle, setAnimationStyle] = useState<'cinematic' | 'smooth' | 'fast-paced' | 'handheld'>('cinematic');
  const [state, setState] = useState<VideoGenerationState>({ status: 'idle' });
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success as per instructions
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  const generateVideo = async () => {
    if (!image) return;

    setState({ status: 'generating' });

    try {
      // Create a fresh instance to ensure the latest API key is used
      // Use process.env.API_KEY which is injected for Veo models
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const stylePrompts = {
        cinematic: "Cinematic motion, high production value, dramatic lighting",
        smooth: "Smooth, fluid motion, elegant transitions",
        'fast-paced': "Fast-paced, energetic motion, dynamic cuts",
        handheld: "Handheld camera feel, natural movement, organic"
      };

      const finalPrompt = prompt 
        ? `${prompt}. Style: ${stylePrompts[animationStyle]}`
        : `Animate this image with ${stylePrompts[animationStyle]}`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio,
        }
      });

      setState({ status: 'polling', operationId: operation.name });

      // Polling loop
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        // Fetch the video with the API key
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey || '',
          },
        });
        
        if (!response.ok) throw new Error('Failed to download video');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setState({ status: 'completed', videoUrl: url });
      } else {
        throw new Error('No video URL returned');
      }

    } catch (error: any) {
      console.error('Generation failed:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let needsReauth = false;

      const errorStr = JSON.stringify(error).toLowerCase();
      const message = error.message?.toLowerCase() || '';

      if (message.includes("requested entity was not found") || errorStr.includes("not_found")) {
        errorMessage = 'API Key session expired or model not found. Please select your key again.';
        needsReauth = true;
      } else if (errorStr.includes("permission_denied") || errorStr.includes("403")) {
        errorMessage = 'Permission denied. Ensure your API key is from a paid Google Cloud project with Veo access enabled.';
        needsReauth = true;
      } else if (errorStr.includes("resource_exhausted") || errorStr.includes("429")) {
        errorMessage = 'Quota exceeded. Please check your usage limits in the Google Cloud Console.';
      } else if (message.includes("fetch")) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred during generation.';
      }

      if (needsReauth) {
        setHasKey(false);
      }
      
      setState({ status: 'error', error: errorMessage });
    }
  };

  const reset = () => {
    setImage(null);
    setPrompt('');
    setState({ status: 'idle' });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12 text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs font-medium text-zinc-400 uppercase tracking-widest"
        >
          <Sparkles className="w-3 h-3 text-orange-500" />
          Powered by Gemini Veo
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
          Image to <span className="italic serif">Video</span>
        </h1>
        <p className="text-zinc-500 text-lg max-w-xl mx-auto font-light">
          Transform static images into cinematic 1080p motion sequences with advanced AI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          {hasKey === false ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4"
            >
              <div className="flex items-center gap-3 text-orange-500">
                <Key className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Setup Required</span>
              </div>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Veo requires a paid Google Cloud project API key. Please select your key to begin.
              </p>
              <button
                onClick={handleSelectKey}
                className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors text-sm"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
              >
                Billing Documentation
              </a>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Source Image
                </label>
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                    isDragActive ? "border-orange-500 bg-orange-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50",
                    image ? "border-solid" : ""
                  )}
                >
                  <input {...getInputProps()} />
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-500">
                      <Upload className="w-10 h-10" />
                      <p className="text-sm font-light">Drop image or click to upload</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Motion Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the motion (e.g., 'gentle waves crashing', 'camera pans right')..."
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all resize-none font-light"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Animation Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['cinematic', 'smooth', 'fast-paced', 'handheld'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setAnimationStyle(style)}
                      className={cn(
                        "py-3 rounded-xl border text-sm transition-all capitalize",
                        animationStyle === style 
                          ? "bg-white text-black border-white" 
                          : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {style.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Quality
                </label>
                <div className="flex gap-3">
                  {(['720p', '1080p', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-sm transition-all",
                        resolution === res 
                          ? "bg-white text-black border-white" 
                          : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Aspect Ratio
                </label>
                <div className="flex gap-3">
                  {(['16:9', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-sm transition-all",
                        aspectRatio === ratio 
                          ? "bg-white text-black border-white" 
                          : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateVideo}
                disabled={!image || state.status !== 'idle' && state.status !== 'completed' && state.status !== 'error'}
                className={cn(
                  "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                  !image || (state.status !== 'idle' && state.status !== 'completed' && state.status !== 'error')
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                )}
              >
                {state.status === 'generating' || state.status === 'polling' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Generate Video
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              {state.status === 'completed' ? 'Video Preview' : 'Output'}
            </h3>
            {state.status === 'completed' && (
              <div className="flex gap-2">
                <a 
                  href={state.videoUrl} 
                  download="gemini-video.mp4"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Video
                </button>
              </div>
            )}
          </div>

          <div className="relative aspect-video bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              {state.status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4 p-8"
                >
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-6 h-6 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 font-light">Your generated video will appear here</p>
                </motion.div>
              )}

              {(state.status === 'generating' || state.status === 'polling') && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6 p-8"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-medium">Creating your masterpiece...</p>
                    <p className="text-zinc-500 text-sm font-light animate-pulse">
                      {state.status === 'generating' ? 'Initializing generation...' : 'Refining frames and motion...'}
                    </p>
                  </div>
                </motion.div>
              )}

              {state.status === 'completed' && state.videoUrl && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full"
                >
                  <video 
                    src={state.videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}

              {state.status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4 p-8"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-medium">Generation Failed</p>
                    <p className="text-zinc-400 text-sm font-light max-w-xs mx-auto leading-relaxed">
                      {state.error}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 items-center">
                    {hasKey === false ? (
                      <button 
                        onClick={handleSelectKey}
                        className="px-8 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-all"
                      >
                        Select API Key
                      </button>
                    ) : (
                      <button 
                        onClick={() => setState({ status: 'idle' })}
                        className="px-8 py-2 bg-zinc-800 text-white rounded-full text-sm hover:bg-zinc-700 transition-all"
                      >
                        Try Again
                      </button>
                    )}
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Check Billing Requirements
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Resolution</p>
              <p className="text-white font-medium">1080p HD</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Engine</p>
              <p className="text-white font-medium">Veo 3.1 Fast</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Status</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  state.status === 'completed' ? "bg-green-500" : "bg-orange-500"
                )} />
                <p className="text-white font-medium capitalize">{state.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
