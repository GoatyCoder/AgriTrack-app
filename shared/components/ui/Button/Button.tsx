import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-agri-600 hover:bg-agri-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => (
  <button className={`px-4 py-2 rounded-lg font-bold transition-colors ${variantClass[variant]} ${className}`} {...props} />
);
