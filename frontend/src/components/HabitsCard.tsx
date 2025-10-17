import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../design/tokens/tokens';

interface Habit {
    name: string;
    completed: boolean;
    streak: number;
}

interface HabitsCardProps {
    habits: Habit[];
    onToggleHabit: (habitName: string) => void;
    onAddHabit: (habitName: string) => void;
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

const HabitGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const HabitRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm};
  border-radius: ${borderRadius.default};
  background: ${colors.background.secondary};
`;

const HabitInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const HabitName = styled.span`
  font-weight: 500;
  color: ${colors.text.primary};
`;

const StreakBadge = styled.span`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.pill};
  font-size: 0.75rem;
  font-weight: 500;
  background: ${colors.primary[100]};
  color: ${colors.primary[700]};
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const AddHabitForm = styled.form`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const Input = styled.input`
  flex: 1;
  padding: ${spacing.sm};
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.default};
  font-size: 0.875rem;
`;

const Button = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${borderRadius.default};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${colors.primary[600]};
  }
`;

export const HabitsCard: React.FC<HabitsCardProps> = ({ 
    habits, 
    onToggleHabit, 
    onAddHabit 
}) => {
    const [newHabitName, setNewHabitName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            onAddHabit(newHabitName.trim());
            setNewHabitName('');
        }
    };

    return (
        <Card>
            <CardTitle>Today's Habits</CardTitle>
            <HabitGrid>
                {habits.map((habit, index) => (
                    <HabitRow key={index}>
                        <HabitInfo>
                            <HabitName>{habit.name}</HabitName>
                            <StreakBadge>{habit.streak} day streak</StreakBadge>
                        </HabitInfo>
                        <Checkbox
                            type="checkbox"
                            checked={habit.completed}
                            onChange={() => onToggleHabit(habit.name)}
                        />
                    </HabitRow>
                ))}
                {habits.length === 0 && (
                    <p style={{ color: colors.text.secondary, textAlign: 'center' }}>
                        No habits set for today
                    </p>
                )}
            </HabitGrid>
            
            <AddHabitForm onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Add a new habit..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                />
                <Button type="submit">Add</Button>
            </AddHabitForm>
        </Card>
    );
};
