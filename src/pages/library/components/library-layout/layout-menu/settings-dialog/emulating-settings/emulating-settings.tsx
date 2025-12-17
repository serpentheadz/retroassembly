import { AutoSaveSettings } from './auto-save-settings.tsx'
import { CoresSettings } from './cores-settings.tsx'
import { ShaderSettings } from './shader-settings.tsx'

export function EmulatingSettings() {
  return (
    <>
      <ShaderSettings />
      <CoresSettings />
      <AutoSaveSettings />
    </>
  )
}
