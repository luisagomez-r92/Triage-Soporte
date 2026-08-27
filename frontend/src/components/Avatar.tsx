interface AvatarProps {
  nombre: string
  avatarUrl?: string
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function Avatar({ nombre, avatarUrl }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nombre}
        className="h-6 w-6 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-semibold text-accent">
      {getInitials(nombre)}
    </div>
  )
}

export default Avatar
