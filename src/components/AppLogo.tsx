import { brand } from '../config/brand'

type AppLogoProps = {
  className?: string
  imageClassName?: string
}

export function AppLogo({
  className = 'inline-flex min-w-0 items-center no-underline',
  imageClassName = 'h-auto w-[148px] max-w-[44vw] object-contain',
}: AppLogoProps) {
  return (
    <a className={className} href="/" aria-label={`${brand.appName} 홈`}>
      <img className={imageClassName} src={brand.logoSvg} alt={brand.appName} />
    </a>
  )
}
