import { useEffect, useState } from "react";
import EventCard from "../EventCard/EventCard";
import { useEvents } from "../../context/EventContext";
import styles from "./EventList.module.css";
import ClipLoader from "react-spinners/ClipLoader";
import { FaRegCalendarMinus } from "react-icons/fa";

const API_KEY = "40850c8658af868d2f8d372ba505c430";

async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    console.log(data)
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

export default function EventList() {
  const { events, loading } = useEvents();
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    const loadWeather = async () => {
      const newWeatherData = {};

      for (const event of events) {
        const key = `${event.lat},${event.lon}`;
        if (!weatherData[key]) {
          const weather = await fetchWeather(event.lat, event.lon);
          console.log(event.lat, event.lon)
          if (weather) {
            newWeatherData[key] = weather;
          }
        }
      }

      setWeatherData((prev) => ({ ...prev, ...newWeatherData }));
    };

    if (events.length > 0) {
      loadWeather();
    }
  }, [events]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ClipLoader size={60} color="#9a9fff" />
        <p>Loading events, please wait...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.noEventsContainer}>
        <FaRegCalendarMinus size={60} />
        <p>No events found right now.</p>
        <p>Try checking back later or add some events!</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Event List</h1>
      <div className={styles["events-container"]}>
        {events.map((event, index) => (
          <EventCard
            key={index}
            {...event}
            weather={weatherData[`${event.lat},${event.lon}`]}
          />
        ))}
      </div>
    </div>
  );
}
