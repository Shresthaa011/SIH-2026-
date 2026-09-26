/* ==================== E-AGREEMENT WORKFLOW MODULE ==================== */
function agreementStatusBadge(s){
  const badges = {
    'Draft': '<span class="badge eagr-badge-draft">Draft (प्रारूप)</span>',
    'Sent': '<span class="badge eagr-badge-sent">Sent to Landowner (हस्ताक्षर हेतु प्रेषित)</span>',
    'Signed': '<span class="badge eagr-badge-signed">Signed by Landowner (हस्ताक्षरित)</span>',
    'Completed': '<span class="badge eagr-badge-completed">✓ Legally Executed (पूर्ण / निष्पादित)</span>'
  };
  return badges[s] || `<span class="badge">${s}</span>`;
}

function agreementStepper(current){
  const steps = ['Draft', 'Sent', 'Signed', 'Completed'];
  const labels = {
    'Draft': '1. Draft (प्रारूप)',
    'Sent': '2. Sent (प्रेषित)',
    'Signed': '3. Signed (हस्ताक्षरित)',
    'Completed': '4. Completed (पूर्ण)'
  };
  const curIdx = steps.indexOf(current);
  return `
    <div class="eagr-stepper">
      ${steps.map((st, i) => {
        const cls = i < curIdx ? 'done' : (i === curIdx ? 'active' : '');
        return `
          <div class="eagr-step ${cls}">
            <span>${i < curIdx ? '✓' : (i + 1)}</span>
            <span>${labels[st]}</span>
          </div>
          ${i < steps.length - 1 ? '<span class="eagr-step-arrow">➔</span>' : ''}
        `;
      }).join('')}
    </div>
  `;
}

