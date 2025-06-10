"use strict";

// functions to save the project to a file
async function saveMap(method) {
  if (customization) return tip("Map cannot be saved in EDIT mode, please complete the edit and retry", false, "error");
  closeDialogs("#alert");

  try {
    const mapData = prepareMapData();
    const filename = getFileName() + ".map";

    saveToStorage(mapData, method === "storage"); // any method saves to indexedDB
    if (method === "machine") saveToMachine(mapData, filename);
    if (method === "dropbox") saveToDropbox(mapData, filename);
  } catch (error) {
    ERROR && console.error(error);
    alertMessage.innerHTML = /* html */ `An error is occured on map saving. If the issue persists, please copy the message below and report it on ${link(
      "https://github.com/Azgaar/Fantasy-Map-Generator/issues",
      "GitHub"
    )}. <p id="errorBox">${parseError(error)}</p>`;

    $("#alert").dialog({
      resizable: false,
      title: "Saving error",
      width: "28em",
      buttons: {
        Retry: function () {
          $(this).dialog("close");
          saveMap(method);
        },
        Close: function () {
          $(this).dialog("close");
        }
      },
      position: {my: "center", at: "center", of: "svg"}
    });
  }
}

function prepareMapData() {
  const date = new Date();
  const dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  const license = "File can be loaded in azgaar.github.io/Fantasy-Map-Generator";
  const params = [VERSION, license, dateString, seed, graphWidth, graphHeight, mapId].join("|");
  const settings = [
    distanceUnitInput.value,
    distanceScale,
    areaUnit.value,
    heightUnit.value,
    heightExponentInput.value,
    temperatureScale.value,
    "", // previously used for barSize.value
    "", // previously used for barLabel.value
    "", // previously used for barBackColor.value
    "", // previously used for barBackColor.value
    "", // previously used for barPosX.value
    "", // previously used for barPosY.value
    populationRate,
    urbanization,
    mapSizeOutput.value,
    latitudeOutput.value,
    "", // previously used for temperatureEquatorOutput.value
    "", // previously used for tempNorthOutput.value
    precOutput.value,
    JSON.stringify(options),
    mapName.value,
    +hideLabels.checked,
    stylePreset.value,
    +rescaleLabels.checked,
    urbanDensity,
    longitudeOutput.value,
    growthRate.value
  ].join("|");
  const coords = JSON.stringify(mapCoordinates);
  const biomes = [biomesData.color, biomesData.habitability, biomesData.name].join("|");
  const notesData = JSON.stringify(notes);
  const rulersString = rulers.toString();
  const fonts = JSON.stringify(getUsedFonts(svg.node()));

  // save svg
  const cloneEl = document.getElementById("map").cloneNode(true);

  // reset transform values to default
  cloneEl.setAttribute("width", graphWidth);
  cloneEl.setAttribute("height", graphHeight);
  cloneEl.querySelector("#viewbox").removeAttribute("transform");

  cloneEl.querySelector("#ruler").innerHTML = ""; // always remove rulers

  const serializedSVG = new XMLSerializer().serializeToString(cloneEl);

  const {spacing, cellsX, cellsY, boundary, points, features, cellsDesired} = grid;
  const gridGeneral = JSON.stringify({spacing, cellsX, cellsY, boundary, points, features, cellsDesired});
  const packFeatures = JSON.stringify(pack.features);
  const cultures = JSON.stringify(pack.cultures);
  const states = JSON.stringify(pack.states);
  const burgs = JSON.stringify(pack.burgs);
  const religions = JSON.stringify(pack.religions);
  const provinces = JSON.stringify(pack.provinces);
  const rivers = JSON.stringify(pack.rivers);
  const markers = JSON.stringify(pack.markers);
  const cellRoutes = JSON.stringify(pack.cells.routes);
  const routes = JSON.stringify(pack.routes);
  const zones = JSON.stringify(pack.zones);

  // store name array only if not the same as default
  const defaultNB = Names.getNameBases();
  const namesData = nameBases
    .map((b, i) => {
      const names = defaultNB[i] && defaultNB[i].b === b.b ? "" : b.b;
      return `${b.name}|${b.min}|${b.max}|${b.d}|${b.m}|${names}`;
    })
    .join("/");

  // round population to save space
  const pop = Array.from(pack.cells.pop).map(p => rn(p, 4));

  // data format as below
  const mapData = [
    params,
    settings,
    coords,
    biomes,
    notesData,
    serializedSVG,
    gridGeneral,
    grid.cells.h,
    grid.cells.prec,
    grid.cells.f,
    grid.cells.t,
    grid.cells.temp,
    packFeatures,
    cultures,
    states,
    burgs,
    pack.cells.biome,
    pack.cells.burg,
    pack.cells.conf,
    pack.cells.culture,
    pack.cells.fl,
    pop,
    pack.cells.r,
    [], // deprecated pack.cells.road
    pack.cells.s,
    pack.cells.state,
    pack.cells.religion,
    pack.cells.province,
    [], // deprecated pack.cells.crossroad
    religions,
    provinces,
    namesData,
    rivers,
    rulersString,
    fonts,
    markers,
    cellRoutes,
    routes,
    zones
  ].join("\r\n");
  return mapData;
}

