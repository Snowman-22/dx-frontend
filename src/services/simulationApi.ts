import axios from "axios";

const simulationApi = axios.create({
  baseURL: import.meta.env.VITE_SIM_API_BASE || "/sim-api",
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});

export default simulationApi;
