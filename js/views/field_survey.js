/* =====================================================================
   GeoSetu-India (जिओसेतु-इंडिया) — FIELD SURVEY & GPS PARCEL VERIFICATION
   Mobile/Tablet Friendly Field Officer (Patwari / Surveyor) Verification Terminal
   ===================================================================== */

ROUTES['field-survey'] = function(c) {
  let selectedParcelId = 'MP-BH-001';
  let liveLat = 23.2599;
  let liveLng = 77.4126;
  let liveAccuracy = 0.35;
  let capturedPhotos = [
    {
      id: 'IMG-001',
      url: 'images/slide4.jpg',
      label: 'Boundary Pillar North Stone #1',
      lat: 23.2601,
      lng: 77.4128,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
      accuracy: '0.28m'
    }
  ];

  function draw() {
    const currentParcel = parcelById(selectedParcelId) || DB.parcels[0];
    const owner = DB.owners.find(o => o.id === currentParcel.ownerId) || { name: 'Amit Kumar', phone: '9826012345' };
    const pendingParcels = DB.parcels.filter(p => p.status === 'Under Verification' || !p.fieldVerified);
    const verifiedParcels = DB.parcels.filter(p => p.fieldVerified);

    c.innerHTML = `
      <!-- Top Title & Officer Badge Bar -->
      <div class="section-head" style="flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div>
          <h2 style="margin:0 0 4px 0;display:flex;align-items:center;gap:8px;">
            <span>📍</span>
            <span>क्षेत्रीय जीपीएस एवं फोटो सत्यापन टर्मिनल</span>
          </h2>
          <div class="muted small">
            Field GPS &amp; Geotagged Parcel Inspection Terminal • RFCTLARR Sec 4/11 Verification
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <div class="badge badge-navy" style="padding:6px 12px;font-size:12px;border-radius:20px;">
            👤 ${CURRENT_USER ? CURRENT_USER.name : 'Vikram Singh'} (${CURRENT_USER ? CURRENT_USER.title : 'Senior Field Surveyor'})
          </div>
          <button class="btn btn-sm btn-secondary" onclick="Device.toggleMode()" title="Toggle Mobile Field Mode">
            📱 Switch UI Layout
          </button>
        </div>
      </div>

      <!-- Live GPS & Device Status Banner -->
      <div class="card" style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#fff;border-radius:12px;padding:16px 20px;margin-bottom:20px;box-shadow:0 6px 16px rgba(15,23,42,0.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:12px;height:12px;background:#22c55e;border-radius:50%;box-shadow:0 0 10px #22c55e;animation:pulse 1.8s infinite;"></div>
            <div>
              <div style="font-size:11px;letter-spacing:0.06em;color:#94a3b8;font-weight:700;text-transform:uppercase;">GNSS / RTK Satellite Receiver</div>
              <div style="font-size:15px;font-weight:800;font-family:var(--font-mono);color:#38bdf8;" id="gps-coord-display">
                ${liveLat.toFixed(6)}° N, ${liveLng.toFixed(6)}° E
              </div>
            </div>
          </div>
          <div style="display:flex;gap:20px;font-size:12px;color:#cbd5e1;flex-wrap:wrap;">
            <div><span style="color:#94a3b8;">Accuracy:</span> <b style="color:#4ade80;">±${liveAccuracy}m (Sub-meter)</b></div>
            <div><span style="color:#94a3b8;">Satellites:</span> <b style="color:#facc15;">14 Active (NavIC + GPS)</b></div>
            <div><span style="color:#94a3b8;">Elevation:</span> <b>524m MSL</b></div>
          </div>
          <button class="btn btn-sm btn-primary" id="btn-refresh-gps" style="background:#0284c7;border:none;border-radius:6px;font-weight:600;">
            🔄 Refresh GPS Fix
          </button>
        </div>
      </div>

      <!-- Main Two-Column Layout for Mobile & Desktop -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;margin-bottom:24px;">

        <!-- Left Column: Active Parcel Inspection & Verification Form -->
        <div class="card" style="border-radius:12px;border:1px solid var(--gov-border);">
          <div style="border-bottom:1px solid var(--gov-border);padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;font-size:16px;color:var(--gov-navy);display:flex;align-items:center;gap:6px;">
              <span>📋</span> Parcels Inspection Console
            </h3>
            <span class="badge badge-warning" style="font-size:11px;">Survey Active</span>
          </div>

          <!-- Parcel Selector -->
          <div class="formrow" style="margin-bottom:16px;">
            <label style="font-weight:700;font-size:13px;color:var(--gov-navy);">Select Khasra Parcel for Field Verification:</label>
            <select id="field-parcel-select" class="gov-select" style="width:100%;padding:8px 12px;font-size:13px;">
              ${DB.parcels.slice(0, 40).map(p => `
                <option value="${p.id}" ${p.id === selectedParcelId ? 'selected' : ''}>
                  ${p.id} — Khasra ${p.surveyNumber} (${p.village}) ${p.fieldVerified ? '✓ Verified' : '⏳ Pending'}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Selected Parcel Key Info Box -->
          <div style="background:#f8fafc;border:1px solid var(--gov-border);border-radius:8px;padding:14px;margin-bottom:18px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12.5px;">
              <div><span class="muted">Parcel ID:</span> <b style="font-family:var(--font-mono);color:var(--gov-blue);">${currentParcel.id}</b></div>
              <div><span class="muted">Khasra No:</span> <b>${currentParcel.surveyNumber}</b></div>
              <div><span class="muted">Khatedar / Owner:</span> <b>${owner.name}</b></div>
              <div><span class="muted">Area &amp; Type:</span> <b>${currentParcel.area} ${currentParcel.areaUnit || 'acres'} (${currentParcel.landType || 'Agricultural'})</b></div>
              <div><span class="muted">Village / Tehsil:</span> <b>${currentParcel.village}, ${currentParcel.tehsil || 'Huzur'}</b></div>
              <div><span class="muted">Status:</span> ${parcelStatusBadge(currentParcel.status)}</div>
            </div>
          </div>

          <!-- Boundary Pillar Verification Checklist -->
          <div style="margin-bottom:18px;">
            <label style="font-weight:700;font-size:13px;color:var(--gov-navy);margin-bottom:8px;display:block;">
              🧱 Physical Boundary Pillar Integrity Checklist:
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <label class="gov-radio-card" style="padding:8px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="chk-pillar-1" checked>
                <span>Pillar #1 (North-East Stone)</span>
              </label>
              <label class="gov-radio-card" style="padding:8px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="chk-pillar-2" checked>
                <span>Pillar #2 (South-East Stone)</span>
              </label>
              <label class="gov-radio-card" style="padding:8px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="chk-pillar-3" checked>
                <span>Pillar #3 (South-West Stone)</span>
              </label>
              <label class="gov-radio-card" style="padding:8px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="chk-pillar-4" checked>
                <span>Pillar #4 (North-West Stone)</span>
              </label>
            </div>
          </div>

          <!-- Physical Land Use & Encroachment Check -->
          <div style="margin-bottom:18px;">
            <label style="font-weight:700;font-size:13px;color:var(--gov-navy);margin-bottom:8px;display:block;">
              🔍 On-Ground Structure &amp; Encroachment Status:
            </label>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <label style="font-size:12.5px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="chk-no-encroach" checked>
                <span>No Illegal Encroachment Found</span>
              </label>
              <label style="font-size:12.5px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="chk-crop-verified" checked>
                <span>Standing Crop &amp; Tree Assessment Done</span>
              </label>
            </div>
          </div>

          <!-- Field Remarks -->
          <div class="formrow" style="margin-bottom:18px;">
            <label style="font-weight:700;font-size:13px;color:var(--gov-navy);">Patwari Ground Survey Remarks &amp; Observations:</label>
            <textarea id="field-remarks" class="gov-input" rows="3" placeholder="Enter physical boundary verification details, crop conditions, or land use remarks...">${currentParcel.fieldNotes || 'Physical boundary pillars inspected with sub-meter RTK GPS fix. Cadastral RoR boundaries match on-ground demarcation. No unauthorized permanent structures detected.'}</textarea>
          </div>

          <!-- Submit Verification Button -->
          <button class="btn btn-navy" id="btn-submit-field-verification" style="width:100%;padding:12px;font-size:14px;font-weight:700;">
            ✍️ Submit Field Verification &amp; Sign Report (Patwari e-Sign)
          </button>
        </div>

        <!-- Right Column: Geotagged Photo Camera Simulator & Photo Log -->
        <div class="card" style="border-radius:12px;border:1px solid var(--gov-border);">
          <div style="border-bottom:1px solid var(--gov-border);padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;font-size:16px;color:var(--gov-navy);display:flex;align-items:center;gap:6px;">
              <span>📸</span> Geotagged Field Photo Capture
            </h3>
            <span class="badge badge-info" style="font-size:11px;">Camera Active</span>
          </div>

          <!-- Live Camera Viewfinder Simulator -->
          <div style="position:relative;background:#000;border-radius:8px;overflow:hidden;margin-bottom:16px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
            <img src="images/slide4.jpg" id="viewfinder-img" alt="Field Camera Viewfinder" style="width:100%;height:100%;object-fit:cover;opacity:0.85;">
            
            <!-- Live Geotag Watermark Overlay -->
            <div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(15,23,42,0.85);backdrop-filter:blur(4px);color:#fff;padding:8px 12px;border-radius:6px;font-size:11px;border-left:3px solid #38bdf8;">
              <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:2px;">
                <span style="color:#38bdf8;">📍 GEOSETU-INDIA FIELD SURVEY</span>
                <span style="font-family:var(--font-mono);">${new Date().toISOString().slice(0,10)} IST</span>
              </div>
              <div style="font-family:var(--font-mono);color:#f1f5f9;display:flex;gap:12px;">
                <span>LAT: <b id="cam-lat">${liveLat.toFixed(6)}</b></span>
                <span>LNG: <b id="cam-lng">${liveLng.toFixed(6)}</b></span>
                <span>ACC: <b>±${liveAccuracy}m</b></span>
              </div>
              <div style="color:#94a3b8;font-size:10px;margin-top:2px;">
                PARCEL: ${currentParcel.id} (${currentParcel.surveyNumber}) • PATWARI: ${CURRENT_USER ? CURRENT_USER.name : 'Vikram Singh'}
              </div>
            </div>

            <!-- Camera Crosshair Grid -->
            <div style="position:absolute;width:60px;height:60px;border:1px dashed rgba(255,255,255,0.6);border-radius:50%;pointer-events:none;"></div>
          </div>

          <!-- Snap Photo Button -->
          <button class="btn btn-saffron" id="btn-snap-photo" style="width:100%;padding:10px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span>📷</span> Capture Geotagged Field Photo
          </button>

          <!-- Captured Field Photos Gallery -->
          <div>
            <div style="font-weight:700;font-size:13px;color:var(--gov-navy);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
              <span>Evidence Photo Audit Trail (${capturedPhotos.length})</span>
              <span class="muted" style="font-size:11px;">EXIF Verified</span>
            </div>

            <div id="captured-photos-list" style="display:flex;flex-direction:column;gap:10px;max-height:260px;overflow-y:auto;padding-right:4px;">
              ${capturedPhotos.map(p => `
                <div style="display:flex;gap:12px;background:#f8fafc;border:1px solid var(--gov-border);border-radius:6px;padding:8px;align-items:center;">
                  <img src="${p.url}" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid #cbd5e1;">
                  <div style="flex:1;font-size:11.5px;">
                    <div style="font-weight:700;color:var(--gov-navy);">${p.label}</div>
                    <div style="font-family:var(--font-mono);color:var(--gov-blue);font-size:10.5px;">
                      ${p.lat}° N, ${p.lng}° E (±${p.accuracy})
                    </div>
                    <div class="muted" style="font-size:10px;">${p.timestamp}</div>
                  </div>
                  <span class="badge badge-success" style="font-size:10px;">Verified</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Field Survey Queue Table -->
      <div class="card" style="border-radius:12px;border:1px solid var(--gov-border);padding:0;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--gov-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <h3 style="margin:0;font-size:16px;color:var(--gov-navy);">
              🏢 Circle Field Inspection Queue (Bhopal Circle #4)
            </h3>
            <div class="muted small">Total Parcels: ${DB.parcels.length} &bull; Field Verified: ${verifiedParcels.length} &bull; Pending Verification: ${pendingParcels.length}</div>
          </div>
        </div>

        <div class="overflow-x">
          <table>
            <thead>
              <tr>
                <th>Khasra ID</th>
                <th>Survey / Plot No.</th>
                <th>Village</th>
                <th>Land Type</th>
                <th>Area</th>
                <th>Registered Owner</th>
                <th>Field Verification</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${DB.parcels.slice(0, 15).map(p => {
                const pOwner = DB.owners.find(o => o.id === p.ownerId) || { name: 'Amit Kumar' };
                const isVerified = p.fieldVerified || p.status === 'Verified' || p.status === 'Acquired';
                return `
                  <tr style="${p.id === selectedParcelId ? 'background:rgba(30,58,138,0.04);' : ''}">
                    <td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);">${p.id}</td>
                    <td><b>${p.surveyNumber}</b></td>
                    <td>${p.village}</td>
                    <td>${p.landType || 'Agricultural'}</td>
                    <td>${p.area} ${p.areaUnit || 'acres'}</td>
                    <td>${pOwner.name}</td>
                    <td>
                      ${isVerified 
                        ? `<span class="badge badge-verified">✓ Verified</span>` 
                        : `<span class="badge badge-under_verification">⏳ Pending Survey</span>`}
                    </td>
                    <td>
                      <button class="btn btn-sm ${p.id === selectedParcelId ? 'btn-primary' : 'btn-secondary'}" data-inspect-id="${p.id}">
                        ${p.id === selectedParcelId ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-refresh-gps').onclick = () => {
      liveLat = 23.2599 + (Math.random() - 0.5) * 0.002;
      liveLng = 77.4126 + (Math.random() - 0.5) * 0.002;
      liveAccuracy = (0.2 + Math.random() * 0.25).toFixed(2);
      const coordEl = document.getElementById('gps-coord-display');
      const camLatEl = document.getElementById('cam-lat');
      const camLngEl = document.getElementById('cam-lng');
      if (coordEl) coordEl.textContent = `${liveLat.toFixed(6)}° N, ${liveLng.toFixed(6)}° E`;
      if (camLatEl) camLatEl.textContent = liveLat.toFixed(6);
      if (camLngEl) camLngEl.textContent = liveLng.toFixed(6);
      toast('Live RTK GPS coordinates refreshed from satellite feed.');
    };

    document.getElementById('field-parcel-select').onchange = (e) => {
      selectedParcelId = e.target.value;
      draw();
    };

    c.querySelectorAll('[data-inspect-id]').forEach(btn => {
      btn.onclick = () => {
        selectedParcelId = btn.dataset.inspectId;
        draw();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      };
    });

    document.getElementById('btn-snap-photo').onclick = () => {
      const photoIndex = capturedPhotos.length + 1;
      const samplePhotos = ['images/slide1.jpg', 'images/slide2.jpg', 'images/slide3.jpg', 'images/slide4.jpg', 'images/about_gis.png'];
      const photoUrl = samplePhotos[(photoIndex - 1) % samplePhotos.length];
      const newPhoto = {
        id: 'IMG-' + String(photoIndex).padStart(3, '0'),
        url: photoUrl,
        label: `Ground Parcel Evidence #${photoIndex} (${currentParcel.surveyNumber})`,
        lat: +liveLat.toFixed(6),
        lng: +liveLng.toFixed(6),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
        accuracy: liveAccuracy + 'm'
      };
      capturedPhotos.unshift(newPhoto);
      toast(`Geotagged Field Photo #${newPhoto.id} captured & EXIF timestamped.`);
      draw();
    };

    document.getElementById('btn-submit-field-verification').onclick = () => {
      const remarks = document.getElementById('field-remarks').value.trim();
      currentParcel.fieldVerified = true;
      currentParcel.fieldVerifiedAt = new Date().toISOString();
      currentParcel.fieldNotes = remarks;
      currentParcel.status = 'Approved';
      currentParcel.documentStatus = 'Verified';

      addAudit('Patwari Field Verification Completed', 'parcel', currentParcel.id, `Verified by ${CURRENT_USER ? CURRENT_USER.name : 'Vikram Singh'} with geotagged photos.`);
      saveDB();

      openModal(`
        <div class="modal-header">
          <div class="modal-title">✓ Field Inspection Report Signed &amp; Registered</div>
          <button class="modal-close-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body" style="text-align:center;padding:24px;">
          <div style="width:54px;height:54px;background:#d1fae5;color:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;">✓</div>
          <h3 style="color:var(--gov-navy);margin-bottom:6px;">Parcel Ground Inspection Verified</h3>
          <p style="font-size:12.5px;color:var(--gov-text-muted);margin-bottom:16px;">
            Field inspection dossier for Khasra <b>${currentParcel.surveyNumber}</b> (${currentParcel.village}) has been digitally signed by Patwari / Field Officer and attached to statutory case records.
          </p>

          <div style="background:#f8fafc;border:1px dashed var(--gov-border);padding:14px;border-radius:6px;text-align:left;margin-bottom:16px;font-size:12px;">
            <div class="kv"><span>Parcel ID:</span><span style="font-family:var(--font-mono);color:var(--gov-blue);">${currentParcel.id}</span></div>
            <div class="kv"><span>Geotag Location:</span><span>${liveLat.toFixed(6)}° N, ${liveLng.toFixed(6)}° E</span></div>
            <div class="kv"><span>Boundary Pillars:</span><span style="color:#059669;font-weight:700;">4/4 Intact Verified</span></div>
            <div class="kv"><span>Evidence Photos Attached:</span><span>${capturedPhotos.length} Geotagged Files</span></div>
            <div class="kv"><span>Verifying Officer:</span><span>${CURRENT_USER ? CURRENT_USER.name : 'Vikram Singh'} (Senior Surveyor)</span></div>
          </div>

          <button class="btn btn-navy" style="width:100%;padding:10px;" onclick="closeModal()">Complete Inspection / संपन्न करें</button>
        </div>
      `);

      draw();
    };
  }

  draw();
};
