import api from "./api.js";
export const getUsers=()=>api.get("/users");
export const updateUser=(id,data)=>api.patch(`/users/${id}`,data);
