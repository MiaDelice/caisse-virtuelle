import ConfirmModal from '~/components/ui/ConfirmModal.vue'
import InfoModal from '~/components/ui/InfoModal.vue'

export function useAppModals() {
  const overlay = useOverlay()

  async function confirm(title: string, message: string): Promise<boolean> {
    const modal = overlay.create(ConfirmModal)
    const confirmed = await modal.open({ title, message })
    return confirmed ?? false
  }

  async function info(title: string, message: string): Promise<void> {
    const modal = overlay.create(InfoModal)
    await modal.open({ title, message })
  }

  return { confirm, info }
}
