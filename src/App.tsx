
// import { FormEvent, useEffect, useRef, useState } from 'react';
// import { Theme } from './settings/types';
// import { AnalyticsDashboard } from './components/generated/AnalyticsDashboard';
// import { MessageSquare, X, Send, PhoneCall, PhoneOff, Play, Pause } from 'lucide-react';
// import typingSound from './typingSound.mp3';
// // const AUDIO_WS_BASE_URL = 'ws://192.168.40.150:8000/ws/audio';
// const AUDIO_WS_BASE_URL = 'wss://192.168.40.150:8000/ws/audio';
// const DEFAULT_PROJECT_ID = 'praangan';
// const MAX_QUEUED_CHUNKS = 200;

// // --- Silence detection (VAD) tuning ---
// // RMS energy below this is treated as silence. Raise if background noise
// // keeps triggering false "speech"; lower if quiet speech isn't detected.
// const SILENCE_RMS_THRESHOLD = 0.012;
// // How long the user must be silent (after having spoken) before we
// // treat the utterance as finished and send it to the backend.
// const SILENCE_DURATION_MS = 2000;
// const MAX_UTTERANCE_MS = 8000; // force-finalize safety net if silence never detected



// const convertFloat32ToInt16PCM = (input: Float32Array): Int16Array => {
//   const output = new Int16Array(input.length);

//   for (let index = 0; index < input.length; index += 1) {
//     const sample = Math.max(-1, Math.min(1, input[index]));
//     output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
//   }

//   return output;
// };

// const computeRms = (data: Float32Array): number => {
//   let sumSquares = 0;
//   for (let i = 0; i < data.length; i += 1) {
//     sumSquares += data[i] * data[i];
//   }
//   return Math.sqrt(sumSquares / data.length);
// };

// const encodeInt16PCMChunksToWav = (chunks: Int16Array[], sampleRate: number): Blob => {
//   const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
//   const buffer = new ArrayBuffer(44 + totalLength * 2);
//   const view = new DataView(buffer);

//   const writeString = (offset: number, string: string) => {
//     for (let i = 0; i < string.length; i += 1) {
//       view.setUint8(offset + i, string.charCodeAt(i));
//     }
//   };

//   writeString(0, 'RIFF');
//   view.setUint32(4, 36 + totalLength * 2, true);
//   writeString(8, 'WAVE');
//   writeString(12, 'fmt ');
//   view.setUint32(16, 16, true);
//   view.setUint16(20, 1, true);
//   view.setUint16(22, 1, true);
//   view.setUint32(24, sampleRate, true);
//   view.setUint32(28, sampleRate * 2, true);
//   view.setUint16(32, 2, true);
//   view.setUint16(34, 16, true);
//   writeString(36, 'data');
//   view.setUint32(40, totalLength * 2, true);

//   let index = 44;
//   for (const chunk of chunks) {
//     for (let i = 0; i < chunk.length; i += 1) {
//       view.setInt16(index, chunk[i], true);
//       index += 2;
//     }
//   }

//   return new Blob([buffer], { type: 'audio/wav' });
// };

// const decodeBase64AudioToArrayBuffer = (raw: string): ArrayBuffer | null => {
//   const payload = raw.trim();
//   if (!payload) return null;

//   const normalized = payload.startsWith('data:')
//     ? payload.slice(payload.indexOf(',') + 1)
//     : payload;

//   const base64Pattern = /^[A-Za-z0-9+/=\r\n]+$/;
//   if (!base64Pattern.test(normalized)) return null;

//   try {
//     const binary = atob(normalized.replace(/\s/g, ''));
//     const bytes = new Uint8Array(binary.length);
//     for (let i = 0; i < binary.length; i += 1) {
//       bytes[i] = binary.charCodeAt(i);
//     }
//     return bytes.buffer;
//   } catch {
//     return null;
//   }
// };

// type AssistantMessage = {
//   id: string;
//   sender: 'user' | 'assistant';
//   text: string;
//   audioUrl?: string;
// };

// const formatAudioTime = (seconds: number): string => {
//   if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// };

// const MessageAudioPlayer = ({ src }: { src: string }) => {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   useEffect(() => {
//     setIsPlaying(false);
//     setCurrentTime(0);
//     setDuration(0);
//   }, [src]);

//   const syncDuration = () => {
//     const nextDuration = audioRef.current?.duration;
//     if (typeof nextDuration === 'number' && Number.isFinite(nextDuration) && nextDuration > 0) {
//       setDuration(nextDuration);
//     }
//   };

//   const togglePlay = () => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     if (audio.paused) {
//       void audio.play().catch(() => undefined);
//     } else {
//       audio.pause();
//     }
//   };

//   const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const nextTime = Number(event.target.value);
//     audio.currentTime = nextTime;
//     setCurrentTime(nextTime);
//   };

//   return (
//     <div className="mt-2 flex w-full min-w-[280px] items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-slate-700">
//       <audio
//         ref={audioRef}
//         src={src}
//         preload="metadata"
//         className="hidden"
//         onLoadedMetadata={syncDuration}
//         onDurationChange={syncDuration}
//         onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onEnded={() => setIsPlaying(false)}
//       />
//       <button
//         type="button"
//         onClick={togglePlay}
//         className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
//         aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
//       >
//         {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
//       </button>
//       <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
//         {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
//       </span>
//       <input
//         type="range"
//         min={0}
//         max={duration || 0}
//         step={0.01}
//         value={Math.min(currentTime, duration || 0)}
//         onChange={handleSeek}
//         className="min-w-0 flex-1 accent-slate-700"
//       />
//     </div>
//   );
// };

// type ControlMessage = {
//   type?: string;
//   project_id?: string;
//   session_id?: string;
//   user_text?: string;
//   language?: string;
//   agent_reply?: string;
//   message?: string;
// };

// let theme: Theme = 'light';
// const CHAT_WELCOME_MESSAGE: AssistantMessage = {
//   id: 'assistant-welcome-chat',
//   sender: 'assistant',
//   text: 'Hello! I’m your AI Assistant. Tap Chat to start typing or Call for voice interaction.',
// };

// const VOICE_WELCOME_MESSAGE: AssistantMessage = {
//   id: 'assistant-welcome-voice',
//   sender: 'assistant',
//   text: 'Hello! I’m your AI Assistant. Start a voice call to speak with me.',
// };

// function App() {
//   const [assistantOpen, setAssistantOpen] = useState(false);
//   const [assistantMode, setAssistantMode] = useState<'chat' | 'call'>('chat');
//   const [assistantInput, setAssistantInput] = useState('');
//   const [isCallRecording, setIsCallRecording] = useState(false);
//   const [isProcessingTurn, setIsProcessingTurn] = useState(false);
//   const [captureError, setCaptureError] = useState<string | null>(null);
//   const [audioBufferCount, setAudioBufferCount] = useState(0);
//   const [audioPreview, setAudioPreview] = useState<number[]>([]);
//   const [websocketStatus, setWebsocketStatus] = useState<
//     'disconnected' | 'connecting' | 'connected' | 'error'
//   >('disconnected');
//   const [isLoadingResponse, setIsLoadingResponse] = useState(false);
//   const [chatHistory, setChatHistory] = useState<AssistantMessage[]>([CHAT_WELCOME_MESSAGE]);
//   const [voiceHistory, setVoiceHistory] = useState<AssistantMessage[]>([VOICE_WELCOME_MESSAGE]);

