import type { FooterProps } from './types.ts';

export const Footer = ({}: FooterProps) => {
    return (
        <footer className={'h-20 bg-red-500 flex items-center justify-between px-30'}>
            <h1>Footer</h1>
        </footer>
    );
};
