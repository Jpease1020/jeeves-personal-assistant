import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  margin: 20px 0;
`;

const Button = styled.button`
  background: #000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  
  &:hover {
    background: #333;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Status = styled.div<{ connected: boolean }>`
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  background: ${props => props.connected ? '#d4edda' : '#f8d7da'};
  color: ${props => props.connected ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.connected ? '#c3e6cb' : '#f5c6cb'};
`;

interface NotionAuthProps {
    userId: string;
}

export const NotionAuth: React.FC<NotionAuthProps> = ({ userId }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check authentication status
    useEffect(() => {
        checkAuthStatus();
    }, [userId]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`http://localhost:4001/auth/notion/status/${userId}`);
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    };

    const handleAuthorize = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4001/auth/notion/authorize?userId=${userId}`);
            const data = await response.json();

            if (data.authUrl) {
                // Open the authorization URL in a new window
                const authWindow = window.open(data.authUrl, 'notion-auth', 'width=600,height=700');

                // Listen for the window to close (user completed auth)
                const checkClosed = setInterval(() => {
                    if (authWindow?.closed) {
                        clearInterval(checkClosed);
                        setIsLoading(false);
                        // Check auth status again
                        setTimeout(checkAuthStatus, 1000);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error initiating authorization:', error);
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <h3>Notion Integration</h3>

            <Status connected={isAuthenticated}>
                {isAuthenticated
                    ? '✅ Connected to Notion - Your TO-DO lists will sync automatically'
                    : '❌ Not connected to Notion - Click below to authorize access'
                }
            </Status>

            {!isAuthenticated && (
                <Button onClick={handleAuthorize} disabled={isLoading}>
                    {isLoading ? 'Opening Notion...' : 'Connect to Notion'}
                </Button>
            )}

            {isAuthenticated && (
                <Button onClick={checkAuthStatus}>
                    Refresh Status
                </Button>
            )}
        </Container>
    );
};
