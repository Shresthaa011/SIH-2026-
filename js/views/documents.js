/* ==================== DOCUMENTS & VERIFICATION ==================== */
ROUTES['documents'] = function(c){
  let filter = '';
  function draw(){
    const rows = DB.documents.filter(d=> !filter || d.status===filter).slice().reverse();
    c.innerHTML = `
      <div class="section-head">
        <div>
          <h2>राजस्व दस्तावेज़ सत्यापन / Document Verification Portal</h2>
          <div class="muted small">${DB.documents.length} राजस्व दस्तावेज़ &bull; AI Assisted Discrepancy Detector</div>
        </div>
        ${CURRENT_USER.role==='LAND_OFFICER'||CURRENT_USER.role==='ADMIN' ? `<button class="btn btn-saffron btn-sm" id="btn-upload">दस्तावेज़ अपलोड व AI जांच / Upload &amp; OCR</button>`:''}
      </div>
      <div class="filterbar"><select id="doc-filter"><option value="">सभी सत्यापन स्थितियां (All Statuses)</option>${DOCUMENT_STATUSES.map(s=>`<option ${filter===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="card" style="padding:0;"><div class="overflow-x"><table>
        <thead><tr><th>दस्तावेज़ संख्या</th><th>दस्तावेज़ प्रकार</th><th>खसरा संख्या</th><th>प्रकरण</th><th>सत्यापन स्थिति</th><th>अपलोड तिथि</th><th>कार्यवाही</th></tr></thead>
        <tbody>${rows.slice(0,60).map(d=>`
          <tr><td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);">${d.id}</td><td>${d.type}</td><td><b>${d.parcelId}</b></td><td>${d.caseId||'—'}</td>
          <td>${docStatusBadge(d.status)}</td><td>${fmtDate(d.uploadedAt)}</td>
          <td>
            ${d.status!=='Verified' && (CURRENT_USER.role==='LAND_OFFICER'||CURRENT_USER.role==='ADMIN') ? `<button class="btn btn-sm btn-primary" data-verify="${d.id}">सत्यापित करें / Verify</button>` : ''}
            ${d.status!=='Rejected' && d.status!=='Verified' && (CURRENT_USER.role==='LAND_OFFICER'||CURRENT_USER.role==='ADMIN') ? `<button class="btn btn-sm btn-danger" data-reject="${d.id}">अस्वीकृत / Reject</button>` : ''}
          </td></tr>`).join('')}
        </tbody></table></div></div>
    `;
    c.querySelectorAll('[data-verify]').forEach(b=>b.addEventListener('click', ()=>{ setDocStatus(b.dataset.verify,'Verified'); draw(); }));
    c.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click', ()=>{ setDocStatus(b.dataset.reject,'Rejected'); draw(); }));
    document.getElementById('doc-filter').addEventListener('change', e=>{ filter=e.target.value; draw(); });
    const ub = document.getElementById('btn-upload'); if(ub) ub.addEventListener('click', openUploadModal);
  }
  draw();
};

function setDocStatus(docId, status){
  const d = DB.documents.find(x=>x.id===docId);
  d.status = status;
  const p = parcelById(d.parcelId);
  if(p){
    const pdocs = DB.documents.filter(x=>x.parcelId===p.id);
    p.documentStatus = pdocs.every(x=>x.status==='Verified') ? 'Verified' : (pdocs.some(x=>x.status==='Rejected')?'Rejected':(pdocs.some(x=>x.status==='Under Review')?'Under Review':'Uploaded'));
  }
  addAudit(`Document marked ${status}`, 'document', docId, `${d.type} for parcel ${d.parcelId}`);
  if(status==='Rejected') addAlert('Missing Document', 'high', `Document ${docId} (${d.type}) for parcel ${d.parcelId} was rejected by LAO.`, 'document', docId);
  saveDB();
  toast(`दस्तावेज़ ${status} मार्क किया गया।`);
}

function openUploadModal(){
  openModal(`
    <h3 style="margin-bottom:6px;color:var(--gov-navy);">राजस्व दस्तावेज़ अपलोड व AI जांच (Demo OCR)</h3>
    <div class="small muted" style="margin-bottom:12px;">Optical Character Recognition (OCR) pipeline simulates automatic parsing of Khasra/Khatoni records:</div>
    <div class="formrow"><label>खसरा भूखंड चुनें / Parcel</label><select id="up-parcel">${DB.parcels.slice(0,40).map(p=>`<option value="${p.id}">${p.id} — ${p.village}</option>`).join('')}</select></div>
    <div class="formrow"><label>दस्तावेज़ प्रकार / Document Type</label><select id="up-type">${DOCUMENT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
    <div class="formrow"><label>दस्तावेज़ पाठ्य प्रविष्टि (OCR Scan Text)</label>
      <textarea id="up-text" rows="3">Owner: Amit Kumar. Survey No. 123/4. Village Demo Village. Area 4.1 acres.</textarea>
    </div>
    <div id="up-result"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
      <button class="btn" id="up-cancel">रद्द करें / Cancel</button>
      <button class="btn btn-saffron" id="up-extract">AI विसंगति जांच / Extract</button>
      <button class="btn btn-primary" id="up-save" disabled>अभिलेख में सहेजें / Save</button>
    </div>
  `);
  document.getElementById('up-cancel').addEventListener('click', closeModal);
  document.getElementById('up-extract').addEventListener('click', ()=>{
    const text = document.getElementById('up-text').value;
    const parcelId = document.getElementById('up-parcel').value;
    const extracted = aiExtractDocument(text);
    const p = parcelById(parcelId);
    const discrepancies = aiDetectDiscrepancy(p, extracted);
    document.getElementById('up-result').innerHTML = `
      <div class="hr"></div>
      <div class="card-title">निकाले गए राजस्व तथ्य / Extracted Fields</div>
      <div class="kv"><span>खातेदार का नाम (Owner)</span><span>${extracted.owner||'पहचान नहीं हुई'}</span></div>
      <div class="kv"><span>खसरा संख्या (Survey)</span><span>${extracted.survey||'पहचान नहीं हुई'}</span></div>
      <div class="kv"><span>ग्राम (Village)</span><span>${extracted.village||'पहचान नहीं हुई'}</span></div>
      <div class="kv"><span>क्षेत्रफल (Area)</span><span>${extracted.area!=null? extracted.area+' acres':'पहचान नहीं हुई'}</span></div>
      ${discrepancies.length? `<div class="tag-warn" style="margin-top:8px;">${discrepancies.map(d=>'⚠ '+d).join('<br>')}</div>` : `<div class="small" style="color:var(--gov-green);margin-top:8px;font-weight:700;">✓ केंद्रीय भू-अभिलेख से कोई विसंगति नहीं मिली। (No Discrepancy Found).</div>`}
    `;
    document.getElementById('up-save').disabled = false;
  });
  document.getElementById('up-save').addEventListener('click', ()=>{
    const parcelId = document.getElementById('up-parcel').value;
    const type = document.getElementById('up-type').value;
    const p = parcelById(parcelId);
    const doc = { id:uid('DOC'), parcelId, caseId: p.caseId||null, type, status:'Uploaded', uploadedAt: todayISO(), extractedArea:null, extractedOwner:null };
    DB.documents.push(doc);
    addAudit('Document uploaded', 'document', doc.id, `${type} uploaded for parcel ${parcelId} (AI verification passed)`);
    saveDB(); closeModal(); toast('दस्तावेज़ सफलतापूर्वक सहेजा गया।');
    navigate('documents');
  });
}