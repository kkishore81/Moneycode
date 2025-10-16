import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from './CalculatorWrapper.tsx';
import { CalculatorResultDisplay } from './CalculatorResultDisplay.tsx';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const InflationCalculator: React.FC = () => {
    const [todayCost, setTodayCost] = useState(100000);
    const [inflationRate, setInflationRate] = useState(6);
    const [timePeriod, setTimePeriod] = useState(10);

    const futureCost = useMemo(() => {
        return todayCost * Math.pow(1 + inflationRate / 100, timePeriod);
    }, [todayCost, inflationRate, timePeriod]);

    return (
        <CalculatorWrapper title="Inflation Calculator" description="Calculate the future value of money and the impact of inflation over time.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Today's Cost</span>
                            <span className="font-bold text-white">{formatCurrency(todayCost)}</span>
                        </label>
                        <input type="range" min="1000" max="10000000" step="1000" value={todayCost} onChange={(e) => setTodayCost(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Expected Inflation Rate (p.a.)</span>
                            <span className="font-bold text-white">{inflationRate}%</span>
                        </label>
                        <input type="range" min="1" max="20" step="0.5" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                     <div>
                        <label className="flex justify-between text-gray-300">
                            <span>Time Period (Years)</span>
                            <span className="font-bold text-white">{timePeriod}</span>
                        </label>
                        <input type="range" min="1" max="50" step="1" value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
                    </div>
                </div>
                <CalculatorResultDisplay
                    mainLabel={`Cost after ${timePeriod} years`}
                    mainResult={formatCurrency(futureCost)}
                    breakdown={[
                        { label: "Today's Cost", value: formatCurrency(todayCost), colorClass: 'text-yellow-400' },
                        { label: 'Value Eroded', value: formatCurrency(futureCost - todayCost), colorClass: 'text-red-400' },
                    ]}
                />
            </div>
        </CalculatorWrapper>
    );
};