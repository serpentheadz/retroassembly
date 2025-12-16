import { Select } from '@radix-ui/themes'
import { useTranslation } from 'react-i18next'
import { usePreference } from '#@/pages/library/hooks/use-preference.ts'
import { SettingsTitle } from '../settings-title.tsx'

const autoSaveIntervals = [
  { label: 'Disabled (0 seconds)', value: 0 },
  { label: '1 minute', value: 60 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
  { label: '10 minutes', value: 600 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
]

export function AutoSaveSettings() {
  const { t } = useTranslation()
  const { isLoading, preference, update } = usePreference()

  return (
    <>
      <SettingsTitle>{t('Auto-Save Interval')}</SettingsTitle>

      <div className='flex flex-col gap-2 px-6 text-gray-11'>
        <p className='text-sm'>{t('Auto-save the game state at a regular interval to prevent progress loss.')}</p>
        <Select.Root
          disabled={isLoading}
          onValueChange={(value) => update({ emulator: { autoSaveInterval: Number(value) } })}
          value={String(preference.emulator.autoSaveInterval)}
        >
          <Select.Trigger />
          <Select.Content>
            {autoSaveIntervals.map(({ label, value }) => (
              <Select.Item key={value} value={String(value)}>
                {value === 0 ? t('Disabled (0 seconds)') : t('{{minutes}} minute', { count: value / 60, minutes: value / 60 })}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </>
  )
}
