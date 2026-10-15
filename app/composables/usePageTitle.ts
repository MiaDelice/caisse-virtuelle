export function usePageTitle() {
  return useState<string | null>('page-title', () => null)
}
