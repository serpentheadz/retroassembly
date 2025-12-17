import { ScrollArea } from '@radix-ui/themes'
import { groupBy } from 'es-toolkit'
import { useTranslation } from 'react-i18next'
import { useGameStates } from '../hooks/use-game-states.ts'
import { GameState } from './game-state.tsx'

export function GameStates() {
  const { t } = useTranslation()
  const { states } = useGameStates()

  if (!states || states.length === 0) {
    return
  }

  const { auto, manual } = groupBy(states, ({ type }) => type)

  return (
    <>
      <h3 className='flex items-center gap-2 text-2xl font-semibold text-white'>
        <span className='icon-[mdi--database] size-7' />
        {t('Saved States')}
      </h3>

      {[
        { label: 'Auto-Save', states: auto, type: 'auto' },
        { label: 'Save State', states: manual, type: 'manual' },
      ]
        .filter(({ states }) => states)
        .map(({ label, states, type }) => (
          <div key={type}>
            {states && states.length > 0 && (
              <h4 className='mb-2 text-lg font-medium text-gray-11'>{t(label)}</h4>
            )}
            <ScrollArea className='overflow-visible! lg:overflow-hidden!' size='2'>
              <div className='flex flex-col flex-nowrap items-center gap-8 pb-4 lg:flex-row'>
                {states.map((state) => (
                  <GameState key={state.id} state={state} />
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
    </>
  )
}
