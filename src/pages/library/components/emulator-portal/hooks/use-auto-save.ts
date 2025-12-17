import { useEffect, useRef } from 'react'
import { client, parseResponse } from '#@/api/client.ts'
import { usePreference } from '#@/pages/library/hooks/use-preference.ts'
import { useRom } from '#@/pages/library/hooks/use-rom.ts'
import { useEmulator } from './use-emulator.ts'

const { $get, $post } = client.states

export function useAutoSave() {
  const rom = useRom()
  const { core, emulator, launched } = useEmulator()
  const { preference } = usePreference()
  const timerRef = useRef<number>()
  const launchTimeRef = useRef<number>()

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }

    // Only set up auto-save if emulator is launched and interval is configured
    const interval = preference.emulator.autoSaveInterval
    if (!launched || !emulator || !core || !rom || interval === 0) {
      launchTimeRef.current = undefined
      return
    }

    // Record when emulator was launched
    if (!launchTimeRef.current) {
      launchTimeRef.current = Date.now()
    }

    // Create auto-save function
    const performAutoSave = async () => {
      try {
        const status = emulator.getStatus()
        // Only auto-save if game is actually running or paused
        if (status !== 'running' && status !== 'paused') {
          return
        }

        // Ensure emulator has been running for at least 30 seconds before first auto-save
        // This gives the game time to fully initialize
        const timeSinceLaunch = Date.now() - (launchTimeRef.current || 0)
        if (timeSinceLaunch < 30000) {
          return
        }

        const { state, thumbnail } = await emulator.saveState()
        
        // First, delete any existing auto-save state for this ROM
        const existingStates = await parseResponse($get({ query: { rom: rom.id, type: 'auto' } }))
        
        // Delete all existing auto-save states (there should only be one, but just to be safe)
        if (existingStates && Array.isArray(existingStates)) {
          for (const existingState of existingStates) {
            await client.states[':id'].$delete({ param: { id: existingState.id } })
          }
        }

        // Create the new auto-save state
        await $post({
          // @ts-expect-error actually we can use Blob here thought it says only File is accepted
          form: { core, rom: rom.id, state, thumbnail, type: 'auto' },
        })
      } catch (error) {
        // Silently fail - don't interrupt gameplay for auto-save errors
        console.error('Auto-save failed:', error)
      }
    }

    // Set up the interval timer (convert seconds to milliseconds)
    timerRef.current = window.setInterval(performAutoSave, interval * 1000)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = undefined
      }
    }
  }, [launched, emulator, core, rom, preference.emulator.autoSaveInterval])

  return null
}
