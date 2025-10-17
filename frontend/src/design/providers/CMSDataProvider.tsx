import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface CMSDataContextType {
    getContent: (key: string) => string;
    updateContent: (key: string, content: string) => void;
    cmsData: Record<string, string>;
}

const CMSDataContext = createContext<CMSDataContextType | undefined>(undefined);

interface CMSDataProviderProps {
    children: ReactNode;
}

export const CMSDataProvider: React.FC<CMSDataProviderProps> = ({ children }) => {
    const [cmsData, setCmsData] = React.useState<Record<string, string>>({});

    const getContent = (key: string): string => {
        return cmsData[key] || `Content for ${key}`;
    };

    const updateContent = (key: string, content: string): void => {
        setCmsData(prev => ({ ...prev, [key]: content }));
        console.log(`Updating content for ${key}:`, content);
    };

    return (
        <CMSDataContext.Provider value={{ getContent, updateContent, cmsData }}>
            {children}
        </CMSDataContext.Provider>
    );
};

export const useCMSData = (): CMSDataContextType => {
    const context = useContext(CMSDataContext);
    if (!context) {
        throw new Error('useCMSData must be used within a CMSDataProvider');
    }
    return context;
};
