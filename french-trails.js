// Initialize the engine with a location and inject into page
const container = document.getElementById("container");
const trailList = document.getElementById("trail-list");
const trailListOverlay = document.getElementById("trail-list-overlay");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

// Define API Keys (replace these with your own!)
const MAPTILER_APIKEY = "0IlMp17ADBjKdUjwsIhj";
const ARCGIS_APIKEY = "ff8nyjqym1ym7bz3mw6mpehc";
if (!MAPTILER_APIKEY || !ARCGIS_APIKEY) {
  const error = Error("Modify index.html to include API keys");
  container.innerHTML = error;
  throw error;
}

const datasource = {
  elevation: {
    apiKey: MAPTILER_APIKEY,
    pixelFormat: 'terrain-rgb',
    maxZoom: 12,
    pixelEncoding: 'terrain-rgb',
    urlFormat: 'https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key={apiKey}',
  },
  imagery: {
    apiKey: ARCGIS_APIKEY,
    urlFormat:
      "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, and the GIS User Community",
  },
};
Procedural.init({ container, datasource });

// Configure buttons for UI
Procedural.setCameraModeControlVisible(true);
Procedural.setCompassVisible(false);
Procedural.setRotationControlVisible(true);
Procedural.setZoomControlVisible(true);

const configuration = {
  // Minimum distance camera can approach scene
  minDistance: 100,
  // Maximum distance camera can move from scene
  maxDistance: 80000,
  // Maximum distance camera target can move from scene
  maxBounds: 7500000,
  // Minimum polar angle of camera
  minPolarAngle: 0.25 * Math.PI,
  // Maximum polar angle of camera
  maxPolarAngle: 0.8 * Math.PI,
  // Set to true to disable panning
  noPan: true,
  // Set to true to disable rotating
  noRotate: false,
  // Set to true to disable zooming
  noZoom: false,
};
Procedural.configureControls(configuration);

// Define function for loading a given trail
function loadTrail(feature) {
  const { name, distance, length, gpx, points } = feature.properties;
  title.innerHTML = name;
  subtitle.innerHTML = `${distance} km (${length})`;
  trailListOverlay.classList.add("hidden");

  let overlay = {
    name: "trail",
    type: "FeatureCollection",
    features: [],
  };
  // Display point name
  overlay.features.push(
    ...points.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point.coordinates,
      },
      properties: {
        name: `${point.name}`,
        background: "rgba(35,46,50,1)",
        borderRadius: 8,
        fontSize: 18,
        padding: 10,
        anchorOffset: { y: 86, x: 0 },
      },
    }))
  );
  // Display |
  overlay.features.push(
    ...points.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point.coordinates,
      },
      properties: {
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 30,
        name: "|",
        anchorOffset: { y: 36, x: 0 },
      },
    }))
  );
  // Display point index
  overlay.features.push(
    ...points.map((point, i) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point.coordinates,
      },
      properties: {
        name: i + 1,
        background: "rgba(35,46,50,1)",
        borderRadius: 8,
        padding: 6,
      },
    }))
  );
  Procedural.addOverlay(overlay);

  // Fetch GPX file and populate UI
  fetch(`gpx/${gpx}`)
    .then((data) => data.text())
    .then((xml) => {
      const gpx = new gpxParser();
      gpx.parse(xml);
      const totalDistance = gpx.tracks[0].distance.total;
      const geoJSON = gpx.toGeoJSON();

      const bounds = gpx.tracks[0].bounds;
      const latitude = (bounds.sw.latitude + bounds.ne.latitude) / 2;
      const longitude = (bounds.sw.longitude + bounds.ne.longitude) / 2;
      Procedural.displayLocation({ latitude, longitude });

      const coords = geoJSON.features[0].geometry.coordinates;
      const start_coords = coords[0];
      const end_coords = coords[coords.length - 1];
      const overlay = {
        name: "track",
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: coords.map((coord, i) => [coord[0], coord[1]]),
            },
            type: "Feature",
            properties: {
              color: "#f30e32",
              thickness: 4,
            },
          },
        ],
      };
      Procedural.addOverlay(overlay);

      setTimeout(() => {
        Procedural.focusOnBounds(gpx.tracks[0].bounds);
        setTimeout(() => Procedural.orbitTarget(), 2000);
      }, 1000);
    });
}

// Show list when title clicked
title.addEventListener("click", () => {
  trailListOverlay.classList.remove("hidden");
});

// Fetch trail list and populate UI
fetch("trails.geojson")
  .then((data) => data.json())
  .then((trails) => {
    trails.features.forEach((trail, i) => {
      const li = document.createElement("li");
      let p = document.createElement("p");
      p.innerHTML = trail.properties.name;
      li.appendChild(p);
      p = document.createElement("p");
      p.innerHTML = `${trail.properties.distance} km (${trail.properties.length})`;
      li.appendChild(p);
      p = document.createElement("p");
      p.innerHTML = `${trail.properties.difficulty}`;
      if (trail.properties.difficulty === "Hard")
        p.style.background = "red";
      else
        p.style.background = "green";
      li.appendChild(p);
      li.style.backgroundImage = `url(images/${trail.properties.code}.jpg)`;
      trailList.appendChild(li);
      li.addEventListener("click", () => loadTrail(trail));
    });

    // Load trail when marker clicked
    Procedural.onFeatureClicked = (id) => {
      const trail = trails.features[id];
      if (trail) {
        loadTrail(trail);
      }
    };

    // Display first trail location
    loadTrail(trails.features[0]);
    trailListOverlay.classList.remove("hidden");
  });
