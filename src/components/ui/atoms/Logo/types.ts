export interface LogoProps {
    isMenuOpen?: boolean;
    isWhite?: boolean;
    /** Called when the logo is pressed, e.g. to close the menu. */
    onNavigate?: () => void;
}
