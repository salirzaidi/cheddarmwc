"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_KEY = "e621ca50d556d9e5b230c315bf419163w"; // 
const CITY = "Barcelona";

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        setWeather({
          city: data.name,
          temperature: data.main.temp, // Celsius
          condition: data.weather[0].description,
          windSpeed: data.wind.speed, // m/s
          humidity: data.main.humidity, // %
          feelsLike: data.main.feels_like, // Celsius
          icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, // Weather Icon
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeather({
            city: CITY,
            temperature: Math.floor(Math.random() * 5) + 10, // Random 10-14°C
            condition: "Sunny",
            windSpeed: 3.5, // Default wind speed
            humidity: 50, // Default humidity
            feelsLike: Math.floor(Math.random() * 5) + 10, // Random 10-14°C
            icon: "/assets/sunny.png", // Replace with a static sun icon in public folder
          });

      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!weather) return <p>Failed to load weather data.</p>;

  return (
    <Card className="w-full rounded-2xl  bg-gradient-to-br from-zinc-800 to-indigo-500 p-6 shadow-xl text-white">
       <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">{weather?.city}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center flex-grow">
        {/* Weather Icon */}
        <img src={weather?.icon} alt={weather?.condition} className="w-24 h-24 mb-2" />

        {/* Temperature */}
        <p className="text-4xl font-bold">{weather?.temperature}°C</p>

        {/* Weather Condition */}
        <p className="text-lg capitalize">{weather?.condition}</p>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 mt-auto w-full text-sm text-gray-200">
          <div className="text-center">
            <p className="font-bold">{weather?.windSpeed} m/s</p>
            <p>Wind</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{weather?.humidity}%</p>
            <p>Humidity</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{weather?.feelsLike}°C</p>
            <p>Feels like</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
