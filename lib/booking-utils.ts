export function getStartTime(timeSlot: string): string {
  return timeSlot.split('-')[0].trim()
}

export function toDatabaseTime(timeSlot: string): string {
  const startTime = getStartTime(timeSlot)
  return startTime.length === 5 ? `${startTime}:00` : startTime
}

export function isAppointmentActive(status?: string | null): boolean {
  return status !== 'cancelled' && status !== 'completed'
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((total, rating) => total + rating, 0) / ratings.length
}
