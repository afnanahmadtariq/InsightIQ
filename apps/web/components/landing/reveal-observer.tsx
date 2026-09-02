'use client'

import { useEffect } from 'react'

export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    elements.forEach((element) => element.classList.add('reveal-pending'))
    const cleanupTimers: number[] = []

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const element = entry.target as HTMLElement
        function releaseInteractionStyles() {
          element.classList.remove('reveal-pending', 'revealed')
          element.removeEventListener('transitionend', handleTransitionEnd)
        }
        function handleTransitionEnd(event: TransitionEvent) {
          if (event.target === element) releaseInteractionStyles()
        }
        element.addEventListener('transitionend', handleTransitionEnd)
        element.classList.add('revealed')
        cleanupTimers.push(window.setTimeout(releaseInteractionStyles, 1100))
        observer.unobserve(element)
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -40px' })

    elements.forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      cleanupTimers.forEach(window.clearTimeout)
    }
  }, [])

  return null
}
