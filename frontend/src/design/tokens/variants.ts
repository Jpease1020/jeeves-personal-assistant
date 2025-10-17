// Component variants for consistent styling
export const variants = {
    button: {
        primary: {},
        secondary: {},
        outline: {},
        ghost: {},
    },
    card: {
        default: {},
        elevated: {},
    },
    text: {
        heading: {},
        body: {},
        caption: {},
    },
} as const;

export type ButtonVariant = keyof typeof variants.button;
export type CardVariant = keyof typeof variants.card;
export type TextVariant = keyof typeof variants.text;

