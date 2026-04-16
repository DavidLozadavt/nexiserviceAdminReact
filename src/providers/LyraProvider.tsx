import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Business {
    id: number;
    name: string;
    logo: string;
    category: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    businesses?: Business[];
}

interface LyraContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    conversationId: string;
}

const LyraContext = createContext<LyraContextType | undefined>(undefined);

export const LyraProvider = ({ children }: { children: ReactNode }) => {
    // 1. Conversation ID (No persistir entre recargas según requerimiento)
    const [conversationId] = useState(() => {
        const newId = uuidv4();
        localStorage.setItem('lyra_conversation_id_admin', newId); // Por si otra tab lo lee o la api lo necesita
        return newId;
    });

    // 2. Open State Persistence
    const [isOpen, setIsOpenState] = useState(() => {
        return localStorage.getItem('lyra_is_open_admin') === 'true';
    });

    const setIsOpen = (open: boolean) => {
        setIsOpenState(open);
        localStorage.setItem('lyra_is_open_admin', String(open));
    };

    // 3. Messages (No persistir entre recargas según requerimiento)
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        localStorage.setItem('lyra_messages_admin', JSON.stringify(messages));
    }, [messages]);

    return (
        <LyraContext.Provider value={{ messages, setMessages, isOpen, setIsOpen, conversationId }}>
            {children}
        </LyraContext.Provider>
    );
};

export const useLyra = () => {
    const context = useContext(LyraContext);
    if (!context) {
        throw new Error('useLyra must be used within a LyraProvider');
    }
    return context;
};
