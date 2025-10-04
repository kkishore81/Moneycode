import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number;
  formatAsCurrency?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, formatAsCurrency, isPositive, isNegative }) => {
  const formattedValue = formatAsCurrency 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
    : value.toString();

  const valueColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white';

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-green-500/10 transition-shadow duration-300">
      <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${valueColor}`}>{formattedValue}</p>
    </div>
  );
};