//   const [keepConnectionOpen, setKeepConnectionOpen] = useState(false);

//   const audioContextRef = useRef<AudioContext | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
//   const processorRef = useRef<ScriptProcessorNode | null>(null);
//   const websocketRef = useRef<WebSocket | null>(null);
//   const chatScrollRef = useRef<HTMLDivElement | null>(null);
//   const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
//   const sessionIdRef = useRef<string>('');
//   const endingCallRef = useRef(false);

//   // Backend readiness / send queue (from previous fix)
//   const backendReadyRef = useRef(false);
//   const pendingChunksRef = useRef<ArrayBufferLike[]>([]);

//   // NEW: silence detection state
//   const hasSpeechRef = useRef(false);
//   const silenceTimeoutRef = useRef<number | null>(null);
//   const isProcessingTurnRef = useRef(false);

//   // ADD near hasSpeechRef / silenceTimeoutRef
//   const speechStartRef = useRef<number | null>(null);
//   const pendingAudioMsgIdRef = useRef<string | null>(null);
//   const pendingUserAudioUrlRef = useRef<string | null>(null);
//   const utterancePcmChunksRef = useRef<Int16Array[]>([]);
//   const typingSoundRef = useRef<HTMLAudioElement | null>(null);
//   const activeHistory = assistantMode === 'chat' ? chatHistory : voiceHistory;

//   function setTheme(theme: Theme) {
//     if (theme === 'dark') {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }

//   // Keep a ref in sync with isProcessingTurn state so timer/audio callbacks
//   // (which close over stale state otherwise) always see the current value.
//   const beginProcessingTurn = () => {
//     isProcessingTurnRef.current = true;
//     setIsProcessingTurn(true);
//     startTypingSound();
//   };

//   const endProcessingTurn = () => {
//     isProcessingTurnRef.current = false;
//     setIsProcessingTurn(false);
//     stopTypingSound();
//   };

//   const clearSilenceTimer = () => {
//     if (silenceTimeoutRef.current !== null) {
//       window.clearTimeout(silenceTimeoutRef.current);
//       silenceTimeoutRef.current = null;
//     }
//   };

//   const flushPendingChunks = () => {
//     const socket = websocketRef.current;
//     if (!socket || socket.readyState !== WebSocket.OPEN) return;

//     while (pendingChunksRef.current.length > 0) {
//       const chunk = pendingChunksRef.current.shift();
//       if (chunk) socket.send(chunk);
//     }
//   };

//   const closeWebSocket = () => {
//     if (websocketRef.current) {
//       console.trace('[closeWebSocket] called — stack trace above');
//       websocketRef.current.onopen = null;
//       websocketRef.current.onmessage = null;
//       websocketRef.current.onerror = null;
//       websocketRef.current.onclose = null;
//       websocketRef.current.close();
//       websocketRef.current = null;
//     }

//     backendReadyRef.current = false;
//     pendingChunksRef.current = [];
//     setWebsocketStatus('disconnected');
//   };

//   const handleAudioReply = (data: ArrayBuffer) => {
//     const blob = new Blob([data], { type: 'audio/wav' });
//     const url = URL.createObjectURL(blob);

//     const targetId = pendingAudioMsgIdRef.current;
//     pendingAudioMsgIdRef.current = null;

//     setVoiceHistory(prev =>
//       prev.map(m => (targetId && m.id === targetId ? { ...m, audioUrl: url } : m))
//     );

//     const audioEl = audioPlaybackRef.current;
//     if (audioEl) {
//       audioEl.src = url;
//       void audioEl.play().catch(() => undefined);
//     }
//   };

//   // NEW: sends the accumulated audio for processing as soon as we detect
//   // the user has stopped talking. Does NOT close the socket — the call
//   // stays open so the next utterance can be captured immediately after.
//   const finalizeTurn = () => {
//     const socket = websocketRef.current;
//     if (!socket || socket.readyState !== WebSocket.OPEN) return;
//     if (!hasSpeechRef.current || isProcessingTurnRef.current) return;

//     const chunks = utterancePcmChunksRef.current;
//     if (chunks.length > 0) {
//       const wavBlob = encodeInt16PCMChunksToWav(chunks, 16000);
//       if (pendingUserAudioUrlRef.current) {
//         URL.revokeObjectURL(pendingUserAudioUrlRef.current);
//       }
//       pendingUserAudioUrlRef.current = URL.createObjectURL(wavBlob);
//     }
//     utterancePcmChunksRef.current = [];

//     hasSpeechRef.current = false;
//     speechStartRef.current = null;
//     beginProcessingTurn();
//     socket.send(JSON.stringify({ type: 'final' }));
//   };

//   const evaluateSilence = (inputData: Float32Array) => {
//     const rms = computeRms(inputData);
//     const isSpeech = rms > SILENCE_RMS_THRESHOLD;

//     if (isSpeech) {
//       if (!hasSpeechRef.current) {
//         speechStartRef.current = Date.now();
//         utterancePcmChunksRef.current = [];
//       }
//       hasSpeechRef.current = true;
//       clearSilenceTimer();

//       if (speechStartRef.current && Date.now() - speechStartRef.current > MAX_UTTERANCE_MS) {
//         speechStartRef.current = null;
//         finalizeTurn();
//       }
//       return;
//     }

//     if (
//       hasSpeechRef.current &&
//       silenceTimeoutRef.current === null &&
//       !isProcessingTurnRef.current
//     ) {
//       silenceTimeoutRef.current = window.setTimeout(() => {
//         silenceTimeoutRef.current = null;
//         speechStartRef.current = null;
//         finalizeTurn();
//       }, SILENCE_DURATION_MS);
//     }
//   };

//   const handleControlMessage = (raw: string) => {
//     let payload: ControlMessage;
//     console.log('[Control Message]', raw);
//     try {
//       payload = JSON.parse(raw);

//       console.log('[Control Message Parsed]', payload);
//     } catch {
//       return;
//     }

//     switch (payload.type) {
//       case 'ready':
//         backendReadyRef.current = true;
//         flushPendingChunks();
//         break;

//       case 'response': {
//         endProcessingTurn();
//         const userText = typeof payload.user_text === 'string' ? payload.user_text.trim() : '';
//         const agentReply =
//           typeof payload.agent_reply === 'string' ? payload.agent_reply.trim() : '';

//         console.log('[Assistant Response]', { userText, agentReply, language: payload.language });
//         const assistantMsgId = `assistant-turn-${Date.now()}`;
//         const userAudioUrl = pendingUserAudioUrlRef.current;
//         pendingUserAudioUrlRef.current = null;

//         setVoiceHistory(prev => [
//           ...prev,
//           ...(userText
//             ? [
//                 {
//                   id: `user-turn-${Date.now()}`,
//                   sender: 'user' as const,
//                   text: userText,
//                   ...(userAudioUrl ? { audioUrl: userAudioUrl } : {}),
//                 },
//               ]
//             : []),
//           ...(agentReply
//             ? [{ id: assistantMsgId, sender: 'assistant' as const, text: agentReply }]
//             : []),
//         ]);

