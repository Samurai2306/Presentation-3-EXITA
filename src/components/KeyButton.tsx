import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { keyButtonClass, type KeyButtonSize, type KeyButtonVariant } from './keyButtonClasses'

export type { KeyButtonSize, KeyButtonVariant }

type KeyButtonProps = {
  variant?: KeyButtonVariant
  size?: KeyButtonSize
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function KeyButton({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconLeft,
  iconRight,
  children,
  className = '',
  type = 'button',
  ...rest
}: KeyButtonProps) {
  return (
    <button type={type} className={`${keyButtonClass(variant, size, { fullWidth })} ${className}`.trim()} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}

type KeyLinkProps = {
  variant?: KeyButtonVariant
  size?: KeyButtonSize
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function KeyLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconLeft,
  iconRight,
  children,
  className = '',
  ...rest
}: KeyLinkProps) {
  return (
    <a className={`${keyButtonClass(variant, size, { fullWidth })} ${className}`.trim()} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </a>
  )
}
