/* ==================== AI ASSISTANT ==================== */
function aiExtractDocument(text){
  const t = text || '';
  const owner = (t.match(/owner[:\s]+([a-zA-Z .]+?)(?:\.|,|$)/i)||[])[1];
  const survey = (t.match(/survey\s*no\.?\s*([0-9]+\/[0-9]+)/i)||[])[1];
  const village = (t.match(/village\s+([a-zA-Z ]+?)(?:\.|,|$)/i)||[])[1];
  const areaMatch = t.match(/area\s+([0-9]+(?:\.[0-9]+)?)/i);
  return { owner: owner? owner.trim():null, survey: survey||null, village: village? village.trim():null, area: areaMatch? parseFloat(areaMatch[1]) : null };
}
function aiDetectDiscrepancy(parcel, extracted){
  const out = [];
  if(extracted.area!=null && Math.abs(extracted.area - parcel.area) > 0.3){
    out.push(`क्षेत्रफल विसंगति: राजस्व अभिलेख में ${parcel.area} एकड़ है किंतु दस्तावेज़ में ${extracted.area} एकड़ दर्ज है।`);
  }
  if(extracted.survey && extracted.survey !== parcel.surveyNumber){
    out.push(`खसरा संख्या विसंगति: राजस्व अभिलेख में ${parcel.surveyNumber} है, दस्तावेज़ में ${extracted.survey} है।`);
  }
  if(extracted.village && parcel.village && !parcel.village.toLowerCase().includes(extracted.village.toLowerCase().slice(0,5))){
    out.push(`ग्राम नाम विसंगति: दस्तावेज़ का ग्राम ("${extracted.village}") राजस्व अभिलेख ("${parcel.village}") से मेल नहीं खाता।`);
  }
  return out;
}

function aiAnswerQuery(q){
  const s = q.toLowerCase();
  const countBy = (arr)=>arr.length;
  if(s.includes('pending compensation') || (s.includes('compensation') && s.includes('pending')) || s.includes('प्रतिकर')){
    const n = countBy(DB.compensation.filter(c=>c.paymentStatus!=='Paid'));
    return `${n} भू-अधिग्रहण प्रकरणों में डीबीटी प्रतिकर भुगतान प्रक्रियाधीन है, कुल देय राशि ${fmtINR(DB.compensation.filter(c=>c.paymentStatus!=='Paid').reduce((s,c)=>s+c.total,0))} है।`;
  }
  if(s.includes('disputed') || s.includes('विवाद')){
    const n = DB.parcels.filter(p=>p.status==='Disputed').length;
    return `${n} खसरा भूखंड वर्तमान में राजस्व न्यायालय या विधिक विवाद के अंतर्गत दर्ज हैं।`;
  }
  if(s.includes('verification') || s.includes('सत्यापन')){
    const n = DB.parcels.filter(p=>p.status==='Under Verification').length;
    return `${n} खसरों का राजस्व अभिलेख सत्यापन वर्तमान में प्रक्रियाधीन है।`;
  }
  if(s.includes('alert') || s.includes('सूचना')){
    const n = DB.alerts.filter(a=>!a.resolved).length;
    return `सिस्टम में वर्तमान में ${n} सतर्कता सूचनाएं (Vigilance Alerts) सक्रिय हैं।`;
  }
  if(s.includes('acquired') || s.includes('अधिग्रहीत')){
    const lines = DB.projects.map(p=>`${p.name}: ${p.acquiredArea}/${p.requiredArea} एकड़ अधिग्रहीत`);
    return lines.join('\n');
  }
  return `मैं राष्ट्रीय भू-अधिग्रहण पोर्टल से संबंधित प्रश्नों के उत्तर दे सकता हूँ। आप पूछ सकते हैं: "कितने प्रकरणों में प्रतिकर लंबित है?", "विवादित खसरों की संख्या?", "सत्यापनधीन भूखंड?" आदि।`;
}

ROUTES['ai'] = function(c){
  c.innerHTML = `
    <div class="section-head">
      <div>
        <h2>डिजिटल इंडिया एआई सहायक / Digital India AI Assistant</h2>
        <div class="muted small">Modular AI Layer for Natural Language Inquiries on Land Acquisition Records</div>
      </div>
    </div>
    <div class="grid g2">
      <div class="card stat-card stripe-navy">
        <div class="card-title">स्वाभाविक भाषा डाटा पूछताछ / Natural Language Query</div>
        <div id="ai-log" style="max-height:270px;overflow-y:auto;margin-bottom:10px;"></div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="ai-input" placeholder='उदा. "कितने भूखंड विवादित हैं?" या "Pending compensation cases"' style="flex:1;">
          <button class="btn btn-primary btn-sm" id="ai-send">पूछें / Ask</button>
        </div>
        <div class="small muted" style="margin-top:8px;">सुझाव: लंबित प्रतिकर &bull; विवादित खसरे &bull; खुली सतर्कता सूचनाएं &bull; परियोजना अधिग्रहण प्रगति</div>
      </div>
      <div class="card stat-card stripe-saffron">
        <div class="card-title">दस्तावेज़ विसंगति पहचान प्रणाली / Document OCR Extraction</div>
        <div class="small muted" style="margin-bottom:10px;">AI आधारित दस्तावेज़ पार्सिंग का उपयोग राजस्व अभिलेखों में कूटकरण अथवा विसंगति की त्वरित पहचान के लिए किया जाता है।</div>
        <button class="btn btn-saffron btn-sm" id="ai-open-upload">दस्तावेज़ AI जांच पोर्टल खोलें</button>
        <div class="hr"></div>
        <div class="card-title">सिस्टम आर्किटेक्चर</div>
        <div class="small muted">यह मॉड्यूल भारत सरकार के भाषिणी (Bhashini) व राष्ट्रीय एआई मिशन के मानकों के अनुकूल एकीकृत होने हेतु निर्मित है।</div>
      </div>
    </div>
  `;
  const log = document.getElementById('ai-log');
  function pushMsg(role, text){
    const el = document.createElement('div');
    el.className = 'ai-msg '+role;
    el.textContent = text;
    log.appendChild(el); log.scrollTop = log.scrollHeight;
  }
  pushMsg('bot', 'नमस्ते! मैं भूमिसेतु डिजिटल एआई सहायक हूँ। आप वर्तमान खसरा अभिलेखों, प्रकरणों, प्रतिकर या विधिक विवादों के संबंध में मुझसे पूछ सकते हैं।');
  document.getElementById('ai-send').addEventListener('click', ask);
  document.getElementById('ai-input').addEventListener('keydown', e=>{ if(e.key==='Enter') ask(); });
  function ask(){
    const input = document.getElementById('ai-input');
    const q = input.value.trim(); if(!q) return;
    pushMsg('user', q);
    pushMsg('bot', aiAnswerQuery(q));
    input.value='';
  }
  document.getElementById('ai-open-upload').addEventListener('click', openUploadModal);
};