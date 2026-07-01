import { MOCK_AVATAR_IDS } from '../../../utils/userPreferences'

interface ProfileAvatarProps {
  avatarId: string
  name: string
  size?: 'xl' | 'lg' | 'sm'
}

export function ProfileAvatar({ avatarId, name, size = 'lg' }: ProfileAvatarProps) {
  const index = MOCK_AVATAR_IDS.indexOf(avatarId as (typeof MOCK_AVATAR_IDS)[number])
  const variant = index >= 0 ? index + 1 : 1
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={`profile-avatar profile-avatar--v${variant} profile-avatar--${size}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
