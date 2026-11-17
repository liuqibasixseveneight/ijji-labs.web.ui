export interface FormSuccessProps {
    title: string;
    message: string;
    /** A button to start again, e.g. Send another message. */
    actionLabel?: string;
    onAction?: () => void;
}

export interface FormErrorProps {
    title: string;
    message: string;
}
