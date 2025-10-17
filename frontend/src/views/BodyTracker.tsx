import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../design/tokens/tokens';

const Container = styled.div`
  max-width: 800px;
`;

export function BodyTracker() {
    return (
        <Container>
            <h1 style={{ marginBottom: spacing.xl }}>Body Transformation Tracker</h1>
            <p style={{ color: colors.text.secondary }}>
                Body tracker coming soon! This will help you track weight, measurements, food logs, and workout progress.
            </p>
        </Container>
    );
}

