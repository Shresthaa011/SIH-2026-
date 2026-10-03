/* =====================================================================
   GeoSetu-India (जिओसेतु-इंडिया) — National Land Acquisition & Management System
   Department of Land Resources, Ministry of Rural Development, GoI.
   Single-file SPA with LocalStorage persistence.
   ===================================================================== */

/* ---------------- CONSTANTS ---------------- */
const ROLES = {
  ADMIN: {key:'ADMIN', label:'Administrator / नोडल अधिकारी'},
  LAND_OFFICER: {key:'LAND_OFFICER', label:'Land Officer / भू-अधिग्रहण अधिकारी'},
  FIELD_OFFICER: {key:'FIELD_OFFICER', label:'Field Officer / पटवारी (क्षेत्रीय सत्यापक)'},
  PROJECT_AUTHORITY: {key:'PROJECT_AUTHORITY', label:'Project Authority / परियोजना प्राधिकारी'},
  LAND_OWNER: {key:'LAND_OWNER', label:'Citizen / Land Owner (खातेदार)'},
};

const PARCEL_STATUSES = ['Available','Under Verification','Under Acquisition','Approved','Compensation Pending','Acquired','Disputed','Utilized'];

const WORKFLOW_STATES = ['IDENTIFIED','VERIFICATION','NOTICE_ISSUED','OBJECTION_REVIEW','APPROVAL','COMPENSATION_ASSESSED','PAYMENT_PENDING','PAYMENT_COMPLETED','LAND_ACQUIRED','PROJECT_UTILIZATION'];
const WORKFLOW_LABELS = {
  IDENTIFIED:'Identified (चिह्नित)', VERIFICATION:'Verification (सत्यापन)', NOTICE_ISSUED:'Notice Issued (धारा 11(1) सूचना)', OBJECTION_REVIEW:'Objection Review (धारा 15 आपत्ति)',
  APPROVAL:'Approval (सक्षम अनुमोदन)', COMPENSATION_ASSESSED:'Compensation Assessed (प्रतिकर निर्धारण)', PAYMENT_PENDING:'Payment Pending (भुगतान प्रक्रियाधीन)',
  PAYMENT_COMPLETED:'Payment Completed (डीबीटी संपन्न)', LAND_ACQUIRED:'Land Acquired (अधिग्रहीत)', PROJECT_UTILIZATION:'Project Utilization (हस्तांतरित)'
};
const WORKFLOW_SECTIONS = {
  IDENTIFIED: 'Sec 4',
  VERIFICATION: 'Sec 6 & 8',
  NOTICE_ISSUED: 'Sec 11(1)',
  OBJECTION_REVIEW: 'Sec 15',
  APPROVAL: 'Sec 19(1)',
  COMPENSATION_ASSESSED: 'Sec 26-30',
  PAYMENT_PENDING: 'Sec 31',
  PAYMENT_COMPLETED: 'Sec 37',
  LAND_ACQUIRED: 'Sec 38',
  PROJECT_UTILIZATION: 'Sec 99/101'
};
const WORKFLOW_RFCTLARR_NOTES = {
  IDENTIFIED: 'RFCTLARR Act 2013 Sec 4 — Preliminary Social Impact Assessment (SIA) study & public notice by Nodal Body.',
  VERIFICATION: 'RFCTLARR Act 2013 Sec 6 & 8 — Independent Expert Group appraisal of SIA & revenue survey boundary verification.',
  NOTICE_ISSUED: 'RFCTLARR Act 2013 Sec 11(1) — Publication of Preliminary Notification in official Gazette & local newspapers.',
  OBJECTION_REVIEW: 'RFCTLARR Act 2013 Sec 15 — Mandatory 60-day hearing of citizen objections on public purpose & land area by Collector.',
  APPROVAL: 'RFCTLARR Act 2013 Sec 19(1) — Final statutory Declaration & Rehabilitation & Resettlement (R&R) Scheme approval.',
  COMPENSATION_ASSESSED: 'RFCTLARR Act 2013 Sec 26-30 — Collector Compensation Award determination (Base Market Value + 100% Solatium + 12% Interest).',
  PAYMENT_PENDING: 'RFCTLARR Act 2013 Sec 31 — Direct Benefit Transfer (DBT) disbursal of compensation award into beneficiary bank account.',
  PAYMENT_COMPLETED: 'RFCTLARR Act 2013 Sec 37 — Collector Award completion & electronic PFMS payment receipt confirmation.',
  LAND_ACQUIRED: 'RFCTLARR Act 2013 Sec 38 — Collector taking full physical possession of unencumbered land post 100% compensation.',
  PROJECT_UTILIZATION: 'RFCTLARR Act 2013 Sec 99/101 — Formal transfer & physical handover of acquired land to Requiring Body (NHAI/Railways).'
};
const WORKFLOW_NEXT = {
  IDENTIFIED:'VERIFICATION', VERIFICATION:'NOTICE_ISSUED', NOTICE_ISSUED:'OBJECTION_REVIEW', OBJECTION_REVIEW:'APPROVAL',
  APPROVAL:'COMPENSATION_ASSESSED', COMPENSATION_ASSESSED:'PAYMENT_PENDING', PAYMENT_PENDING:'PAYMENT_COMPLETED',
  PAYMENT_COMPLETED:'LAND_ACQUIRED', LAND_ACQUIRED:'PROJECT_UTILIZATION', PROJECT_UTILIZATION:null
};
const WORKFLOW_TO_PARCEL_STATUS = {
  IDENTIFIED:'Available', VERIFICATION:'Under Verification', NOTICE_ISSUED:'Under Acquisition', OBJECTION_REVIEW:'Under Acquisition',
  APPROVAL:'Approved', COMPENSATION_ASSESSED:'Compensation Pending', PAYMENT_PENDING:'Compensation Pending',
  PAYMENT_COMPLETED:'Acquired', LAND_ACQUIRED:'Acquired', PROJECT_UTILIZATION:'Utilized'
};

