import styled from 'styled-components';
import { colors, spacing } from '../design/tokens/tokens';

const Container = styled.div`
  max-width: 800px;
`;

export function Quiz() {
    return (
        <Container>
            <h1 style={{ marginBottom: spacing.xl }}>Quiz & Learning</h1>
            <p style={{ color: colors.text.secondary }}>
                Quiz system coming soon! This will help you study Spanish, Swift, AI concepts, and green card interview prep.
            </p>
        </Container>
    );
}

