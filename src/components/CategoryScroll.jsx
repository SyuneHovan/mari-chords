import React, { useState } from 'react';

const CategoryScroll = ({ options, onChange }) => {
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategoryClick = (value) => {
        setSelectedCategory(value);
        onChange({ target: { value } });
    };

    return (
        <div className="w-full">
            <div className="catScrollButtonBox flex overflow-x-auto space-x-4 p-2 bg-gray-100 rounded-lg">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleCategoryClick(option.value)}
                        className={`catScrollButton flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            selectedCategory === option.value && 'active'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryScroll;