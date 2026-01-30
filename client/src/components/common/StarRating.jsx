import React from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating, maxRating = 5, size = 16, interactive = false, onChange }) {
    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="stars" style={{ cursor: interactive ? 'pointer' : 'default' }}>
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;

                return (
                    <Star
                        key={index}
                        size={size}
                        className={isFilled ? 'star' : 'star-empty'}
                        fill={isFilled ? '#fbbf24' : 'none'}
                        onClick={() => handleClick(starValue)}
                        style={{ transition: 'transform 0.1s' }}
                        onMouseEnter={(e) => {
                            if (interactive) {
                                e.target.style.transform = 'scale(1.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    />
                );
            })}
        </div>
    );
}

export default StarRating;
