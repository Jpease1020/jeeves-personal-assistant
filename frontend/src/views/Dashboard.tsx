import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAPI } from '../providers/APIProvider';
import { colors, spacing, borderRadius, shadows } from '../design/tokens/tokens';
import { HabitsCard } from '../components/HabitsCard';
import { TasksCard } from '../components/TasksCard';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.xl};
`;

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

const Badge = styled.span<{ variant: 'success' | 'warning' | 'default' }>`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.pill};
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) =>
        props.variant === 'success'
            ? colors.success[100]
            : props.variant === 'warning'
                ? colors.warning[100]
                : colors.gray[200]};
  color: ${(props) =>
        props.variant === 'success'
            ? colors.success[700]
            : props.variant === 'warning'
                ? colors.warning[700]
                : colors.gray[700]};
`;


const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.lg};
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${colors.primary[600]};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

export function Dashboard() {
    const { getDashboard } = useAPI();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const dashboardData = await getDashboard();
            setData(dashboardData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleHabit = async (habitName: string) => {
        try {
            // TODO: Call habit tracker MCP to toggle habit completion
            console.log('Toggling habit:', habitName);

            // Refresh dashboard data
            await loadDashboard();
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const handleAddHabit = async (habitName: string) => {
        try {
            // TODO: Call habit tracker MCP to add new habit
            console.log('Adding habit:', habitName);

            // Refresh dashboard data
            await loadDashboard();
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <h1 style={{ marginBottom: spacing['2xl'] }}>Dashboard</h1>
            <DashboardContainer>
                {/* Today's Habits */}
                <HabitsCard
                    habits={data?.habits?.today || []}
                    onToggleHabit={handleToggleHabit}
                    onAddHabit={handleAddHabit}
                />

                {/* Tasks */}
                <TasksCard
                    priorities={data?.tasks?.priorities || []}
                    overdue={data?.tasks?.overdue || []}
                />

                {/* Goals Progress */}
                <Card>
                    <CardTitle>Goals</CardTitle>
                    <StatGrid>
                        <StatCard>
                            <StatValue>{data?.goals?.greenCardDaysLeft || 0}</StatValue>
                            <StatLabel>Days until Green Card</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue>{data?.goals?.bodyTransformation?.daysIntoChallenge || 0}</StatValue>
                            <StatLabel>Days into Body Transformation</StatLabel>
                        </StatCard>
                    </StatGrid>
                </Card>

                {/* Learning Progress */}
                <Card>
                    <CardTitle>Learning Progress</CardTitle>
                    <HabitGrid>
                        {data?.goals?.learningProgress?.map((subject: any) => (
                            <HabitRow key={subject.subject}>
                                <span>{subject.subject}</span>
                                <Badge variant={subject.masteryLevel > 0.5 ? 'success' : 'warning'}>
                                    {Math.round(subject.masteryLevel * 100)}%
                                </Badge>
                            </HabitRow>
                        ))}
                    </HabitGrid>
                </Card>

                {/* Oura Ring Data */}
                <Card>
                    <CardTitle>💍 Oura Ring Data</CardTitle>
                    <StatGrid>
                        <StatCard>
                            <StatValue>{data?.oura?.sleep?.score || 0}</StatValue>
                            <StatLabel>Sleep Score</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue>{data?.oura?.readiness?.score || 0}</StatValue>
                            <StatLabel>Readiness Score</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue>{data?.oura?.activity?.steps || 0}</StatValue>
                            <StatLabel>Steps Today</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue>{data?.oura?.sleep?.hours || 0}h</StatValue>
                            <StatLabel>Sleep Hours</StatLabel>
                        </StatCard>
                    </StatGrid>
                    {data?.oura?.recovery?.recommendation && (
                        <div style={{ marginTop: spacing.md, padding: spacing.sm, background: colors.background.secondary, borderRadius: borderRadius.default }}>
                            <strong>Recovery Status:</strong> {data.oura.recovery.status}
                            <br />
                            <strong>Recommendation:</strong> {data.oura.recovery.recommendation}
                        </div>
                    )}
                </Card>

                {/* Screen Time */}
                <Card>
                    <CardTitle>📱 Screen Time</CardTitle>
                    <StatGrid>
                        <StatCard>
                            <StatValue>{Math.floor((data?.screenTime?.totalMinutes || 0) / 60)}h {((data?.screenTime?.totalMinutes || 0) % 60)}m</StatValue>
                            <StatLabel>Total Screen Time</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue>{data?.screenTime?.focusScore || 0}%</StatValue>
                            <StatLabel>Focus Score</StatLabel>
                        </StatCard>
                    </StatGrid>
                    {data?.screenTime?.topApps?.length > 0 && (
                        <div style={{ marginTop: spacing.md }}>
                            <strong>Top Apps:</strong>
                            <HabitGrid>
                                {data.screenTime.topApps.map((app: any, idx: number) => (
                                    <HabitRow key={idx}>
                                        <span>{app.name}</span>
                                        <Badge variant="default">
                                            {Math.floor(app.timeSpent / 60)}m ({app.pickups} pickups)
                                        </Badge>
                                    </HabitRow>
                                ))}
                            </HabitGrid>
                        </div>
                    )}
                </Card>
            </DashboardContainer>
        </>
    );
}

