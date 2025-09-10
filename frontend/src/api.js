import axios from "axios";

// Create an axios instance
const instance = axios.create({
  baseURL: "http://localhost:5000", // change this to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
