import React from 'react';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', className = '' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600 ${sizeClasses[size]}`}
                role="status"
                aria-label="loading"
            />
        </div>
    );
};

export default Loader;