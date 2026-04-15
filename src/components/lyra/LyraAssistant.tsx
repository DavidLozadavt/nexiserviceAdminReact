import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { KeenIcon } from '@/components';
import clsx from 'clsx';
import { useLyra } from '@/providers';
import { useLyraVoice } from '@/hooks/useLyraVoice';
import { useNavigate } from 'react-router-dom';
import { 
    lyraMapFlyTo, 
    lyraMapHighlight, 
    lyraMapShow, 
    lyraMapFitAll,
    lyraMapZoomIn,
    lyraMapZoomOut,
} from '@/utils/lyraMapBridge';

/* ── Error Boundary ──────────────────────────────────────────────────────── */
class LyraErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lyra Critical Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // No renderizamos nada si falla para no romper la app
    }
    return this.props.children;
  }
}

/* ── SVG Icons ────────────────────────────────────────────────────────── */
const IconMic = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
    </svg>
);

const IconMicOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 10v2a7 7 0 0 1-.77 3.21L16.7 13.7A5 5 0 0 0 17 12v-2h-2V7.83L19 10zM15 4v5.17l-3-3V4a2 2 0 1 1 3 0z"/>
        <path d="m3.27 3 18 18-1.27 1.27-2.48-2.48A9 9 0 0 1 3 12v-2h2v2a7 7 0 0 0 9.51 6.51L16.11 20A9 9 0 0 1 13 22.94V23h-2v-2.06A9 9 0 0 1 3 12v-2H1.27z"/>
        <path d="M9.24 9.24 9 9V4a3 3 0 0 1 5.76-1.24L9.24 9.24z"/>
    </svg>
);

const IconSend = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

const IconVolumeOn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
);

const IconVolumeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
);

/* ── Sub-component: BusinessCard ────────────────────────────────────────── */
const BusinessCard = ({ business, onVisit, onExploreMap }: { business: any, onVisit: (id: number) => void, onExploreMap: (business: any) => void }) => (
    <div className="mt-2 flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-coal-400 dark:bg-coal-500">
        <div className="h-24 w-full bg-gray-100 dark:bg-coal-400">
            <img 
                src={business.logo} 
                alt={business.name} 
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x200?text=NexiService')}
            />
        </div>
        <div className="p-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100">{business.name}</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{business.category}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                    onClick={() => onExploreMap(business)}
                    className="rounded-lg bg-violet-100 py-1.5 text-[9px] font-bold text-violet-700 transition-all hover:bg-violet-200 active:scale-95 dark:bg-violet-900/30 dark:text-violet-300 flex items-center justify-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Ver en Mapa
                </button>
                <button
                    onClick={() => onVisit(business.id)}
                    className="rounded-lg bg-primary py-1.5 text-[9px] font-bold text-white transition-all hover:bg-primary-active active:scale-95 flex items-center justify-center gap-1"
                >
                    Ir a Negocio
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                </button>
            </div>
        </div>
    </div>
);

