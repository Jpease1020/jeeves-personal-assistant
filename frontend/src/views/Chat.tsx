import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAPI } from '../providers/APIProvider';
import { useWebSocket } from '../providers/WebSocketProvider';
import { colors, spacing, borderRadius, shadows } from '../design/tokens/tokens';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  background: ${colors.background.primary};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Message = styled.div<{ isUser: boolean }>`
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  max-width: 70%;
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  background: ${(props) => (props.isUser ? colors.primary[600] : colors.gray[100])};
  color: ${(props) => (props.isUser ? colors.text.white : colors.text.primary)};
  box-shadow: ${shadows.sm};
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  padding: ${spacing.xl};
  border-top: 1px solid ${colors.border.light};
  background: ${colors.background.secondary};
`;

const Input = styled.input`
  flex: 1;
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.lg};
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }
`;

const Button = styled.button`
  padding: ${spacing.md} ${spacing.xl};
  background: ${colors.primary[600]};
  color: ${colors.text.white};
  border: none;
  border-radius: ${borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primary[700]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  padding: 0 ${spacing.xl} ${spacing.lg};
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: ${spacing.xs} ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.light};
  border-radius: ${borderRadius.pill};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primary[50]};
    border-color: ${colors.primary[600]};
    color: ${colors.primary[600]};
  }
`;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export function Chat() {
    const { sendMessage } = useAPI();
    const { messages: wsMessages } = useWebSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add WebSocket messages to chat
    useEffect(() => {
        const latestWsMessage = wsMessages[wsMessages.length - 1];
        if (latestWsMessage && latestWsMessage.content) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: latestWsMessage.content || latestWsMessage.message || '',
                },
            ]);
        }
    }, [wsMessages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await sendMessage(userMessage);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, there was an error processing your message.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
    };

    return (
        <>
            <h1 style={{ marginBottom: spacing.xl }}>Chat with Assistant</h1>
            <ChatContainer>
                <MessageList>
                    {messages.length === 0 && (
                        <Message isUser={false}>
                            Hi! I'm your personal assistant. I'm here to help you stay organized, build habits, and achieve your
                            goals. What would you like to work on today?
                        </Message>
                    )}
                    {messages.map((msg, idx) => (
                        <Message key={idx} isUser={msg.role === 'user'}>
                            {msg.content}
                        </Message>
                    ))}
                    {loading && (
                        <Message isUser={false}>
                            <em>Thinking...</em>
                        </Message>
                    )}
                    <div ref={messagesEndRef} />
                </MessageList>

                <QuickActions>
                    <QuickActionButton onClick={() => handleQuickAction('Give me my morning briefing')}>
                        Morning Briefing
                    </QuickActionButton>
                    <QuickActionButton onClick={() => handleQuickAction('Start morning routine')}>
                        Start Routine
                    </QuickActionButton>
                    <QuickActionButton onClick={() => handleQuickAction('Quiz me on Spanish')}>
                        Spanish Quiz
                    </QuickActionButton>
                    <QuickActionButton onClick={() => handleQuickAction("What's my priority for today?")}>
                        Today's Priority
                    </QuickActionButton>
                </QuickActions>

                <InputContainer>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()}>
                        Send
                    </Button>
                </InputContainer>
            </ChatContainer>
        </>
    );
}

