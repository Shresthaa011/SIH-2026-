/* ==================== ALERTS ==================== */
ROUTES['alerts'] = function(c){
  let showResolved = false;
  function draw(){
    const rows = DB.alerts.filter(a=> showResolved || !a.resolved);
    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>सतर्कता व विधिक सूचनाएं / Vigilance &amp; Compliance Alerts</h2>
          <div class="muted small">Auto-monitored under RFCTLARR Act 2013 Statutory Deadlines</div>
        </div>
        <label class="small" style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="show-resolved" ${showResolved?'checked':''}> निस्तारित प्रकरण भी दिखाएं (Show Resolved)</label>
      </div>
      <div class="card">
      ${rows.length? rows.map(a=>`
        <div class="timeline-item" style="padding:10px 0;">
          <div class="timeline-dot" style="background:${a.resolved?'var(--gov-green)':'var(--clay)'};"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;"><div style="font-weight:700;font-size:13px;color:${a.resolved?'var(--gov-green)':'var(--clay)'};">${escapeHtml(a.type)}</div><div class="small muted">${fmtDate(a.createdAt)}</div></div>
            <div class="small muted" style="margin-top:2px;">${escapeHtml(a.message)}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="btn btn-sm btn-primary" data-goto="${a.entityType}:${a.entityId}">अभिलेख देखें</button>
            ${!a.resolved? `<button class="btn btn-sm btn-saffron" data-resolve="${a.id}">निस्तारित करें / Resolve</button>`:''}
          </div>
        </div>`).join('') : '<div class="empty small">कोई सतर्कता सूचना लंबित नहीं है।</div>'}
      </div>
    `;
    document.getElementById('show-resolved').addEventListener('change', e=>{ showResolved=e.target.checked; draw(); });
    c.querySelectorAll('[data-resolve]').forEach(b=>b.addEventListener('click', ()=>{
      const a = DB.alerts.find(x=>x.id===b.dataset.resolve); a.resolved=true;
      addAudit('Vigilance alert resolved', 'alert', a.id, a.type); saveDB(); toast('सतर्कता प्रकरण निस्तारित किया गया।'); draw();
    }));
    c.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click', ()=>{
      const [type,eid] = b.dataset.goto.split(':');
      if(type==='parcel') navigate('parcel-detail', eid);
      else if(type==='case') navigate('case-detail', eid);
      else if(type==='project') navigate('project-detail', eid);
      else if(type==='document') navigate('documents');
      else toast('No detail view available.');
    }));
  }
  draw();
};

/* ==================== AUDIT TRAIL ==================== */
ROUTES['audit'] = function(c){
  let q='';
  function draw(){
    const rows = DB.auditLogs.filter(a=> !q || (a.action+a.entityId+a.user).toLowerCase().includes(q.toLowerCase())).slice().reverse();
    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>अपरिवर्तनीय डिजिटल ऑडिट ट्रेल / Immutable Audit Trail</h2>
          <div class="muted small">${DB.auditLogs.length} डिजिटल लॉग प्रविष्टियां &bull; Timestamped Officer Action Logs</div>
        </div>
      </div>
      <div class="filterbar"><input type="text" id="aud-q" placeholder="कार्यवाही / अधिकारी / अभिलेख संख्या खोजें..." value="${escapeHtml(q)}"></div>
      <div class="card" style="padding:0;"><div class="overflow-x"><table>
        <thead><tr><th>समय व दिनांक (Timestamp)</th><th>कार्यवाही (Gazetted Action)</th><th>सक्षम प्राधिकारी (Officer)</th><th>अभिलेख संदर्भ (Entity ID)</th><th>टिप्पणी (Remarks)</th></tr></thead>
        <tbody>${rows.slice(0,150).map(a=>`<tr>
          <td style="font-family:var(--font-mono);font-size:11px;white-space:nowrap;color:var(--gov-navy);font-weight:600;">${fmtDate(a.timestamp)}</td>
          <td><b>${escapeHtml(a.action)}</b></td>
          <td>${escapeHtml(a.user)}</td>
          <td style="font-family:var(--font-mono);">${escapeHtml(a.entity)} &bull; ${escapeHtml(a.entityId)}</td>
          <td class="small muted">${escapeHtml(a.remarks||'')}</td>
        </tr>`).join('') || `<tr><td colspan="5"><div class="empty">कोई ऑडिट प्रविष्टि नहीं मिली।</div></td></tr>`}</tbody>
      </table></div></div>
    `;
    document.getElementById('aud-q').addEventListener('input', e=>{ q=e.target.value; draw(); });
  }
  draw();
};

/* ==================== USER & ROLE MANAGEMENT ==================== */
ROUTES['users'] = function(c){
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>प्रयोक्ता एवं कार्यक्षेत्र प्रबंधन / User &amp; Role Management</h2>
        <div class="muted small">Government Directory of Authorized Officers &amp; Citizen Portals</div>
      </div>
    </div>
    <div class="card stat-card stripe-navy" style="margin-bottom:16px;padding:0;">
      <div class="overflow-x"><table><thead><tr><th>नाम (Officer / User)</th><th>प्रयोक्ता नाम (Username)</th><th>ईमेल (Official Email)</th><th>पद (Designation Role)</th><th>कार्यक्षेत्र (Jurisdiction)</th><th>पासवर्ड</th></tr></thead>
      <tbody>${DB.users.map(u=>`<tr>
        <td><b>${escapeHtml(u.name)}</b></td>
        <td><code>${escapeHtml(u.username||'—')}</code></td>
        <td>${escapeHtml(u.email||'—')}</td>
        <td><span class="badge badge-available">${ROLES[u.role].label}</span></td>
        <td>${escapeHtml(u.title)}</td>
        <td><span class="muted small"><code>${escapeHtml(u.password||'password123')}</code></span></td>
      </tr>`).join('')}</tbody></table></div>
    </div>
    <div class="grid g2">
      <div class="card"><div class="card-title">भू-अधिग्रहण अधिकारी (Land Officer) — अधिकार क्षेत्र</div><ul class="small" style="margin:0;padding-left:18px;line-height:1.9;">
        <li>खसरा व खातेदार अभिलेखों का राजस्व सत्यापन</li><li>दस्तावेज़ अपलोड व AI आधारित विसंगति पहचान</li><li>अधिग्रहण प्रकरणों का पंजीयन व धारा 11-19 वैधानिक कार्य</li><li>प्रतिकर निर्धारण व डीबीटी अंतरण का संपादन</li></ul></div>
      <div class="card"><div class="card-title">सक्षम परियोजना प्राधिकारी (Project Authority) — अधिकार क्षेत्र</div><ul class="small" style="margin:0;padding-left:18px;line-height:1.9;">
        <li>राष्ट्रीय अवसंरचना परियोजनाओं का पंजीयन व संपादन</li><li>धारा 15 आपत्ति सुनवाई व अंतिम संस्वीकृति आदेश</li><li>PRAGATI आधारित भौतिक व वित्तीय प्रगति अद्यतन</li><li>भू-चयन निर्णय सहायता प्रणाली का उपयोग</li></ul></div>
    </div>
  `;
};