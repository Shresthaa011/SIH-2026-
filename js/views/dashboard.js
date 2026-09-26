/* ==================== DASHBOARD ==================== */
ROUTES['dashboard'] = function(c){
  const parcels = DB.parcels;
  const counts = {
    total: parcels.length,
    verification: parcels.filter(p=>p.status==='Under Verification').length,
    acquisition: parcels.filter(p=>p.status==='Under Acquisition').length,
    acquired: parcels.filter(p=>p.status==='Acquired' || p.status==='Utilized').length,
    disputed: parcels.filter(p=>p.status==='Disputed').length,
    pendingComp: DB.compensation.filter(x=>x.paymentStatus!=='Paid').length,
    activeProjects: DB.projects.filter(p=>p.status==='In Progress').length,
    alerts: DB.alerts.filter(a=>!a.resolved).length,
  };
  const statusTally = {};
  PARCEL_STATUSES.forEach(s=> statusTally[s] = parcels.filter(p=>p.status===s).length);
  const compTotal = DB.compensation.reduce((s,x)=>s+x.total,0);
  const compPaid = DB.compensation.filter(x=>x.paymentStatus==='Paid').reduce((s,x)=>s+x.total,0);

  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>राष्ट्रीय भू-अधिग्रहण अवलोकन / National Acquisition Overview</h2>
        <div class="muted small">Ministry of Rural Development &bull; Central Revenue Bank &bull; RFCTLARR Act 2013 Synchronized</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm" data-nav="map">🗺️ भू-मानचित्र / GIS Map</button>
        <button class="btn btn-primary btn-sm" data-nav="cases">📑 प्रकरण देखें / View Cases</button>
      </div>
    </div>
    <div class="grid g4" style="margin-bottom:14px;">
      ${statCard('कुल भूखंड (Total Parcels)', counts.total, 'across '+DISTRICTS.length+' Districts', '', 'stripe-saffron')}
      ${statCard('सत्यापनधीन (Under Verification)', counts.verification, 'Revenue records check pending', '', 'stripe-navy')}
      ${statCard('अधिग्रहणधीन (Under Acquisition)', counts.acquisition, 'Sec. 11(1) Notice issued', '', 'stripe-sky')}
      ${statCard('अधिग्रहीत / हस्तांतरित (Acquired / Utilized)', counts.acquired, 'Sec. 38 Possession Complete', '', 'stripe-green')}
    </div>
    <div class="grid g4" style="margin-bottom:18px;">
      ${statCard('विवादित खसरा (Disputed Land)', counts.disputed, counts.disputed>0?'Revenue Court Intervention':'No litigations pending', '', 'stripe-clay')}
      ${statCard('प्रतिकर देयता (Pending Compensation)', counts.pendingComp, fmtINR(compTotal-compPaid)+' DBT Pending', '', 'stripe-saffron')}
      ${statCard('सक्रिय परियोजनाएं (Active Projects)', counts.activeProjects, DB.projects.length+' Infrastructure Works', '', 'stripe-navy')}
      ${statCard('सतर्कता प्रकरण (Open Vigilance Alerts)', counts.alerts, 'Auto-monitored under RFCTLARR', '', 'stripe-sky')}
    </div>
    <div class="grid g2" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-title">भू-स्थानिक सर्वेक्षण पूर्वावलोकन / Cadastral Map Preview</div>
        <div id="dash-map" style="height:290px;border-radius:2px;overflow:hidden;"></div>
      </div>
      <div class="card">
        <div class="card-title">स्थिति अनुसार भूखंड विभाजन / Parcels by RFCTLARR Stage</div>
        <canvas id="chart-status" height="220"></canvas>
      </div>
    </div>
    <div class="grid g2" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-title">प्रतिकर डीबीटी स्थिति / Compensation: Paid vs Pending</div>
        <canvas id="chart-comp" height="210"></canvas>
      </div>
      <div class="card">
        <div class="card-title">अवसंरचना परियोजना प्रगति / Infrastructure Progress vs Target</div>
        <canvas id="chart-progress" height="210"></canvas>
      </div>
    </div>
    <div class="grid g2">
      <div class="card">
        <div class="section-head" style="margin-bottom:6px;"><h3 style="font-size:13.5px;color:var(--gov-navy);">नवीनतम कार्यवाही / Recent Gazette Actions</h3><a class="small" data-nav="audit" style="cursor:pointer;color:var(--gov-navy);font-weight:600;">पूर्ण ऑडिट ट्रेल →</a></div>
        <div>${DB.auditLogs.slice(-6).reverse().map(a=>`
          <div class="timeline-item"><div class="timeline-dot"></div><div><div style="font-size:12.5px;font-weight:600;">${escapeHtml(a.action)}</div><div class="small muted">${escapeHtml(a.user)} &bull; ${escapeHtml(a.entityId)} &bull; ${fmtDate(a.timestamp)}</div></div></div>
        `).join('')}</div>
      </div>
      <div class="card">
        <div class="section-head" style="margin-bottom:6px;"><h3 style="font-size:13.5px;color:var(--gov-navy);">सतर्कता सूचनाएं / Vigilance Alerts</h3><a class="small" data-nav="alerts" style="cursor:pointer;color:var(--gov-navy);font-weight:600;">सभी सूचनाएं →</a></div>
        <div>${DB.alerts.filter(a=>!a.resolved).slice(0,5).map(a=>`
          <div class="timeline-item"><div class="timeline-dot" style="background:var(--clay);"></div><div><div style="font-size:12.5px;font-weight:700;color:var(--clay);">${escapeHtml(a.type)}</div><div class="small muted">${escapeHtml(a.message)}</div></div></div>
        `).join('') || '<div class="empty small">No active vigilance alerts. All records verified.</div>'}</div>
      </div>
    </div>
  `;
  c.querySelectorAll('[data-nav]').forEach(n=>n.addEventListener('click', ()=>navigate(n.dataset.nav)));

  // mini map
  const dmap = L.map('dash-map',{zoomControl:false, attributionControl:false}).setView([BASE_LAT,BASE_LNG], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(dmap);
  parcels.forEach(p=>{ L.circleMarker([p.lat,p.lng],{radius:4,color:colorForStatus(p.status),fillOpacity:.85,weight:1}).addTo(dmap); });

  // charts
  new Chart(document.getElementById('chart-status'), {
    type:'bar',
    data:{ labels:PARCEL_STATUSES, datasets:[{ data:PARCEL_STATUSES.map(s=>statusTally[s]), backgroundColor:PARCEL_STATUSES.map(colorForStatus) }] },
    options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, grid:{color:'rgba(0,0,0,.06)'}}, x:{ticks:{font:{size:9.5}}}} }
  });
  new Chart(document.getElementById('chart-comp'), {
    type:'doughnut',
    data:{ labels:['Paid (डीबीटी संपन्न)','Pending / Processing (प्रक्रियाधीन)'], datasets:[{ data:[compPaid, compTotal-compPaid], backgroundColor:['#138808','#ff9933'] }] },
    options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:12,font:{size:11}}}} }
  });
  new Chart(document.getElementById('chart-progress'), {
    type:'bar',
    data:{ labels:DB.monitoring.map(m=>m.projectId), datasets:[
      {label:'Target % (लक्ष्य)', data:DB.monitoring.map(m=>m.expectedProgress), backgroundColor:'#cbd5e1'},
      {label:'Actual % (वास्तविक)', data:DB.monitoring.map(m=>m.actualProgress), backgroundColor:'#0a2e5c'}
    ]},
    options:{ plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11}}}}, scales:{y:{beginAtZero:true,max:100}} }
  });
};

function colorForStatus(status){
  const m = {'Available':'#138808','Under Verification':'#d97706','Under Acquisition':'#0284c7','Approved':'#0a2e5c',
  'Compensation Pending':'#ff9933','Acquired':'#15803d','Disputed':'#b91c1c','Utilized':'#6b21a8'};
  return m[status] || '#64748b';
}

/* ==================== MY LAND (Citizen / Khatedar) ==================== */
ROUTES['my-land'] = function(c){
  const myParcels = DB.parcels.filter(p=> p.ownerId === DB.owners[0].id);
  const pendingAgreements = (DB.agreements||[]).filter(a=> a.ownerId === DB.owners[0].id && a.status === 'Sent');
  const allMyAgreements = (DB.agreements||[]).filter(a=> a.ownerId === DB.owners[0].id);

  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>मेरी भूमि / My Registered Land Holdings</h2>
        <div class="muted small">Aadhaar Linked Revenue Dossier &bull; UIDAI Verified: Amit Kumar &bull; Bhopal Circle</div>
      </div>
      <div>
        <button class="btn btn-primary btn-sm" id="btn-goto-my-agreements">✍ मेरे ई-समझौते / My E-Agreements (${allMyAgreements.length})</button>
      </div>
    </div>

    ${pendingAgreements.length ? `
      <div class="card stat-card stripe-saffron" style="background:#fffbeb;border:1px solid #fde68a;margin-bottom:18px;padding:14px 18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-weight:700;color:#92400e;font-size:13.5px;display:flex;align-items:center;gap:6px;">
              <span>📜</span> ई-समझौता डिजिटल हस्ताक्षर आवश्यक / Action Required: E-Agreement Awaiting e-Sign
            </div>
            <div class="small" style="color:#78350f;margin-top:4px;">
              आपकी भूमि (खसरा संख्या <b>${pendingAgreements[0].khasraNo}</b> &bull; ${pendingAgreements[0].projectName}) के लिए सक्षम प्राधिकारी द्वारा ई-समझौता प्रारूप प्रेषित किया गया है। कुल प्रतिकर: <b>${fmtINR(pendingAgreements[0].totalAmount)}</b>।
            </div>
          </div>
          <button class="btn btn-saffron btn-sm" id="btn-quick-sign" data-agr="${pendingAgreements[0].id}">
            समझौता देखें व ई-हस्ताक्षर करें / Review &amp; e-Sign →
          </button>
        </div>
      </div>
    ` : ''}

    <div class="grid g3">
    ${myParcels.map(p=>{
      const doc = DB.documents.filter(d=>d.parcelId===p.id);
      const comp = p.caseId ? compForCase(p.caseId) : null;
      return `<div class="card stat-card stripe-saffron">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:15px;color:var(--gov-navy);">${p.id}</h3>${parcelStatusBadge(p.status)}
        </div>
        <div class="small muted" style="margin-bottom:8px;">${p.village}, ${p.tehsil}, ${p.district} &bull; खसरा नं. (Survey) ${p.surveyNumber}</div>
        <div class="kv"><span>क्षेत्रफल (Area)</span><span>${p.area} ${p.areaUnit}</span></div>
        <div class="kv"><span>भूमि प्रकार (Type)</span><span>${p.landType}</span></div>
        <div class="kv"><span>राजस्व अभिलेख स्थिति</span><span>${docStatusBadge(p.documentStatus)}</span></div>
        <div class="kv"><span>परियोजना (Project)</span><span>${p.projectId? projectName(p.projectId) : '—'}</span></div>
        <div class="kv"><span>प्रतिकर (Compensation)</span><span>${comp? fmtINR(comp.total)+' &bull; '+comp.paymentStatus : 'निर्धारण प्रतीक्षित'}</span></div>
        <button class="btn btn-sm btn-primary" style="margin-top:10px;width:100%;" data-parcel="${p.id}">खसरा विवरण देखें / View Details</button>
      </div>`;
    }).join('') || '<div class="empty">वर्तमान में कोई भूखंड पंजीकृत नहीं है।</div>'}
    </div>
  `;
  c.querySelectorAll('[data-parcel]').forEach(b=> b.addEventListener('click', ()=> navigate('parcel-detail', b.dataset.parcel)));
  const btnMyAgr = document.getElementById('btn-goto-my-agreements');
  if(btnMyAgr) btnMyAgr.addEventListener('click', ()=> navigate('e-agreements'));
  const btnQuickSign = document.getElementById('btn-quick-sign');
  if(btnQuickSign) btnQuickSign.addEventListener('click', ()=> openSignModal(btnQuickSign.dataset.agr));
};