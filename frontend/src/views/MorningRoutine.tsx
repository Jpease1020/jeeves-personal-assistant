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

const ProgressCard = styled.div`
  background: ${colors.background.card};
  border-radius: 12px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.border.light};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: ${spacing.md};
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, ${colors.accent.primary}, ${colors.accent.secondary});
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm};
`;

const ProgressLabel = styled.span`
  font-weight: ${typography.weight.semibold};
  color: ${colors.text.primary};
`;

const ProgressValue = styled.span`
  font-weight: ${typography.weight.bold};
  color: ${colors.accent.primary};
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const StepCard = styled.div<{ completed: boolean; current: boolean }>`
  background: ${props => props.current ? colors.accent.light : colors.background.card};
  border: 2px solid ${props =>
        props.completed ? colors.success.primary :
            props.current ? colors.accent.primary :
                colors.border.light
    };
  border-radius: 12px;
  padding: ${spacing.lg};
  transition: all 0.3s ease;
  cursor: ${props => props.current ? 'pointer' : 'default'};
  
  &:hover {
    transform: ${props => props.current ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.current ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.sm};
`;

const StepNumber = styled.div<{ completed: boolean; current: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.weight.bold};
  background: ${props =>
        props.completed ? colors.success.primary :
            props.current ? colors.accent.primary :
                colors.background.secondary
    };
  color: ${props =>
        props.completed || props.current ? colors.text.inverse : colors.text.secondary
    };
`;

const StepTitle = styled.h3<{ completed: boolean }>`
  color: ${props => props.completed ? colors.text.secondary : colors.text.primary};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  margin: 0;
`;

const StepDescription = styled.p<{ completed: boolean }>`
  color: ${props => props.completed ? colors.text.secondary : colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const StepDuration = styled.div`
  margin-top: ${spacing.sm};
  font-size: ${typography.size.sm};
  color: ${colors.text.secondary};
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
  margin-top: ${spacing.lg};
  
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

const CompletionMessage = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  background: ${colors.success.light};
  border-radius: 12px;
  margin-top: ${spacing.lg};
`;

const CompletionTitle = styled.h2`
  color: ${colors.success.primary};
  margin-bottom: ${spacing.sm};
`;

const CompletionText = styled.p`
  color: ${colors.text.primary};
  font-size: ${typography.size.lg};
`;

const ErrorMessage = styled.div`
  background: ${colors.error.light};
  color: ${colors.error.primary};
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

interface MorningRoutineStep {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedAt?: string;
    estimatedDuration: number;
}

interface MorningRoutineData {
    started: boolean;
    startedAt?: string;
    completedAt?: string;
    steps: MorningRoutineStep[];
    progress: {
        completedSteps: number;
        totalSteps: number;
        percentage: number;
        allCompleted: boolean;
    };
}

export function MorningRoutine() {
    const [data, setData] = useState<MorningRoutineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingStep, setCompletingStep] = useState<string | null>(null);

    const userId = 'default-user'; // In a real app, this would come from auth

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/morning-routine/progress?userId=${userId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load progress');
            }

            setData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load morning routine');
        } finally {
            setLoading(false);
        }
    };

    const startRoutine = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/morning-routine/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to start morning routine');
            }

            setData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start morning routine');
        } finally {
            setLoading(false);
        }
    };

    const completeStep = async (stepId: string) => {
        try {
            setCompletingStep(stepId);

            const response = await fetch('/api/morning-routine/complete-step', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, stepId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to complete step');
            }

            // Update local state
            setData(prevData => {
                if (!prevData) return prevData;

                const updatedSteps = prevData.steps.map(step =>
                    step.id === stepId
                        ? { ...step, completed: true, completedAt: result.data.step.completedAt }
                        : step
                );

                return {
                    ...prevData,
                    steps: updatedSteps,
                    progress: result.data.progress
                };
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete step');
        } finally {
            setCompletingStep(null);
        }
    };

    const getCurrentStep = () => {
        if (!data?.steps) return null;
        return data.steps.find(step => !step.completed);
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    if (loading) {
        return (
            <Container>
                <LoadingSpinner>
                    <div>Loading your morning routine...</div>
                </LoadingSpinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <ErrorMessage>{error}</ErrorMessage>
                <ActionButton variant="primary" onClick={loadProgress}>
                    Try Again
                </ActionButton>
            </Container>
        );
    }

    if (!data?.started) {
        return (
            <Container>
                <Header>
                    <Title>🌅 Morning Routine</Title>
                    <Subtitle>Start your day with intention and purpose</Subtitle>
                </Header>

                <ProgressCard>
                    <h3>Ready to begin?</h3>
                    <p>Your morning routine will be loaded from your Notion page. Make sure you have a page with keywords like "morning", "routine", or "daily routine".</p>
                </ProgressCard>

                <ActionButton variant="primary" onClick={startRoutine}>
                    Start Morning Routine
                </ActionButton>
            </Container>
        );
    }

    const currentStep = getCurrentStep();
    const progress = data.progress;

    return (
        <Container>
            <Header>
                <Title>🌅 Morning Routine</Title>
                <Subtitle>Progress: {progress.completedSteps} of {progress.totalSteps} steps</Subtitle>
            </Header>

            <ProgressCard>
                <ProgressText>
                    <ProgressLabel>Progress</ProgressLabel>
                    <ProgressValue>{progress.percentage}%</ProgressValue>
                </ProgressText>
                <ProgressBar>
                    <ProgressFill percentage={progress.percentage} />
                </ProgressBar>
            </ProgressCard>

            {data.progress.allCompleted ? (
                <CompletionMessage>
                    <CompletionTitle>🎉 Morning Routine Complete!</CompletionTitle>
                    <CompletionText>
                        Excellent work! You've set yourself up for a productive day.
                        Your routine was completed at {new Date(data.completedAt!).toLocaleTimeString()}.
                    </CompletionText>
                </CompletionMessage>
            ) : (
                <StepsContainer>
                    {data.steps.map((step, index) => {
                        const isCurrent = step.id === currentStep?.id;
                        const isCompleted = step.completed;

                        return (
                            <StepCard
                                key={step.id}
                                completed={isCompleted}
                                current={isCurrent}
                                onClick={() => isCurrent && !completingStep && completeStep(step.id)}
                            >
                                <StepHeader>
                                    <StepNumber completed={isCompleted} current={isCurrent}>
                                        {isCompleted ? '✓' : index + 1}
                                    </StepNumber>
                                    <StepTitle completed={isCompleted}>{step.name}</StepTitle>
                                </StepHeader>

                                <StepDescription completed={isCompleted}>
                                    {step.description}
                                </StepDescription>

                                <StepDuration>
                                    Estimated time: {formatDuration(step.estimatedDuration)}
                                    {step.completedAt && (
                                        <span> • Completed at {new Date(step.completedAt).toLocaleTimeString()}</span>
                                    )}
                                </StepDuration>

                                {isCurrent && (
                                    <ActionButton
                                        variant="primary"
                                        onClick={() => completeStep(step.id)}
                                        disabled={completingStep === step.id}
                                    >
                                        {completingStep === step.id ? 'Completing...' : 'Mark Complete'}
                                    </ActionButton>
                                )}
                            </StepCard>
                        );
                    })}
                </StepsContainer>
            )}
        </Container>
    );
}