import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import { client, parseResponse } from '#@/api/client.ts'
import { useShowGameOverlayContent } from '#@/pages/library/atoms.ts'
import { useRom } from '#@/pages/library/hooks/use-rom.ts'
import { useEmulator } from './use-emulator.ts'

const { $get, $post } = client.states

export function useGameStates() {
  const rom = useRom()
  const { core, emulator } = useEmulator()
  const [showGameOverlay] = useShowGameOverlayContent()

  const manualQuery = { rom: rom.id, type: 'manual' } as const
  const {
    data: manualStates,
    isLoading: isManualStatesLoading,
    mutate: reloadManualStates,
  } = useSWRImmutable(
    rom && showGameOverlay ? { endpoint: '/api/v1/roms/:id/states/manual', query: manualQuery } : false,
    ({ query }) => parseResponse($get({ query })),
  )

  const autoQuery = { rom: rom.id, type: 'auto' } as const
  const {
    data: autoStates,
    isLoading: isAutoStatesLoading,
    mutate: reloadAutoStates,
  } = useSWRImmutable(
    rom && showGameOverlay ? { endpoint: '/api/v1/roms/:id/states/auto', query: autoQuery } : false,
    ({ query }) => parseResponse($get({ query })),
  )

  const { isMutating: isSavingState, trigger: saveState } = useSWRMutation('/api/v1/states', async () => {
    if (!emulator || !core || !rom) {
      throw new Error('invalid emulator or core or rom')
    }
    const { state, thumbnail } = await emulator.saveState()
    await $post({
      // @ts-expect-error actually we can use Blob here thought it says only File is accepted
      form: { core, rom: rom.id, state, thumbnail, type: 'manual' },
    })
    await reloadManualStates()
  })

  const reloadStates = async () => {
    await Promise.all([reloadManualStates(), reloadAutoStates()])
  }

  const states = [...(manualStates || []), ...(autoStates || [])]
  const isStatesLoading = isManualStatesLoading || isAutoStatesLoading

  return { autoStates, isSavingState, isStatesLoading, manualStates, reloadStates, saveState, states }
}

