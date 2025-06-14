// Helper function for Android file saving with proper permission handling
async function saveFileOnAndroid(data, filename, isBlob = false) {
  if (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android') {
    try {
      const { Filesystem } = window.Capacitor.Plugins;
      if (!Filesystem) {
        console.error('Capacitor Filesystem plugin not available');
        return false;
      }
      
      // Request permissions explicitly
      const permissions = await Filesystem.requestPermissions();
      console.log('Export JSON permissions:', permissions);
      
      if (permissions.publicStorage !== 'granted') {
        console.warn('Public storage permission not granted, trying share fallback');
        
        // Try using Web Share API as fallback
        if (navigator.share && isBlob) {
          const file = new File([data], filename, { type: data.type || 'application/json' });
          await navigator.share({
            files: [file],
            title: 'Export Fantasy Map JSON',
            text: `Export: ${filename}`
          });
          tip(`JSON file shared successfully. Choose "Save to Files" to save to device.`, true, 'success', 8000);
          return true;
        }
        
        return false;
      }
      
      // Try multiple directories for better compatibility
      const dirAttempts = [
        { dir: 'DOCUMENTS', name: 'Documents' },
        { dir: 'EXTERNAL', name: 'Downloads', path: `Download/${filename}` },
        { dir: 'EXTERNAL_STORAGE', name: 'External Storage' }
      ];
      
      for (const attempt of dirAttempts) {
        try {
          const filePath = attempt.path || filename;
          
          if (isBlob) {
            // Convert blob to base64 for Capacitor
            const reader = new FileReader();
            const success = await new Promise((resolve) => {
              reader.onloadend = async () => {
                try {
                  const base64Data = reader.result.split(',')[1];
                  await Filesystem.writeFile({
                    path: filePath,
                    data: base64Data,
                    directory: attempt.dir,
                    encoding: 'base64'
                  });
                  resolve(true);
                } catch (error) {
                  console.warn(`Failed to save blob to ${attempt.name}:`, error.message);
                  resolve(false);
                }
              };
              reader.readAsDataURL(data);
            });
            
            if (success) {
              tip(`JSON file saved to device ${attempt.name} as "${filename}"`, true, 'success', 5000);
              return true;
            }
          } else {
            // Text data
            await Filesystem.writeFile({
              path: filePath,
              data: data,
              directory: attempt.dir,
              encoding: 'utf8'
            });
            tip(`JSON file saved to device ${attempt.name} as "${filename}"`, true, 'success', 5000);
            return true;
          }
        } catch (error) {
          console.warn(`Failed to save JSON to ${attempt.name}:`, error.message);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Android JSON save error:', error);
      return false;
    }
  }
  return false;
}

export async function exportToJson(type) {
  if (customization)
    return tip("Data cannot be exported when edit mode is active, please exit the mode and retry", false, "error");
  closeDialogs("#alert");

  TIME && console.time("exportToJson");
  const typeMap = {
    Full: getFullDataJson,
    Minimal: getMinimalDataJson,
    PackCells: getPackDataJson,
    GridCells: getGridDataJson
  };

  const mapData = typeMap[type]();
  const filename = getFileName(type) + ".json";
  const blob = new Blob([mapData], {type: "application/json"});
  
  // Try Android save first
  if (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android') {
    try {
      const saved = await saveFileOnAndroid(blob, filename, true);
      if (saved) {
        TIME && console.timeEnd("exportToJson");
        return;
      }
    } catch (error) {
      console.warn('Android JSON save failed, falling back to browser download:', error);
    }
  }
  
  // Fallback to browser download
  const URL = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL;
  link.click();
  tip(`${link.download} is saved. Open "Downloads" screen (CTRL + J) to check`, true, "success", 7000);
  window.URL.revokeObjectURL(URL);
  TIME && console.timeEnd("exportToJson");
}

export function getFullDataJson() {
  const info = getMapInfo();
  const settings = getSettings();
  const pack = getPackCellsData();
  const grid = getGridCellsData();

  return JSON.stringify({
    info,
    settings,
    mapCoordinates,
    pack,
    grid,
    biomesData,
    notes,
    nameBases
  });
}

function getMinimalDataJson() {
  const info = getMapInfo();
  const settings = getSettings();
  const packData = {
    features: pack.features,
    cultures: pack.cultures,
    burgs: pack.burgs,
    states: pack.states,
    provinces: pack.provinces,
    religions: pack.religions,
    rivers: pack.rivers,
    markers: pack.markers,
    routes: pack.routes,
    zones: pack.zones
  };
  return JSON.stringify({info, settings, mapCoordinates, pack: packData, biomesData, notes, nameBases});
}

function getPackDataJson() {
  const info = getMapInfo();
  const cells = getPackCellsData();
  return JSON.stringify({info, cells});
}

function getGridDataJson() {
  const info = getMapInfo();
  const cells = getGridCellsData();
  return JSON.stringify({info, cells});
}

function getMapInfo() {
  return {
    version: VERSION,
    description: "Azgaar's Fantasy Map Generator output: azgaar.github.io/Fantasy-map-generator",
    exportedAt: new Date().toISOString(),
    mapName: mapName.value,
    width: graphWidth,
    height: graphHeight,
    seed,
    mapId
  };
}

function getSettings() {
  return {
    distanceUnit: distanceUnitInput.value,
    distanceScale,
    areaUnit: areaUnit.value,
    heightUnit: heightUnit.value,
    heightExponent: heightExponentInput.value,
    temperatureScale: temperatureScale.value,
    populationRate: populationRate,
    urbanization: urbanization,
    mapSize: mapSizeOutput.value,
    latitude: latitudeOutput.value,
    longitude: longitudeOutput.value,
    prec: precOutput.value,
    options: options,
    mapName: mapName.value,
    hideLabels: hideLabels.checked,
    stylePreset: stylePreset.value,
    rescaleLabels: rescaleLabels.checked,
    urbanDensity: urbanDensity
  };
}

function getPackCellsData() {
  const data = {
    v: pack.cells.v,
    c: pack.cells.c,
    p: pack.cells.p,
    g: Array.from(pack.cells.g),
    h: Array.from(pack.cells.h),
    area: Array.from(pack.cells.area),
    f: Array.from(pack.cells.f),
    t: Array.from(pack.cells.t),
    haven: Array.from(pack.cells.haven),
    harbor: Array.from(pack.cells.harbor),
    fl: Array.from(pack.cells.fl),
    r: Array.from(pack.cells.r),
    conf: Array.from(pack.cells.conf),
    biome: Array.from(pack.cells.biome),
    s: Array.from(pack.cells.s),
    pop: Array.from(pack.cells.pop),
    culture: Array.from(pack.cells.culture),
    burg: Array.from(pack.cells.burg),
    routes: pack.cells.routes,
    state: Array.from(pack.cells.state),
    religion: Array.from(pack.cells.religion),
    province: Array.from(pack.cells.province)
  };

  return {
    cells: Array.from(pack.cells.i).map(cellId => ({
      i: cellId,
      v: data.v[cellId],
      c: data.c[cellId],
      p: data.p[cellId],
      g: data.g[cellId],
      h: data.h[cellId],
      area: data.area[cellId],
      f: data.f[cellId],
      t: data.t[cellId],
      haven: data.haven[cellId],
      harbor: data.harbor[cellId],
      fl: data.fl[cellId],
      r: data.r[cellId],
      conf: data.conf[cellId],
      biome: data.biome[cellId],
      s: data.s[cellId],
      pop: data.pop[cellId],
      culture: data.culture[cellId],
      burg: data.burg[cellId],
      routes: data.routes[cellId],
      state: data.state[cellId],
      religion: data.religion[cellId],
      province: data.province[cellId]
    })),
    vertices: Array.from(pack.vertices.p).map((_, vertexId) => ({
      i: vertexId,
      p: pack.vertices.p[vertexId],
      v: pack.vertices.v[vertexId],
      c: pack.vertices.c[vertexId]
    })),
    features: pack.features,
    cultures: pack.cultures,
    burgs: pack.burgs,
    states: pack.states,
    provinces: pack.provinces,
    religions: pack.religions,
    rivers: pack.rivers,
    markers: pack.markers,
    routes: pack.routes,
    zones: pack.zones
  };
}

function getGridCellsData() {
  const dataArrays = {
    v: grid.cells.v,
    c: grid.cells.c,
    b: grid.cells.b,
    f: Array.from(grid.cells.f),
    t: Array.from(grid.cells.t),
    h: Array.from(grid.cells.h),
    temp: Array.from(grid.cells.temp),
    prec: Array.from(grid.cells.prec)
  };

  const gridData = {
    cells: Array.from(grid.cells.i).map(cellId => ({
      i: cellId,
      v: dataArrays.v[cellId],
      c: dataArrays.c[cellId],
      b: dataArrays.b[cellId],
      f: dataArrays.f[cellId],
      t: dataArrays.t[cellId],
      h: dataArrays.h[cellId],
      temp: dataArrays.temp[cellId],
      prec: dataArrays.prec[cellId]
    })),
    vertices: Array.from(grid.vertices.p).map((_, vertexId) => ({
      i: vertexId,
      p: grid.vertices.p[vertexId],
      v: grid.vertices.v[vertexId],
      c: grid.vertices.c[vertexId]
    })),
    cellsDesired: grid.cellsDesired,
    spacing: grid.spacing,
    cellsY: grid.cellsY,
    cellsX: grid.cellsX,
    points: grid.points,
    boundary: grid.boundary,
    seed: grid.seed,
    features: pack.features
  };
  return gridData;
}
