import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../design/tokens/tokens';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${spacing.lg};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const Title = styled.h1`
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const Subtitle = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.size.lg};
`;

const StatsCard = styled.div`
  background: ${colors.background.card};
  border-radius: 12px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${typography.size.xl};
  font-weight: ${typography.weight.bold};
  color: ${colors.accent.primary};
  margin-bottom: ${spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${typography.size.sm};
  color: ${colors.text.secondary};
`;

const QuizCard = styled.div`
  background: ${colors.background.card};
  border-radius: 12px;
  padding: ${spacing.xl};
  margin-bottom: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const QuestionText = styled.h2`
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
  line-height: 1.5;
`;

const AnswerInput = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 2px solid ${colors.border.light};
  border-radius: 8px;
  font-size: ${typography.size.lg};
  margin-bottom: ${spacing.lg};
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.accent.primary};
  }
`;

const FeedbackCard = styled.div<{ isCorrect: boolean }>`
  background: ${props => props.isCorrect ? colors.success.light : colors.error.light};
  border: 2px solid ${props => props.isCorrect ? colors.success.primary : colors.error.primary};
  border-radius: 8px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const FeedbackTitle = styled.h3<{ isCorrect: boolean }>`
  color: ${props => props.isCorrect ? colors.success.primary : colors.error.primary};
  margin-bottom: ${spacing.sm};
`;

const FeedbackText = styled.p`
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const CorrectAnswer = styled.div`
  background: ${colors.background.secondary};
  padding: ${spacing.md};
  border-radius: 6px;
  font-family: monospace;
  font-size: ${typography.size.lg};
  color: ${colors.text.primary};
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  background: ${props =>
        props.variant === 'primary' ? colors.accent.primary : colors.background.secondary
    };
  color: ${props =>
        props.variant === 'primary' ? colors.text.inverse : colors.text.primary
    };
  border: none;
  border-radius: 8px;
  padding: ${spacing.md} ${spacing.lg};
  font-weight: ${typography.weight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: ${spacing.md};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? colors.accent.dark : colors.border.light
    };
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SyncButton = styled.button`
  background: ${colors.accent.secondary};
  color: ${colors.text.inverse};
  border: none;
  border-radius: 8px;
  padding: ${spacing.md} ${spacing.lg};
  font-weight: ${typography.weight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: ${spacing.lg};
  
  &:hover {
    background: ${colors.accent.dark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl};
`;

const ErrorMessage = styled.div`
  background: ${colors.error.light};
  color: ${colors.error.primary};
  padding: ${spacing.md};
  border-radius: 8px;
  margin-bottom: ${spacing.lg};
`;

const NoQuestionsMessage = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  background: ${colors.background.secondary};
  border-radius: 12px;
  margin-bottom: ${spacing.lg};
`;

const NoQuestionsTitle = styled.h3`
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const NoQuestionsText = styled.p`
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.lg};
`;

interface QuizQuestion {
    id: string;
    studyItemId: string;
    question: string;
    correctAnswer: string;
    options?: string[];
    type: 'translation' | 'definition' | 'conjugation' | 'fill_blank' | 'multiple_choice';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    explanation?: string;
}

interface ProgressStats {
    totalItems: number;
    reviewedItems: number;
    correctRate: number;
    streak: number;
    dueForReview: number;
}

