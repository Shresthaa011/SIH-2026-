/* ==================== CASES & DETAIL ==================== */
ROUTES['cases'] = function(c){
  let filter = '';
  function draw(){
    const rows = DB.cases.filter(k=> !filter || k.status===filter);
    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>भू-अधिग्रहण प्रकरण / Acquisition Cases (RFCTLARR 2013)</h2>
          <div class="muted small">${rows.length} सक्रिय प्रकरण &bull; Statutory 10-Stage Monitoring</div>
        </div>
      </div>
      <div class="filterbar">
        <select id="case-filter"><option value="">सभी चरण (All Stages)</option>${WORKFLOW_STATES.map(s=>`<option value="${s}" ${filter===s?'selected':''}>${WORKFLOW_LABELS[s]}</option>`).join('')}</select>
      </div>
      <div class="card" style="padding:0;"><div class="overflow-x"><table>
        <thead><tr><th>प्रकरण संख्या (Case ID)</th><th>खसरा संख्या</th><th>राष्ट्रीय परियोजना</th><th>खातेदार (Owner)</th><th>अधिग्रहण चरण (Stage)</th><th>अधिसूचना तिथि</th><th>कार्यवाही</th></tr></thead>
        <tbody>${rows.map(k=>{ const p=parcelById(k.parcelId); return `
          <tr><td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);">${k.id}</td><td><b>${k.parcelId}</b></td><td>${projectName(k.projectId)}</td>
          <td>${ownerName(p.ownerId)}</td><td>${workflowBadge(k.status)}</td><td>${fmtDate(k.createdAt)}</td>
          <td><button class="btn btn-sm btn-primary" data-open="${k.id}">खोलें / Open</button></td></tr>`; }).join('') || `<tr><td colspan="7"><div class="empty">इस चरण में कोई प्रकरण नहीं है।</div></td></tr>`}
        </tbody></table></div></div>
    `;
    c.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click', ()=>navigate('case-detail', b.dataset.open)));
    document.getElementById('case-filter').addEventListener('change', e=>{ filter=e.target.value; draw(); });
  }
  draw();
};

ROUTES['case-detail'] = function(c, id){
  const k = caseById(id);
  if(!k){ c.innerHTML='<div class="empty">प्रकरण नहीं मिला / Case not found.</div>'; return; }
  draw();
  function draw(){
    const p = parcelById(k.parcelId);
    const docs = docsForCase(k.id);
    const approvals = approvalsForCase(k.id);
    const comp = compForCase(k.id);
    const next = WORKFLOW_NEXT[k.status];
    const canAdvance = (CURRENT_USER.role==='LAND_OFFICER'||CURRENT_USER.role==='ADMIN'||CURRENT_USER.role==='PROJECT_AUTHORITY');
    const blockers = [];
    if(k.status==='VERIFICATION' && docs.some(d=>d.status!=='Verified')) blockers.push('दस्तावेज़ सत्यापन पूर्ण होना अनिवार्य है (All documents must be Verified).');
    if(k.status==='OBJECTION_REVIEW' && (CURRENT_USER.role!=='PROJECT_AUTHORITY' && CURRENT_USER.role!=='ADMIN')) blockers.push('सक्षम प्राधिकारी ही इस चरण का अनुमोदन कर सकते हैं।');

    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>प्रकरण संख्या: ${k.id}</h2>
          <div class="muted small">खसरा ${p.id} &bull; ${projectName(k.projectId)} &bull; खातेदार: ${ownerName(p.ownerId)}</div>
        </div>
        <div style="display:flex;gap:8px;">${workflowBadge(k.status)}<button class="btn btn-sm btn-primary" id="btn-parcel">खसरा देखें / View Parcel</button></div>
      </div>
      <div class="card stat-card stripe-navy" style="margin-bottom:14px;overflow-x:auto;">
        <div class="card-title">वैधानिक चरण प्रगति / Statutory Workflow Progression</div>
        ${renderStepper(k.status)}
        ${next ? `<div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
          <button class="btn btn-saffron btn-sm" id="btn-advance" ${!canAdvance||blockers.length?'disabled':''}>अगले चरण “${WORKFLOW_LABELS[next]}” पर अग्रसारित करें</button>
          ${blockers.length? `<span class="small" style="color:var(--clay);font-weight:600;">⚠ ${blockers[0]}</span>`:''}
        </div>` : `<div class="small" style="color:var(--gov-green);margin-top:10px;font-weight:700;">✓ यह प्रकरण पूर्ण हो चुका है (Acquisition &amp; Handover Completed).</div>`}
      </div>
      <div class="grid g2">
        <div class="card">
          <div class="card-title">कार्यवाही इतिहास / Action History</div>
          ${k.history.map(h=>`<div class="timeline-item"><div class="timeline-dot"></div><div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--gov-navy);">${WORKFLOW_LABELS[h.status]}</div><div class="small muted">${escapeHtml(h.user)} &bull; ${fmtDate(h.date)}</div></div></div>`).join('')}
        </div>
        <div class="card">
          <div class="card-title">संलग्न राजस्व दस्तावेज़ (${docs.length})</div>
          ${docs.map(d=>`<div class="kv" data-doc="${d.id}"><span>${d.type}</span><span>${docStatusBadge(d.status)}</span></div>`).join('') || '<div class="small muted">कोई दस्तावेज़ संलग्न नहीं है।</div>'}
          <button class="btn btn-sm btn-primary" style="margin-top:10px;" id="btn-goto-docs">दस्तावेज़ सत्यापन पोर्टल / Verification Portal</button>
        </div>
      </div>
      <div class="grid g2" style="margin-top:14px;">
        <div class="card">
          <div class="card-title">सक्षम अनुमोदन / Competent Authority Approvals</div>
          ${approvals.length? approvals.map(a=>`<div class="kv"><span>${a.approver}</span><span>${a.decision} &bull; ${fmtDate(a.date)}</span></div>`).join('') : '<div class="small muted">अनुमोदन अभी शेष है।</div>'}
          ${approvals.length? `<div class="small muted" style="margin-top:8px;">"${escapeHtml(approvals[0].remarks)}"</div>`:''}
        </div>
        <div class="card">
          <div class="card-title">प्रतिकर आकलन व भुगतान / Compensation Award</div>
          ${comp ? `
            <div class="kv"><span>भूमि का मूल्य (Land Value)</span><span>${fmtINR(comp.landValue)}</span></div>
            <div class="kv"><span>परिसंपत्ति / संरचना मूल्य</span><span>${fmtINR(comp.structureValue)}</span></div>
            <div class="kv"><span>सोलेशियम व अतिरिक्त भत्ते</span><span>${fmtINR(comp.additional)}</span></div>
            <div class="kv"><span><b>कुल प्रतिकर (Total Award)</b></span><span><b>${fmtINR(comp.total)}</b></span></div>
            <div class="kv"><span>डीबीटी स्थिति</span><span>${docStatusBadge(comp.paymentStatus==='Paid'?'Verified':(comp.paymentStatus==='Processing'?'Under Review':'Pending'))} ${comp.paymentStatus}</span></div>
          ` : '<div class="small muted">प्रतिकर आकलन चरण 6 पर निर्धारित होगा।</div>'}
        </div>
      </div>
    `;
    document.getElementById('btn-parcel').addEventListener('click', ()=>navigate('parcel-detail', p.id));
    document.getElementById('btn-goto-docs').addEventListener('click', ()=>navigate('documents'));
    const advBtn = document.getElementById('btn-advance');
    if(advBtn) advBtn.addEventListener('click', ()=> advanceCase(k, draw));
  }
};

function advanceCase(k, redraw){
  const next = WORKFLOW_NEXT[k.status];
  if(!next) return;
  const prevStatus = k.status;
  k.status = next;
  const today = todayISO();
  k.history.push({status:next, date:today, user:CURRENT_USER.name});
  const p = parcelById(k.parcelId);
  p.status = WORKFLOW_TO_PARCEL_STATUS[next];
  addAudit(`Case moved to ${WORKFLOW_LABELS[next]}`, 'acquisition_case', k.id, `Parcel ${p.id}`);

  if(prevStatus==='OBJECTION_REVIEW' && next==='APPROVAL'){
    DB.approvals.push({ id:uid('APR'), caseId:k.id, approver:CURRENT_USER.name, decision:'Approved', date:today, remarks:'धारा 15 सुनवाई पश्चात आपत्तियां निस्तारित; अधिग्रहण संस्वीकृत।' });
    addAudit('Competent approval recorded', 'approval', k.id, `Approved by ${CURRENT_USER.name}`);
  }
  if(next==='COMPENSATION_ASSESSED' && !compForCase(k.id)){
    const landValue = Math.round(p.area * (rint ? rint(600000,1200000) : 800000));
    const structureValue = Math.random()<0.5 ? Math.round(landValue*0.1) : 0;
    const additional = Math.random()<0.3 ? Math.round(landValue*0.05) : 0;
    const total = landValue+structureValue+additional;
    DB.compensation.push({ id:uid('COMP'), caseId:k.id, landValue, structureValue, additional, total, paymentStatus:'Pending', paymentDate:null });
    addAudit('Compensation award calculated', 'compensation', k.id, `Award of ${fmtINR(total)} issued under RFCTLARR.`);
    addAlert('Compensation Delay', 'medium', `Case ${k.id} compensation award of ${fmtINR(total)} pending PFMS transfer.`, 'case', k.id);
  }
  if(next==='PAYMENT_COMPLETED'){
    const comp = compForCase(k.id);
    if(comp){ comp.paymentStatus='Paid'; comp.paymentDate=today; addAudit('DBT payment completed', 'compensation', k.id, fmtINR(comp.total)+' transferred to bank account.'); }
  }
  if(next==='LAND_ACQUIRED'){
    const proj = projectById(k.projectId);
    if(proj){ proj.acquiredArea = +(proj.acquiredArea + p.area).toFixed(2); }
    addAlert('Land Acquired', 'low', `Parcel ${p.id} acquired and possessed under Sec 38 for ${projectName(k.projectId)}.`, 'case', k.id);
  }
  if(next==='PROJECT_UTILIZATION'){
    const proj = projectById(k.projectId);
    if(proj){ proj.utilizedArea = +(proj.utilizedArea + p.area*0.6).toFixed(2); }
  }
  saveDB();
  toast(`प्रकरण “${WORKFLOW_LABELS[next]}” पर अग्रसारित किया गया।`);
  redraw();
};