ROUTES['e-agreements'] = function(c){
  let filter = 'ALL';
  let searchQuery = '';

  function draw(){
    const list = DB.agreements || [];
    const isCitizen = CURRENT_USER.role === 'LAND_OWNER';
    
    // Landowners only see agreements pertaining to them
    const accessibleList = isCitizen 
      ? list.filter(a => a.ownerId === DB.owners[0].id || a.ownerName === CURRENT_USER.name)
      : list;

    const filtered = accessibleList.filter(a => {
      const matchesFilter = filter === 'ALL' || a.status === filter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        a.id.toLowerCase().includes(q) || 
        a.khasraNo.toLowerCase().includes(q) || 
        a.ownerName.toLowerCase().includes(q) ||
        a.projectName.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    const counts = {
      ALL: accessibleList.length,
      Draft: accessibleList.filter(a => a.status === 'Draft').length,
      Sent: accessibleList.filter(a => a.status === 'Sent').length,
      Signed: accessibleList.filter(a => a.status === 'Signed').length,
      Completed: accessibleList.filter(a => a.status === 'Completed').length
    };

    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>डिजिटल भू-अधिग्रहण ई-समझौता प्रणाली / Digital E-Agreements Portal</h2>
          <div class="muted small">
            Right to Fair Compensation &amp; Transparency (RFCTLARR) Act, 2013 &bull; Digital Stamp Paper Deeds &bull; Aadhaar e-Sign &amp; Officer DSC Seal
          </div>
        </div>
        <div>
          ${(CURRENT_USER.role === 'LAND_OFFICER' || CURRENT_USER.role === 'ADMIN') ? `
            <button class="btn btn-primary btn-sm" id="btn-create-agreement">+ नया ई-समझौता प्रारूप बनाएं / Create E-Agreement</button>
          ` : ''}
        </div>
      </div>

      <!-- Statutory Pipeline Stats -->
      <div class="grid g4" style="margin-bottom:16px;">
        ${statCard('प्रारूप अवस्था (Draft)', counts.Draft, 'Pending circle officer review', '', 'stripe-navy')}
        ${statCard('खातेदार हस्ताक्षर प्रतीक्षित (Sent)', counts.Sent, 'Awaiting citizen Aadhaar e-Sign', '', 'stripe-saffron')}
        ${statCard('अधिकारी प्रति-हस्ताक्षर (Signed)', counts.Signed, 'Awaiting officer DSC seal', '', 'stripe-sky')}
        ${statCard('विधिक रूप से पूर्ण (Completed)', counts.Completed, '100% Legally Executed Deeds', '', 'stripe-green')}
      </div>

      <!-- Status Filter Tabs & Search Bar -->
      <div class="card" style="padding:14px;margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-sm ${filter==='ALL'?'btn-primary':''}" data-tab="ALL">सभी / All (${counts.ALL})</button>
            <button class="btn btn-sm ${filter==='Draft'?'btn-primary':''}" data-tab="Draft">1. Draft (${counts.Draft})</button>
            <button class="btn btn-sm ${filter==='Sent'?'btn-saffron':''}" data-tab="Sent">2. Sent (${counts.Sent})</button>
            <button class="btn btn-sm ${filter==='Signed'?'btn-primary':''}" data-tab="Signed">3. Signed (${counts.Signed})</button>
            <button class="btn btn-sm ${filter==='Completed'?'btn-primary':''}" data-tab="Completed">4. Completed (${counts.Completed})</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" id="eagr-search" placeholder="खसरा, खातेदार, प्रकरण या परियोजना खोजें..." value="${escapeHtml(searchQuery)}" style="width:260px;">
          </div>
        </div>
      </div>

      <!-- Agreements Directory Table -->
      <div class="card" style="padding:0;">
        <div class="overflow-x">
          <table>
            <thead>
              <tr>
                <th>समझौता संख्या (ID)</th>
                <th>खसरा व भूखंड</th>
                <th>खातेदार विवरण (Landowner)</th>
                <th>राष्ट्रीय अवसंरचना परियोजना</th>
                <th>प्रतिकर राशि (Compensation)</th>
                <th>प्रगति चरण (Workflow)</th>
                <th>विधिक स्थिति</th>
                <th>कार्यवाही / Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(a => `
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);white-space:nowrap;">
                    ${a.id}
                  </td>
                  <td>
                    <div style="font-weight:700;">खसरा नं. ${a.khasraNo}</div>
                    <div class="small muted">${a.parcelId} &bull; ${a.areaAcres} एकड़ (${a.landType})</div>
                    <div class="small muted">${a.village}, ${a.tehsil}</div>
                  </td>
                  <td>
                    <div style="font-weight:700;">${a.ownerName}</div>
                    <div class="small muted font-mono">UIDAI: ${a.ownerAadhaar || '—'}</div>
                    <div class="small muted">Mob: ${a.ownerPhone || '—'}</div>
                  </td>
                  <td>
                    <div style="font-weight:600;max-width:210px;">${a.projectName}</div>
                    <div class="small muted">प्रकरण: ${a.caseId}</div>
                  </td>
                  <td>
                    <div style="font-weight:700;color:var(--gov-navy);font-size:13.5px;">${fmtINR(a.totalAmount)}</div>
                    <div class="small muted">मूल मूल्य: ${fmtINR(a.marketValue)}</div>
                    <div class="small muted" style="color:var(--gov-green);">100% सोलेशियम: ${fmtINR(a.solatium)}</div>
                  </td>
                  <td>
                    ${agreementStepper(a.status)}
                    <div class="small muted" style="font-size:10px;margin-top:2px;">
                      ${a.status==='Completed' ? `पूर्ण: ${fmtDate(a.completedDate)}` : (a.status==='Signed' ? `हस्ताक्षरित: ${fmtDate(a.signedDate)}` : (a.status==='Sent' ? `प्रेषित: ${fmtDate(a.sentDate)}` : `प्रारूप: ${fmtDate(a.draftDate)}`))}
                    </div>
                  </td>
                  <td>
                    ${agreementStatusBadge(a.status)}
                  </td>
                  <td style="white-space:nowrap;">
                    ${renderAgreementActionButtons(a)}
                  </td>
                </tr>
              `).join('') || `<tr><td colspan="8"><div class="empty">इस श्रेणी में कोई ई-समझौता अभिलेख नहीं मिला।</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event bindings
    c.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { filter = btn.dataset.tab; draw(); });
    });

    const searchInput = document.getElementById('eagr-search');
    if(searchInput){
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        draw();
        const inp = document.getElementById('eagr-search');
        if(inp){ inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; }
      });
    }

    const btnCreate = document.getElementById('btn-create-agreement');
    if(btnCreate) btnCreate.addEventListener('click', openCreateAgreementModal);

    c.querySelectorAll('[data-send-owner]').forEach(b => {
      b.addEventListener('click', () => sendAgreementToOwner(b.dataset.sendOwner));
    });
    c.querySelectorAll('[data-sign-owner]').forEach(b => {
      b.addEventListener('click', () => openSignModal(b.dataset.signOwner));
    });
    c.querySelectorAll('[data-countersign-officer]').forEach(b => {
      b.addEventListener('click', () => openOfficerCounterSignModal(b.dataset.countersignOfficer));
    });
    c.querySelectorAll('[data-preview-deed]').forEach(b => {
      b.addEventListener('click', () => openDeedPreview(b.dataset.previewDeed));
    });
    c.querySelectorAll('[data-print-deed]').forEach(b => {
      b.addEventListener('click', () => {
        openDeedPreview(b.dataset.printDeed);
        setTimeout(() => window.print(), 400);
      });
    });
  }

  draw();
};

function renderAgreementActionButtons(a){
  const role = CURRENT_USER.role;
  let html = '<div style="display:flex;flex-direction:column;gap:5px;">';

  if(a.status === 'Draft'){
    if(role === 'LAND_OFFICER' || role === 'ADMIN'){
      html += `<button class="btn btn-sm btn-saffron" data-send-owner="${a.id}">हस्ताक्षर हेतु भेजें / Send →</button>`;
    }
    html += `<button class="btn btn-sm" data-preview-deed="${a.id}">प्रारूप देखें / Preview</button>`;
  } else if(a.status === 'Sent'){
    if(role === 'LAND_OWNER' || role === 'ADMIN'){
      html += `<button class="btn btn-sm btn-saffron" data-sign-owner="${a.id}" style="font-weight:700;">✍ ई-हस्ताक्षर करें / e-Sign</button>`;
    } else {
      html += `<button class="btn btn-sm" disabled title="Awaiting citizen signature">खातेदार हस्ताक्षर प्रतीक्षित</button>`;
    }
    html += `<button class="btn btn-sm" data-preview-deed="${a.id}">समझौता देखें / Preview</button>`;
  } else if(a.status === 'Signed'){
    if(role === 'LAND_OFFICER' || role === 'ADMIN'){
      html += `<button class="btn btn-sm btn-primary" data-countersign-officer="${a.id}" style="font-weight:700;">अधिकारी प्रति-हस्ताक्षर / Seal</button>`;
    } else {
      html += `<span class="small muted" style="color:var(--gov-green);">✓ आपके हस्ताक्षर दर्ज</span>`;
    }
    html += `<button class="btn btn-sm" data-preview-deed="${a.id}">समझौता देखें / Preview</button>`;
  } else if(a.status === 'Completed'){
    html += `<button class="btn btn-sm btn-primary" data-preview-deed="${a.id}">विलेख देखें / Preview Deed</button>`;
    html += `<button class="btn btn-sm" data-print-deed="${a.id}" title="Download or Print Non-Judicial Deed">प्रिंट / PDF डाउनलोड</button>`;
  }

  html += '</div>';
  return html;
}

function openCreateAgreementModal(){
  const parcels = DB.parcels.filter(p => !p.agreementId);
  openModal(`
    <div class="eagr-deed-header">
      <div style="font-weight:700;font-size:14px;">नया ई-समझौता प्रारूप तैयार करें / Draft New E-Agreement</div>
      <button class="btn btn-sm" onclick="closeModal()" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3);">✕</button>
    </div>
    <div style="padding:18px 22px;">
      <p class="small muted" style="margin-bottom:14px;">RFCTLARR अधिनियम, 2013 की धारा 23/30 के अंतर्गत भू-स्वामी के साथ समझौता विलेख तैयार करें:</p>
      
      <div class="formrow">
        <label>अधिग्रहीत खसरा भूखंड चुनें / Select Parcel</label>
        <select id="neagr-parcel" style="width:100%;">
          <option value="">-- खसरा भूखंड चुनें --</option>
          ${parcels.slice(0,35).map(p => `
            <option value="${p.id}" data-khasra="${p.surveyNumber}" data-owner="${p.ownerId}" data-area="${p.area}" data-type="${p.landType}" data-village="${p.village}" data-tehsil="${p.tehsil||'Huzur'}" data-district="${p.district}" data-project="${p.projectId||''}">
              ${p.id} — खसरा ${p.surveyNumber} &bull; ${p.village} (${p.area} एकड़)
            </option>
          `).join('')}
        </select>
      </div>

      <div class="two-col">
        <div class="formrow">
          <label>भू-स्वामी का नाम (Landowner)</label>
          <input type="text" id="neagr-owner-name" placeholder="खसरा चयन पर स्वतः भरेगा" readonly style="background:#f1f5f9 !important;">
        </div>
        <div class="formrow">
          <label>संबद्ध परियोजना (Project)</label>
          <input type="text" id="neagr-project-name" placeholder="परियोजना" readonly style="background:#f1f5f9 !important;">
        </div>
      </div>

      <div class="two-col">
        <div class="formrow">
          <label>भूमि मूल बाजार मूल्य (₹ Market Value)</label>
          <input type="number" id="neagr-market-val" value="5000000" min="100000">
        </div>
        <div class="formrow">
          <label>धारा 30(1) सोलेशियम (100% Solatium)</label>
          <input type="text" id="neagr-solatium" value="₹50,00,000" readonly style="background:#f1f5f9 !important;font-weight:700;color:var(--gov-green) !important;">
        </div>
      </div>

      <div class="two-col">
        <div class="formrow">
          <label>धारा 30(3) अतिरिक्त ब्याज (12% Interest)</label>
          <input type="text" id="neagr-interest" value="₹6,00,000" readonly style="background:#f1f5f9 !important;">
        </div>
        <div class="formrow">
          <label>कुल देय प्रतिकर राशि (Total Compensation)</label>
          <input type="text" id="neagr-total" value="₹1,06,00,000" readonly style="background:#f0fdf4 !important;font-weight:700;color:var(--gov-navy) !important;font-size:14px;">
        </div>
      </div>

      <div class="formrow">
        <label>पुनर्वासन एवं व्यवस्थापन शर्तें (R&amp;R Terms under Schedule II)</label>
        <textarea id="neagr-rehab" rows="2">RFCTLARR Schedule II R&R Entitlement Card issued; One-time resettlement allowance ₹50,000.</textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
        <button class="btn" onclick="closeModal()">रद्द करें / Cancel</button>
        <button class="btn btn-primary" id="neagr-submit">प्रारूप सहेजें / Create Draft</button>
      </div>
    </div>
  `);

  const pSelect = document.getElementById('neagr-parcel');
  const ownerInput = document.getElementById('neagr-owner-name');
  const projInput = document.getElementById('neagr-project-name');
  const mktInput = document.getElementById('neagr-market-val');
  const solInput = document.getElementById('neagr-solatium');
  const intInput = document.getElementById('neagr-interest');
  const totInput = document.getElementById('neagr-total');

  function recalc(){
    const mv = parseFloat(mktInput.value) || 0;
    const sol = mv;
    const interest = Math.round(mv * 0.12);
    const tot = mv + sol + interest;
    solInput.value = fmtINR(sol);
    intInput.value = fmtINR(interest);
    totInput.value = fmtINR(tot);
  }

  mktInput.addEventListener('input', recalc);

  pSelect.addEventListener('change', () => {
    const opt = pSelect.options[pSelect.selectedIndex];
    if(!opt.value) return;
    const owner = DB.owners.find(o => o.id === opt.dataset.owner);
    ownerInput.value = owner ? owner.name : 'Unknown Owner';
    const proj = DB.projects.find(pr => pr.id === opt.dataset.project);
    projInput.value = proj ? proj.name : 'Central Corridor Highway Project';
    const area = parseFloat(opt.dataset.area) || 2.0;
    mktInput.value = Math.round(area * 2500000);
    recalc();
  });

  document.getElementById('neagr-submit').addEventListener('click', () => {
    const opt = pSelect.options[pSelect.selectedIndex];
    if(!opt.value){
      alert('कृपया खसरा भूखंड चुनें।');
      return;
    }
    const mv = parseFloat(mktInput.value) || 0;
    const sol = mv;
    const interest = Math.round(mv * 0.12);
    const tot = mv + sol + interest;
    const newId = 'EAGR-2026-' + String((DB.agreements||[]).length + 1).padStart(3, '0');
    
    const newAgr = {
      id: newId,
      parcelId: opt.value,
      khasraNo: opt.dataset.khasra,
      caseId: 'CASE-' + String(rint(1,20)).padStart(3,'0'),
      projectId: opt.dataset.project || 'PRJ-001',
      projectName: projInput.value,
      ownerId: opt.dataset.owner,
      ownerName: ownerInput.value,
      ownerAadhaar: 'XXXX-XXXX-' + rint(1000,9999),
      ownerPhone: '9' + rint(100000000,999999999),
      officerName: CURRENT_USER.name,
      officerDesignation: CURRENT_USER.title || 'Land Acquisition Officer',
      tehsil: opt.dataset.tehsil,
      district: opt.dataset.district,
      village: opt.dataset.village,
      areaAcres: opt.dataset.area,
      landType: opt.dataset.type,
      marketValue: mv,
      solatium: sol,
      interest: interest,
      totalAmount: tot,
      rehabTerms: document.getElementById('neagr-rehab').value,
      status: 'Draft',
      draftDate: todayISO(),
      sentDate: null,
      signedDate: null,
      completedDate: null,
      ownerSignature: null,
      officerSignature: null,
      auditTrail: [
        { action: 'Initial Agreement Drafted by Officer', user: CURRENT_USER.name, timestamp: new Date().toLocaleString('en-IN') + ' IST' }
      ]
    };

    DB.agreements.unshift(newAgr);
    const p = parcelById(opt.value);
    if(p) p.agreementId = newId;
    addAudit(`New E-Agreement Draft ${newId} created`, 'agreement', newId, `Parcel ${opt.value}`);
    saveDB();
    closeModal();
    toast(`ई-समझौता प्रारूप ${newId} सफलतापूर्वक बनाया गया।`);
    navigate('e-agreements');
  });
}

function sendAgreementToOwner(agrId){
  const a = (DB.agreements||[]).find(x => x.id === agrId);
  if(!a) return;
  if(confirm(`क्या आप समझौता संख्या ${a.id} (खसरा ${a.khasraNo}) को खातेदार ${a.ownerName} के पोर्टल पर डिजिटल हस्ताक्षर हेतु प्रेषित करना चाहते हैं?`)){
    a.status = 'Sent';
    a.sentDate = new Date().toLocaleString('en-IN') + ' IST';
    a.auditTrail.push({
      action: 'Dispatched to Landowner Portal for Digital Signature',
      user: CURRENT_USER.name,
      timestamp: a.sentDate
    });
    addAudit(`Agreement ${a.id} sent to landowner`, 'agreement', a.id, `Sent to ${a.ownerName}`);
    saveDB();
    toast(`ई-समझौता ${a.id} खातेदार ${a.ownerName} को प्रेषित किया गया।`);
    navigate('e-agreements');
  }
}

function openSignModal(agrId){
  const a = (DB.agreements||[]).find(x => x.id === agrId);
  if(!a) return;

  let simulatedOtp = '';
  openModal(`
    <div class="eagr-deed-header">
      <div style="font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;">
        <span>✍</span> डिजिटल ई-हस्ताक्षर प्रमाणीकरण / Landowner E-Signature
      </div>
      <button class="btn btn-sm" onclick="closeModal()" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3);">✕</button>
    </div>
    <div style="padding:20px 24px;">
      <!-- Agreement Summary Chip -->
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:12px 14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-weight:700;color:var(--gov-navy);font-size:13px;">${a.id} &bull; खसरा नं. ${a.khasraNo}</span>
          <span style="font-weight:700;color:var(--gov-green);font-size:13.5px;">${fmtINR(a.totalAmount)}</span>
        </div>
        <div class="small muted">${a.village}, ${a.tehsil}, ${a.district} &bull; ${a.areaAcres} एकड़ &bull; ${a.projectName}</div>
      </div>

      <!-- Statutory Declaration -->
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;margin-bottom:16px;cursor:pointer;">
        <input type="checkbox" id="sign-declare" checked style="margin-top:2px;">
        <span>
          <b>विधिक घोषणा:</b> मैं (${a.ownerName}) प्रमाणित करता/करती हूँ कि मैंने अधिग्रहण विलेख व प्रतिकर निर्धारण पढ़ लिया है। मैं स्वेच्छा से अपनी सहमति व्यक्त करता हूँ तथा धारा 23/30 RFCTLARR Act 2013 के अंतर्गत इस विलेख पर डिजिटल हस्ताक्षर अंकित कर रहा हूँ।
        </span>
      </label>

      <!-- Signature Method Tabs -->
      <div class="sso-tabs" style="margin-bottom:14px;">
        <button type="button" class="sso-tab active" id="tab-sign-aadhaar">विधि 1: आधार ई-हस्ताक्षर (Aadhaar OTP)</button>
        <button type="button" class="sso-tab" id="tab-sign-canvas">विधि 2: टच/माउस हस्ताक्षर (Canvas Stylus)</button>
      </div>

      <!-- Aadhaar Method Form -->
      <div id="sign-pane-aadhaar">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;padding:12px;margin-bottom:14px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span>पंजीकृत आधार: <b>${a.ownerAadhaar}</b></span>
            <span>लिंक्ड मोबाइल: <b>+91 ******${a.ownerPhone.slice(-4)}</b></span>
          </div>
          <div class="small muted">UIDAI e-KYC एवं भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 के अंतर्गत मान्य डिजिटल हस्ताक्षर।</div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
          <button type="button" class="btn btn-sm btn-primary" id="btn-get-otp">ओटीपी प्राप्त करें / Get OTP</button>
          <span id="otp-status-msg" class="small muted">बटन पर क्लिक करके 6 अंकों का सुरक्षित OTP प्राप्त करें</span>
        </div>

        <div class="formrow" id="otp-input-row" style="display:none;">
          <label>प्रविष्ट करें 6-अंकीय आधार OTP (Security OTP)</label>
          <div style="display:flex;gap:10px;">
            <input type="text" id="sign-otp-code" placeholder="उदा. 482910" maxlength="6" style="letter-spacing:4px;font-family:var(--font-mono);font-size:16px;font-weight:700;width:160px;">
            <button type="button" class="btn btn-saffron" id="btn-verify-affix-otp" style="font-weight:700;">हस्ताक्षर अंकित करें / Affix e-Sign</button>
          </div>
        </div>
      </div>

      <!-- Canvas Method Form -->
      <div id="sign-pane-canvas" style="display:none;">
        <div class="small muted" style="margin-bottom:6px;">नीचे दिए गए पैड में माउस या टच स्क्रीन का उपयोग कर अपने हस्ताक्षर बनाएं:</div>
        <div style="border:1px solid #94a3b8;border-radius:4px;background:#ffffff;margin-bottom:8px;">
          <canvas id="sig-pad-canvas" width="430" height="130" style="display:block;width:100%;cursor:crosshair;touch-action:none;"></canvas>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button type="button" class="btn btn-sm" id="btn-clear-canvas">↺ मिटाएं / Clear</button>
          <button type="button" class="btn btn-sm btn-saffron" id="btn-verify-affix-canvas" style="font-weight:700;">हस्ताक्षर सुरक्षित करें / Affix Signature</button>
        </div>
      </div>
    </div>
  `);

  const tabAadhaar = document.getElementById('tab-sign-aadhaar');
  const tabCanvas = document.getElementById('tab-sign-canvas');
  const paneAadhaar = document.getElementById('sign-pane-aadhaar');
  const paneCanvas = document.getElementById('sign-pane-canvas');

  tabAadhaar.addEventListener('click', () => {
    tabAadhaar.classList.add('active'); tabCanvas.classList.remove('active');
    paneAadhaar.style.display = 'block'; paneCanvas.style.display = 'none';
  });
  tabCanvas.addEventListener('click', () => {
    tabCanvas.classList.add('active'); tabAadhaar.classList.remove('active');
    paneCanvas.style.display = 'block'; paneAadhaar.style.display = 'none';
    initCanvas();
  });

  // Aadhaar OTP simulation
  const btnGetOtp = document.getElementById('btn-get-otp');
  const otpRow = document.getElementById('otp-input-row');
  const otpStatus = document.getElementById('otp-status-msg');
  const otpInput = document.getElementById('sign-otp-code');

  btnGetOtp.addEventListener('click', () => {
    simulatedOtp = String(rint(100000, 999999));
    otpRow.style.display = 'block';
    otpStatus.innerHTML = `<span style="color:var(--gov-green);font-weight:700;">✓ OTP प्रेषित! Demo OTP: ${simulatedOtp}</span>`;
    otpInput.value = simulatedOtp;
    toast(`UIDAI e-Sign OTP: ${simulatedOtp} (demo auto-filled)`);
    otpInput.focus();
  });

  document.getElementById('btn-verify-affix-otp').addEventListener('click', () => {
    if(!document.getElementById('sign-declare').checked){
      alert('कृपया विधिक घोषणा पर सहमति व्यक्त करें।');
      return;
    }
    const entered = otpInput.value.trim();
    if(entered !== simulatedOtp && entered.length < 4){
      alert('अमान्य OTP! कृपया मान्य कोड प्रविष्ट करें।');
      return;
    }
    affixSignatureSuccess('Aadhaar e-Sign (UIDAI OTP)');
  });

  // Canvas Drawing
  let canvas, ctx, isDrawing = false;
  function initCanvas(){
    canvas = document.getElementById('sig-pad-canvas');
    if(!canvas) return;
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0a2e5c';

    function getPos(e){
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if(e.touches && e.touches[0]){
        return { x: (e.touches[0].clientX - rect.left)*scaleX, y: (e.touches[0].clientY - rect.top)*scaleY };
      }
      return { x: (e.clientX - rect.left)*scaleX, y: (e.clientY - rect.top)*scaleY };
    }

    canvas.onmousedown = (e)=>{ isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    canvas.onmousemove = (e)=>{ if(!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    window.onmouseup = ()=>{ isDrawing = false; };

    canvas.ontouchstart = (e)=>{ e.preventDefault(); isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    canvas.ontouchmove = (e)=>{ e.preventDefault(); if(!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    canvas.ontouchend = ()=>{ isDrawing = false; };

    document.getElementById('btn-clear-canvas').onclick = ()=>{ ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }

  document.getElementById('btn-verify-affix-canvas').addEventListener('click', () => {
    if(!document.getElementById('sign-declare').checked){
      alert('कृपया विधिक घोषणा पर सहमति व्यक्त करें।');
      return;
    }
    affixSignatureSuccess('Digital Stylus / Touch Signature');
  });

  function affixSignatureSuccess(method){
    const now = new Date().toLocaleString('en-IN') + ' IST';
    const hash = 'SHA256: ' + Array.from({length:32}, ()=> Math.floor(Math.random()*16).toString(16)).join('');
    
    a.status = 'Signed';
    a.signedDate = now;
    a.ownerSignature = {
      method,
      signer: a.ownerName,
      timestamp: now,
      certHash: hash,
      ip: '103.24.' + rint(10,250) + '.' + rint(1,254)
    };
    a.auditTrail.push({
      action: `Digitally Signed by Landowner via ${method}`,
      user: `${a.ownerName} (Landowner)`,
      timestamp: now
    });

    addAudit(`Agreement ${a.id} signed by owner`, 'agreement', a.id, `Signed via ${method}`);
    saveDB();
    closeModal();
    toast(`ई-समझौता ${a.id} पर आपके डिजिटल हस्ताक्षर सफलता पूर्वक अंकित किए गए।`);
    navigate('e-agreements');
  }
}

function openOfficerCounterSignModal(agrId){
  const a = (DB.agreements||[]).find(x => x.id === agrId);
  if(!a) return;

  openModal(`
    <div class="eagr-deed-header">
      <div style="font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;">
        <span>🛡️</span> सक्षम प्राधिकारी प्रति-हस्ताक्षर व मुहर / Officer Counter-Signature
      </div>
      <button class="btn btn-sm" onclick="closeModal()" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3);">✕</button>
    </div>
    <div style="padding:20px 24px;">
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:12px 14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-weight:700;color:var(--gov-navy);">${a.id} &bull; खसरा नं. ${a.khasraNo}</span>
          <span class="badge eagr-badge-signed">खातेदार हस्ताक्षरित: ${fmtDate(a.signedDate)}</span>
        </div>
        <div class="small muted">खातेदार: <b>${a.ownerName}</b> &bull; प्रतिकर राशि: <b>${fmtINR(a.totalAmount)}</b></div>
      </div>

      <div class="formrow">
        <label>हस्ताक्षरकर्ता अधिकारी (Signatory Officer)</label>
        <input type="text" value="${CURRENT_USER.name} (${CURRENT_USER.title})" readonly style="background:#f1f5f9 !important;">
      </div>

      <div class="formrow">
        <label>डिजिटल टोकन प्रमाणपत्र (Class-3 DSC Token)</label>
        <select id="officer-dsc-token" style="width:100%;">
          <option value="GOI-NIC-DSC-2026-9931">e-Pass2003: NIC Class-3 Signing Certificate (Serial #9931-Valid till 2028)</option>
          <option value="GOI-NIC-DSC-2026-4412">ProxKey: Revenue Dept Officer Seal (Serial #4412-Valid till 2029)</option>
        </select>
      </div>

      <div class="two-col">
        <div class="formrow">
          <label>टोकन पिन (Token PIN)</label>
          <input type="password" id="officer-pin" value="123456" style="font-family:var(--font-mono);font-size:15px;letter-spacing:3px;">
        </div>
        <div class="formrow">
          <label>विभागीय मुहर (Official Seal)</label>
          <input type="text" value="Office of LAO, Circle-I, Bhopal" readonly style="background:#f1f5f9 !important;font-size:11.5px;">
        </div>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:10px 12px;font-size:11.5px;color:#166534;margin-bottom:16px;">
        <b>विधिक प्रभाव:</b> इस कार्यवाही से ई-समझौता पूर्ण रूप से निष्पादित होकर केंद्रीय विलेख भंडार (National Deed Vault) में सुरक्षित रूप से दर्ज हो जाएगा।
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn" onclick="closeModal()">रद्द करें / Cancel</button>
        <button class="btn btn-primary" id="btn-confirm-officer-seal" style="font-weight:700;">प्रति-हस्ताक्षर व मुहर अंकित करें / Seal &amp; Complete →</button>
      </div>
    </div>
  `);

  document.getElementById('btn-confirm-officer-seal').addEventListener('click', () => {
    const pin = document.getElementById('officer-pin').value;
    if(!pin){
      alert('कृपया टोकन पिन प्रविष्ट करें।');
      return;
    }
    const token = document.getElementById('officer-dsc-token').value;
    const now = new Date().toLocaleString('en-IN') + ' IST';
    const hash = 'SHA256: ' + Array.from({length:32}, ()=> Math.floor(Math.random()*16).toString(16)).join('');

    a.status = 'Completed';
    a.completedDate = now;
    a.officerSignature = {
      method: 'e-Token DSC Class-3 Seal',
      signer: `${CURRENT_USER.name} (${CURRENT_USER.title})`,
      tokenSerial: token,
      timestamp: now,
      certHash: hash,
      seal: 'OFFICE OF THE COMPETENT AUTHORITY & LAO, BHOPAL CIRCLE'
    };

    a.auditTrail.push({
      action: 'Counter-Signed & Sealed with Official Government DSC Token',
      user: `${CURRENT_USER.name} (LAO)`,
      timestamp: now
    });
    a.auditTrail.push({
      action: 'Deed Registered in Central E-Agreement Vault with Immutable Hash',
      user: 'System / NIC',
      timestamp: now
    });

    addAudit(`Agreement ${a.id} completed and sealed`, 'agreement', a.id, `Counter-signed by ${CURRENT_USER.name}`);
    saveDB();
    closeModal();
    toast(`ई-समझौता ${a.id} पर सक्षम प्राधिकारी की मुहर व प्रति-हस्ताक्षर सफलतापूर्वक दर्ज किए गए।`);
    navigate('e-agreements');
  });
}

function openDeedPreview(agrId){
  const a = (DB.agreements||[]).find(x => x.id === agrId);
  if(!a) return;

  openModal(`
    <div class="eagr-deed-modal">
      <div class="eagr-deed-header">
        <div>
          <div style="font-weight:700;font-size:15px;letter-spacing:.02em;">राष्ट्रीय ई-समझौता विलेख / Official Statutory Deed</div>
          <div class="small" style="color:#cbd5e1;font-family:var(--font-mono);margin-top:2px;">Certificate No: IN-MP2026-${a.id}-8849</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm btn-saffron" onclick="window.print()" title="Print deed as official stamp paper">🖨 प्रिंट / Print Deed</button>
          <button class="btn btn-sm" onclick="closeModal()" style="background:transparent;color:#ffffff;border-color:rgba(255,255,255,.3);">✕ बंद करें</button>
        </div>
      </div>

      <div class="eagr-deed-body" id="printable-deed">
        <!-- Lion Capital Header -->
        <div class="eagr-stamp-header">
          <div style="display:flex;justify-content:center;margin-bottom:8px;">
            <svg class="ashoka-svg" viewBox="0 0 100 130" width="46" height="58" xmlns="http://www.w3.org/2000/svg">
              <g fill="#c59b27" stroke="#8c6d1a" stroke-width="1.2">
                <path d="M50 8 C42 8 36 14 36 22 C36 28 40 33 46 35 C42 37 38 42 38 48 C38 56 44 62 50 63 C56 62 62 56 62 48 C62 42 58 37 54 35 C60 33 64 28 64 22 C64 14 58 8 50 8 Z"/>
              </g>
              <rect x="18" y="65" width="64" height="14" rx="2" fill="#d4af37" stroke="#8c6d1a" stroke-width="1.2"/>
              <circle cx="50" cy="72" r="5.5" fill="none" stroke="#0a2e5c" stroke-width="1.5"/>
              <text x="50" y="103" text-anchor="middle" font-size="8.5" font-family="'Noto Sans Devanagari', sans-serif" font-weight="700" fill="#0a2e5c">सत्यमेव जयते</text>
            </svg>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--gov-saffron);letter-spacing:.08em;">मध्य प्रदेश शासन &bull; राजस्व विभाग</div>
          <div class="eagr-stamp-title">वैधानिक ई-समझौता अधिग्रहण विलेख (E-STAMP DEED)</div>
          <div class="eagr-stamp-sub">
            भूमि अर्जन, पुनर्वासन और पुनर्व्यवस्थापन में उचित प्रतिकर और पारदर्शिता का अधिकार अधिनियम, 2013 (धारा 23/30/31)
          </div>
        </div>

        <div class="eagr-cert-box">
          <span>विलेख आईडी: <b>${a.id}</b></span>
          <span>प्रकरण: <b>${a.caseId}</b></span>
          <span>स्थिति: <b>${a.status.toUpperCase()}</b></span>
        </div>

        <!-- Preamble -->
        <div class="eagr-clause">
          <span class="eagr-clause-num">1. पक्षकार (Parties):</span>
          यह समझौता विलेख आज दिनांक <b>${a.completedDate || a.signedDate || todayISO()}</b> को प्रथम पक्षकार <b>मध्य प्रदेश के राज्यपाल</b> की ओर से सक्षम प्राधिकारी एवं भू-अधिग्रहण अधिकारी (वृत्त-भोपाल) तथा द्वितीय पक्षकार <b>श्री/श्रीमती ${a.ownerName}</b> (खातेदार/भू-स्वामी), धारक आधार संख्या ${a.ownerAadhaar} के मध्य निष्पादित किया जाता है।
        </div>

        <!-- Property Schedule -->
        <div class="eagr-clause">
          <span class="eagr-clause-num">2. अधिग्रहीत संपत्ति की अनुसूची (Schedule of Acquired Land):</span>
          परियोजना <b>"${a.projectName}"</b> के लोक प्रयोजन हेतु निम्नलिखित भूमि का अर्जन किया जा रहा है:
          <table style="margin:8px 0;font-size:12px;">
            <tr style="background:#f1f5f9;">
              <th>ज़िला</th><th>तहसील</th><th>ग्राम</th><th>खसरा संख्या</th><th>क्षेत्रफल</th><th>भूमि प्रकार</th>
            </tr>
            <tr>
              <td>${a.district}</td><td>${a.tehsil}</td><td>${a.village}</td><td><b>${a.khasraNo}</b></td><td>${a.areaAcres} एकड़</td><td>${a.landType}</td>
            </tr>
          </table>
        </div>

        <!-- Compensation Table -->
        <div class="eagr-clause">
          <span class="eagr-clause-num">3. वैधानिक प्रतिकर का विवरण (Statutory Compensation Calculation):</span>
          अधिनियम की धारा 26, 27, 28, 29 एवं 30 के अनुसार प्रतिकर का निर्धारण निम्नानुसार नियत किया गया है:
          <table style="margin:8px 0;font-size:12px;">
            <tr><td>1. बाजार मूल्य अनुसार मूल भूमि का मूल्य (Market Value):</td><td style="font-weight:700;text-align:right;">${fmtINR(a.marketValue)}</td></tr>
            <tr><td>2. धारा 30(1) अनुसार 100% सोलेशियम तुष्टि राशि (100% Solatium):</td><td style="font-weight:700;text-align:right;color:var(--gov-green);">${fmtINR(a.solatium)}</td></tr>
            <tr><td>3. धारा 30(3) अनुसार 12% प्रतिवर्ष अतिरिक्त देय ब्याज:</td><td style="font-weight:700;text-align:right;">${fmtINR(a.interest)}</td></tr>
            <tr style="background:#f8fafc;border-top:2px solid #0a2e5c;font-size:13px;">
              <td><b>कुल देय एवार्ड राशि (Total Payable Award):</b></td>
              <td style="font-weight:700;text-align:right;color:var(--gov-navy);font-size:14px;">${fmtINR(a.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- R&R Terms -->
        <div class="eagr-clause">
          <span class="eagr-clause-num">4. पुनर्वासन एवं पुनर्व्यवस्थापन शर्तें (R&amp;R Package):</span>
          द्वितीय पक्षकार को अधिनियम की द्वितीय अनुसूची के अनुरूप निम्नलिखित पात्रताएं प्राप्त होंगी:
          <div style="background:#f8fafc;padding:8px 12px;border-left:3px solid var(--gov-saffron);margin:6px 0;font-size:12px;">
            ${escapeHtml(a.rehabTerms)}
          </div>
        </div>

        <!-- Signatures Box -->
        <div class="eagr-signatures">
          <!-- Landowner Sig -->
          <div class="eagr-sig-card ${a.ownerSignature ? 'signed' : ''}">
            <div class="eagr-sig-status" style="color:${a.ownerSignature?'#15803d':'#b45309'};">
              <span>${a.ownerSignature ? '✓ प्रमाणित डिजिटल हस्ताक्षर' : '⏳ हस्ताक्षर प्रतीक्षित'}</span>
            </div>
            <div style="font-weight:700;font-size:13px;color:var(--gov-navy);">${a.ownerName}</div>
            <div class="small muted">भू-स्वामी / खातेदार (Second Party)</div>
            ${a.ownerSignature ? `
              <div style="margin-top:6px;font-size:10.5px;font-family:var(--font-mono);color:#334155;border-top:1px dashed #cbd5e1;padding-top:4px;">
                <div>विधि: ${a.ownerSignature.method}</div>
                <div>तिथि: ${a.ownerSignature.timestamp}</div>
                <div style="word-break:break-all;">प्रमाण: ${a.ownerSignature.certHash.slice(0,24)}...</div>
              </div>
            ` : '<div class="small muted" style="font-style:italic;margin-top:8px;">Aadhaar e-Sign Pending</div>'}
          </div>

          <!-- Officer Sig -->
          <div class="eagr-sig-card ${a.officerSignature ? 'signed' : ''}">
            <div class="eagr-sig-status" style="color:${a.officerSignature?'#15803d':'#b45309'};">
              <span>${a.officerSignature ? '✓ सक्षम प्राधिकारी मुहर व DSC' : '⏳ मुहर व प्रति-हस्ताक्षर प्रतीक्षित'}</span>
            </div>
            <div style="font-weight:700;font-size:13px;color:var(--gov-navy);">${a.officerName}</div>
            <div class="small muted">${a.officerDesignation}</div>
            ${a.officerSignature ? `
              <div style="margin-top:6px;font-size:10.5px;font-family:var(--font-mono);color:#334155;border-top:1px dashed #cbd5e1;padding-top:4px;">
                <div>टोकन: ${a.officerSignature.tokenSerial}</div>
                <div>तिथि: ${a.officerSignature.timestamp}</div>
                <div style="word-break:break-all;">मुहर: ${a.officerSignature.seal}</div>
              </div>
            ` : '<div class="small muted" style="font-style:italic;margin-top:8px;">Officer DSC Pending</div>'}
          </div>
        </div>

        <!-- Verification Footer -->
        <div style="margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:10.5px;color:#64748b;">
          <div>
            <b>TerraByte National Land Records Registry</b> &bull; GIGW 3.0 &bull; Tamper Evident
          </div>
          <div style="font-family:var(--font-mono);">
            SHA-256 Seal: 8a4c9f1...77e02 | NIC Cert Validated
          </div>
        </div>
      </div>
    </div>
  `);
}