//         pendingAudioMsgIdRef.current = agentReply ? assistantMsgId : null;

//         // if (endingCallRef.current) {
//         //   endingCallRef.current = false;
//         //   closeWebSocket();
//         // }
//         break;
//       }

//       case 'error':
//         endProcessingTurn();
//         setCaptureError(
//           typeof payload.message === 'string' ? payload.message : 'The assistant reported an error.'
//         );
//         // if (endingCallRef.current) {
//         //   endingCallRef.current = false;
//         //   closeWebSocket();
//         // }
//         break;

//       case 'warning':
//         endProcessingTurn();
//         if (typeof payload.message === 'string') {
//           setCaptureError(payload.message);
//         }
//         // if (endingCallRef.current) {
//         //   endingCallRef.current = false;
//         //   closeWebSocket();
//         // }
//         break;

//       case 'reset':
//         endProcessingTurn();
//         break;

//       case 'processing': {
//         console.log('[Assistant Processing]', payload.message);
//         // Optional: surface a "thinking" state in the UI here, e.g.:
//         // setCaptureError(null);
//         break;
//       }

//       default:
//         break;
//     }
//   };

//   const connectWebSocket = (sessionId: string) => {
//     if (websocketRef.current?.readyState === WebSocket.OPEN) {
//       return;
//     }

//     setWebsocketStatus('connecting');
//     backendReadyRef.current = false;
//     pendingChunksRef.current = [];

//     const url = `${AUDIO_WS_BASE_URL}?project_id=${encodeURIComponent(DEFAULT_PROJECT_ID)}&session_id=${encodeURIComponent(sessionId)}`;
//     const socket = new WebSocket(url);
//     socket.binaryType = 'arraybuffer';

//     socket.onopen = () => {
//       setWebsocketStatus('connected');
//     };

//     socket.onmessage = event => {
//       if (typeof event.data === 'string') {
//         const raw = event.data.trim();
//         if (raw.startsWith('{')) {
//           handleControlMessage(raw);
//           return;
//         }

//         const decodedAudio = decodeBase64AudioToArrayBuffer(raw);
//         if (decodedAudio) {
//           handleAudioReply(decodedAudio);
//           return;
//         }

//         handleControlMessage(raw);
//       } else {
//         handleAudioReply(event.data as ArrayBuffer);
//       }
//     };

//     socket.onerror = () => {
//       setWebsocketStatus('error');
//       console.log('[WebSocket Error] Connection failed.');
//       setCaptureError('WebSocket connection failed.');
//     };

//     socket.onclose = event => {
//       console.log('[WebSocket] onclose fired', {
//         code: event.code,
//         reason: event.reason,
//         wasClean: event.wasClean,
//       });
//       if (websocketRef.current === socket) {
//         websocketRef.current = null;
//       }
//       backendReadyRef.current = false;
//       pendingChunksRef.current = [];
//       setWebsocketStatus('disconnected');
//     };

//     websocketRef.current = socket;
//   };

//   // const stopMicrophoneCapture = (keepSocketOpen = false) => {
//   const stopMicrophoneCapture = (keepSocketOpen = true) => {
//     const processor = processorRef.current;
//     if (processor) {
//       processor.disconnect();
//       processor.onaudioprocess = null;
//     }

//     mediaStreamSourceRef.current?.disconnect();

//     processorRef.current = null;
//     mediaStreamSourceRef.current = null;

//     void audioContextRef.current?.close().catch(() => undefined);
//     audioContextRef.current = null;

//     mediaStreamRef.current?.getTracks().forEach(track => track.stop());
//     mediaStreamRef.current = null;

//     clearSilenceTimer();
//     hasSpeechRef.current = false;

//     if (!keepSocketOpen) {
//       closeWebSocket();
//     }
//   };

//   const sendAudioChunk = (pcmBuffer: Int16Array) => {
//     if (isProcessingTurnRef.current) {
//       return;
//     }

//     const socket = websocketRef.current;
//     const chunk = pcmBuffer.buffer.slice(
//       pcmBuffer.byteOffset,
//       pcmBuffer.byteOffset + pcmBuffer.byteLength
//     );

//     const canSendNow = !!socket && socket.readyState === WebSocket.OPEN && backendReadyRef.current;

//     if (canSendNow) {
//       socket!.send(chunk);
//       return;
//     }

//     pendingChunksRef.current.push(chunk);
//     if (pendingChunksRef.current.length > MAX_QUEUED_CHUNKS) {
//       pendingChunksRef.current.shift();
//     }
//   };

//   const handleAudioBuffer = (inputData: Float32Array) => {
//     if (isProcessingTurnRef.current) {
//       return;
//     }

//     const pcmBuffer = convertFloat32ToInt16PCM(inputData);
//     sendAudioChunk(pcmBuffer);
//     setAudioBufferCount(count => count + 1);
//     setAudioPreview(Array.from(pcmBuffer.slice(0, 8)));
//     evaluateSilence(inputData);
//     if (hasSpeechRef.current) {
//       utterancePcmChunksRef.current.push(pcmBuffer);
//     }
//   };

//   const startMicrophoneCapture = async (sessionId: string) => {
//     if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
//       throw new Error('This browser does not support microphone capture.');
//     }

//     stopMicrophoneCapture();

//     // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//    const stream = await navigator.mediaDevices.getUserMedia({
//   audio: {
//     echoCancellation: true,   // removes the assistant's own TTS audio if picked up by mic (critical for barge-in/call scenarios)
//     noiseSuppression: true,   // suppresses steady background noise (fans, hum, traffic)
//     autoGainControl: true,    // normalizes volume so quiet speech isn't under-captured
//     channelCount: 1,
//     sampleRate: 16000,
//   },
// });
    
//     const AudioContextCtor =
//       window.AudioContext ||
//       (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
//         .webkitAudioContext;

//     if (!AudioContextCtor) {
//       throw new Error('AudioContext is not supported in this browser.');
//     }

//     const context = new AudioContextCtor({ sampleRate: 16000 });
//     const source = context.createMediaStreamSource(stream);
//     const processor = context.createScriptProcessor(4096, 1, 1);

//     connectWebSocket(sessionId);

//     processor.onaudioprocess = event => {
//       const inputData = event.inputBuffer.getChannelData(0);
//       handleAudioBuffer(inputData);
//     };

//     source.connect(processor);
//     processor.connect(context.destination);

//     audioContextRef.current = context;
//     mediaStreamRef.current = stream;
//     mediaStreamSourceRef.current = source;
//     processorRef.current = processor;

//     await context.resume();
//   };

//   useEffect(() => {
//     return () => {
//       stopMicrophoneCapture();
//     };
//   }, []);

//   useEffect(() => {
//     if (chatScrollRef.current) {
//       chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
//     }
//   }, [activeHistory, isLoadingResponse]);

//   const openAssistant = (mode: 'chat' | 'call' = 'chat') => {
//     setAssistantMode(mode);
//     setAssistantOpen(true);
//     if (mode !== 'call') {
//       setIsCallRecording(false);
//     }
//   };

//   // const closeAssistant = () => {
//   //   setAssistantOpen(false);
//   //   setIsCallRecording(false);
//   //   endProcessingTurn();
//   //   setCaptureError(null);
//   //   endingCallRef.current = false;
//   //   stopMicrophoneCapture();
//   // };

