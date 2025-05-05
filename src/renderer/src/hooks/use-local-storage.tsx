import * as React from 'react'

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>

/**
 * A hook for storing and retrieving values from localStorage with automatic JSON serialization.
 *
 * @param key The key to use for storing in localStorage
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns A tuple containing the current value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = React.useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      return initialValue
    }
  }, [initialValue, key])

  // State to store our value
  const [storedValue, setStoredValue] = React.useState<T>(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = React.useCallback(
    (value) => {
      // Prevent build error "window is undefined" but keep working
      if (typeof window === 'undefined') {
        console.warn(
          `Attempted to set localStorage key "${key}" even though environment is not a browser`
        )
        return
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save to state
        setStoredValue(valueToStore)

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Listen for changes to this localStorage key from other tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue))
      }
    }

    // Listen for storage events to keep synchronized
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
