/* ==================== GIS MAP ==================== */
ROUTES['map'] = function(c){
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>भू-स्थानिक कैडस्ट्रल नक्शा / GIS Land Map</h2>
        <div class="muted small">National Remote Sensing Centre (NRSC) / Bhunaksha Integration Prototype</div>
      </div>
    </div>
    <div class="map-wrap">
      <div id="leaflet-map"></div>
      <div class="map-search">
        <input type="text" id="map-search-input" placeholder="खसरा / Parcel ID / Village...">
        <button class="btn btn-sm btn-primary" id="map-search-btn">खोजें / Search</button>
      </div>
      <div class="map-legend" id="map-legend"></div>
      <div id="map-parcel-panel"></div>
    </div>
  `;
  const legend = document.getElementById('map-legend');
  legend.innerHTML = '<div style="font-weight:700;margin-bottom:4px;color:var(--gov-navy);">खसरा स्थिति संकेतक</div>' + 
    PARCEL_STATUSES.map(s=>`<div><span class="legend-dot" style="background:${colorForStatus(s)}"></span>${s}</div>`).join('');

  const map = L.map('leaflet-map').setView([BASE_LAT,BASE_LNG], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18, attribution:'&copy; OpenStreetMap &bull; NIC Govt. Portal'}).addTo(map);

  const layers = {};
  DB.parcels.forEach(p=>{
    const poly = L.polygon(p.polygon, { color:colorForStatus(p.status), weight:1.4, fillOpacity:.55 }).addTo(map);
    poly.on('click', ()=> showParcelPanel(p.id, map, poly));
    layers[p.id] = poly;
  });

  function showParcelPanel(id){
    const p = parcelById(id);
    const panel = document.getElementById('map-parcel-panel');
    panel.innerHTML = `<div class="parcel-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <h3 style="font-size:14px;color:var(--gov-navy);">${p.id}</h3>${parcelStatusBadge(p.status)}
      </div>
      <div class="kv"><span>खातेदार (Owner)</span><span>${ownerName(p.ownerId)}</span></div>
      <div class="kv"><span>क्षेत्रफल (Area)</span><span>${p.area} ${p.areaUnit}</span></div>
      <div class="kv"><span>भूमि प्रकार (Type)</span><span>${p.landType}</span></div>
      <div class="kv"><span>स्थान (Village)</span><span>${p.village}, ${p.district}</span></div>
      <div class="kv"><span>खसरा नं. (Survey)</span><span>${p.surveyNumber}</span></div>
      <div class="kv"><span>दस्तावेज़ (Docs)</span><span>${docStatusBadge(p.documentStatus)}</span></div>
      <div class="kv"><span>परियोजना (Project)</span><span>${p.projectId? projectName(p.projectId):'—'}</span></div>
      <div class="kv"><span>प्रतिकर (Comp.)</span><span>${p.caseId && compForCase(p.caseId) ? fmtINR(compForCase(p.caseId).total) : '—'}</span></div>
      <button class="btn btn-primary btn-sm" style="width:100%;margin-top:12px;" id="panel-open-detail">राजस्व अभिलेख खोलें / Open Dossier</button>
    </div>`;
    document.getElementById('panel-open-detail').addEventListener('click', ()=> navigate('parcel-detail', p.id));
  }
  showParcelPanel('MP-BH-001');
  map.setView([parcelById('MP-BH-001').lat, parcelById('MP-BH-001').lng], 13);

  document.getElementById('map-search-btn').addEventListener('click', doSearch);
  document.getElementById('map-search-input').addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });
  function doSearch(){
    const q = document.getElementById('map-search-input').value.trim().toLowerCase();
    if(!q) return;
    const p = DB.parcels.find(p=> p.id.toLowerCase().includes(q) || p.village.toLowerCase().includes(q) || p.surveyNumber.toLowerCase().includes(q));
    if(p){ map.setView([p.lat,p.lng], 14); showParcelPanel(p.id); } else toast('कोई मेल खाता खसरा नहीं मिला / Parcel Not Found.');
  }
};