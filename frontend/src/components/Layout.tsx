import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { colors, spacing } from '../design/tokens/tokens';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Nav = styled.nav`
  background: ${colors.background.primary};
  border-bottom: 1px solid ${colors.border.light};
  padding: ${spacing.lg};
  display: flex;
  gap: ${spacing.xl};
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const NavLink = styled(Link) <{ $isActive: boolean }>`
  color: ${(props) => (props.$isActive ? colors.primary[600] : colors.text.secondary)};
  text-decoration: none;
  font-weight: ${(props) => (props.$isActive ? 600 : 400)};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${colors.background.secondary};
    color: ${colors.primary[600]};
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${spacing['2xl']};
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <LayoutContainer>
      <Nav>
        <Title>Personal Assistant</Title>
        <NavLink to="/" $isActive={isActive('/')}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" $isActive={isActive('/chat')}>
          Chat
        </NavLink>
        <NavLink to="/routine" $isActive={isActive('/routine')}>
          Routine
        </NavLink>
        <NavLink to="/quiz" $isActive={isActive('/quiz')}>
          Quiz
        </NavLink>
        <NavLink to="/spanish" $isActive={isActive('/spanish')}>
          Spanish
        </NavLink>
        <NavLink to="/tracker" $isActive={isActive('/tracker')}>
          Body Tracker
        </NavLink>
        <NavLink to="/settings" $isActive={isActive('/settings')}>
          Settings
        </NavLink>
      </Nav>
      <Main>{children}</Main>
    </LayoutContainer>
  );
}

