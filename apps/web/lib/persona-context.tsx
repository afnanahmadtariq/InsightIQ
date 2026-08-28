'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PERSONAS, type Persona, type PersonaId } from '@/data/personas'

const STORAGE_KEY = 'insightiq.demo.personaId'
const DEFAULT_PERSONA_ID: PersonaId = 'b2b-saas'

interface PersonaContextValue {
  persona: Persona
  personaId: PersonaId
  setPersonaId: (id: PersonaId) => void
}

const PersonaContext = createContext<PersonaContextValue | null>(null)

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId>(DEFAULT_PERSONA_ID)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && stored in PERSONAS) {
        setPersonaIdState(stored as PersonaId)
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — keep the default persona.
    }
  }, [])

  const setPersonaId = (id: PersonaId) => {
    setPersonaIdState(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Ignore write failures; the in-memory selection still works for this session.
    }
  }

  const value = useMemo<PersonaContextValue>(
    () => ({ persona: PERSONAS[personaId], personaId, setPersonaId }),
    [personaId],
  )

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider')
  }
  return context
}
