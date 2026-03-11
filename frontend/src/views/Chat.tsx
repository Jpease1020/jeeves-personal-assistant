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

const TextArea = styled.textarea`
  flex: 1;
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.lg};
  font-size: 1rem;
  outline: none;
  resize: vertical;
  min-height: 40px;
  max-height: 200px;
  font-family: inherit;

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

const StopButton = styled(Button)`
  background: ${colors.danger[600]};
  
  &:hover {
    background: ${colors.danger[700]};
  }
`;

const EditButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  background: transparent;
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};

  &:hover {
    background: ${colors.gray[50]};
    border-color: ${colors.primary[600]};
    color: ${colors.primary[600]};
  }
`;

const MessageContainer = styled.div`
  position: relative;
`;

const ResubmitContainer = styled.div`
  margin-top: ${spacing.xs};
  padding: ${spacing.sm};
  background: ${colors.gray[50]};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  color: ${colors.text.secondary};
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
    isEditable?: boolean;
    editedContent?: string;
}

// Format message content with basic markdown support
const formatMessage = (content: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/);

    return parts.map((part, idx) => {
        // Code blocks
        if (part.startsWith('```')) {
            const codeContent = part.slice(3, -3).trim();
            const language = codeContent.split('\n')[0];
            const code = codeContent.replace(language, '').trim();

            return (
                <code key={idx} style={{
                    display: 'block',
                    background: 'rgba(0,0,0,0.05)',
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    whiteSpace: 'pre-wrap',
                    marginTop: spacing.sm,
                    marginBottom: spacing.sm
                }}>
                    {code}
                </code>
            );
        }
        // Inline code
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
                <code key={idx} style={{
                    background: 'rgba(0,0,0,0.05)',
                    padding: '2px 6px',
                    borderRadius: borderRadius.sm,
                    fontFamily: 'monospace',
                    fontSize: '0.9em'
                }}>
                    {part.slice(1, -1)}
                </code>
            );
        }
        // Regular text with line breaks
        // Split by double newlines first to detect paragraphs
        const paragraphs = part.split(/\n\n+/);

        return (
            <span key={idx}>
                {paragraphs.map((para, paraIdx) => (
                    <React.Fragment key={paraIdx}>
                        <span style={{
                            display: 'block',
                            marginBottom: paraIdx < paragraphs.length - 1 ? '1em' : 0
                        }}>
                            {para.split('\n').map((line, lineIdx, lines) => (
                                <React.Fragment key={lineIdx}>
                                    {line}
                                    {lineIdx < lines.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </span>
                    </React.Fragment>
                ))}
            </span>
        );
    });
};

export function Chat() {
    const { sendMessage } = useAPI();
    const { messages: wsMessages } = useWebSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [resubmitContent, setResubmitContent] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

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

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            const response = await sendMessage(userMessage, abortControllerRef.current.signal);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sending message:', error);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, there was an error processing your message.' },
                ]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setResubmitContent(messages[index].content);
    };

    const handleResubmit = async () => {
        if (!resubmitContent.trim() || editingIndex === null) return;

        // Remove the user message and all messages after it
        const updatedMessages = messages.slice(0, editingIndex);
        setMessages(updatedMessages);
        setInput(resubmitContent.trim());
        setEditingIndex(null);
        setResubmitContent('');
        setLoading(true);

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            const response = await sendMessage(resubmitContent.trim(), abortControllerRef.current.signal);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sending message:', error);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, there was an error processing your message.' },
                ]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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
                        <MessageContainer key={idx}>
                            <Message isUser={msg.role === 'user'}>
                                {formatMessage(msg.content)}
                            </Message>
                            {msg.role === 'user' && (
                                <EditButton onClick={() => handleEdit(idx)}>
                                    Edit
                                </EditButton>
                            )}
                        </MessageContainer>
                    ))}
                    {editingIndex !== null && (
                        <ResubmitContainer>
                            <TextArea
                                value={resubmitContent}
                                onChange={(e) => setResubmitContent(e.target.value)}
                                placeholder="Edit your message..."
                                style={{ width: '100%', marginBottom: spacing.sm }}
                            />
                            <div style={{ display: 'flex', gap: spacing.sm }}>
                                <Button onClick={handleResubmit}>
                                    Resubmit
                                </Button>
                                <Button onClick={() => { setEditingIndex(null); setResubmitContent(''); }}>
                                    Cancel
                                </Button>
                            </div>
                        </ResubmitContainer>
                    )}
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
                    <TextArea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        disabled={loading}
                    />
                    {loading ? (
                        <StopButton onClick={handleStop}>
                            Stop
                        </StopButton>
                    ) : (
                        <Button onClick={handleSend} disabled={!input.trim()}>
                            Send
                        </Button>
                    )}
                </InputContainer>
            </ChatContainer>
        </>
    );
}