// save map file to indexedDB
async function saveToStorage(mapData, showTip = false) {
  const blob = new Blob([mapData], {type: "text/plain"});
  await ldb.set("lastMap", blob);
  showTip && tip("Map is saved to the browser storage", false, "success");
}

// download map file
function isAndroidWebView() {
  return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
}

async function saveToMachine(mapData, filename) {
  if (isAndroidWebView()) {
    try {
      const { Filesystem, Capacitor } = window.Capacitor.Plugins ? 
        { Filesystem: window.Capacitor.Plugins.Filesystem, Capacitor: window.Capacitor } : 
        { Filesystem: null, Capacitor: window.Capacitor };
      
      if (!Filesystem) {
        console.error('Capacitor Filesystem plugin not available');
        tip('Error: Filesystem plugin not available', false, 'error', 8000);
        return;
      }
      
      // Debug: log platform
      const platform = Capacitor.getPlatform();
      console.log('Platform detected:', platform);
      
      // Request permissions explicitly
      const permissions = await Filesystem.requestPermissions();
      console.log('Filesystem permissions:', permissions);
      
      if (permissions.publicStorage !== 'granted') {
        // Show detailed instructions for Samsung devices
        tip('Storage permission required. Go to Android Settings > Apps > Fantasy Map Generator > Permissions > Files and media > Allow access to manage all files', false, 'warn', 12000);
        
        // Try to use the Document Picker approach as fallback
        try {
          await saveWithDocumentPicker(mapData, filename);
          return;
        } catch (docError) {
          console.error('Document picker fallback failed:', docError);
          tip('Cannot save without storage permissions. Please grant file access in Android settings.', false, 'error', 8000);
          return;
        }
      }
      
      // Try multiple directories for better compatibility
      const dirAttempts = [
        { dir: 'DOCUMENTS', name: 'Documents', path: filename },
        { dir: 'EXTERNAL', name: 'External Storage', path: `Download/${filename}` },
        { dir: 'EXTERNAL_STORAGE', name: 'External Storage Root', path: filename },
        { dir: 'DATA', name: 'App Data', path: filename }
      ];
      
      let saved = false;
      let lastError = null;
      
      for (const attempt of dirAttempts) {
        try {
          await Filesystem.writeFile({
            path: attempt.path,
            data: mapData,
            directory: attempt.dir,
            encoding: 'utf8'
          });
          
          console.log(`File saved successfully to ${attempt.name}: ${attempt.path}`);
          tip(`Map saved to device ${attempt.name} folder as "${filename}"`, true, 'success', 8000);
          saved = true;
          break;
        } catch (error) {
          console.warn(`Failed to save to ${attempt.name}:`, error.message);
          lastError = error;
        }
      }
      
      if (!saved) {
        console.error('All save attempts failed. Last error:', lastError);
        
        // Try Document Picker as final fallback
        try {
          await saveWithDocumentPicker(mapData, filename);
        } catch (docError) {
          console.error('Document picker fallback also failed:', docError);
          tip(`Error saving file: ${lastError?.message || 'Storage access denied'}. Please try granting storage permissions in Android settings.`, false, 'error', 12000);
        }
      }
      
    } catch (error) {
      console.error('Android save error:', error);
      
      // Try Document Picker as fallback for permission errors
      if (error.message && error.message.includes('permission')) {
        try {
          await saveWithDocumentPicker(mapData, filename);
        } catch (docError) {
          console.error('Document picker fallback failed:', docError);
          tip(`Permission error: ${error.message}. Please grant storage access in Android settings.`, false, 'error', 8000);
        }
      } else {
        tip(`Error saving file: ${error.message}`, false, 'error', 8000);
      }
    }
  } else {
    // Regular browser download fallback
    const blob = new Blob([mapData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    tip(`Map downloaded to browser as "${filename}"`, true, 'success', 8000);
    window.URL.revokeObjectURL(url);
  }
}

// Alternative save method using Android's document picker (for when permissions are denied)
async function saveWithDocumentPicker(mapData, filename) {
  try {
    // Create a temporary blob that can be shared
    const blob = new Blob([mapData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Try to use Android's built-in share functionality
    if (navigator.share) {
      // Create a File object from the blob
      const file = new File([blob], filename, { type: 'text/plain' });
      
      await navigator.share({
        files: [file],
        title: 'Save Fantasy Map',
        text: `Save your fantasy map: ${filename}`
      });
      
      tip(`Map shared successfully. Choose "Save to Files" or similar option to save to device.`, true, 'success', 8000);
      return;
    }
    
    // Fallback: trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    tip(`Map file prepared for download. Check your Downloads folder for "${filename}"`, true, 'info', 8000);
    
    // Clean up
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    
  } catch (error) {
    console.error('Document picker save failed:', error);
    throw error;
  }
}

async function saveToDropbox(mapData, filename) {
  await Cloud.providers.dropbox.save(filename, mapData);
  tip("Map is saved to your Dropbox", true, "success", 8000);
}

async function initiateAutosave() {
  const MINUTE = 60000; // munite in milliseconds
  let lastSavedAt = Date.now();

  async function autosave() {
    const timeoutMinutes = byId("autosaveIntervalOutput").valueAsNumber;
    if (!timeoutMinutes) return;

    const diffInMinutes = (Date.now() - lastSavedAt) / MINUTE;
    if (diffInMinutes < timeoutMinutes) return;
    if (customization) return tip("Autosave: map cannot be saved in edit mode", false, "warning", 2000);

    try {
      tip("Autosave: saving map...", false, "warning", 3000);
      const mapData = prepareMapData();
      await saveToStorage(mapData);
      tip("Autosave: map is saved", false, "success", 2000);

      lastSavedAt = Date.now();
    } catch (error) {
      ERROR && console.error(error);
    }
  }

  setInterval(autosave, MINUTE / 2);
}

// TODO: unused code
async function compressData(uncompressedData) {
  const compressedStream = new Blob([uncompressedData]).stream().pipeThrough(new CompressionStream("gzip"));

  let compressedData = [];
  for await (const chunk of compressedStream) {
    compressedData = compressedData.concat(Array.from(chunk));
  }

  return new Uint8Array(compressedData);
}

const saveReminder = function () {
  if (localStorage.getItem("noReminder")) return;
  const message = [
    "Please don't forget to save the project to desktop from time to time",
    "Please remember to save the map to your desktop",
    "Saving will ensure your data won't be lost in case of issues",
    "Safety is number one priority. Please save the map",
    "Don't forget to save your map on a regular basis!",
    "Just a gentle reminder for you to save the map",
    "Please don't forget to save your progress (saving to desktop is the best option)",
    "Don't want to get reminded about need to save? Press CTRL+Q"
  ];
  const interval = 15 * 60 * 1000; // remind every 15 minutes

  saveReminder.reminder = setInterval(() => {
    if (customization) return;
    tip(ra(message), true, "warn", 2500);
  }, interval);
  saveReminder.status = 1;
};
saveReminder();

function toggleSaveReminder() {
  if (saveReminder.status) {
    tip("Save reminder is turned off. Press CTRL+Q again to re-initiate", true, "warn", 2000);
    clearInterval(saveReminder.reminder);
    localStorage.setItem("noReminder", true);
    saveReminder.status = 0;
  } else {
    tip("Save reminder is turned on. Press CTRL+Q to turn off", true, "warn", 2000);
    localStorage.removeItem("noReminder");
    saveReminder();
  }
}
