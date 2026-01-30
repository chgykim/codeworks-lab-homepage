import React from 'react';

function Loading({ text = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>{text}</p>
            </div>
        </div>
    );
}

export default Loading;