const DOCUMENT_TYPES = ['Land Record (खसरा / खतौनी)','Ownership Certificate (भू-स्वामित्व प्रमाण)','Survey Report (सर्वेक्षण प्रतिवेदन)','Encumbrance Certificate (भारमुक्ति प्रमाण)','Identity Document (आधार / ई-केवाईसी)','Acquisition Notice (राजपत्र अधिसूचना)','Approval Document (सक्षम प्राधिकारी आदेश)','Compensation Document (प्रतिकर एवार्ड)'];
const DOCUMENT_STATUSES = ['Pending','Uploaded','Under Review','Verified','Rejected'];

const DISTRICTS = ['Bhopal (भोपाल)','Sehore (सीहोर)','Raisen (रायसेन)','Vidisha (विदिशा)','Hoshangabad (होशंगाबाद)'];
const TEHSILS = ['Huzur (हुजूर)','Berasia (बैरसिया)','Phanda (फंदा)','Silwani (सिलवानी)','Goharganj (गौहरगंज)','Budni (बुदनी)'];
const VILLAGES = ['Demo Village (डेमो ग्राम)','Kolar Kalan (कोलार कलां)','Bagsevaniya (बागसेवनिया)','Ratanpur (रतनपुर)','Sukhi Sewaniya (सूखी सेवनिया)','Chandanpura (चंदनपुरा)','Neelbad (नीलबड़)','Barkheda Pathani (बरखेड़ा पठानी)','Misrod (मिसरोद)','Ayodhya Nagar (अयोध्या नगर)'];
const LAND_TYPES = ['Agricultural (कृषि भूमि)','Residential (आवासीय)','Commercial (व्यावसायिक)','Barren (बंजर)','Forest Buffer (वन सीमावर्ती)'];
const PROJECT_TYPES = ['National Highway Expansion (NHAI)','Irrigation Canal (सिंचाई नहर)','Railway Dedicated Freight Corridor','Industrial Corridor (औद्योगिक गलियारा)','Urban Housing Scheme (पीएम आवास)','Power Transmission Grid Line','Airport Expansion Project'];
const DEPARTMENTS = ['Ministry of Road Transport & Highways','Water Resources Department','Railway Board (Ministry of Railways)','Department for Promotion of Industry','Urban Development Authority','Power Grid Corporation of India','Airports Authority of India'];

