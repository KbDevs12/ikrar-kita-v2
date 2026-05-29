import type { PublicInvitationView } from "@/server/invitation/cache"

/**
 * Common props shared by every invitation template.
 *
 * Each template owns its own visual language - layout, typography, spacing,
 * accent shapes, and motion. Reusable bits live in `../sections/` but a
 * template is free to ignore them and roll its own.
 */
export interface InvitationTemplateProps {
  invitation: PublicInvitationView
  recipient: string
  /**
   * Set true when the invitation should be rendered without `?to=` audio
   * autoplay attempts (e.g. dashboard preview). Music control still appears
   * but does not trigger user-gesture-required APIs.
   */
  staticPreview?: boolean
}
