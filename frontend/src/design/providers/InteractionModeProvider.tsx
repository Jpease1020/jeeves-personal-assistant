// Interaction Mode Provider
import React, { createContext, useContext, useState, ReactNode } from 'react';

type InteractionMode = 'mouse' | 'touch' | 'keyboard';

interface InteractionModeContextType {
    mode: InteractionMode;
    setMode: (mode: InteractionMode) => void;
}

const InteractionModeContext = createContext<InteractionModeContextType | undefined>(undefined);

export const InteractionModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<InteractionMode>('mouse');

    return (
        <InteractionModeContext.Provider value={{ mode, setMode }}>
            {children}
        </InteractionModeContext.Provider>
    );
};

export const useInteractionMode = () => {
    const context = useContext(InteractionModeContext);
    if (!context) {
        throw new Error('useInteractionMode must be used within an InteractionModeProvider');
    }
    return context;
};
