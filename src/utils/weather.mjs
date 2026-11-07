export function validLocation(value) {
  return !!value && typeof value.name === 'string' && !!value.name.trim() &&
    typeof value.latitude === 'number' && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === 'number' && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180
}
export function describeWeather(code, isDay = 1) {
  if (code === 0) return { text: '晴', icon: isDay === 0 ? '🌙' : '☀️' }
  if ([1, 2].includes(code)) return { text: '多云', icon: '🌤️' }
  if (code === 3) return { text: '阴', icon: '☁️' }
  if ([45, 48].includes(code)) return { text: '雾', icon: '🌫️' }
  if ([51, 53, 55, 56, 57].includes(code)) return { text: '毛毛雨', icon: '🌦️' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: '雨', icon: '🌧️' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: '雪', icon: '🌨️' }
  if ([95, 96, 99].includes(code)) return { text: '雷雨', icon: '⛈️' }
  return { text: '天气未知', icon: '🌡️' }
}
export function forecastUrl(location) {
  if (!validLocation(location)) throw new Error('Invalid location')
  const params = new URLSearchParams({ latitude: location.latitude, longitude: location.longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min', timezone: 'auto', forecast_days: '4',
    temperature_unit: 'celsius', wind_speed_unit: 'kmh' })
  return `https://api.open-meteo.com/v1/forecast?${params}`
}
export function normalizeWeather(data) {
  const c = data?.current
  if (!c || typeof c.temperature_2m !== 'number' || !Number.isFinite(c.temperature_2m)) throw new Error('Invalid weather response')
  const number = value => typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : null
  const daily = data.daily || {}
  return { temperature: number(c.temperature_2m), apparent: number(c.apparent_temperature),
    humidity: number(c.relative_humidity_2m), wind: number(c.wind_speed_10m), ...describeWeather(c.weather_code, c.is_day),
    time: typeof c.time === 'string' ? c.time.replace('T', ' ') : '', timezone: data.timezone || '',
    days: (Array.isArray(daily.time) ? daily.time : []).slice(1, 4).map((date, i) => ({ date,
      ...describeWeather(daily.weather_code?.[i + 1]), high: number(daily.temperature_2m_max?.[i + 1]), low: number(daily.temperature_2m_min?.[i + 1]) })) }
}
