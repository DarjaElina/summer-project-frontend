import { useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvent";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import styles from "./EventDetails.module.css";
import { FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { formatInTimeZone } from "date-fns-tz";
import { parseUTCDateFromDB } from '../../utils/dateHelper';

export default function EventDetails() {
  const { id } = useParams();
  const { event, loading } = useEvent(id, true);
 

  if (!event && !loading) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Oops! 🎈</h2>
        <p>We couldn’t find an event with this ID. It might have been removed or never existed.</p>
        <p>
          <a href="/events/public" className={styles.backLink}>
            ← Back to Public Events
          </a>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ClipLoader size={60} color="#9a9fff" />
        <p>Loading event...</p>
      </div>
    );
  }

  const d = parseUTCDateFromDB(event.date);

  const dateWithTime = formatInTimeZone(d, 'Europe/Helsinki' , 'd MMMM \'at\' HH:mm');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{event.title}</h1>
        <div className={styles.metaBlock}>
          <p className={styles.meta}><FaCalendarAlt /> {dateWithTime}</p>
          <p className={styles.meta}><FaMapMarkerAlt /> {event.location}</p>
        </div>
      </div>

      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className={styles.image}
        />
      )}

      <div className={styles.descriptionSection}>
        <h2 className={styles.subheading}><FaAlignLeft /> Description</h2>
        <p className={styles.description}>{event.description}</p>
      </div>

      <div className={styles.registrationSection}>
        <h2 className={styles.subheading}>Register to Attend</h2>
        <RegistrationForm eventId={id} />
      </div>
    </div>
  );
}