const FIRST_NAMES = ['Amit','Sunita','Rakesh','Priya','Manoj','Geeta','Suresh','Kavita','Deepak','Anita','Vijay','Rekha','Ramesh','Meena','Ashok','Neha','Sanjay','Pooja','Vinod','Shweta','Arun','Kiran','Mahesh','Seema','Ravi','Usha','Naresh','Anjali','Dinesh','Bharti'];
const LAST_NAMES = ['Kumar','Sharma','Verma','Patel','Yadav','Chouhan','Mishra','Singh','Gupta','Rathore','Malviya','Tiwari','Agrawal','Jain','Solanki'];

/* ---------------- UTILS ---------------- */
let SEED = 42;
function rnd(){ SEED = (SEED*9301+49297)%233280; return SEED/233280; }
function rint(a,b){ return Math.floor(rnd()*(b-a+1))+a; }
function pick(arr){ return arr[rint(0,arr.length-1)]; }
function pickN(arr,n){ const c=[...arr]; const out=[]; for(let i=0;i<n && c.length;i++){ out.push(c.splice(rint(0,c.length-1),1)[0]); } return out; }
function uid(prefix){ return prefix+'-'+Math.random().toString(36).slice(2,9); }
function fmtINR(n){ return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtDate(d){ const dt = new Date(d); return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function daysBetween(a,b){ return Math.round((new Date(b)-new Date(a))/86400000); }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'_'); }
function statusBadgeClass(s){ return 'badge badge-'+slug(s); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function addDaysISO(iso,n){ const d=new Date(iso); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

/* ---------------- SEED DATA GENERATION ---------------- */
const BASE_LAT = 23.2599, BASE_LNG = 77.4126;

function makeParcelPolygon(lat,lng,sizeDeg){
  const j = ()=> (rnd()-0.5)*sizeDeg*0.35;
  return [
    [lat - sizeDeg/2 + j(), lng - sizeDeg/2 + j()],
    [lat - sizeDeg/2 + j(), lng + sizeDeg/2 + j()],
    [lat + sizeDeg/2 + j(), lng + sizeDeg/2 + j()],
    [lat + sizeDeg/2 + j(), lng - sizeDeg/2 + j()],
  ];
}

function generateSeed(){
  SEED = 42;
  const db = { users:[], owners:[], parcels:[], projects:[], cases:[], documents:[], approvals:[], compensation:[], alerts:[], monitoring:[], auditLogs:[], agreements:[] };

  db.users = [
    {id:'U-ADMIN', name:'S. Nair', role:'ADMIN', title:'District Nodal Administrator', username:'admin', email:'admin@geosetu-india.gov.in', password:'password123'},
    {id:'U-OFFICER', name:'R. Chouhan', role:'LAND_OFFICER', title:'Land Acquisition Officer (Bhopal Circle)', username:'officer', email:'officer@geosetu-india.gov.in', password:'password123'},
    {id:'U-FIELD', name:'Vikram Singh', role:'FIELD_OFFICER', title:'Senior Field Surveyor / Patwari', username:'field', email:'field@geosetu-india.gov.in', password:'password123'},
    {id:'U-AUTHORITY', name:'A. Deshmukh', role:'PROJECT_AUTHORITY', title:'Project Director, NHAI Cell', username:'authority', email:'authority@geosetu-india.gov.in', password:'password123'},
    {id:'U-OWNER', name:'Amit Kumar', role:'LAND_OWNER', title:'Verified Khatedar / Citizen', username:'citizen', email:'citizen@geosetu-india.gov.in', password:'password123'},
  ];

  // Owners
  for(let i=1;i<=30;i++){
    db.owners.push({
      id:'OWN-'+String(i).padStart(3,'0'),
      name: (i===1? 'Amit Kumar' : (pick(FIRST_NAMES)+' '+pick(LAST_NAMES))),
      phone: '9' + rint(100000000,999999999),
      village: pick(VILLAGES),
      idType:'Aadhaar (UIDAI Verified)', idMasked: 'XXXX-XXXX-'+rint(1000,9999)
    });
  }

  // Projects
  for(let i=1;i<=10;i++){
    const req = rint(20,80);
    const acq = Math.round(req * (rint(20,95)/100));
    const util = Math.round(acq * (rint(10,90)/100));
    const start = `202${rint(3,5)}-0${rint(1,9)}-1${rint(0,5)}`;
    db.projects.push({
      id:'PRJ-'+String(i).padStart(3,'0'),
      name: PROJECT_TYPES[(i-1)%PROJECT_TYPES.length] + ' — Stage '+i,
      type: PROJECT_TYPES[(i-1)%PROJECT_TYPES.length],
      department: DEPARTMENTS[(i-1)%DEPARTMENTS.length],
      location: pick(DISTRICTS),
      requiredArea: req,
      acquiredArea: acq,
      utilizedArea: util,
      startDate: start,
      targetDate: addDaysISO(start, rint(300,900)),
      status: acq>=req ? 'Completed' : 'In Progress'
    });
  }

  // Parcels (100)
  for(let i=1;i<=100;i++){
    const dlat = BASE_LAT + (rnd()-0.5)*0.32;
    const dlng = BASE_LNG + (rnd()-0.5)*0.42;
    const size = 0.006 + rnd()*0.006;
    const owner = pick(db.owners);
    const status = pick(PARCEL_STATUSES);
    const project = rnd()<0.72 ? pick(db.projects) : null;
    db.parcels.push({
      id:'MP-BH-'+String(i).padStart(3,'0'),
      surveyNumber: rint(10,999)+'/'+rint(1,9),
      district: pick(DISTRICTS),
      tehsil: pick(TEHSILS),
      village: pick(VILLAGES),
      area: +(2 + rnd()*14).toFixed(2),
      areaUnit:'acres (एकड़)',
      landType: pick(LAND_TYPES),
      ownerId: owner.id,
      lat: dlat, lng: dlng,
      polygon: makeParcelPolygon(dlat,dlng,size),
      status: status,
      documentStatus: pick(DOCUMENT_STATUSES),
      projectId: project ? project.id : null,
      createdAt: addDaysISO('2025-06-01', rint(0,400))
    });
  }
  db.parcels[0].id='MP-BH-001'; db.parcels[0].ownerId=db.owners[0].id; db.parcels[0].village='Demo Village (डेमो ग्राम)';
  db.parcels[0].surveyNumber='123/4'; db.parcels[0].district='Bhopal (भोपाल)'; db.parcels[0].area=3.2; db.parcels[0].landType='Agricultural (कृषि भूमि)';
  db.parcels[0].status='Under Verification';

  // Cases (20)
  const usedParcelIdx = pickN(Array.from({length:100},(_,i)=>i), 20);
  usedParcelIdx.forEach((pIdx,i)=>{
    const n = i+1;
    const parcel = db.parcels[pIdx];
    const project = parcel.projectId ? db.projects.find(p=>p.id===parcel.projectId) : pick(db.projects);
    parcel.projectId = project.id;
    const stateIdx = rint(0,9);
    const state = WORKFLOW_STATES[stateIdx];
    const created = addDaysISO('2025-11-01', rint(0,280));
    const history = [];
    let d = created;
    for(let s=0;s<=stateIdx;s++){
      history.push({status: WORKFLOW_STATES[s], date:d, user: s===0?'R. Chouhan (LAO)': (s<4?'R. Chouhan (LAO)':(s<6?'A. Deshmukh (NHAI)':'PFMS Portal'))});
      d = addDaysISO(d, rint(4,18));
    }
    const caseId = 'CASE-'+String(n).padStart(3,'0');
    db.cases.push({ id:caseId, parcelId:parcel.id, projectId:project.id, status:state, createdAt:created, history });
    parcel.status = WORKFLOW_TO_PARCEL_STATUS[state];
    parcel.caseId = caseId;

    // documents per case
    const docCount = rint(3,5);
    const docTypes = pickN(DOCUMENT_TYPES, docCount);
    docTypes.forEach((dt,di)=>{
      db.documents.push({
        id: uid('DOC'), parcelId: parcel.id, caseId: caseId, type: dt,
        status: stateIdx>=2 ? pick(['Verified','Under Review','Uploaded']) : pick(['Pending','Uploaded']),
        uploadedAt: addDaysISO(created, di*2+1),
        extractedArea: null, extractedOwner: null
      });
    });

    // approvals
    if(stateIdx>=4){
      db.approvals.push({ id: uid('APR'), caseId: caseId, approver:'A. Deshmukh (NHAI)', decision:'Approved', date: history[4] ? history[4].date : created, remarks:'Gazetted Section 19 declaration cleared; compensation approved.' });
    }
    // compensation
    if(stateIdx>=5){
      const landValue = Math.round(parcel.area * rint(600000,1200000));
      const structureValue = rnd()<0.5 ? Math.round(landValue*rint(5,20)/100) : 0;
      const additional = rnd()<0.3 ? Math.round(landValue*rint(2,8)/100) : 0;
      const total = landValue+structureValue+additional;
      const paid = stateIdx>=7;
      db.compensation.push({
        id: uid('COMP'), caseId:caseId, landValue, structureValue, additional, total,
        paymentStatus: paid?'Paid':(stateIdx>=6?'Processing':'Pending'),
        paymentDate: paid? addDaysISO(history[7] ? history[7].date : created, rint(1,10)) : null
      });
    }

    history.forEach(h=>{
      db.auditLogs.push({ id:uid('AUD'), action:`Case moved to ${WORKFLOW_LABELS[h.status]}`, user:h.user, entity:'acquisition_case', entityId:caseId, timestamp:h.date, remarks:`Gazette notification record for Parcel ${parcel.id}` });
    });
  });

  // Standalone documents
  db.parcels.filter(p=>!p.caseId).slice(0,35).forEach((p,i)=>{
    db.documents.push({ id: uid('DOC'), parcelId:p.id, caseId:null, type: pick(DOCUMENT_TYPES), status: pick(DOCUMENT_STATUSES), uploadedAt: addDaysISO('2025-10-01', i), extractedArea:null, extractedOwner:null });
  });

  // Monitoring
  db.projects.forEach(p=>{
    const acquiredPct = Math.min(100, Math.round((p.acquiredArea/p.requiredArea)*100));
    const utilizedPct = Math.min(100, Math.round((p.utilizedArea/Math.max(p.acquiredArea,1))*100));
    const totalDays = daysBetween(p.startDate, p.targetDate);
    const elapsed = Math.max(0,daysBetween(p.startDate, todayISO()));
    const expected = Math.min(100, Math.round((elapsed/Math.max(totalDays,1))*100));
    const actual = Math.min(100, Math.max(5, expected + rint(-25,10)));
    const compCases = db.cases.filter(c=>c.projectId===p.id);
    const paidComp = compCases.filter(c=>{ const comp=db.compensation.find(x=>x.caseId===c.id); return comp && comp.paymentStatus==='Paid'; }).length;
    const compPct = compCases.length ? Math.round((paidComp/compCases.length)*100) : 0;
    db.monitoring.push({
      projectId:p.id, landAcquiredPct:acquiredPct, landUtilizedPct:utilizedPct, compensationPaidPct:compPct,
      plannedProgress: expected, expectedProgress: expected, actualProgress: Math.max(0,Math.min(100,actual)),
      lastUpdate: addDaysISO(todayISO(), -rint(0,12))
    });
  });

  // Alerts
  db.parcels.forEach(p=>{
    if(p.documentStatus==='Pending' || p.documentStatus==='Rejected'){
      db.alerts.push({ id:uid('ALT'), type:'Missing Document', severity:'high', message:`Khasra ${p.surveyNumber} (${p.id}) has ${p.documentStatus.toLowerCase()} records in revenue archive.`, entityType:'parcel', entityId:p.id, createdAt: addDaysISO(todayISO(),-rint(1,20)), resolved:false });
    }
  });
  db.cases.forEach(c=>{
    const verifStart = c.history.find(h=>h.status==='VERIFICATION');
    if(verifStart && c.status==='VERIFICATION' && daysBetween(verifStart.date, todayISO())>21){
      db.alerts.push({ id:uid('ALT'), type:'Verification Delay', severity:'medium', message:`Proceedings for Case ${c.id} pending verification for ${daysBetween(verifStart.date,todayISO())} days (threshold 21).`, entityType:'case', entityId:c.id, createdAt: todayISO(), resolved:false });
    }
    const comp = db.compensation.find(x=>x.caseId===c.id);
    if(comp && comp.paymentStatus!=='Paid'){
      db.alerts.push({ id:uid('ALT'), type:'Compensation Delay', severity:'medium', message:`Compensation for Case ${c.id} of ${fmtINR(comp.total)} pending DBT transfer.`, entityType:'case', entityId:c.id, createdAt: addDaysISO(todayISO(),-rint(1,15)), resolved:false });
    }
  });
  db.monitoring.forEach(m=>{
    if(m.actualProgress < m.expectedProgress - 10){
      db.alerts.push({ id:uid('ALT'), type:'Project Delay', severity:'high', message:`Project ${m.projectId} physical progress (${m.actualProgress}%) trails schedule target (${m.expectedProgress}%).`, entityType:'project', entityId:m.projectId, createdAt: todayISO(), resolved:false });
    }
  });
  db.parcels.filter(p=>p.status==='Disputed').slice(0,6).forEach(p=>{
    db.alerts.push({ id:uid('ALT'), type:'Ownership Dispute', severity:'high', message:`Parcel ${p.id} flagged in revenue court dispute; proceedings halted under Sec 76.`, entityType:'parcel', entityId:p.id, createdAt: addDaysISO(todayISO(),-rint(1,30)), resolved: rnd()<0.3 });
  });

  // Seeded E-Agreements across all 4 statutory statuses: Completed, Signed, Sent, Draft
  db.agreements = [
    {
      id: 'EAGR-2026-001',
      parcelId: 'MP-BH-001',
      khasraNo: '142/1',
      caseId: 'CASE-001',
      projectId: 'PRJ-001',
      projectName: 'Bhopal-Indore Economic Corridor (NH-46)',
      ownerId: 'OWN-001',
      ownerName: 'Amit Kumar',
      ownerAadhaar: 'XXXX-XXXX-8492',
      ownerPhone: '9826012345',
      officerName: 'R. Chouhan',
      officerDesignation: 'Land Acquisition Officer (LAO, Circle-I)',
      tehsil: 'Huzur',
      district: 'Bhopal',
      village: 'Bairagarh Kalan',
      areaAcres: '4.20',
      landType: 'Agricultural (Irrigated)',
      marketValue: 12400000,
      solatium: 12400000,
      interest: 1488000,
      totalAmount: 26288000,
      rehabTerms: 'RFCTLARR Schedule II R&R Entitlement Card issued; 1 Model Residential Plot in Rehabilitation Enclave; Resettlement Grant ₹50,000.',
      status: 'Completed',
      draftDate: '2026-09-02',
      sentDate: '2026-09-06',
      signedDate: '2026-09-10 11:34:22 IST',
      completedDate: '2026-09-12 15:42:08 IST',
      ownerSignature: {
        method: 'Aadhaar e-Sign (UIDAI OTP)',
        signer: 'Amit Kumar',
        timestamp: '2026-09-10 11:34:22 IST',
        certHash: 'SHA256: 8f4b7a2e910c8842af5e12bc44093d19f',
        ip: '103.24.188.42'
      },
      officerSignature: {
        method: 'e-Token DSC Class-3 Seal',
        signer: 'R. Chouhan (LAO)',
        tokenSerial: 'GOI-NIC-DSC-2026-9931',
        timestamp: '2026-09-12 15:42:08 IST',
        certHash: 'SHA256: 3a99c11f78bc2281aef871b66d21b4421',
        seal: 'OFFICE OF THE COMPETENT AUTHORITY & LAO, BHOPAL CIRCLE'
      },
      auditTrail: [
        { action: 'Agreement Drafted under Sec 23 RFCTLARR Act', user: 'R. Chouhan (LAO)', timestamp: '2026-09-02 10:15:00 IST' },
        { action: 'Dispatched to Landowner Portal for Digital Signature', user: 'R. Chouhan (LAO)', timestamp: '2026-09-06 14:20:10 IST' },
        { action: 'Digitally Signed by Landowner via Aadhaar e-Sign OTP', user: 'Amit Kumar (Landowner)', timestamp: '2026-09-10 11:34:22 IST' },
        { action: 'Counter-Signed & Sealed with Official Government DSC Token', user: 'R. Chouhan (LAO)', timestamp: '2026-09-12 15:42:08 IST' },
        { action: 'Deed Registered in Central E-Agreement Vault', user: 'System / NIC', timestamp: '2026-09-12 15:42:15 IST' }
      ]
    },
    {
      id: 'EAGR-2026-002',
      parcelId: 'MP-BH-002',
      khasraNo: '88/2',
      caseId: 'CASE-002',
      projectId: 'PRJ-001',
      projectName: 'Bhopal-Indore Economic Corridor (NH-46)',
      ownerId: 'OWN-002',
      ownerName: 'Sunita Devi',
      ownerAadhaar: 'XXXX-XXXX-6124',
      ownerPhone: '9425098712',
      officerName: 'R. Chouhan',
      officerDesignation: 'Land Acquisition Officer (LAO, Circle-I)',
      tehsil: 'Huzur',
      district: 'Bhopal',
      village: 'Bairagarh Kalan',
      areaAcres: '2.80',
      landType: 'Agricultural (Un-irrigated)',
      marketValue: 7800000,
      solatium: 7800000,
      interest: 936000,
      totalAmount: 16536000,
      rehabTerms: 'One-time resettlement allowance ₹50,000 + Subsistence grant for 12 months under RFCTLARR Sec 31.',
      status: 'Signed',
      draftDate: '2026-09-08',
      sentDate: '2026-09-12',
      signedDate: '2026-09-15 14:18:40 IST',
      completedDate: null,
      ownerSignature: {
        method: 'Aadhaar e-Sign (UIDAI OTP)',
        signer: 'Sunita Devi',
        timestamp: '2026-09-15 14:18:40 IST',
        certHash: 'SHA256: 7d21a88b12f08819abef21198c41c0981',
        ip: '103.24.188.88'
      },
      officerSignature: null,
      auditTrail: [
        { action: 'Agreement Drafted by LAO Circle Desk', user: 'R. Chouhan (LAO)', timestamp: '2026-09-08 11:00:00 IST' },
        { action: 'Dispatched to Landowner Portal', user: 'R. Chouhan (LAO)', timestamp: '2026-09-12 16:30:00 IST' },
        { action: 'Digitally Signed by Landowner via Aadhaar e-Sign', user: 'Sunita Devi (Landowner)', timestamp: '2026-09-15 14:18:40 IST' }
      ]
    },
    {
      id: 'EAGR-2026-003',
      parcelId: 'MP-BH-003',
      khasraNo: '215/3',
      caseId: 'CASE-003',
      projectId: 'PRJ-002',
      projectName: 'Bhopal Outer Ring Road (Phase-II)',
      ownerId: 'OWN-001',
      ownerName: 'Amit Kumar',
      ownerAadhaar: 'XXXX-XXXX-8492',
      ownerPhone: '9826012345',
      officerName: 'R. Chouhan',
      officerDesignation: 'Land Acquisition Officer (LAO, Circle-I)',
      tehsil: 'Berasia',
      district: 'Bhopal',
      village: 'Kolar Sub-div',
      areaAcres: '5.10',
      landType: 'Agricultural (Commercial Road-facing)',
      marketValue: 18500000,
      solatium: 18500000,
      interest: 2220000,
      totalAmount: 39220000,
      rehabTerms: 'Mandatory RFCTLARR Schedule II Package with Commercial kiosk allotment entitlement.',
      status: 'Sent',
      draftDate: '2026-09-14',
      sentDate: '2026-09-16',
      signedDate: null,
      completedDate: null,
      ownerSignature: null,
      officerSignature: null,
      auditTrail: [
        { action: 'Draft Prepared based on Preliminary Section 11 Survey', user: 'R. Chouhan (LAO)', timestamp: '2026-09-14 09:45:00 IST' },
        { action: 'Dispatched to Landowner Portal; Pending e-Sign', user: 'R. Chouhan (LAO)', timestamp: '2026-09-16 12:00:00 IST' }
      ]
    },
    {
      id: 'EAGR-2026-004',
      parcelId: 'MP-BH-004',
      khasraNo: '304/1',
      caseId: 'CASE-004',
      projectId: 'PRJ-003',
      projectName: 'Metro Rail Feeder Depot (Sub-Circle)',
      ownerId: 'OWN-004',
      ownerName: 'Vikram Singh',
      ownerAadhaar: 'XXXX-XXXX-3319',
      ownerPhone: '9893011223',
      officerName: 'R. Chouhan',
      officerDesignation: 'Land Acquisition Officer (LAO, Circle-I)',
      tehsil: 'Govindpura',
      district: 'Bhopal',
      village: 'Bairagarh Kalan',
      areaAcres: '1.95',
      landType: 'Non-Agricultural Commercial',
      marketValue: 9200000,
      solatium: 9200000,
      interest: 1104000,
      totalAmount: 19504000,
      rehabTerms: 'Monetary compensation package in lieu of rehabilitation under Section 31.',
      status: 'Draft',
      draftDate: '2026-09-17',
      sentDate: null,
      signedDate: null,
      completedDate: null,
      ownerSignature: null,
      officerSignature: null,
      auditTrail: [
        { action: 'Initial E-Agreement Draft Initiated by Circle Staff', user: 'R. Chouhan (LAO)', timestamp: '2026-09-17 08:30:00 IST' }
      ]
    }
  ];

  db.auditLogs.push({ id:uid('AUD'), action:'Central database synchronized with National Land Record Portal', user:'System / NIC', entity:'system', entityId:'-', timestamp: addDaysISO(todayISO(),-1), remarks:'GeoSetu-India platform initialized under GIGW guidelines.' });
  db.auditLogs.sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));

  return db;
}

