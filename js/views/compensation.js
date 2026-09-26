/* ==================== COMPENSATION & DBT ==================== */
ROUTES['compensation'] = function(c){
  const rows = DB.compensation;
  const total = rows.reduce((s,x)=>s+x.total,0);
  const paid = rows.filter(x=>x.paymentStatus==='Paid').reduce((s,x)=>s+x.total,0);
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>प्रतिकर निर्धारण व प्रत्यक्ष लाभ अंतरण (DBT Portal)</h2>
        <div class="muted small">${rows.length} प्रकरणों का प्रतिकर आकलन &bull; Public Financial Management System (PFMS) Synchronized</div>
      </div>
    </div>
    <div class="grid g4" style="margin-bottom:16px;">
      ${statCard('कुल प्रतिकर राशि', fmtINR(total), rows.length+' Cases Assessed', '', 'stripe-navy')}
      ${statCard('डीबीटी भुगतान संपन्न', fmtINR(paid), Math.round(paid/Math.max(total,1)*100)+'% of Total Award', '', 'stripe-green')}
      ${statCard('भुगतान हेतु लंबित', fmtINR(total-paid), rows.filter(x=>x.paymentStatus!=='Paid').length+' Cases Pending PFMS', '', 'stripe-saffron')}
      ${statCard('औसत प्रतिकर दर', fmtINR(total/Math.max(rows.length,1)), 'Per Khatedar Award', '', 'stripe-sky')}
    </div>
    <div class="card" style="padding:0;"><div class="overflow-x"><table>
      <thead><tr><th>प्रकरण संख्या</th><th>खसरा संख्या</th><th>भूमि मूल्य (Land Value)</th><th>संरचना मूल्य</th><th>सोलेशियम / अन्य</th><th>कुल प्रतिकर (Total)</th><th>डीबीटी स्थिति</th><th>कार्यवाही</th></tr></thead>
      <tbody>${rows.map(r=>{ const k=caseById(r.caseId); return `
        <tr><td style="font-family:var(--font-mono);font-weight:700;color:var(--gov-navy);">${r.caseId}</td><td><b>${k?k.parcelId:'—'}</b></td><td>${fmtINR(r.landValue)}</td><td>${fmtINR(r.structureValue)}</td><td>${fmtINR(r.additional)}</td>
        <td><b>${fmtINR(r.total)}</b></td><td><span class="${statusBadgeClass(r.paymentStatus)}">${r.paymentStatus}</span></td>
        <td>${r.paymentStatus!=='Paid' && (CURRENT_USER.role==='ADMIN'||CURRENT_USER.role==='LAND_OFFICER') ? `<button class="btn btn-sm btn-saffron" data-pay="${r.id}">डीबीटी भुगतान करें / Pay</button>`:''}</td></tr>`; }).join('') || `<tr><td colspan="8"><div class="empty">कोई प्रतिकर आकलन नहीं मिला।</div></td></tr>`}
      </tbody></table></div></div>
  `;
  c.querySelectorAll('[data-pay]').forEach(b=>b.addEventListener('click', ()=>{
    const r = DB.compensation.find(x=>x.id===b.dataset.pay);
    r.paymentStatus='Paid'; r.paymentDate=todayISO();
    const k = caseById(r.caseId);
    if(k && k.status==='PAYMENT_PENDING'){ k.status='PAYMENT_COMPLETED'; k.history.push({status:'PAYMENT_COMPLETED', date:todayISO(), user:CURRENT_USER.name}); const p=parcelById(k.parcelId); p.status='Acquired'; }
    addAudit('Compensation payment released', 'compensation', r.id, fmtINR(r.total)+' transferred via PFMS.');
    saveDB(); toast('डीबीटी भुगतान अंतरण सफल।'); navigate('compensation');
  }));
};