//   const closeAssistant = () => {
//     setAssistantOpen(false);
//     setCaptureError(null);

//     // Only tear down the mic/socket if the user hasn't chosen to keep it open
//     // if (!keepConnectionOpen) {
//     //   setIsCallRecording(false);
//     //   endProcessingTurn();
//     //   endingCallRef.current = false;
//     //   stopMicrophoneCapture();
//     // }
//     // else: panel hides, but websocket + mic capture keep running in background
//   };

//   const forceCloseConnection = () => {
//     setKeepConnectionOpen(false);
//     setIsCallRecording(false);
//     endProcessingTurn();
//     setCaptureError(null);
//     endingCallRef.current = false;
//     stopMicrophoneCapture(); // this also calls closeWebSocket()
//     setAssistantOpen(false);
//   };

//   const endVoiceCall = () => {
//     const socket = websocketRef.current;
//     const canFlushFinalTurn = hasSpeechRef.current && socket?.readyState === WebSocket.OPEN;

//     setIsCallRecording(false);
//     setCaptureError(null);

//     stopMicrophoneCapture(true); // keep socket open always

//     const endMessage: AssistantMessage = {
//       id: `user-voice-end-${Date.now()}`,
//       sender: 'user',
//       text: '🛑 Ended the voice call.',
//     };
//     setVoiceHistory(prev => [...prev, endMessage]);

//     if (canFlushFinalTurn && socket) {
//       beginProcessingTurn();
//       socket.send(JSON.stringify({ type: 'final' })); // flush last utterance, socket stays open
//     } else {
//       endProcessingTurn();
//     }
//   };

//   const handleVoiceCallToggle = async () => {
//     if (isCallRecording) {
//       endVoiceCall();
//       return;
//     }

//     const sessionId =
//       typeof crypto !== 'undefined' && crypto.randomUUID
//         ? crypto.randomUUID()
//         : `session-${Date.now()}`;
//     sessionIdRef.current = sessionId;

//     setIsCallRecording(true);
//     setAudioBufferCount(0);
//     setAudioPreview([]);
//     setCaptureError(null);

//     const userMessage: AssistantMessage = {
//       id: `user-voice-${Date.now()}`,
//       sender: 'user',
//       text: '🔊 Started a voice session.',
//     };

//     setVoiceHistory(prev => [...prev, userMessage]);

//     const reply: AssistantMessage = {
//       id: `assistant-voice-${Date.now()}`,
//       sender: 'assistant',
//       text: "Voice call mode is ready. Just speak — I'll reply automatically each time you pause.",
//     };

//     setVoiceHistory(prev => [...prev, reply]);

//     try {
//       await startMicrophoneCapture(sessionId);
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : 'Unable to start microphone capture.';
//       setCaptureError(message);
//       setIsCallRecording(false);
//       stopMicrophoneCapture();
//     }
//   };

//   const handleAssistantSend = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const trimmed = assistantInput.trim();
//     if (!trimmed) return;

//     const userMessage: AssistantMessage = {
//       id: `user-${Date.now()}`,
//       sender: 'user',
//       text: trimmed,
//     };

//     setChatHistory(prev => [...prev, userMessage]);
//     setAssistantInput('');
//     setIsLoadingResponse(true);

//     try {
//       const response = await fetch('https://192.168.40.150:8000/chat/text', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: trimmed }),
//       });

//       if (!response.ok) {
//         throw new Error(`Request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       const replyText =
//         typeof data?.reply === 'string'
//           ? data.reply
//           : typeof data?.agent_reply === 'string'
//             ? data.agent_reply
//             : 'The assistant returned an empty response.';

//       const reply: AssistantMessage = {
//         id: `assistant-${Date.now()}`,
//         sender: 'assistant',
//         text: replyText,
//       };

//       setChatHistory(prev => [...prev, reply]);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : 'Unable to reach the assistant service.';
//       const reply: AssistantMessage = {
//         id: `assistant-error-${Date.now()}`,
//         sender: 'assistant',
//         text: `Sorry, I couldn’t reach the assistant service. ${errorMessage}`,
//       };

//       setChatHistory(prev => [...prev, reply]);
//     } finally {
//       setIsLoadingResponse(false);
//     }
//   };

//   setTheme(theme);

//   const startTypingSound = () => {
//     const audio = typingSoundRef.current;

//     if (audio) {
//       audio.currentTime = 0;
//       audio.play().catch(() => undefined);
//     }
//   };

//   const stopTypingSound = () => {
//     const audio = typingSoundRef.current;

//     if (audio) {
//       audio.pause();
//       audio.currentTime = 0;
//     }
//   };

//   return (
//     <>
//       <AnalyticsDashboard onOpenAssistant={openAssistant} />

//       <audio ref={audioPlaybackRef} className="hidden" />
//       <audio ref={typingSoundRef} src={typingSound} className="hidden" />

//       <button
//         type="button"
//         onClick={() => openAssistant('chat')}
//         className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-slate-950/20 transition hover:bg-slate-800 cursor-pointer"
//       >
//         <MessageSquare size={18} className="cursor-pointer" />
//         Talk to AI Assistant
//       </button>

//       {assistantOpen && (
//         <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/30 backdrop-blur-sm px-4 py-6 sm:items-center sm:px-6">
//           <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl sm:h-[90vh]">
//             <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
//               <div>
//                 <p className="text-lg font-semibold text-slate-400">
//                   Hello! Ask us anything about Praangan Elitus Project!
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={closeAssistant}
//                 className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
//                 aria-label="Close assistant panel"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setAssistantMode('chat')}
//                   className={` cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${assistantMode === 'chat' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
//                 >
//                   Chat with AI
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setAssistantMode('call')}
//                   className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${assistantMode === 'call' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
//                 >
//                   Voice Call with AI
//                 </button>
//               </div>
//             </div>