/* ---------------- PERSISTENCE ---------------- */
const DB_KEY = 'terrabyte_db_v1';
let DB = null;

function loadDB(){
  try{
    let raw = localStorage.getItem(DB_KEY);
    if(!raw){
      raw = localStorage.getItem('bhoomisetu_db_v1');
    }
    if(raw){
      DB = JSON.parse(raw);
      const defaultCreds = {
        'U-ADMIN': {u:'admin', e:'admin@geosetu-india.gov.in', p:'password123'},
        'U-OFFICER': {u:'officer', e:'officer@geosetu-india.gov.in', p:'password123'},
        'U-FIELD': {u:'field', e:'field@geosetu-india.gov.in', p:'password123'},
        'U-AUTHORITY': {u:'authority', e:'authority@geosetu-india.gov.in', p:'password123'},
        'U-OWNER': {u:'citizen', e:'citizen@geosetu-india.gov.in', p:'password123'},
      };
      if (!DB.users.some(u => u.id === 'U-FIELD')) {
        DB.users.push({id:'U-FIELD', name:'Vikram Singh', role:'FIELD_OFFICER', title:'Senior Field Surveyor / Patwari', username:'field', email:'field@geosetu-india.gov.in', password:'password123'});
      }
      DB.users.forEach(u => {
        if (!u.password) u.password = defaultCreds[u.id] ? defaultCreds[u.id].p : 'password123';
        if (!u.username) u.username = defaultCreds[u.id] ? defaultCreds[u.id].u : u.name.toLowerCase().replace(/\s+/g,'.');
        if (!u.email || u.email.includes('bhoomisetu') || u.email.includes('terrabyte')) u.email = defaultCreds[u.id] ? defaultCreds[u.id].e : `${u.username}@geosetu-india.gov.in`;
      });
      if(!DB.agreements || !DB.agreements.length){
        const seed = generateSeed();
        DB.agreements = seed.agreements;
      }
      saveDB();
      return;
    }
  }catch(e){ console.warn('DB load failed', e); }
  DB = generateSeed();
  saveDB();
}
function saveDB(){
  try{ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }catch(e){ console.warn('DB save failed', e); }
}
function resetDB(){ localStorage.removeItem(DB_KEY); localStorage.removeItem('bhoomisetu_db_v1'); loadDB(); }

function addAudit(action, entity, entityId, remarks){
  DB.auditLogs.push({ id:uid('AUD'), action, user: CURRENT_USER ? CURRENT_USER.name : 'System', entity, entityId, timestamp: new Date().toISOString(), remarks: remarks||'' });
  DB.auditLogs.sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));
}
function addAlert(type, severity, message, entityType, entityId){
  DB.alerts.unshift({ id:uid('ALT'), type, severity, message, entityType, entityId, createdAt: todayISO(), resolved:false });
}
function toast(msg){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className='toast'; el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .4s'; el.style.opacity='0'; setTimeout(()=>el.remove(),400); }, 2600);
}