/* ── Main Component ─────────────────────────────────────────────────────── */
const LyraAssistantInner = () => {
    // 1. Hooks - Stable Top Level Execution
    const navigate = useNavigate();
    const { messages, setMessages, isOpen, setIsOpen, conversationId } = useLyra();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_URL = import.meta.env.VITE_LYRA_API_URL || 'http://localhost:8099';
    const PROJECT_ID = import.meta.env.VITE_LYRA_PROJECT_ID || 'nexiservice';

    // 2. Handlers
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleSendText = useCallback(async (text: string) => {
        const userMessage = text.trim();
        if (!userMessage || isLoading) return;
        
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Using /chat as it seems to be the one with more features in original code
            const response = await axios.post(`${API_URL}/chat`, {
                message: userMessage,
                project_id: PROJECT_ID,
                conversation_id: conversationId,
                user_id: 'user_admin_demo',
                role: 'admin',
            });

            if (response.data?.reply) {
                const { reply, voice_action, voice_action_payload, properties } = response.data;
                const businesses = properties?.businesses || [];

                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: reply,
                    businesses: businesses.length > 0 ? businesses : undefined
                }]);
                
                if (voiceEnabled) speak(reply);

                if (voice_action === 'navigate' && voice_action_payload?.url) {
                    setTimeout(() => {
                        setIsOpen(false);
                        navigate(voice_action_payload.url);
                    }, 2000);
                }

                // Map Actions
                if (voice_action === 'show_map') {
                    lyraMapShow();
                } else if (voice_action === 'fly_to_business') {
                    const { business_id, lat, lng } = voice_action_payload || {};
                    if (lat && lng) {
                        lyraMapFlyTo(lat, lng);
                        if (business_id) lyraMapHighlight(business_id);
                    }
                } else if (voice_action === 'fit_all_businesses') {
                    lyraMapFitAll();
                } else if (voice_action === 'zoom_in') {
                    lyraMapZoomIn();
                } else if (voice_action === 'zoom_out') {
                    lyraMapZoomOut();
                }
            }
        } catch (error: any) {
            console.error('Lyra Assistant Error:', error);
            let errorMessage = 'Lo siento, tuve un problema al conectar con el asistente. ';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage += 'Parece que el servidor de IA está fuera de línea (Puerto 8099).';
            } else {
                errorMessage += '¡Intenta de nuevo en un momento!';
            }

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: errorMessage 
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    }, [API_URL, PROJECT_ID, conversationId, isLoading, setMessages, navigate, scrollToBottom]);

    const handleTranscript = useCallback((text: string) => { 
        setInput(text); 
        handleSendText(text); 
    }, [handleSendText]);

    // 3. Voice Hook Call
    const {
        isListening,
        isSpeaking,
        voiceEnabled,
        isSupported: voiceSupported,
        startListening,
        stopListening,
        speak,
        toggleVoice,
        error: voiceError,
    } = useLyraVoice({
        apiUrl: API_URL,
        projectId: PROJECT_ID,
        onTranscript: handleTranscript,
    });

    // 4. Effects
    useEffect(() => { 
        scrollToBottom(); 
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: '¡Hola! Soy Lyra, tu consultora experta de NexiService. Estoy lista para ayudarte con la gestión de inventario, POS y reportes de tu negocio. ¿Qué deseas revisar hoy?'
            }]);
        }
    }, [isOpen, messages.length, setMessages]);

    const handleVisit = (id: number) => {
        setIsOpen(false);
        navigate(`/empresa/${id}`);
    };

    const handleExploreOnMap = (business: any) => {
        const lat = business.lat || business.latitud || business.latitude;
        const lng = business.lng || business.longitud || business.longitude;
        if (lat && lng) {
            lyraMapFlyTo(Number(lat), Number(lng), 17);
        }
        if (business.id) {
            lyraMapHighlight(Number(business.id));
        }
        lyraMapShow();
    };

    const handleSend = () => handleSendText(input);
    const handleMicClick = () => { if (isListening) stopListening(); else startListening(); };

    return (
        <>
            {/* Botón Flotante */}
            <div className="fixed bottom-10 right-10 z-[100] transition-all hover:scale-110" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-24 w-24 items-center justify-center rounded-full transition-all hover:scale-110 overflow-hidden"
                >
                    {isOpen ? (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                            <KeenIcon icon="cross" className="text-4xl" />
                        </div>
                    ) : (
                        <img src="/media/app/lyra-memoji.png" alt="Lyra" className="h-full w-full object-cover" />
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <div className={clsx(
                'fixed bottom-28 right-10 z-[100] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 dark:bg-coal-600',
                isOpen ? 'h-[550px] w-80 opacity-100 scale-100' : 'h-0 w-0 opacity-0 scale-90'
            )}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between bg-primary p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                            <img src="/media/app/lyra-memoji.png" alt="Lyra" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">NexiService AI</h3>
                            <p className="text-[10px] opacity-80">{isSpeaking ? '🔊 Hablando...' : 'Modo Consultora • En línea'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {voiceSupported && (
                            <button onClick={toggleVoice} title={voiceEnabled ? 'Silenciar Lyra' : 'Activar voz'} className={clsx('rounded-full p-1 transition-all hover:bg-white/20', voiceEnabled ? 'opacity-100' : 'opacity-40')}>
                                {voiceEnabled ? <IconVolumeOn /> : <IconVolumeOff />}
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="hover:opacity-70"><KeenIcon icon="down" className="text-lg" /></button>
                    </div>
                </div>

                {voiceError && (<div className="flex-shrink-0 mx-3 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">⚠️ {voiceError}</div>)}

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 scrollbar-hide bg-gray-50/50 dark:bg-coal-600/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={clsx('flex flex-col gap-2', msg.role === 'user' ? 'items-end' : 'items-start')}>
                            <div className={clsx(
                                'max-w-[90%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap',
                                msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-800 dark:bg-coal-400 dark:text-gray-100'
                            )}>
                                {msg.content}
                                {msg.businesses && (
                                    <div className="mt-4 grid grid-cols-1 gap-2">
                                        {msg.businesses.map((b: any) => (
                                            <BusinessCard 
                                                key={b.id} 
                                                business={b} 
                                                onVisit={handleVisit} 
                                                onExploreMap={handleExploreOnMap}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (<div className="self-start rounded-2xl bg-white p-3 text-sm text-gray-400 dark:bg-coal-400 animate-pulse">Escribiendo...</div>)}
                    {isListening && (<div className="self-center flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Escuchando...</div>)}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-100 p-3 dark:border-coal-400 bg-white dark:bg-coal-600">
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-coal-500 border border-gray-100 dark:border-coal-400">
                        <input
                            type="text"
                            placeholder={isListening ? '🎙️ Escuchando...' : 'Escribe un mensaje...'}
                            className="w-full bg-transparent text-sm outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isListening}
                        />
                        {voiceSupported && (
                            <button onClick={handleMicClick} disabled={isLoading} className={clsx('flex-shrink-0 rounded-full p-1 transition-all disabled:opacity-40', isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-primary')}>
                                {isListening ? <IconMicOff /> : <IconMic />}
                            </button>
                        )}
                        <button onClick={handleSend} disabled={isLoading || isListening || !input.trim()} className="flex-shrink-0 rounded-full p-1 text-primary transition-all hover:scale-110 disabled:opacity-40">
                            <IconSend />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ── Final Component with Error Boundary ────────────────────────────────── */
const LyraAssistant = () => (
    <LyraErrorBoundary>
        <LyraAssistantInner />
    </LyraErrorBoundary>
);

export { LyraAssistant };
