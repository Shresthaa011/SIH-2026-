/* ==================== PARCELS LIST ==================== */
ROUTES['parcels'] = function(c){
  let state = { q:'', status:'', district:'', page:1, pageSize:12 };
  function draw(){
    let rows = DB.parcels.filter(p=>{
      if(state.status && p.status!==state.status) return false;
      if(state.district && p.district!==state.district) return false;
      if(state.q){
        const q = state.q.toLowerCase();
        if(!(p.id.toLowerCase().includes(q) || p.village.toLowerCase().includes(q) || p.surveyNumber.toLowerCase().includes(q) || ownerName(p.ownerId).toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total/state.pageSize));
    state.page = Math.min(state.page, pages);
    rows = rows.slice((state.page-1)*state.pageSize, state.page*state.pageSize);

    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>खसरा भूखंड अभिलेख सूची / Land Parcels Cadastre</h2>
          <div class="muted small">${total} खसरा अभिलेख उपलब्ध &bull; Central Revenue Database</div>
        </div>
      </div>
      <div class="filterbar">
        <input type="text" id="f-q" placeholder="खसरा / Parcel ID / खातेदार / ग्राम..." value="${escapeHtml(state.q)}">
        <select id="f-status"><option value="">सभी स्थितियां (All Statuses)</option>${PARCEL_STATUSES.map(s=>`<option ${state.status===s?'selected':''}>${s}</option>`).join('')}</select>
        <select id="f-district"><option value="">सभी ज़िले (All Districts)</option>${DISTRICTS.map(s=>`<option ${state.district===s?'selected':''}>${s}</option>`).join('')}</select>
        <button class="btn btn-sm" id="f-clear">फ़िल्टर हटाएं / Clear</button>
      </div>
      <div class="card" style="padding:0;">
        <div class="overflow-x"><table>
          <thead><tr><th>क्र.सं. (ID)</th><th>खातेदार (Owner)</th><th>ग्राम / ज़िला (Location)</th><th>खसरा नं. (Survey)</th><th>क्षेत्रफल (Area)</th><th>प्रकार (Type)</th><th>स्थिति (Status)</th><th>अभिलेख (Docs)</th><th>परियोजना</th><th>कार्यवाही</th></tr></thead>
          <tbody>${rows.map(p=>`
            <tr>
              <td style="font-family:var(--font-mono);font-weight:600;color:var(--gov-navy);">${p.id}</td>
              <td>${ownerName(p.ownerId)}</td>
              <td>${p.village}, ${p.district}</td>
              <td><b>${p.surveyNumber}</b></td>
              <td>${p.area} ${p.areaUnit}</td>
              <td>${p.landType}</td>
              <td>${parcelStatusBadge(p.status)}</td>
              <td>${docStatusBadge(p.documentStatus)}</td>
              <td>${p.projectId? p.projectId : '—'}</td>
              <td><button class="btn btn-sm btn-primary" data-open="${p.id}">खोलें / Open</button></td>
            </tr>`).join('') || `<tr><td colspan="10"><div class="empty">कोई खसरा अभिलेख नहीं मिला।</div></td></tr>`}
          </tbody>
        </table></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid var(--line);background:#f8fafc;">
          <span class="small muted">पृष्ठ ${state.page} / ${pages} (${total} Records)</span>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-sm" id="p-prev" ${state.page<=1?'disabled':''}>← पिछला / Prev</button>
            <button class="btn btn-sm" id="p-next" ${state.page>=pages?'disabled':''}>अगला / Next →</button>
          </div>
        </div>
      </div>
    `;
    c.querySelectorAll('[data-open]').forEach(b=> b.addEventListener('click', ()=> navigate('parcel-detail', b.dataset.open)));
    document.getElementById('f-q').addEventListener('input', e=>{ state.q=e.target.value; state.page=1; draw(); });
    document.getElementById('f-status').addEventListener('change', e=>{ state.status=e.target.value; state.page=1; draw(); });
    document.getElementById('f-district').addEventListener('change', e=>{ state.district=e.target.value; state.page=1; draw(); });
    document.getElementById('f-clear').addEventListener('click', ()=>{ state={q:'',status:'',district:'',page:1,pageSize:12}; draw(); });
    document.getElementById('p-prev').addEventListener('click', ()=>{ state.page--; draw(); });
    document.getElementById('p-next').addEventListener('click', ()=>{ state.page++; draw(); });
  }
  draw();
};

/* ==================== PARCEL DETAIL ==================== */
ROUTES['parcel-detail'] = function(c, id){
  const p = parcelById(id);
  if(!p){ c.innerHTML = '<div class="empty">खसरा अभिलेख नहीं मिला / Parcel not found.</div>'; return; }
  const docs = DB.documents.filter(d=>d.parcelId===p.id);
  const kase = p.caseId ? caseById(p.caseId) : null;
  const comp = kase ? compForCase(kase.id) : null;

  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>खसरा अभिलेख: ${p.id}</h2>
        <div class="muted small">खसरा संख्या ${p.surveyNumber} &bull; ${p.village}, ${p.tehsil}, ${p.district}</div>
      </div>
      <div style="display:flex;gap:8px;">${parcelStatusBadge(p.status)}
        ${!kase && (CURRENT_USER.role==='LAND_OFFICER'||CURRENT_USER.role==='ADMIN') ? `<button class="btn btn-saffron btn-sm" id="btn-create-case">+ अधिग्रहण प्रकरण प्रारंभ करें</button>` : ''}
        ${kase ? `<button class="btn btn-primary btn-sm" id="btn-view-case">प्रकरण देखें / Case ${kase.id}</button>` : ''}
      </div>
    </div>
    <div class="grid g2">
      <div class="card stat-card stripe-navy">
        <div class="card-title">भूखंड राजस्व विवरण / Revenue Dossier</div>
        <div class="kv"><span>पंजीकृत खातेदार (Owner)</span><span>${ownerName(p.ownerId)}</span></div>
        <div class="kv"><span>कुल क्षेत्रफल (Area)</span><span>${p.area} ${p.areaUnit}</span></div>
        <div class="kv"><span>भूमि वर्गीकरण (Classification)</span><span>${p.landType}</span></div>
        <div class="kv"><span>कैडस्ट्रल निर्देशांक (GPS)</span><span>${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</span></div>
        <div class="kv"><span>राजस्व प्रविष्टि तिथि</span><span>${fmtDate(p.createdAt)}</span></div>
        <div class="kv"><span>दस्तावेज़ सत्यापन स्थिति</span><span>${docStatusBadge(p.documentStatus)}</span></div>
        <div class="kv"><span>अधिग्रहण स्थिति</span><span>${parcelStatusBadge(p.status)}</span></div>
        <div class="kv"><span>संबद्ध राष्ट्रीय परियोजना</span><span>${p.projectId? projectName(p.projectId):'असंबंधित / None'}</span></div>
        <div class="kv"><span>प्रतिकर स्थिति (Compensation)</span><span>${comp? fmtINR(comp.total)+' &bull; '+comp.paymentStatus : 'निर्धारण प्रतीक्षित'}</span></div>
        <div id="mini-map" style="height:180px;margin-top:12px;border-radius:2px;overflow:hidden;border:1px solid var(--line);"></div>
      </div>
      <div class="card stat-card stripe-saffron">
        <div class="card-title">खातेदार एवं राजस्व दस्तावेज़ / Owner &amp; Verification</div>
        <div class="kv"><span>खातेदार का नाम</span><span>${ownerName(p.ownerId)}</span></div>
        <div class="kv"><span>संपर्क सूत्र (Mobile)</span><span>${(DB.owners.find(o=>o.id===p.ownerId)||{}).phone||'—'}</span></div>
        <div class="kv"><span>पहचान पत्र (Masked UIDAI)</span><span>${(DB.owners.find(o=>o.id===p.ownerId)||{}).idMasked||'—'}</span></div>
        <div class="hr"></div>
        <div class="card-title">पंजीकृत राजस्व दस्तावेज़ (${docs.length})</div>
        ${docs.length? docs.map(d=>`<div class="kv"><span>${d.type}</span><span>${docStatusBadge(d.status)}</span></div>`).join('') : '<div class="small muted">कोई दस्तावेज़ अपलोड नहीं है।</div>'}
      </div>
    </div>
  `;
  const mm = L.map('mini-map',{zoomControl:false, attributionControl:false}).setView([p.lat,p.lng],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(mm);
  L.polygon(p.polygon,{color:colorForStatus(p.status), fillOpacity:.5}).addTo(mm);

  const bc = document.getElementById('btn-create-case');
  if(bc) bc.addEventListener('click', ()=> openCreateCaseModal(p.id));
  const bv = document.getElementById('btn-view-case');
  if(bv) bv.addEventListener('click', ()=> navigate('case-detail', kase.id));
};

function openCreateCaseModal(parcelId){
  const p = parcelById(parcelId);
  openModal(`
    <h3 style="margin-bottom:14px;color:var(--gov-navy);">नया भू-अधिग्रहण प्रकरण प्रारंभ करें / Initiate Case</h3>
    <div class="formrow"><label>खसरा भूखंड / Parcel</label><input disabled value="${p.id} — ${p.village}, ${p.district} (${p.area} ${p.areaUnit})"></div>
    <div class="formrow"><label>राष्ट्रीय परियोजना संबद्ध करें (Assign Project)</label>
      <select id="np-project"><option value="">— परियोजना चुनें / Select Project —</option>${DB.projects.map(pr=>`<option value="${pr.id}">${pr.name}</option>`).join('')}</select>
    </div>
    <div class="formrow"><label>राजपत्र अधिसूचना संदर्भ / Remarks (Optional)</label><textarea id="np-remarks" rows="2" placeholder="e.g. Preliminary survey completed under RFCTLARR Section 11(1)"></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
      <button class="btn" id="np-cancel">रद्द करें / Cancel</button>
      <button class="btn btn-primary" id="np-submit">प्रकरण बनाएं / Create Case</button>
    </div>
  `);
  document.getElementById('np-cancel').addEventListener('click', closeModal);
  document.getElementById('np-submit').addEventListener('click', ()=>{
    const projId = document.getElementById('np-project').value;
    if(!projId){ toast('कृपया परियोजना का चयन करें।'); return; }
    const remarks = document.getElementById('np-remarks').value;
    const caseId = 'CASE-'+String(DB.cases.length+1).padStart(3,'0');
    const created = todayISO();
    DB.cases.push({ id:caseId, parcelId:p.id, projectId:projId, status:'IDENTIFIED', createdAt:created, history:[{status:'IDENTIFIED', date:created, user:CURRENT_USER.name}] });
    p.caseId = caseId; p.projectId = projId; p.status = 'Available';
    addAudit('Acquisition case initiated', 'acquisition_case', caseId, remarks || `Initiated under Sec 11 for parcel ${p.id}`);
    saveDB();
    closeModal();
    toast('अधिग्रहण प्रकरण ' + caseId + ' सफलतापूर्वक पंजीकृत।');
    navigate('case-detail', caseId);
  });
}