/**
 * Share link helper. Never uses window.location directly in built links
 * so that deployed app URLs work correctly.
 */

export function getShareBase(): string {
  // In the Arc Studio preview the origin is the preview hostname.
  // In a deployed app it is the host's origin.
  return window.location.origin
}

export function shiftShareUrl(shiftId: number): string {
  return `${getShareBase()}/shift/${shiftId}`
}