export function SpanishStudy() {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation?: string;
        message: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = 'default-user'; // In a real app, this would come from auth

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load progress stats
            const statsResponse = await fetch(`/api/spanish/progress?userId=${userId}`);
            const statsResult = await statsResponse.json();

            if (statsResponse.ok) {
                setStats(statsResult.data);
            }

            // Load next question
            const questionResponse = await fetch(`/api/spanish/next-question?userId=${userId}`);
            const questionResult = await questionResponse.json();

            if (questionResponse.ok) {
                setQuestion(questionResult.data.question);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Spanish study data');
        } finally {
            setLoading(false);
        }
    };

    const syncContent = async () => {
        try {
            setSyncing(true);
            setError(null);

            const response = await fetch('/api/spanish/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to sync Spanish content');
            }

            // Reload data after sync
            await loadData();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync Spanish content');
        } finally {
            setSyncing(false);
        }
    };

    const submitAnswer = async () => {
        if (!question || !answer.trim()) return;

        try {
            setLoading(true);

            const response = await fetch('/api/spanish/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    questionId: question.id,
                    answer: answer.trim(),
                    responseTime: 0 // Could track actual response time
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit answer');
            }

            setFeedback({
                isCorrect: result.data.isCorrect,
                correctAnswer: result.data.correctAnswer,
                explanation: result.data.explanation,
                message: result.data.feedback
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit answer');
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        setAnswer('');
        setFeedback(null);
        loadData();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !feedback) {
            submitAnswer();
        }
    };

    if (loading && !question) {
        return (
            <Container>
                <LoadingSpinner>
                    <div>Loading Spanish study...</div>
                </LoadingSpinner>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>🇪🇸 Spanish Study</Title>
                <Subtitle>Practice with spaced repetition</Subtitle>
            </Header>

            {error && (
                <ErrorMessage>{error}</ErrorMessage>
            )}

            {stats && (
                <StatsCard>
                    <StatsGrid>
                        <StatItem>
                            <StatValue>{stats.totalItems}</StatValue>
                            <StatLabel>Total Items</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.reviewedItems}</StatValue>
                            <StatLabel>Reviewed</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.correctRate}%</StatValue>
                            <StatLabel>Correct Rate</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.streak}</StatValue>
                            <StatLabel>Current Streak</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.dueForReview}</StatValue>
                            <StatLabel>Due for Review</StatLabel>
                        </StatItem>
                    </StatsGrid>
                </StatsCard>
            )}

            <SyncButton onClick={syncContent} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync from Notion'}
            </SyncButton>

            {!question ? (
                <NoQuestionsMessage>
                    <NoQuestionsTitle>No questions available</NoQuestionsTitle>
                    <NoQuestionsText>
                        {stats?.totalItems === 0
                            ? "No Spanish study content found in Notion. Make sure you have pages with Spanish vocabulary, grammar, or phrases."
                            : "All questions have been reviewed! Great job! New questions will appear as you add more content to Notion."
                        }
                    </NoQuestionsText>
                    <ActionButton variant="primary" onClick={syncContent} disabled={syncing}>
                        {syncing ? 'Syncing...' : 'Sync Content from Notion'}
                    </ActionButton>
                </NoQuestionsMessage>
            ) : (
                <QuizCard>
                    <QuestionText>{question.question}</QuestionText>

                    {!feedback ? (
                        <>
                            <AnswerInput
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your answer here..."
                                disabled={loading}
                            />
                            <ActionButton
                                variant="primary"
                                onClick={submitAnswer}
                                disabled={loading || !answer.trim()}
                            >
                                {loading ? 'Checking...' : 'Submit Answer'}
                            </ActionButton>
                        </>
                    ) : (
                        <>
                            <FeedbackCard isCorrect={feedback.isCorrect}>
                                <FeedbackTitle isCorrect={feedback.isCorrect}>
                                    {feedback.isCorrect ? '¡Correcto!' : 'Not quite'}
                                </FeedbackTitle>
                                <FeedbackText>{feedback.message}</FeedbackText>
                                {!feedback.isCorrect && (
                                    <CorrectAnswer>
                                        Correct answer: {feedback.correctAnswer}
                                    </CorrectAnswer>
                                )}
                                {feedback.explanation && (
                                    <FeedbackText>
                                        <strong>Explanation:</strong> {feedback.explanation}
                                    </FeedbackText>
                                )}
                            </FeedbackCard>

                            <ActionButton variant="primary" onClick={nextQuestion}>
                                Next Question
                            </ActionButton>
                        </>
                    )}
                </QuizCard>
            )}
        </Container>
    );
}
