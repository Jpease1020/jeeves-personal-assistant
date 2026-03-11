import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight } from '../design/tokens/tokens';

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
  font-size: ${fontSize.lg};
`;

const QuizCard = styled.div`
  background: ${colors.background.secondary};
  border-radius: 12px;
  padding: ${spacing.xl};
  margin-bottom: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const QuestionCard = styled.div`
  background: ${colors.background.primary};
  border-radius: 8px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  border: 2px solid ${colors.border.light};
`;

const QuestionText = styled.h2`
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md};
  font-size: ${fontSize.xl};
`;

const AnswerInput = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 2px solid ${colors.border.light};
  border-radius: 8px;
  font-size: ${fontSize.md};
  margin-bottom: ${spacing.md};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
  }
`;

const FeedbackCard = styled.div<{ isCorrect: boolean }>`
  padding: ${spacing.lg};
  border-radius: 8px;
  margin-bottom: ${spacing.lg};
  background: ${props => props.isCorrect ? colors.success[50] : colors.danger[50]};
  border: 2px solid ${props => props.isCorrect ? colors.success[500] : colors.danger[500]};
`;

const FeedbackText = styled.p<{ isCorrect: boolean }>`
  color: ${props => props.isCorrect ? colors.success[600] : colors.danger[600]};
  font-weight: ${fontWeight.semibold};
  margin: 0;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  background: ${props =>
    props.variant === 'primary' ? colors.primary[500] : colors.background.secondary
  };
  color: ${props =>
    props.variant === 'primary' ? colors.text.white : colors.text.primary
  };
  border: none;
  border-radius: 8px;
  padding: ${spacing.md} ${spacing.lg};
  font-weight: ${fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: ${spacing.md};
  
  &:hover {
    background: ${props =>
    props.variant === 'primary' ? colors.primary[600] : colors.border.light
  };
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsCard = styled.div`
  background: ${colors.background.secondary};
  border-radius: 12px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
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
  font-size: ${fontSize['2xl']};
  font-weight: ${fontWeight.bold};
  color: ${colors.primary[500]};
`;

const StatLabel = styled.div`
  font-size: ${fontSize.sm};
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

const ErrorMessage = styled.div`
  background: ${colors.danger[50]};
  color: ${colors.danger[600]};
  padding: ${spacing.md};
  border-radius: 8px;
  margin-bottom: ${spacing.lg};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl};
`;

const SyncButton = styled.button`
  background: ${colors.secondary[500]};
  color: ${colors.text.white};
  border: none;
  border-radius: 8px;
  padding: ${spacing.md} ${spacing.lg};
  font-weight: ${fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: ${spacing.lg};
  
  &:hover {
    background: ${colors.secondary[600]};
    transform: translateY(-1px);
  }
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

interface StudyStats {
  totalItems: number;
  reviewedItems: number;
  correctRate: number;
  streak: number;
  dueForReview: number;
}

export function SpanishStudy() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const userId = 'default-user'; // In a real app, this would come from auth

  useEffect(() => {
    loadNextQuestion();
    loadStats();
  }, []);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setFeedback(null);
      setAnswer('');

      const response = await fetch(`/api/spanish/next-question?userId=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load question');
      }

      // The API returns { success: true, data: { question } }
      setQuestion(result.data?.question || result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/spanish/progress?userId=${userId}`);
      const result = await response.json();

      if (response.ok) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/spanish/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          questionId: question.id,
          answer: answer.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit answer');
      }

      setFeedback({
        isCorrect: result.data.isCorrect,
        message: result.data.feedback
      });

      // Update stats
      if (stats) {
        setStats({
          ...stats,
          reviewedItems: stats.reviewedItems + 1,
          correctRate: result.data.isCorrect
            ? Math.round(((stats.correctRate * stats.reviewedItems) + 100) / (stats.reviewedItems + 1))
            : Math.round((stats.correctRate * stats.reviewedItems) / (stats.reviewedItems + 1))
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const syncNotionContent = async () => {
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
        throw new Error(result.error || 'Failed to sync Notion content');
      }

      // Reload stats after sync
      await loadStats();

      // Show success message
      setFeedback({
        isCorrect: true,
        message: `Successfully synced ${result.data.synced} items from Notion!`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync Notion content');
    } finally {
      setSyncing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting && !feedback) {
      submitAnswer();
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div>Loading your Spanish study...</div>
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

      <SyncButton onClick={syncNotionContent} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync from Notion'}
      </SyncButton>

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {stats && (
        <StatsCard>
          <h3>Study Statistics</h3>
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
              <StatLabel>Accuracy</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.streak}</StatValue>
              <StatLabel>Best Streak</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsCard>
      )}

      {question ? (
        <QuizCard>
          <QuestionCard>
            <QuestionText>{question.question}</QuestionText>
            {question.explanation && (
              <p style={{ color: colors.text.secondary, fontStyle: 'italic' }}>
                {question.explanation}
              </p>
            )}
          </QuestionCard>

          {!feedback ? (
            <>
              <AnswerInput
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                disabled={submitting}
              />
              <ActionButton
                variant="primary"
                onClick={submitAnswer}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? 'Checking...' : 'Check Answer'}
              </ActionButton>
            </>
          ) : (
            <>
              <FeedbackCard isCorrect={feedback.isCorrect}>
                <FeedbackText isCorrect={feedback.isCorrect}>
                  {feedback.message}
                </FeedbackText>
                {feedback.isCorrect && (
                  <p style={{ margin: `${spacing.sm} 0 0 0`, color: colors.text.primary }}>
                    <strong>Correct answer:</strong> {question.correctAnswer}
                  </p>
                )}
              </FeedbackCard>
              <ActionButton
                variant="primary"
                onClick={loadNextQuestion}
              >
                Next Question
              </ActionButton>
            </>
          )}
        </QuizCard>
      ) : (
        <QuizCard>
          <h3>No questions available</h3>
          <p>Either sync content from Notion or you've completed all available questions for today.</p>
          <ActionButton variant="primary" onClick={loadNextQuestion}>
            Try Again
          </ActionButton>
        </QuizCard>
      )}
    </Container>
  );
}