//             <div className="flex h-[calc(100%-212px)] flex-col overflow-hidden bg-slate-50 px-6 py-6 sm:h-[calc(100%-150px)]">
//               {assistantMode === 'chat' ? (
//                 <div className="flex h-full flex-col">
//                   <div className="flex-1 overflow-y-auto pr-1" ref={chatScrollRef}>
//                     <div className="space-y-4">
//                       {chatHistory.map(message => (
//                         <div
//                           key={message.id}
//                           className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                         >
//                           <div
//                             className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm ${
//                               message.sender === 'user'
//                                 ? 'bg-slate-950 text-white rounded-br-none'
//                                 : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
//                             }`}
//                           >
//                             <p>{message.text}</p>
//                             {message.audioUrl && <MessageAudioPlayer src={message.audioUrl} />}
//                           </div>
//                         </div>
//                       ))}
//                       {isLoadingResponse && (
//                         <div className="flex justify-start">
//                           <div className="max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm bg-white text-slate-900 rounded-bl-none border border-slate-200">
//                             <div className="flex items-center gap-1.5">
//                               <span
//                                 className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
//                                 style={{ animationDelay: '0ms' }}
//                               />
//                               <span
//                                 className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
//                                 style={{ animationDelay: '150ms' }}
//                               />
//                               <span
//                                 className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
//                                 style={{ animationDelay: '300ms' }}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <form
//                     onSubmit={handleAssistantSend}
//                     className="mt-4 flex flex-col gap-3 sm:flex-row"
//                   >
//                     <input
//                       type="text"
//                       value={assistantInput}
//                       onChange={event => setAssistantInput(event.target.value)}
//                       placeholder="Ask your AI Assistant anything..."
//                       className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                     <button
//                       type="submit"
//                       disabled={!assistantInput.trim() || isLoadingResponse}
//                       className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
//                     >
//                       <Send size={16} />
//                       Send
//                     </button>
//                   </form>
//                 </div>
//               ) : (
//                 <div className="flex h-full flex-col justify-between gap-6 overflow-y-auto">
//                   <div className="space-y-4">
//                     <div className="max-h-[500px] overflow-y-auto pr-1" ref={chatScrollRef}>
//                       <div className="space-y-4">
//                         {voiceHistory.map(message => (
//                           <div
//                             key={message.id}
//                             className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                           >
//                             <div
//                               className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm ${
//                                 message.sender === 'user'
//                                   ? 'bg-slate-950 text-white rounded-br-none'
//                                   : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
//                               }`}
//                             >
//                               <p>{message.text}</p>
//                               {message.audioUrl && <MessageAudioPlayer src={message.audioUrl} />}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
//                       <p className="font-semibold text-slate-900">Current status</p>
//                       <p className="mt-2 text-sm text-slate-600">
//                         {isProcessingTurn
//                           ? 'Processing your last utterance...'
//                           : isCallRecording
//                             ? "Voice session is active. Just speak — I'll reply automatically when you pause."
//                             : 'Tap the button below to start your voice interaction.'}
//                       </p>
//                     {/* <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
//                         <p className="font-medium text-slate-900">PCM capture preview</p>
//                         <p className="mt-2">Buffers captured: {audioBufferCount}</p>
//                         <p className="mt-2">
//                           Latest PCM samples:{' '}
//                           {audioPreview.length > 0
//                             ? audioPreview.join(', ')
//                             : 'Waiting for audio...'}
//                         </p>
//                         <p className="mt-2">WebSocket: {websocketStatus}</p>
//                       </div> */}
//                       {captureError && (
//                         <p className="mt-3 text-sm font-medium text-red-600">{captureError}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         void handleVoiceCallToggle();
//                       }}
//                       disabled={isProcessingTurn}
//                       className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
//                         isCallRecording
//                           ? 'bg-red-600 hover:bg-red-700'
//                           : 'bg-slate-950 hover:bg-slate-800'
//                       }`}
//                     >
//                       {isCallRecording && (
//                         // <span className="inline-flex h-3.5 w-3.5 rounded-full bg-white animate-spin" />
//                         <div className="h-5 w-5 animate-spin rounded-full border-4 border-gray-200 border-t-red-500"></div>

//                       )}
//                       {/* <PhoneCall size={18} /> */}
//                       {isCallRecording ? 'Thinking...' : 'Start Voice Call'}
//                     </button>
//                     {isCallRecording && (
//                       <button
//                         type="button"
//                         onClick={endVoiceCall}
//                         disabled={isProcessingTurn}
//                         className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         <PhoneOff size={18} />
//                         {isProcessingTurn ? 'Finishing up...' : 'End Voice Call'}
//                       </button>
//                     )}

//                     {/* NEW: keep-connection toggle */}
//                     <button
//                       type="button"
//                       onClick={() => setKeepConnectionOpen(prev => !prev)}
//                       className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full border px-5 py-4 text-sm font-semibold shadow-sm transition ${
//                         keepConnectionOpen
//                           ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
//                           : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
//                       }`}
//                     >
//                       {keepConnectionOpen
//                         ? '🔒 Connection stays open on close'
//                         : '🔓 Connection closes on panel close'}
//                     </button>

//                     {/* NEW: explicit hard-close button */}
//                     {keepConnectionOpen && (
//                       <button
//                         type="button"
//                         onClick={forceCloseConnection}
//                         className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
//                       >
//                         <PhoneOff size={18} />
//                         Close Connection
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default App;

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Theme } from './settings/types';
import { AnalyticsDashboard } from './components/generated/AnalyticsDashboard';
import { MessageSquare, X, Send, PhoneCall, PhoneOff, Play, Pause } from 'lucide-react';
import typingSound from './typingSound.mp3';
// const AUDIO_WS_BASE_URL = 'ws://192.168.40.150:8000/ws/audio';
// const AUDIO_WS_BASE_URL = 'wss://192.168.40.150:8000/ws/audio';
const AUDIO_WS_BASE_URL = 'wss://192.168.40.150:8000/ws/live';
const DEFAULT_PROJECT_ID = 'praangan';
const MAX_QUEUED_CHUNKS = 200;

// --- Silence detection (VAD) tuning ---
// RMS energy below this is treated as silence. Raise if background noise
// keeps triggering false "speech"; lower if quiet speech isn't detected.
const SILENCE_RMS_THRESHOLD = 0.012;
// How long the user must be silent (after having spoken) before we
// treat the utterance as finished and send it to the backend.
const SILENCE_DURATION_MS = 2000;
const MAX_UTTERANCE_MS = 8000; // force-finalize safety net if silence never detected



const convertFloat32ToInt16PCM = (input: Float32Array): Int16Array => {
  const output = new Int16Array(input.length);

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
};

const computeRms = (data: Float32Array): number => {
  let sumSquares = 0;
  for (let i = 0; i < data.length; i += 1) {
    sumSquares += data[i] * data[i];
  }
  return Math.sqrt(sumSquares / data.length);
};

