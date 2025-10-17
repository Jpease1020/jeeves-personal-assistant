import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../design/tokens/tokens';

const Container = styled.div`
  max-width: 800px;
`;

export function Settings() {
    return (
        <Container>
            <h1 style={{ marginBottom: spacing.xl }}>Settings</h1>
            <p style={{ color: colors.text.secondary }}>
                Settings panel coming soon! This will allow you to configure integrations (Google Calendar, Notion), notification preferences, and more.
            </p>
        </Container>
    );
}

