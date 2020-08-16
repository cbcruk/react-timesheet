import sortBy from 'lodash/sortBy'
import range from 'lodash/range'
import dayjs from 'dayjs'
import { Time } from './types'

export function getYears(scale: number[]) {
  const [min, max] = scale
  const years = range(min, max + 1)
  const months = years.length * 12

  return {
    years,
    months,
  }
}

export function getBubbles(data: Time[], scale: number[]) {
  const sortedData = sortBy(data, ([start]) => start)
  const { years, months } = getYears(scale)
  const [startYear] = years
  const bubbles = sortedData.map(([start, end, label, type]) => {
    const period = dayjs(end).diff(start, 'month', true)
    const fromStartYear = dayjs(start).diff(`${startYear}`, 'month')
    const width = (period / months) * 100
    const offset = (fromStartYear / months) * 100

    return {
      start: start.replace('-', '/'),
      end: end.replace('-', '/'),
      label,
      type,
      width,
      offset,
    }
  })

  return {
    years,
    bubbles,
  }
}
