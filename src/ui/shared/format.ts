export const seconds = (value: number) => {
  const total = Math.max(0, Math.ceil(value))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
