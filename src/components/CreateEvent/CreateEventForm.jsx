import React, { useState } from 'react';
import Dropzone from '../Dropzone/Dropzone';
import styles from './CreateEventForm.module.css';
import { useCreateEvent } from '../../hooks/useCreateEvent';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import { SearchBox } from "@mapbox/search-js-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  location: Yup.string().required(''),
  date: Yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
  type: Yup.string().required('Type is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.mixed().required('Image is required'),
  lat: Yup.number()
    .required('Start typing to select a valid location from the list')
    .min(59.5, 'Latitude must be within Finland')
    .max(70.1, 'Latitude must be within Finland'),
  lon: Yup.number()
    .required('Start typing to select a valid location from the list')
    .min(19, 'Longitude must be within Finland')
    .max(32, 'Longitude must be within Finland')
});

const CreateEventForm = () => {
  const { createEvent, loading } = useCreateEvent();
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const navigate = useNavigate();

  const initialValues = {
    title: '',
    emoji: '🌐',
    location: '',
    date: new Date(),
    type: 'general',
    description: '',
    image: null,
    is_public: false,
    lat: null,
    lon: null
  };

  const handleSubmit = async (values, { resetForm }) => {
    const data = new FormData();
    const fullTitle = values.emoji ? `${values.emoji} ${values.title}` : values.title;

    data.append('title', fullTitle);
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'title' || key === 'emoji') return;
      if (val !== undefined && val !== null) {
        if (key === 'date') {
          const mysqlDate = val.toISOString().slice(0, 19).replace('T', ' ');
          data.append(key, mysqlDate);
        } else if (typeof val === 'boolean') {
          data.append(key, val ? '1' : '0');
        } else {
          data.append(key, val);
        }
      }
    });

    try {
      await createEvent(data);
      toast.success('Event successfully created! 🎉');
      resetForm();
      setDropzoneKey((k) => k + 1);
      navigate('/events');
    } catch (err) {
      toast.error('Oops! Something went wrong.');
      console.error(err);
    }
  };

  return (
    <div className={styles.createEventFormContainer}>
      <div className={styles.formWrapper}>
        <h2 className={styles.heading}>Create a New Event</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.staticLabel} htmlFor="title">Title ✱</label>
                <div className={styles.emojiTitleWrapper}>
                  <Field
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter event title"
                    className={`${styles.titleInput} ${values.title ? 'filled' : ''}`}
                  />
                  <div>
                    <label className={styles.staticLabel} htmlFor="emoji">Emoji</label>
                    <Field as="select" name="emoji" id="emoji" className={styles.emojiDropdown}>
                      <option value="🌐">🌐</option>
                      <option value="🎉">🎉</option>
                      <option value="🏃">🏃</option>
                      <option value="🎨">🎨</option>
                      <option value="🎵">🎵</option>
                      <option value="🍲">🍲</option>
                      <option value="📚">📚</option>
                      <option value="👨‍👩‍👧">👨‍👩‍👧</option>
                      <option value="🌍">🌍</option>
                      <option value="🥳">🥳</option>
                    </Field>
                  </div>
                </div>
                <ErrorMessage name="title" component="div" className={styles.formError} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.staticLabel} htmlFor="location">Location ✱</label>
                <SearchBox
                  id="location"
                  name="location"
                  options={{ country: "FI", types: "address, street, place" }}
                  value={values.location}
                  accessToken={MAPBOX_TOKEN}
                  onChange={(input) => {
                    setFieldValue('location', input);
                    setFieldValue('lat', null);
                    setFieldValue('lon', null);
                  }}
                  onRetrieve={(data) => {
                    setFieldValue('location', data.features[0].properties.full_address)
                    setFieldValue('lat',  data.features[0].properties.coordinates.latitude)
                    setFieldValue('lon',  data.features[0].properties.coordinates.longitude)
                  }}
                />
                <ErrorMessage name="lat" component="div" className={styles.formError} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.staticLabel} htmlFor="date">Date ✱</label>
                <DatePicker
                  selected={values.date}
                  onChange={(date) => setFieldValue('date', date)}
                  showTimeSelect
                  minDate={new Date()}
                  dateFormat="Pp"
                  className={styles.datepicker}
                  id="date"
                />
                <ErrorMessage name="date" component="div" className={styles.formError} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="type" className={styles.staticLabel}>Type ✱</label>
                <Field id="type" as="select" name="type" className={styles.select}>
                  {['general', 'course', 'volunteering', 'sports', 'music', 'art and culture', 'food and drink', 'networking', 'online', 'kids and family'].map((type) => (
                    <option key={type} value={type}>
                      {type[0].toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="type" component="div" className={styles.formError} />
              </div>

              <label className={styles.staticLabel} htmlFor="image">Image ✱</label>
              <Dropzone
                id="image"
                key={dropzoneKey}
                onFileSelect={(file) => setFieldValue('image', file)}
              />
              <ErrorMessage name="image" component="div" className={styles.formError} />

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.staticLabel}>Description ✱</label>
                <Field id="description" as="textarea" name="description" rows={4} className={values.description ? 'filled' : ''} />
                <ErrorMessage name="description" component="div" className={styles.formError} />
              </div>

              <div className="checkboxRow">
                <Field id="isPublic" type="checkbox" name="is_public" />
                <label className="staticLabel" htmlFor="isPublic">Make this event public</label>
              </div>

              <button type="submit" disabled={loading} className="button button-gradient">
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <div className="sideImage" />
    </div>
  );
};

export default CreateEventForm;

