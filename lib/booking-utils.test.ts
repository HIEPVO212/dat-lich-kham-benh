import { describe, expect, it } from 'vitest'
import {
  calculateAverageRating,
  isAppointmentActive,
  toDatabaseTime,
} from './booking-utils'

describe('booking utilities', () => {
  it('converts a displayed slot to a database time', () => {
    expect(toDatabaseTime('09:00 - 09:30')).toBe('09:00:00')
  })

  it('does not block cancelled or completed appointments', () => {
    expect(isAppointmentActive('pending')).toBe(true)
    expect(isAppointmentActive('cancelled')).toBe(false)
    expect(isAppointmentActive('completed')).toBe(false)
  })

  it('calculates the average rating', () => {
    expect(calculateAverageRating([5, 4, 5])).toBeCloseTo(4.67, 2)
    expect(calculateAverageRating([])).toBe(0)
  })
})
