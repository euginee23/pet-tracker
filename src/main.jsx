import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet-geometryutil";

import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

import L from "leaflet";
window.L = L;

import "@geoman-io/leaflet-geoman-free";

import App from "./App.jsx";

const root = document.getElementById("root");

createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
