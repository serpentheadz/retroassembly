import { useEffect } from 'react'
import { useIsTurboEnabled } from '#@/pages/library/atoms.ts'
import { useEmulator } from './use-emulator.ts'

export function useTurboToggle() {
  const { emulator } = useEmulator()
  const [isTurboEnabled, setIsTurboEnabled] = useIsTurboEnabled()

  function toggleTurbo() {
    setIsTurboEnabled(!isTurboEnabled)
  }

  useEffect(() => {
    if (!emulator) {
      return
    }

    if (isTurboEnabled) {
      emulator.pressDown('fast_forward')
    } else {
      emulator.pressUp('fast_forward')
    }
  }, [emulator, isTurboEnabled])

  return { isTurboEnabled, toggleTurbo }
}
