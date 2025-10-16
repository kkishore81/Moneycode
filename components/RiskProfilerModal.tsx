

import React, { useState } from 'react';
import { RiskProfile } from '../types.ts';

interface RiskProfilerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (profile: RiskProfile) => void;
}

interface Question {
    text: string;
    options: { text: string; points: number }[];
}

const questions: Question[] = [
    {
        text: "When will you most likely need to withdraw a significant portion of your investments?",
        options: [
            { text: "Within the next 2 years", points: 1 },
            { text: "In 2 to 5 years", points: 2 },
            { text: "In 5 to 10 years", points: 3 },
            { text: "Not for at least 10 years", points: 4 },
        ]
    },
    {
        text: "How would you rate your knowledge of investments?",
        options: [
            { text: "Beginner: I'm new to investing.", points: 1 },
            { text: "Intermediate: I know the basics.", points: 2 },
            { text: "Advanced: I'm very experienced.", points: 3 },
        ]
    },
    {
        text: "Your investment portfolio lost 20% of its value in a month. What would you do?",
        options: [
            { text: "Sell all of my investments.", points: 1 },
            { text: "Sell some of my investments.", points: 2 },
            { text: "Hold and do nothing.", points: 3 },
            { text: "Invest more (buy the dip).", points: 4 },
        ]
    },
    {
        text: "What is your primary goal for your investments?",
        options: [
            { text: "Capital Preservation: Protect my initial investment.", points: 1 },
            { text: "Balanced: A mix of safety and moderate growth.", points: 2 },
            { text: "Growth: Maximize my returns, despite the risk.", points: 3 },
        ]
    },
    {
        text: "How secure is your current and future income (from salary, business, etc.)?",
        options: [
            { text: "Not secure.", points: 1 },
            { text: "Somewhat secure.", points: 2 },
            { text: "Very secure.", points: 3 },
        ]
    }
];

const getProfileFromScore = (score: number): RiskProfile => {
    if (score <= 8) return 'Conservative';
    if (score <= 13) return 'Moderate';
    return 'Aggressive';
};

const getProfileInfo = (profile: RiskProfile) => {
    switch (profile) {
        case 'Conservative': return { color: 'text-blue-400', description: 'You prioritize protecting your capital over high returns. Your portfolio should primarily consist of low-risk assets like debt funds, fixed deposits, and government bonds.' };
        case 'Moderate': return { color: 'text-yellow-400', description: 'You seek a balance between growth and safety. Your portfolio should be a diversified mix of equities (like index funds) and debt instruments.' };
        case 'Aggressive': return { color: 'text-red-400', description: 'You are comfortable with high risk for the potential of high returns. Your portfolio can be heavily weighted towards equities and other high-growth assets.' };
    }
};


export const RiskProfilerModal: React.FC<RiskProfilerModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<RiskProfile | null>(null);

    const handleStartOver = () => {
        setCurrentStep(0);
        setAnswers([]);
        setResult(null);
    }

    const handleClose = () => {
        handleStartOver();
        onClose();
    }
    
    const handleAnswer = (points: number) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = points;
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const totalScore = newAnswers.reduce((sum, p) => sum + p, 0);
            const finalProfile = getProfileFromScore(totalScore);
            setResult(finalProfile);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl relative w-full max-w-2xl text-white">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
                
                {!result ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Risk Profile Questionnaire</h2>
                        <p className="text-gray-400 mb-6">Answer a few questions to understand your investment style.</p>
                        
                        <div className="mb-4">
                            <p className="font-semibold text-lg">{`Q${currentStep + 1}: ${questions[currentStep].text}`}</p>
                        </div>
                        
                        <div className="space-y-3">
                            {questions[currentStep].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option.points)}
                                    className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Question {currentStep + 1} of {questions.length}
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Your Risk Profile is:</h2>
                        <p className={`text-4xl font-extrabold my-4 ${getProfileInfo(result).color}`}>
                            {result}
                        </p>
                        <p className="text-gray-300 max-w-md mx-auto">
                            {getProfileInfo(result).description}
                        </p>
                        <div className="flex justify-center gap-4 mt-8">
                            <button onClick={handleStartOver} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">
                                Retake
                            </button>
                            <button onClick={() => onComplete(result)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};