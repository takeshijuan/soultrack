import type { SVGProps } from 'react'

interface SoultrackLogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
}

// SVGProps<SVGSVGElement> と size prop の衝突を width/height で明示的に解決
export function SoultrackIcon({
  size = 24,
  width,
  height,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* S-wave: Sの文字がサイン波として流れる
          流れ: 右上(17,6)→左上(7,7)→中央inflection→右中(16,17)→左下(7,18) */}
      <path
        d="M 17 6 C 17 3, 8 3, 7 7 C 6 11, 16 13, 16 17 C 16 21, 7 21, 7 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function SoultrackLogo({
  size = 24,
  showWordmark = false,
  className,
}: SoultrackLogoProps) {
  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <SoultrackIcon size={size} />
      {showWordmark && (
        <span
          className="font-display font-bold tracking-tight"
          style={{ fontSize: size * 0.75, lineHeight: 1 }}
        >
          SOULTRACK
        </span>
      )}
    </div>
  )
}
