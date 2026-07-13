'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

interface NavLinkProps extends LinkProps, AnchorProps {
  className?: string
  activeClassName?: string
  pendingClassName?: string
}

const getHrefAsString = (href: NavLinkProps['href']) => {
  if (typeof href === 'string') return href
  if (typeof href === 'object') {
    return href.pathname ?? ''
  }
  return ''
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName: _ignored, href, ...props }, ref) => {
    const pathname = usePathname()
    const hrefAsString = getHrefAsString(href)

    const isActive = (() => {
      if (!hrefAsString) return false
      if (hrefAsString === '/') return pathname === hrefAsString
      return pathname.startsWith(hrefAsString)
    })()

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    )
  }
)

NavLink.displayName = 'NavLink'

export { NavLink }
