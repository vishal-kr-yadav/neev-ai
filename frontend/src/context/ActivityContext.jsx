import { createContext, useContext } from 'react'
import { useActivityTracker } from '../hooks/useActivityTracker'

const ActivityContext = createContext(null)

export function ActivityProvider({ children }) {
  const tracker = useActivityTracker()
  return (
    <ActivityContext.Provider value={tracker}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  return useContext(ActivityContext)
}
