import React from 'react';
import './LoadMoreButton.scss';

const LoadMoreButton = ({
    onClick
}: {
    onClick: () => void
}) => {
    return (
        <button
            className="load-more-button"
            onClick={onClick}
        >
            Weitere Transaktionen laden
        </button>
    );
};

export default LoadMoreButton;