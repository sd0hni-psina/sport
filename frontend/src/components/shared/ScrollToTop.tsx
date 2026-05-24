import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

export function ScrollToTop() {
  const routerState = useRouterState()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [routerState.location.pathname])

  return null
}