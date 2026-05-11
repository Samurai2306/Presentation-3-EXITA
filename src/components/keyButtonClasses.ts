export type KeyButtonVariant = 'primary' | 'secondary' | 'ghost'
export type KeyButtonSize = 'sm' | 'md' | 'lg'

export function keyButtonClass(
  variant: KeyButtonVariant = 'primary',
  size: KeyButtonSize = 'md',
  options?: { fullWidth?: boolean },
): string {
  return ['well-key', `well-key--${variant}`, `well-key--${size}`, options?.fullWidth ? 'well-key--full' : ''].filter(Boolean).join(' ')
}
