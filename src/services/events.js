import api from "./axios";

export const getAll = async () => {
  const response = await api.get("/events");
  console.log(response.data.events);
  return response.data.events;
};

export const create = async (newEvent) => {
  const response = await api.post("/events", newEvent, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
export const update = async (id, updatedEvent) => {
  const response = await api.put(`/events/${id}`, updatedEvent);
  return response.data;
};
export const remove = async (id) => {
  const response = await api.delete(`/events/${id}`)
  return response.data;
};

export const getPublic = async () => {
  const response = await api.get("/events/public");
  console.log(response)
  console.log("Public events:", response.data.events);
  return response.data.events;
};
