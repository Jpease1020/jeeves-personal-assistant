import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4001/api/ws';

interface Message {
    type: string;
    content?: string;
    message?: string;
    timestamp: string;
}

interface WebSocketContextType {
    messages: Message[];
    isConnected: boolean;
    sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const websocket = new WebSocket(WS_URL);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('WebSocket message:', message);
                setMessages((prev) => [...prev, message]);

                // Show browser notification for proactive messages
                if (message.type === 'morning-briefing' || message.type === 'evening-check-in') {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Personal Assistant', {
                            body: message.type === 'morning-briefing'
                                ? 'Your morning briefing is ready!'
                                : 'Time for your evening check-in',
                            icon: '/icon.png',
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    const sendMessage = (message: any) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    const value = {
        messages,
        isConnected,
        sendMessage,
    };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}

