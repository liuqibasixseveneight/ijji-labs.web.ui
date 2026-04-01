export const enableScrollLock = () => {
    document.documentElement.classList.add('overflow-hidden');
};

export const disableScrollLock = () => {
    document.documentElement.classList.remove('overflow-hidden');
};
