import React from 'react'
import { CommandCategory } from '@/components/layout/command-menu'

interface SearchContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const initialContextValue: SearchContextType = {
  open: false,
  setOpen: () => false,
}

const SearchContext =
  React.createContext<SearchContextType>(initialContextValue)

interface SearchProviderProps {
  children: React.ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [open, setOpen] = React.useState(false)

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open])

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen((prevOpen) => !prevOpen)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
      <CommandCategory />
    </SearchContext.Provider>
  )
}

export const useSearch = (): SearchContextType => {
  const context = React.useContext(SearchContext)

  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }

  return context
}
