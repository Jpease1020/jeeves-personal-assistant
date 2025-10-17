import styled from 'styled-components';
import { colors, spacing } from '../design/tokens/tokens';

const Container = styled.div`
  max-width: 800px;
`;

export function MorningRoutine() {
    return (
        <Container>
            <h1 style={{ marginBottom: spacing.xl }}>Morning Routine</h1>
            <p style={{ color: colors.text.secondary }}>
                Morning routine guide coming soon! This will provide step-by-step guidance through your morning routine with timers and progress tracking.
            </p>
        </Container>
    );
}

