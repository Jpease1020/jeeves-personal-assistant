import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../design/tokens/tokens';

interface Task {
    title: string;
    dueDate?: string;
    list: string;
}

interface TasksCardProps {
    priorities: Task[];
    overdue: Task[];
}

const Card = styled.div`
  background: ${colors.background.primary};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.md};
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm};
  border-radius: ${borderRadius.default};
  background: ${colors.background.secondary};
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const TaskTitle = styled.span`
  font-weight: 500;
  color: ${colors.text.primary};
`;

const TaskMeta = styled.div`
  display: flex;
  gap: ${spacing.sm};
  align-items: center;
`;

const DueDate = styled.span<{ overdue?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.overdue ? '#ef4444' : colors.text.secondary};
`;

const ListBadge = styled.span`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.pill};
  font-size: 0.75rem;
  font-weight: 500;
  background: ${colors.secondary[100]};
  color: ${colors.secondary[700]};
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: ${spacing.lg} 0 ${spacing.md} 0;
`;

const EmptyState = styled.p`
  color: ${colors.text.secondary};
  text-align: center;
  font-style: italic;
`;

export const TasksCard: React.FC<TasksCardProps> = ({ priorities, overdue }) => {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <Card>
            <CardTitle>Tasks</CardTitle>

            {overdue.length > 0 && (
                <>
                    <SectionTitle>⚠️ Overdue</SectionTitle>
                    <TaskList>
                        {overdue.map((task, index) => (
                            <TaskItem key={index}>
                                <TaskInfo>
                                    <TaskTitle>{task.title}</TaskTitle>
                                    <TaskMeta>
                                        <DueDate overdue>
                                            Due: {formatDate(task.dueDate!)}
                                        </DueDate>
                                        <ListBadge>{task.list}</ListBadge>
                                    </TaskMeta>
                                </TaskInfo>
                            </TaskItem>
                        ))}
                    </TaskList>
                </>
            )}

            <SectionTitle>🎯 Priorities</SectionTitle>
            <TaskList>
                {priorities.map((task, index) => (
                    <TaskItem key={index}>
                        <TaskInfo>
                            <TaskTitle>{task.title}</TaskTitle>
                            <TaskMeta>
                                {task.dueDate && (
                                    <DueDate>
                                        Due: {formatDate(task.dueDate)}
                                    </DueDate>
                                )}
                                <ListBadge>{task.list}</ListBadge>
                            </TaskMeta>
                        </TaskInfo>
                    </TaskItem>
                ))}
                {priorities.length === 0 && (
                    <EmptyState>No priority tasks</EmptyState>
                )}
            </TaskList>
        </Card>
    );
};
