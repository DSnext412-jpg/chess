import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  fullWidth,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {icon}
      {children}
      {trailingIcon}
    </button>
  );
}
