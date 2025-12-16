import { debounce } from 'es-toolkit'
import { useEffect } from 'react'
import { useGamepadMapping } from '#@/pages/library/hooks/use-gamepad-mapping.ts'
import { useKeyboardMapping } from '#@/pages/library/hooks/use-keyboard-mapping.ts'
import { getKeyNameFromCode } from '#@/pages/library/utils/keyboard.ts'
import { Gamepad } from '#@/utils/client/gamepad.ts'
import { useGameOverlay } from '../hooks/use-game-overlay.ts'
import { useTurboToggle } from '../hooks/use-turbo-toggle.ts'
import { GameOverlayContent } from './game-overlay-content.tsx'
import { GameOverlayController } from './game-overlay-controller.tsx'
import { GameOverlayVirtualGamepad } from './game-overlay-virtual-gamepad.tsx'

export function GameOverlay() {
  const keyboardMapping = useKeyboardMapping()
  const gamepadMapping = useGamepadMapping()
  const { toggle } = useGameOverlay()
  const { toggleTurbo } = useTurboToggle()

  useEffect(() => {
    async function handleKeydown(event: KeyboardEvent) {
      const keyName = getKeyNameFromCode(event.code)
      if (keyName === keyboardMapping.$pause) {
        event.preventDefault()
        await toggle()
      } else if (keyName === keyboardMapping.input_toggle_fast_forward) {
        event.preventDefault()
        toggleTurbo()
      }
    }
    document.body.addEventListener('keydown', handleKeydown)
    return () => document.body.removeEventListener('keydown', handleKeydown)
  }, [toggle, toggleTurbo, keyboardMapping.$pause, keyboardMapping.input_toggle_fast_forward])

  useEffect(
    () =>
      Gamepad.onPress(
        debounce(async (event) => {
          const { buttons } = event.gamepad
          const expectedButtons = [gamepadMapping.input_player1_l1_btn, gamepadMapping.input_player1_r1_btn]
          const areExpectedButtonPressed = expectedButtons.every((code) => buttons[code].pressed)
          if (areExpectedButtonPressed) {
            await toggle()
          }
        }, 100),
      ),
    [gamepadMapping, toggle],
  )

  return (
    <div className='pointer-events-none fixed inset-0 z-10 overflow-hidden text-white *:pointer-events-auto *:absolute *:inset-0'>
      <GameOverlayController />
      <GameOverlayVirtualGamepad />
      <GameOverlayContent />
    </div>
  )
}