const encodeInt16PCMChunksToWav = (chunks: Int16Array[], sampleRate: number): Blob => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const buffer = new ArrayBuffer(44 + totalLength * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i += 1) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalLength * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, totalLength * 2, true);

  let index = 44;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i += 1) {
      view.setInt16(index, chunk[i], true);
      index += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

const decodeBase64AudioToArrayBuffer = (raw: string): ArrayBuffer | null => {
  const payload = raw.trim();
  if (!payload) return null;

  const normalized = payload.startsWith('data:')
    ? payload.slice(payload.indexOf(',') + 1)
    : payload;

  const base64Pattern = /^[A-Za-z0-9+/=\r\n]+$/;
  if (!base64Pattern.test(normalized)) return null;

  try {
    const binary = atob(normalized.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
};

type AssistantMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioUrl?: string;
};

const formatAudioTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MessageAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const syncDuration = () => {
    const nextDuration = audioRef.current?.duration;
    if (typeof nextDuration === 'number' && Number.isFinite(nextDuration) && nextDuration > 0) {
      setDuration(nextDuration);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="mt-2 flex w-full min-w-[280px] items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-slate-700">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={syncDuration}
        onDurationChange={syncDuration}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
        {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={Math.min(currentTime, duration || 0)}
        onChange={handleSeek}
        className="min-w-0 flex-1 accent-slate-700"
      />
    </div>
  );
};

type ControlMessage = {
  type?: string;
  project_id?: string;
  session_id?: string;
  user_text?: string;
  language?: string;
  agent_reply?: string;
  message?: string;
};

let theme: Theme = 'light';
const CHAT_WELCOME_MESSAGE: AssistantMessage = {
  id: 'assistant-welcome-chat',
  sender: 'assistant',
  text: 'Hello! I’m your AI Assistant. Tap Chat to start typing or Call for voice interaction.',
};

const VOICE_WELCOME_MESSAGE: AssistantMessage = {
  id: 'assistant-welcome-voice',
  sender: 'assistant',
  text: 'Hello! I’m your AI Assistant. Start a voice call to speak with me.',
};

function App() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'call'>('chat');
  const [assistantInput, setAssistantInput] = useState('');
  const [isCallRecording, setIsCallRecording] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [audioBufferCount, setAudioBufferCount] = useState(0);
  const [audioPreview, setAudioPreview] = useState<number[]>([]);
  const [websocketStatus, setWebsocketStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState<AssistantMessage[]>([CHAT_WELCOME_MESSAGE]);
  const [voiceHistory, setVoiceHistory] = useState<AssistantMessage[]>([VOICE_WELCOME_MESSAGE]);

  const [keepConnectionOpen, setKeepConnectionOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string>('');
  const endingCallRef = useRef(false);

  // Backend readiness / send queue (from previous fix)
  const backendReadyRef = useRef(false);
  const pendingChunksRef = useRef<ArrayBufferLike[]>([]);

  // NEW: silence detection state
  const hasSpeechRef = useRef(false);
  const silenceTimeoutRef = useRef<number | null>(null);
  const isProcessingTurnRef = useRef(false);

  // ADD near hasSpeechRef / silenceTimeoutRef
  const speechStartRef = useRef<number | null>(null);
  const pendingAudioMsgIdRef = useRef<string | null>(null);
  const pendingUserAudioUrlRef = useRef<string | null>(null);
  const utterancePcmChunksRef = useRef<Int16Array[]>([]);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);
  const activeHistory = assistantMode === 'chat' ? chatHistory : voiceHistory;

  // Add near your other refs
const chatSessionIdRef = useRef<string>(
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `chat-session-${Date.now()}`
);


  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Keep a ref in sync with isProcessingTurn state so timer/audio callbacks
  // (which close over stale state otherwise) always see the current value.
  const beginProcessingTurn = () => {
    isProcessingTurnRef.current = true;
    setIsProcessingTurn(true);
    startTypingSound();
  };

  const endProcessingTurn = () => {
    isProcessingTurnRef.current = false;
    setIsProcessingTurn(false);
    stopTypingSound();
  };

  const clearSilenceTimer = () => {
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const flushPendingChunks = () => {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    while (pendingChunksRef.current.length > 0) {
      const chunk = pendingChunksRef.current.shift();
      if (chunk) socket.send(chunk);
    }
  };

  const closeWebSocket = () => {
    if (websocketRef.current) {
      console.trace('[closeWebSocket] called — stack trace above');
      websocketRef.current.onopen = null;
      websocketRef.current.onmessage = null;
      websocketRef.current.onerror = null;
      websocketRef.current.onclose = null;
      websocketRef.current.close();
      websocketRef.current = null;
    }

    backendReadyRef.current = false;
    pendingChunksRef.current = [];
    setWebsocketStatus('disconnected');
  };

  const handleAudioReply = (data: ArrayBuffer) => {
    const blob = new Blob([data], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const targetId = pendingAudioMsgIdRef.current;
    pendingAudioMsgIdRef.current = null;

    setVoiceHistory(prev =>
      prev.map(m => (targetId && m.id === targetId ? { ...m, audioUrl: url } : m))
    );

    const audioEl = audioPlaybackRef.current;
    // if (audioEl) {
    //   audioEl.src = url;
    //   void audioEl.play().catch(() => undefined);
    // }

    // below code is only for if assistant complete the sentense then capture another input
    if (audioEl) {
      audioEl.src = url;
      audioEl.onended = () => {
        endProcessingTurn(); // mic only re-enabled once the assistant is done talking
      };
      audioEl.onerror = () => {
        endProcessingTurn(); // safety net so a playback failure doesn't lock the mic forever
      };
      void audioEl.play().catch(() => {
        endProcessingTurn(); // if autoplay is blocked, don't leave the turn stuck
      });
    } else {
      endProcessingTurn();
    }
  };

  // NEW: sends the accumulated audio for processing as soon as we detect
  // the user has stopped talking. Does NOT close the socket — the call
  // stays open so the next utterance can be captured immediately after.
  const finalizeTurn = () => {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (!hasSpeechRef.current || isProcessingTurnRef.current) return;

    const chunks = utterancePcmChunksRef.current;
    if (chunks.length > 0) {
      const wavBlob = encodeInt16PCMChunksToWav(chunks, 16000);
      if (pendingUserAudioUrlRef.current) {
        URL.revokeObjectURL(pendingUserAudioUrlRef.current);
      }
      pendingUserAudioUrlRef.current = URL.createObjectURL(wavBlob);
    }
    utterancePcmChunksRef.current = [];

    hasSpeechRef.current = false;
    speechStartRef.current = null;
    beginProcessingTurn();
    socket.send(JSON.stringify({ type: 'final' }));
  };

  const evaluateSilence = (inputData: Float32Array) => {
    const rms = computeRms(inputData);
    const isSpeech = rms > SILENCE_RMS_THRESHOLD;

    if (isSpeech) {
      if (!hasSpeechRef.current) {
        speechStartRef.current = Date.now();
        utterancePcmChunksRef.current = [];
      }
      hasSpeechRef.current = true;
      clearSilenceTimer();

      if (speechStartRef.current && Date.now() - speechStartRef.current > MAX_UTTERANCE_MS) {
        speechStartRef.current = null;
        finalizeTurn();
      }
      return;
    }

    if (
      hasSpeechRef.current &&
      silenceTimeoutRef.current === null &&
      !isProcessingTurnRef.current
    ) {
      silenceTimeoutRef.current = window.setTimeout(() => {
        silenceTimeoutRef.current = null;
        speechStartRef.current = null;
        finalizeTurn();
      }, SILENCE_DURATION_MS);
    }
  };

  const handleControlMessage = (raw: string) => {
    let payload: ControlMessage;
    console.log('[Control Message]', raw);
    try {
      payload = JSON.parse(raw);

      console.log('[Control Message Parsed]', payload);
    } catch {
      return;
    }

    switch (payload.type) {
      case 'ready':
        backendReadyRef.current = true;
        flushPendingChunks();
        break;

      case 'response': {
    // uncommnt if you dont want  assistant complete the sentense then capture another input


        // endProcessingTurn();
        const userText = typeof payload.user_text === 'string' ? payload.user_text.trim() : '';
        const agentReply =
          typeof payload.agent_reply === 'string' ? payload.agent_reply.trim() : '';

        console.log('[Assistant Response]', { userText, agentReply, language: payload.language });
        const assistantMsgId = `assistant-turn-${Date.now()}`;
        const userAudioUrl = pendingUserAudioUrlRef.current;
        pendingUserAudioUrlRef.current = null;

        setVoiceHistory(prev => [
          ...prev,
          ...(userText
            ? [
                {
                  id: `user-turn-${Date.now()}`,
                  sender: 'user' as const,
                  text: userText,
                  ...(userAudioUrl ? { audioUrl: userAudioUrl } : {}),
                },
              ]
            : []),
          ...(agentReply
            ? [{ id: assistantMsgId, sender: 'assistant' as const, text: agentReply }]
            : []),
        ]);

        pendingAudioMsgIdRef.current = agentReply ? assistantMsgId : null;

        // if (endingCallRef.current) {
        //   endingCallRef.current = false;
        //   closeWebSocket();
        // }

    // below code is only for if assistant complete the sentense then capture another input
        if (!agentReply) {
          endProcessingTurn();
        }
        
        break;
      }

      case 'error':
    // uncommnt if you dont want  assistant complete the sentense then capture another input
    console.log("error",payload.message)

        // endProcessingTurn();
        setCaptureError(
          typeof payload.message === 'string' ? payload.message : 'The assistant reported an error.'
        );
        // if (endingCallRef.current) {
        //   endingCallRef.current = false;
        //   closeWebSocket();
        // }
        break;

      case 'warning':
    // uncommnt if you dont want  assistant complete the sentense then capture another input
    console.log("warning",payload.message)

        // endProcessingTurn();
        if (typeof payload.message === 'string') {
          setCaptureError(payload.message);
        }
        // if (endingCallRef.current) {
        //   endingCallRef.current = false;
        //   closeWebSocket();
        // }
        break;

      case 'reset':
        endProcessingTurn();
        break;

      case 'processing': {
        console.log('[Assistant Processing]', payload.message);
        // Optional: surface a "thinking" state in the UI here, e.g.:
        // setCaptureError(null);
        break;
      }

      default:
        break;
    }
  };

  const connectWebSocket = (sessionId: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setWebsocketStatus('connecting');
    backendReadyRef.current = false;
    pendingChunksRef.current = [];

    const url = `${AUDIO_WS_BASE_URL}?project_id=${encodeURIComponent(DEFAULT_PROJECT_ID)}&session_id=${encodeURIComponent(sessionId)}`;
    const socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      setWebsocketStatus('connected');
    };

    socket.onmessage = event => {
      if (typeof event.data === 'string') {
        const raw = event.data.trim();
        if (raw.startsWith('{')) {
          handleControlMessage(raw);
          return;
        }

        const decodedAudio = decodeBase64AudioToArrayBuffer(raw);
        if (decodedAudio) {
          handleAudioReply(decodedAudio);
          return;
        }

        handleControlMessage(raw);
      } else {
        handleAudioReply(event.data as ArrayBuffer);
      }
    };

    socket.onerror = () => {
      setWebsocketStatus('error');
      console.log('[WebSocket Error] Connection failed.');
      setCaptureError('WebSocket connection failed.');
    };

    socket.onclose = event => {
      console.log('[WebSocket] onclose fired', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      if (websocketRef.current === socket) {
        websocketRef.current = null;
      }
      backendReadyRef.current = false;
      pendingChunksRef.current = [];
      setWebsocketStatus('disconnected');
    };

    websocketRef.current = socket;
  };

  // const stopMicrophoneCapture = (keepSocketOpen = false) => {
  const stopMicrophoneCapture = (keepSocketOpen = true) => {
    const processor = processorRef.current;
    if (processor) {
      processor.disconnect();
      processor.onaudioprocess = null;
    }

    mediaStreamSourceRef.current?.disconnect();

    processorRef.current = null;
    mediaStreamSourceRef.current = null;

    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    clearSilenceTimer();
    hasSpeechRef.current = false;

    if (!keepSocketOpen) {
      closeWebSocket();
    }
  };

  const sendAudioChunk = (pcmBuffer: Int16Array) => {
    if (isProcessingTurnRef.current) {
      return;
    }

    const socket = websocketRef.current;
    const chunk = pcmBuffer.buffer.slice(
      pcmBuffer.byteOffset,
      pcmBuffer.byteOffset + pcmBuffer.byteLength
    );

    const canSendNow = !!socket && socket.readyState === WebSocket.OPEN && backendReadyRef.current;

    if (canSendNow) {
      socket!.send(chunk);
      return;
    }

    pendingChunksRef.current.push(chunk);
    if (pendingChunksRef.current.length > MAX_QUEUED_CHUNKS) {
      pendingChunksRef.current.shift();
    }
  };

  const handleAudioBuffer = (inputData: Float32Array) => {
    if (isProcessingTurnRef.current) {
      return;
    }

    const pcmBuffer = convertFloat32ToInt16PCM(inputData);
    sendAudioChunk(pcmBuffer);
    setAudioBufferCount(count => count + 1);
    setAudioPreview(Array.from(pcmBuffer.slice(0, 8)));
    evaluateSilence(inputData);
    if (hasSpeechRef.current) {
      utterancePcmChunksRef.current.push(pcmBuffer);
    }
  };

  const startMicrophoneCapture = async (sessionId: string) => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support microphone capture.');
    }

    stopMicrophoneCapture();

    // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

   const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,   // removes the assistant's own TTS audio if picked up by mic (critical for barge-in/call scenarios)
    noiseSuppression: true,   // suppresses steady background noise (fans, hum, traffic)
    autoGainControl: true,    // normalizes volume so quiet speech isn't under-captured
    channelCount: 1,
    sampleRate: 16000,
  },
});
    
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      throw new Error('AudioContext is not supported in this browser.');
    }

    const context = new AudioContextCtor({ sampleRate: 16000 });
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);

    connectWebSocket(sessionId);

    processor.onaudioprocess = event => {
      const inputData = event.inputBuffer.getChannelData(0);
      handleAudioBuffer(inputData);
    };

    source.connect(processor);
    processor.connect(context.destination);

    audioContextRef.current = context;
    mediaStreamRef.current = stream;
    mediaStreamSourceRef.current = source;
    processorRef.current = processor;

    await context.resume();
  };

  useEffect(() => {
    return () => {
      stopMicrophoneCapture();
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeHistory, isLoadingResponse]);

  const openAssistant = (mode: 'chat' | 'call' = 'chat') => {
    setAssistantMode(mode);
    setAssistantOpen(true);
    if (mode !== 'call') {
      setIsCallRecording(false);
    }
  };

  // const closeAssistant = () => {
  //   setAssistantOpen(false);
  //   setIsCallRecording(false);
  //   endProcessingTurn();
  //   setCaptureError(null);
  //   endingCallRef.current = false;
  //   stopMicrophoneCapture();
  // };

  const closeAssistant = () => {
    setAssistantOpen(false);
    setCaptureError(null);

    // Only tear down the mic/socket if the user hasn't chosen to keep it open
    // if (!keepConnectionOpen) {
    //   setIsCallRecording(false);
    //   endProcessingTurn();
    //   endingCallRef.current = false;
    //   stopMicrophoneCapture();
    // }
    // else: panel hides, but websocket + mic capture keep running in background
  };

  const forceCloseConnection = () => {
    setKeepConnectionOpen(false);
    setIsCallRecording(false);
    endProcessingTurn();
    setCaptureError(null);
    endingCallRef.current = false;
    stopMicrophoneCapture(); // this also calls closeWebSocket()
    setAssistantOpen(false);
  };

  const endVoiceCall = () => {
    const socket = websocketRef.current;
    const canFlushFinalTurn = hasSpeechRef.current && socket?.readyState === WebSocket.OPEN;

    setIsCallRecording(false);
    setCaptureError(null);

    stopMicrophoneCapture(true); // keep socket open always

    const endMessage: AssistantMessage = {
      id: `user-voice-end-${Date.now()}`,
      sender: 'user',
      text: '🛑 Ended the voice call.',
    };
    setVoiceHistory(prev => [...prev, endMessage]);

    if (canFlushFinalTurn && socket) {
      beginProcessingTurn();
      socket.send(JSON.stringify({ type: 'final' })); // flush last utterance, socket stays open
    } else {
      endProcessingTurn();
    }
  };

  const handleVoiceCallToggle = async () => {
    if (isCallRecording) {
      endVoiceCall();
      return;
    }

    const sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
    sessionIdRef.current = sessionId;

    setIsCallRecording(true);
    setAudioBufferCount(0);
    setAudioPreview([]);
    setCaptureError(null);

    const userMessage: AssistantMessage = {
      id: `user-voice-${Date.now()}`,
      sender: 'user',
      text: '🔊 Started a voice session.',
    };

    setVoiceHistory(prev => [...prev, userMessage]);

    const reply: AssistantMessage = {
      id: `assistant-voice-${Date.now()}`,
      sender: 'assistant',
      text: "Voice call mode is ready. Just speak — I'll reply automatically each time you pause.",
    };

    setVoiceHistory(prev => [...prev, reply]);

    try {
      await startMicrophoneCapture(sessionId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start microphone capture.';
      setCaptureError(message);
      setIsCallRecording(false);
      stopMicrophoneCapture();
    }
  };

  const handleAssistantSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = assistantInput.trim();
    if (!trimmed) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setChatHistory(prev => [...prev, userMessage]);
    setAssistantInput('');
    setIsLoadingResponse(true);

    try {
      const response = await fetch("https://192.168.40.150:8000/chat/text", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmed,session_id: chatSessionIdRef.current, project_id: DEFAULT_PROJECT_ID }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        typeof data?.reply === 'string'
          ? data.reply
          : typeof data?.agent_reply === 'string'
            ? data.agent_reply
            : 'The assistant returned an empty response.';

      const reply: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
      };

      setChatHistory(prev => [...prev, reply]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to reach the assistant service.';
      const reply: AssistantMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I couldn’t reach the assistant service. ${errorMessage}`,
      };

      setChatHistory(prev => [...prev, reply]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  setTheme(theme);

  const startTypingSound = () => {
    const audio = typingSoundRef.current;

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
    }
  };

  const stopTypingSound = () => {
    const audio = typingSoundRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return (
    <>
      <AnalyticsDashboard onOpenAssistant={openAssistant} />

      <audio ref={audioPlaybackRef} className="hidden" />
      <audio ref={typingSoundRef} src={typingSound} className="hidden" />

      <button
        type="button"
        onClick={() => openAssistant('chat')}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-slate-950/20 transition hover:bg-slate-800 cursor-pointer"
      >
        <MessageSquare size={18} className="cursor-pointer" />
        Talk to AI Assistant
      </button>

      {assistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/30 backdrop-blur-sm px-4 py-6 sm:items-center sm:px-6">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl sm:h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-lg font-semibold text-slate-400">
                  Hello! Ask us anything about Praangan Elitus Project!
                </p>
              </div>
              <button
                type="button"
                onClick={closeAssistant}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close assistant panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssistantMode('chat')}
                  className={` cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${assistantMode === 'chat' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Chat with AI
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantMode('call')}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${assistantMode === 'call' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Voice Call with AI
                </button>
              </div>
            </div>

            <div className="flex h-[calc(100%-212px)] flex-col overflow-hidden bg-slate-50 px-6 py-6 sm:h-[calc(100%-150px)]">
              {assistantMode === 'chat' ? (
                <div className="flex h-full flex-col">
                  <div className="flex-1 overflow-y-auto pr-1" ref={chatScrollRef}>
                    <div className="space-y-4">
                      {chatHistory.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm ${
                              message.sender === 'user'
                                ? 'bg-slate-950 text-white rounded-br-none'
                                : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                            }`}
                          >
                            <p>{message.text}</p>
                            {message.audioUrl && <MessageAudioPlayer src={message.audioUrl} />}
                          </div>
                        </div>
                      ))}
                      {isLoadingResponse && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm bg-white text-slate-900 rounded-bl-none border border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <form
                    onSubmit={handleAssistantSend}
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      type="text"
                      value={assistantInput}
                      onChange={event => setAssistantInput(event.target.value)}
                      placeholder="Ask your AI Assistant anything..."
                      className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={!assistantInput.trim() || isLoadingResponse}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between gap-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="max-h-[500px] overflow-y-auto pr-1" ref={chatScrollRef}>
                      <div className="space-y-4">
                        {voiceHistory.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-6 shadow-sm ${
                                message.sender === 'user'
                                  ? 'bg-slate-950 text-white rounded-br-none'
                                  : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                              }`}
                            >
                              <p>{message.text}</p>
                              {message.audioUrl && <MessageAudioPlayer src={message.audioUrl} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">Current status</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {isProcessingTurn
                          ? 'Processing your Question...'
                          : isCallRecording
                            ? "Ask anything about Praangan Elitus"
                            : 'Tap the button below to start your voice interaction.'}
                      </p>
                    {/* <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">PCM capture preview</p>
                        <p className="mt-2">Buffers captured: {audioBufferCount}</p>
                        <p className="mt-2">
                          Latest PCM samples:{' '}
                          {audioPreview.length > 0
                            ? audioPreview.join(', ')
                            : 'Waiting for audio...'}
                        </p>
                        <p className="mt-2">WebSocket: {websocketStatus}</p>
                      </div> */}
                      {captureError && (
                        <p className="mt-3 text-sm font-medium text-red-600">{captureError}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void handleVoiceCallToggle();
                      }}
                      disabled={isProcessingTurn}
                      className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isCallRecording
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-slate-950 hover:bg-slate-800'
                      }`}
                    >
                      {isCallRecording && (
                        // <span className="inline-flex h-3.5 w-3.5 rounded-full bg-white animate-spin" />
                        <div className="h-5 w-5 animate-spin rounded-full border-4 border-gray-200 border-t-red-500"></div>

                      )}
                      {/* <PhoneCall size={18} /> */}
                      {isCallRecording ? 'Thinking...' : 'Start Voice Call'}
                    </button>
                    {isCallRecording && (
                      <button
                        type="button"
                        onClick={endVoiceCall}
                        disabled={isProcessingTurn}
                        className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PhoneOff size={18} />
                        {isProcessingTurn ? 'Finishing up...' : 'End Voice Call'}
                      </button>
                    )}

                    {/* NEW: keep-connection toggle */}
                    <button
                      type="button"
                      onClick={() => setKeepConnectionOpen(prev => !prev)}
                      className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full border px-5 py-4 text-sm font-semibold shadow-sm transition ${
                        keepConnectionOpen
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {keepConnectionOpen
                        ? '🔒 Connection stays open on close'
                        : '🔓 Connection closes on panel close'}
                    </button>

                    {/* NEW: explicit hard-close button */}
                    {keepConnectionOpen && (
                      <button
                        type="button"
                        onClick={forceCloseConnection}
                        className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
                      >
                        <PhoneOff size={18} />
                        Close Connection
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
