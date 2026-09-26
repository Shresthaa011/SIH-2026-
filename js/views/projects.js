/* ==================== PROJECTS & MONITORING ==================== */
ROUTES['projects'] = function(c){
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>राष्ट्रीय अवसंरचना परियोजनाएं / National Infrastructure Projects</h2>
        <div class="muted small">${DB.projects.length} PM GatiShakti &amp; Priority Infrastructure Works</div>
      </div>
      ${(CURRENT_USER.role==='PROJECT_AUTHORITY'||CURRENT_USER.role==='ADMIN') ? `<button class="btn btn-primary btn-sm" id="btn-new-project">+ नई परियोजना जोड़ें / New Project</button>`:''}
    </div>
    <div class="grid g3">
      ${DB.projects.map(p=>{
        const pct = Math.min(100, Math.round((p.acquiredArea/p.requiredArea)*100));
        return `<div class="card stat-card stripe-navy">
          <div style="display:flex;justify-content:space-between;"><h3 style="font-size:14px;color:var(--gov-navy);">${p.name}</h3></div>
          <div class="small muted" style="margin-bottom:8px;">${p.department} &bull; ${p.location}</div>
          <div class="kv"><span>आवश्यक भूमि (Required)</span><span>${p.requiredArea} acres</span></div>
          <div class="kv"><span>अधिग्रहीत भूमि (Acquired)</span><span>${p.acquiredArea} acres</span></div>
          <div class="kv"><span>उपयोगित भूमि (Utilized)</span><span>${p.utilizedArea} acres</span></div>
          <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${pct}%;"></div></div>
          <div class="small muted" style="margin-top:4px;font-weight:600;">${pct}% भूमि अधिग्रहण संपन्न</div>
          <button class="btn btn-sm btn-primary" style="margin-top:10px;width:100%;" data-open="${p.id}">परियोजना विवरण देखें / Open Project</button>
        </div>`;
      }).join('')}
    </div>
  `;
  c.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click', ()=>navigate('project-detail', b.dataset.open)));
  const nb = document.getElementById('btn-new-project');
  if(nb) nb.addEventListener('click', openNewProjectModal);
};

function openNewProjectModal(){
  openModal(`
    <h3 style="margin-bottom:14px;color:var(--gov-navy);">नई अवसंरचना परियोजना पंजीकृत करें</h3>
    <div class="formrow"><label>परियोजना का नाम (Project Name)</label><input id="np-name" placeholder="e.g. NH-46 6-Lane Expressway Extension"></div>
    <div class="two-col">
      <div class="formrow"><label>क्षेत्र / कार्य (Sector)</label><select id="np-type">${PROJECT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="formrow"><label>मंत्रालय / विभाग (Ministry)</label><select id="np-dept">${DEPARTMENTS.map(t=>`<option>${t}</option>`).join('')}</select></div>
    </div>
    <div class="two-col">
      <div class="formrow"><label>ज़िला / कार्यक्षेत्र (District)</label><select id="np-loc">${DISTRICTS.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="formrow"><label>आवश्यक भूमि (Acres)</label><input id="np-area" type="number" value="40"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
      <button class="btn" id="np-cancel">रद्द करें / Cancel</button><button class="btn btn-primary" id="np-submit">परियोजना पंजीकृत करें</button>
    </div>
  `);
  document.getElementById('np-cancel').addEventListener('click', closeModal);
  document.getElementById('np-submit').addEventListener('click', ()=>{
    const name = document.getElementById('np-name').value.trim() || 'Untitled Infrastructure Work';
    const id = 'PRJ-'+String(DB.projects.length+1).padStart(3,'0');
    const start = todayISO();
    DB.projects.push({ id, name, type:document.getElementById('np-type').value, department:document.getElementById('np-dept').value,
      location:document.getElementById('np-loc').value, requiredArea:+document.getElementById('np-area').value||10, acquiredArea:0, utilizedArea:0,
      startDate:start, targetDate: addDaysISO(start, 500), status:'In Progress' });
    DB.monitoring.push({ projectId:id, landAcquiredPct:0, landUtilizedPct:0, compensationPaidPct:0, plannedProgress:0, expectedProgress:2, actualProgress:0, lastUpdate:start });
    addAudit('Infrastructure project created', 'project', id, name);
    saveDB(); closeModal(); toast('परियोजना सफलतापूर्वक पंजीकृत।'); navigate('project-detail', id);
  });
}

ROUTES['project-detail'] = function(c, id){
  const p = projectById(id);
  if(!p){ c.innerHTML='<div class="empty">परियोजना नहीं मिली / Project not found.</div>'; return; }
  const cases = DB.cases.filter(k=>k.projectId===id);
  const m = DB.monitoring.find(x=>x.projectId===id);
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>${p.name}</h2>
        <div class="muted small">${p.department} &bull; ${p.location} &bull; लक्ष्य तिथि: ${fmtDate(p.targetDate)}</div>
      </div>
      <span class="${statusBadgeClass(p.status)}">${p.status}</span>
    </div>
    <div class="grid g4" style="margin-bottom:16px;">
      ${statCard('आवश्यक भूमि', p.requiredArea+' ac','Target Acquisition','','stripe-navy')}
      ${statCard('अधिग्रहीत भूमि', p.acquiredArea+' ac', Math.round(p.acquiredArea/p.requiredArea*100)+'% of Target','','stripe-green')}
      ${statCard('उपयोगित भूमि', p.utilizedArea+' ac','Under Construction','','stripe-sky')}
      ${statCard('संबद्ध प्रकरण', cases.length,'Active Revenue Cases','','stripe-saffron')}
    </div>
    ${m? `<div class="card stat-card stripe-navy" style="margin-bottom:16px;">
      <div class="card-title">परियोजना प्रगति डैशबोर्ड / PRAGATI Milestone Monitor</div>
      <div class="grid g3">
        <div><div class="small muted">अपेक्षित प्रगति (Expected)</div><div class="progress-track" style="margin-top:6px;"><div class="progress-fill" style="width:${m.expectedProgress}%;background:var(--slate);"></div></div><div class="small" style="margin-top:3px;font-weight:700;">${m.expectedProgress}%</div></div>
        <div><div class="small muted">वास्तविक प्रगति (Actual)</div><div class="progress-track" style="margin-top:6px;"><div class="progress-fill" style="width:${m.actualProgress}%;background:var(--gov-green);"></div></div><div class="small" style="margin-top:3px;font-weight:700;">${m.actualProgress}%</div></div>
        <div><div class="small muted">प्रतिकर डीबीटी वितरण</div><div class="progress-track" style="margin-top:6px;"><div class="progress-fill" style="width:${m.compensationPaidPct}%;background:var(--gov-saffron);"></div></div><div class="small" style="margin-top:3px;font-weight:700;">${m.compensationPaidPct}%</div></div>
      </div>
      <button class="btn btn-sm btn-primary" style="margin-top:12px;" id="goto-monitor">पूर्ण निगरानी डैशबोर्ड खोलें / Open Monitoring</button>
    </div>`:''}
    <div class="card" style="padding:0;">
      <div class="card-title" style="padding:14px 18px 0;">इस परियोजना से संबद्ध अधिग्रहण प्रकरण</div>
      <div class="overflow-x"><table><thead><tr><th>प्रकरण संख्या</th><th>खसरा संख्या</th><th>खातेदार (Owner)</th><th>अधिग्रहण चरण</th><th>कार्यवाही</th></tr></thead>
      <tbody>${cases.map(k=>{ const parc=parcelById(k.parcelId); return `<tr><td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);">${k.id}</td><td><b>${k.parcelId}</b></td><td>${ownerName(parc.ownerId)}</td><td>${workflowBadge(k.status)}</td><td><button class="btn btn-sm btn-primary" data-open="${k.id}">खोलें / Open</button></td></tr>`; }).join('') || `<tr><td colspan="5"><div class="empty">कोई प्रकरण संबद्ध नहीं है।</div></td></tr>`}</tbody></table></div>
    </div>
  `;
  c.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click', ()=>navigate('case-detail', b.dataset.open)));
  const gm = document.getElementById('goto-monitor'); if(gm) gm.addEventListener('click', ()=>navigate('monitoring'));
};

ROUTES['monitoring'] = function(c){
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>परियोजना प्रगति निगरानी / PRAGATI National Milestone Monitor</h2>
        <div class="muted small">Real-time Comparison of Physical Progress vs. Statutory Acquisition Timeline</div>
      </div>
    </div>
    <div class="grid g3">
    ${DB.monitoring.map(m=>{
      const p = projectById(m.projectId);
      const delayed = m.actualProgress < m.expectedProgress - 10;
      return `<div class="card stat-card ${delayed?'stripe-clay':'stripe-green'}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:13.5px;color:var(--gov-navy);">${p.name}</h3>
          ${delayed?'<span class="badge badge-disputed">प्रगति विलंबित (Delayed)</span>':'<span class="badge badge-available">प्रगति संतोषजनक (On Track)</span>'}
        </div>
        <div class="small muted" style="margin-bottom:8px;">अंतिम अद्यतन: ${fmtDate(m.lastUpdate)}</div>
        <div class="small muted">भूमि अधिग्रहण: <b>${m.landAcquiredPct}%</b></div>
        <div class="progress-track" style="margin:3px 0 7px;"><div class="progress-fill" style="width:${m.landAcquiredPct}%;"></div></div>
        <div class="small muted">भूमि उपयोगिता: <b>${m.landUtilizedPct}%</b></div>
        <div class="progress-track" style="margin:3px 0 7px;"><div class="progress-fill" style="width:${m.landUtilizedPct}%;background:#6b21a8;"></div></div>
        <div class="small muted">प्रतिकर डीबीटी: <b>${m.compensationPaidPct}%</b></div>
        <div class="progress-track" style="margin:3px 0 7px;"><div class="progress-fill" style="width:${m.compensationPaidPct}%;background:var(--gov-saffron);"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-top:6px;"><span>लक्ष्य: <b>${m.expectedProgress}%</b></span><span>वास्तविक: <b>${m.actualProgress}%</b></span></div>
        ${(CURRENT_USER.role==='PROJECT_AUTHORITY'||CURRENT_USER.role==='ADMIN') ? `
        <div style="display:flex;gap:6px;margin-top:10px;">
          <button class="btn btn-sm" data-adj="${m.projectId}" data-dir="-1">− प्रगति दर्ज करें</button>
          <button class="btn btn-sm btn-primary" data-adj="${m.projectId}" data-dir="1">+ प्रगति दर्ज करें</button>
        </div>` : ''}
      </div>`;
    }).join('')}
    </div>
  `;
  c.querySelectorAll('[data-adj]').forEach(b=>b.addEventListener('click', ()=>{
    const m = DB.monitoring.find(x=>x.projectId===b.dataset.adj);
    m.actualProgress = Math.max(0, Math.min(100, m.actualProgress + 5*(+b.dataset.dir)));
    m.lastUpdate = todayISO();
    addAudit('Project progress updated', 'project', b.dataset.adj, `Progress set to ${m.actualProgress}%`);
    if(m.actualProgress < m.expectedProgress-10) addAlert('Project Delay','high',`Project ${b.dataset.adj} trails schedule target.`,'project', b.dataset.adj);
    saveDB(); toast('परियोजना प्रगति अद्यतन की गई।'); navigate('monitoring');
  }));
};

/* ==================== DECISION SUPPORT ==================== */
ROUTES['decision-support'] = function(c){
  function draw(projectId){
    const proj = projectById(projectId) || DB.projects[0];
    const candidates = DB.parcels.filter(p=>!p.caseId && p.status!=='Disputed').slice(0,3);
    const scored = candidates.map(p=>{
      const docsComplete = p.documentStatus==='Verified' ? 100 : (p.documentStatus==='Under Review'?70:(p.documentStatus==='Uploaded'?50:20));
      const dist = Math.sqrt(Math.pow(p.lat-BASE_LAT,2)+Math.pow(p.lng-BASE_LNG,2));
      const proximity = Math.max(0, 100 - dist*900);
      const areaFit = Math.max(0, 100 - Math.abs(p.area-10)*6);
      const ownerSimplicity = 90;
      const disputeFree = p.status==='Disputed' ? 0 : 100;
      const factors = [
        {label:'राजस्व दस्तावेज़ पूर्णता (30%)', value:Math.round(docsComplete), weight:.3},
        {label:'परियोजना गलियारा निकटता (25%)', value:Math.round(proximity), weight:.25},
        {label:'क्षेत्रफल अनुकूलता (20%)', value:Math.round(areaFit), weight:.2},
        {label:'भू-स्वामित्व सरलता (15%)', value:Math.round(ownerSimplicity), weight:.15},
        {label:'विवाद मुक्त स्थिति (10%)', value:Math.round(disputeFree), weight:.1},
      ];
      const score = Math.round(factors.reduce((s,f)=>s+f.value*f.weight,0));
      return {p, factors, score};
    }).sort((a,b)=>b.score-a.score);

    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>भू-चयन निर्णय सहायता प्रणाली / Parcel Decision Support System</h2>
          <div class="muted small">Transparent, Multi-Factor Algorithmic Evaluation for Project Alignment</div>
        </div>
        <select id="ds-project">${DB.projects.map(pp=>`<option value="${pp.id}" ${pp.id===proj.id?'selected':''}>${pp.name}</option>`).join('')}</select>
      </div>
      <div class="tag-warn" style="margin-bottom:14px;">पारदर्शिता सूचना: स्कोरिंग मानकीकृत भारित मापकों (Weighted Factors) पर आधारित है, जो किसी भी प्रकार के मानवीय पूर्वाग्रह से मुक्त है।</div>
      <div class="grid g3">
        ${scored.map((s,i)=>`
        <div class="card stat-card ${i===0?'stripe-green':'stripe-navy'}">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <h3 style="font-size:14px;color:var(--gov-navy);">${s.p.id}</h3>
            <div style="font-family:var(--font-serif);font-size:22px;font-weight:700;color:${i===0?'var(--gov-green)':'var(--gov-navy)'};">${s.score} / 100</div>
          </div>
          <div class="small muted" style="margin-bottom:8px;">${s.p.village}, ${s.p.district} &bull; ${s.p.area} ${s.p.areaUnit}</div>
          ${i===0? `<span class="badge badge-available" style="margin-bottom:8px;display:inline-block;">सर्वश्रेष्ठ उपयुक्त भूखंड (Recommended)</span>`:''}
          ${s.factors.map(f=>`
            <div style="margin:6px 0;">
              <div style="display:flex;justify-content:space-between;font-size:11px;"><span class="muted">${f.label}</span><span>${f.value}</span></div>
              <div class="score-bar-track"><div class="score-bar-fill" style="width:${f.value}%;"></div></div>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-primary" style="width:100%;margin-top:8px;" data-open="${s.p.id}">खसरा विवरण देखें / Inspect</button>
        </div>`).join('') || '<div class="empty">कोई असंबद्ध खसरा उपलब्ध नहीं है।</div>'}
      </div>
    `;
    document.getElementById('ds-project').addEventListener('change', e=>draw(e.target.value));
    c.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click', ()=>navigate('parcel-detail', b.dataset.open)));
  }
  draw(DB.projects[0].id);
};
