import React, { useEffect, useState, useRef } from 'react';
import { Phone, Square, Play, Pause, MessageSquare, Headphones, ArrowRight, Send, X, Mic } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  text?: string;
  audioUrl?: string;
  duration?: string;
  timestamp: string;
}

const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
  const length = samples.length;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
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
  view.setUint32(40, length * 2, true);

  let index = 44;
  for (let i = 0; i < length; i++) {
    view.setInt16(index, samples[i] < 0 ? samples[i] * 0x8000 : samples[i] * 0x7fff, true);
    index += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

export const RecordPage: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'PLAYING' | 'PAUSED' | 'UPLOADING'>('IDLE');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'chat' | 'call'>('chat');
  const [messageInput, setMessageInput] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const openChatPanel = () => {
    setPanelMode('chat');
    setPanelOpen(true);
  };

  const openCallPanel = () => {
    setPanelMode('call');
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessageInput('');

    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      text: 'Hi there! I’m your AI Assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
    };

    window.setTimeout(() => {
      setChatHistory((prev) => [...prev, agentMessage]);
    }, 500);
  };

  const handleToggleAction = async () => {
    if (status === 'IDLE') {
      samplesRef.current = [];
      setRecordedAudioUrl(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          samplesRef.current.push(new Float32Array(inputData));
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        setStatus('RECORDING');
      } catch (err) {
        console.error('Microphone capture failed:', err);
        setStatus('IDLE');
      }
      return;
    }

    if (status === 'RECORDING') {
      if (processorRef.current && sourceRef.current) {
        processorRef.current.disconnect();
        sourceRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mergedSamples = new Float32Array(
        samplesRef.current.reduce((acc, val) => acc + val.length, 0)
      );
      let offset = 0;
      for (const sample of samplesRef.current) {
        mergedSamples.set(sample, offset);
        offset += sample.length;
      }

      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const wavBlob = encodeWAV(mergedSamples, sampleRate);
      const recordedUrl = URL.createObjectURL(wavBlob);
      setRecordedAudioUrl(recordedUrl);

      const duration = mergedSamples.length / sampleRate;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationStr = `${minutes}m ${seconds}s`;

      const userMessage: ChatMessage = {
        id: `voice-${Date.now()}`,
        type: 'user',
        audioUrl: recordedUrl,
        duration: durationStr,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory((prev) => [...prev, userMessage]);
      await sendAudioToApi(wavBlob);
    }
  };

  const sendAudioToApi = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'audio.wav');

    try {
      setStatus('UPLOADING');
      const response = await fetch('http://192.168.40.150:8000/chat/audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          text: data.agent_reply,
          audioUrl: data.audio_base64 ? `data:audio/wav;base64,${data.audio_base64}` : undefined,
          timestamp: new Date().toLocaleTimeString(),
        };
        setChatHistory((prev) => [...prev, agentMessage]);
        setStatus('IDLE');
      } else {
        console.error('Server returned error:', response.status);
        setStatus('IDLE');
      }
    } catch (error) {
      console.error('Network translation error:', error);
      setStatus('IDLE');
    }
  };

  const buttonConfigs = {
    IDLE: { label: 'Record Message', color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: <Phone size={18} /> },
    RECORDING: { label: 'Stop Recording', color: 'bg-red-600 hover:bg-red-700 text-white animate-pulse', icon: <Square size={18} /> },
    PLAYING: { label: 'Pause Reply', color: 'bg-amber-500 hover:bg-amber-600 text-white', icon: <Pause size={18} /> },
    PAUSED: { label: 'Play Reply', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: <Play size={18} /> },
    UPLOADING: { label: 'Processing...', color: 'bg-slate-400 text-slate-100 cursor-not-allowed', icon: null },
  };

  const currentButton = buttonConfigs[status];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr] p-8 lg:p-10">
            <div className="space-y-6">
              <div className="max-w-2xl space-y-4">
                {/* <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Praangan AI Assistant</p> */}
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl"># AI Assistant</h1>
                <p className="text-base leading-8 text-slate-600">
                  Choose Chat or Call to connect with the assistant. Tap “Talk to AI Assistant” to open the chatbox overlay and begin your conversation instantly.
                </p>
              </div>

            </div>

          </div>
        </div>

    
      </div>

    
    </div>
  );
};
