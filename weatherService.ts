import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning, Wind, CloudFog } from 'lucide-react';
import { differenceInDays, format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';

// WMO Weather interpretation codes (WW)
export const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return { icon: Sun, label: 'Soleggiato', color: 'text-yellow-500' };
  if (code === 2 || code === 3) return { icon: Cloud, label: 'Nuvoloso', color: 'text-slate-500' };
  if (code >= 45 && code <= 48) return { icon: CloudFog, label: 'Nebbia', color: 'text-slate-400' };
  if (code >= 51 && code <= 67) return { icon: CloudRain, label: 'Pioggia', color: 'text-blue-500' };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, label: 'Neve', color: 'text-cyan-400' };
  if (code >= 80 && code <= 82) return { icon: CloudRain, label: 'Rovesci', color: 'text-blue-600' };
  if (code >= 95) return { icon: CloudLightning, label: 'Temporale', color: 'text-purple-600' };
  return { icon: Sun, label: 'Sereno', color: 'text-yellow-500' };
};

export interface WeatherData {
  date: string;
  minTemp: number;
  maxTemp: number;
  weatherCode: number;
}

export const fetchWeatherForecast = async (lat: number, lng: number, dateStr: string): Promise<WeatherData | null> => {
  try {
    const targetDate = startOfDay(new Date(dateStr));
    const today = startOfDay(new Date());
    const daysDiff = differenceInDays(targetDate, today);

    // Open-Meteo free API usually provides 7 days forecast by default. 
    // We extend request to 16 days to cover the required 14-day window.
    // If date is in the past or too far in future (>14 days), return null.
    if (daysDiff < 0 || daysDiff > 14) {
      return null;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`
    );
    const data = await response.json();

    if (!data || !data.daily) return null;

    // Find the index for the requested date
    const timeArray = data.daily.time as string[];
    const index = timeArray.findIndex((t: string) => t === dateStr);

    if (index === -1) return null;

    return {
      date: dateStr,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index]
    };

  } catch (error) {
    console.error("Failed to fetch weather", error);
    return null;
  }
};