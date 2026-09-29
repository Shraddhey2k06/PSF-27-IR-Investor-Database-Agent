const DEMO_DATA = [
  {
    name:"Sanjay Mehta", bio:"Venture investor and startup ecosystem professional.",
    followers:"", city:"Mumbai", phone:"", email:"", linkedin:"",
    status:"review", confidence:78,
    sources:["https://www.100x.vc/"], notes:"Demo record. Verify before use."
  },
  {
    name:"Anil Joshi", bio:"Investor and venture capital professional.",
    followers:"", city:"Mumbai", phone:"", email:"", linkedin:"",
    status:"review", confidence:74,
    sources:["https://www.unicornivc.com/"], notes:"Demo record. Verify before use."
  },
  {
    name:"Mayuresh Raut", bio:"Investment professional and startup ecosystem participant.",
    followers:"", city:"Bengaluru", phone:"", email:"", linkedin:"",
    status:"review", confidence:72,
    sources:[], notes:"Demo record. Verify before use."
  }
];

let investors = load("psf_investors", DEMO_DATA);
let editingIndex = -1;

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const initials = n => n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

function load(key, fallback){
  try { const x = JSON.parse(localStorage.getItem(key)); return Array.isArray(x) && x.length ? x : structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}
function persist(){ localStorage.setItem("psf_investors", JSON.stringify(investors)); }

function toast(msg){
  const t=$("toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2400);
}

function render(){
  const q=$("search").value.toLowerCase().trim();
  const status=$("statusFilter").value;
  const rows=investors.filter(x=>{
    const hay=[x.name,x.bio,x.city,x.email,x.notes].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (status==="all" || x.status===status);
  });
  $("investorTable").innerHTML = rows.map(x=>{
    const i=investors.indexOf(x);
    const cls=x.status==="verified"?"verified":x.status==="missing"?"missing":"review";
    const label=x.status==="verified"?"Verified":x.status==="missing"?"Missing data":"Needs review";
    const confidence=Math.max(0,Math.min(100,Number(x.confidence)||0));
    return `<tr>
      <td><div class="person"><div class="avatar">${esc(initials(x.name||"?"))}</div><div><div class="person-name">${esc(x.name)}</div><div class="muted">${esc(x.notes||"")}</div></div></div></td>
      <td>${esc(x.bio||"—")}</td>
      <td>${esc(x.followers||"—")}</td>
      <td>${esc(x.city||"—")}</td>
      <td>${esc(x.phone||"—")}</td>
      <td>${esc(x.email||"—")}</td>
      <td>${validUrl(x.linkedin)?`<a class="link" target="_blank" rel="noopener" href="${esc(x.linkedin)}">Profile ↗</a>`:"—"}</td>
      <td><span class="pill ${cls}">${label}</span></td>
      <td><div class="confidence"><div class="confidence-bar"><i style="width:${confidence}%"></i></div><small>${confidence}%</small></div></td>
      <td><button class="btn" data-edit="${i}">Edit</button></td>
    </tr>`;
  }).join("") || `<tr><td colspan="10" class="muted">No investors match your filters.</td></tr>`;
  $("statTotal").textContent=investors.length;
  $("statVerified").textContent=investors.filter(x=>x.status==="verified").length;
  $("statReview").textContent=investors.filter(x=>x.status==="review").length;
  $("statComplete").textContent=investors.filter(x=>x.name&&x.city&&x.bio&&x.linkedin).length;
  $("statSources").textContent=investors.reduce((n,x)=>n+(x.sources?.length||0),0);
}
function validUrl(v){try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)}catch{return false}}

function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
}

function openModal(index=-1){
  editingIndex=index;
  const x=index>=0?investors[index]:{};
  $("modalTitle").textContent=index>=0?"Edit investor":"Add investor";
  $("fName").value=x.name||"";$("fCity").value=x.city||"";$("fBio").value=x.bio||"";
  $("fFollowers").value=x.followers||"";$("fPhone").value=x.phone||"";$("fEmail").value=x.email||"";
  $("fLinkedin").value=x.linkedin||"";$("fConfidence").value=x.confidence??0;$("fStatus").value=x.status||"review";
  $("fSources").value=(x.sources||[]).join("\n");$("fNotes").value=x.notes||"";
  $("deleteBtn").style.display=index>=0?"inline-block":"none";
  $("modal").classList.remove("hidden");
}
function closeModal(){ $("modal").classList.add("hidden"); }
function saveInvestor(){
  const x={
    name:$("fName").value.trim(), city:$("fCity").value.trim(), bio:$("fBio").value.trim(),
    followers:$("fFollowers").value.trim(), phone:$("fPhone").value.trim(), email:$("fEmail").value.trim(),
    linkedin:$("fLinkedin").value.trim(), confidence:Number($("fConfidence").value)||0, status:$("fStatus").value,
    sources:$("fSources").value.split("\n").map(s=>s.trim()).filter(Boolean), notes:$("fNotes").value.trim()
  };
  if(!x.name) return toast("Investor name is required.");
  if(editingIndex<0) investors.push(x); else investors[editingIndex]=x;
  persist(); closeModal(); render(); toast("Investor saved.");
}
function deleteInvestor(){
  if(editingIndex<0)return;
  if(confirm("Delete this investor?")){investors.splice(editingIndex,1);persist();closeModal();render();toast("Investor deleted.");}
}

async function importAndResearch(){
  const source=$("sourceUrl").value.trim();
  if(!source)return toast("Enter Website B first.");
  const panel=$("researchPanel"), bar=$("progressBar"), pct=$("researchPct"), status=$("researchStatus"), log=$("researchLog");
  panel.classList.remove("hidden"); log.textContent="";
  const production=$("productionMode").checked;
  if(production){
    const endpoint=$("apiEndpoint").value.trim();
    if(!endpoint)return toast("Set the research API endpoint in Settings.");
    await runProductionResearch(endpoint,source,status,bar,pct,log);
  }else{
    await runDemoResearch(source,status,bar,pct,log);
  }
}

async function runDemoResearch(source,status,bar,pct,log){
  const steps=[
    "Validating source URL",
    "Reading investor directory in demo mode",
    "Normalizing investor names",
    "Checking duplicate records",
    "Preparing enrichment queue",
    "Attaching available demo evidence",
    "Research queue complete"
  ];
  for(let i=0;i<steps.length;i++){
    status.textContent=steps[i]+"…"; log.textContent+=`› ${steps[i]}\n`;
    const p=Math.round(((i+1)/steps.length)*100); bar.style.width=p+"%"; pct.textContent=p+"%";
    await new Promise(r=>setTimeout(r,380));
  }
  const existing=new Set(investors.map(x=>x.name.toLowerCase()));
  DEMO_DATA.forEach(x=>{if(!existing.has(x.name.toLowerCase()))investors.push(structuredClone(x));});
  persist(); render(); toast("Demo research complete.");
}

async function runProductionResearch(endpoint,source,status,bar,pct,log){
  status.textContent="Sending research request…"; log.textContent="› POST "+endpoint+"\n"; bar.style.width="15%";pct.textContent="15%";
  try{
    const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceUrl:source})});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(!Array.isArray(data.investors))throw new Error("Backend response must contain investors[]");
    data.investors.forEach(normalizeRecord);
    investors=mergeByName(investors,data.investors);
    persist();render();
    bar.style.width="100%";pct.textContent="100%";status.textContent="Research complete";log.textContent+="› Received "+data.investors.length+" investor records\n";
    toast("Production research complete.");
  }catch(err){
    status.textContent="Research failed"; log.textContent+=`› ERROR: ${err.message}\n`;
    bar.style.width="0%";pct.textContent="0%";toast("Backend request failed.");
  }
}

function normalizeRecord(x){
  x.name=String(x.name||"").trim(); x.bio=String(x.bio||"").trim(); x.followers=x.followers??"";
  x.city=String(x.city||"").trim();x.phone=String(x.phone||"").trim();x.email=String(x.email||"").trim();
  x.linkedin=String(x.linkedin||"").trim();x.status=x.status||"review";x.confidence=Number(x.confidence)||0;
  x.sources=Array.isArray(x.sources)?x.sources:[];x.notes=String(x.notes||"");
}
function mergeByName(a,b){
  const map=new Map(a.map(x=>[x.name.toLowerCase(),x]));
  b.forEach(x=>{normalizeRecord(x);if(x.name)map.set(x.name.toLowerCase(),x)});
  return [...map.values()];
}

function exportWorkbook(){
  if(!window.XLSX)return toast("Excel library unavailable.");
  const rows=investors.map(x=>({
    "Investor Name":x.name,"LinkedIn Bio":x.bio,"LinkedIn Followers":x.followers,"City / Location":x.city,
    "Phone":x.phone,"Email":x.email,"LinkedIn Link":x.linkedin,"Verification Status":x.status,
    "Confidence":`${x.confidence}%`,"Source URLs":(x.sources||[]).join(" | "),"Notes":x.notes
  }));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),"Investor Database");
  const sources=investors.flatMap(x=>(x.sources||[]).map(s=>({"Investor":x.name,"Source":s})));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sources),"Sources");
  XLSX.writeFile(wb,"PSF_2027_Investor_Database.xlsx");
}
function exportCsv(){
  const headers=["Investor Name","LinkedIn Bio","LinkedIn Followers","City / Location","Phone","Email","LinkedIn Link","Verification Status","Confidence","Source URLs","Notes"];
  const rows=investors.map(x=>[x.name,x.bio,x.followers,x.city,x.phone,x.email,x.linkedin,x.status,`${x.confidence}%`,(x.sources||[]).join(" | "),x.notes]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="PSF_2027_Investor_Database.csv";a.click();URL.revokeObjectURL(a.href);
}

function saveSettings(){
  localStorage.setItem("psf_api_endpoint",$("apiEndpoint").value.trim());
  localStorage.setItem("psf_production_mode",$("productionMode").checked?"1":"0");
  toast("Settings saved.");
}
function loadSettings(){
  $("apiEndpoint").value=localStorage.getItem("psf_api_endpoint")||"";
  $("productionMode").checked=localStorage.getItem("psf_production_mode")==="1";
}

document.addEventListener("click",e=>{
  const nav=e.target.closest(".nav-btn");if(nav)showView(nav.dataset.view);
  const edit=e.target.closest("[data-edit]");if(edit)openModal(Number(edit.dataset.edit));
});
$("importBtn").onclick=importAndResearch;
$("addBtn").onclick=()=>openModal();
$("addBtn2").onclick=()=>openModal();
$("xlsxBtn").onclick=exportWorkbook;
$("csvBtn").onclick=exportCsv;
$("search").oninput=render;
$("statusFilter").onchange=render;
$("closeModal").onclick=closeModal;
$("cancelBtn").onclick=closeModal;
$("saveBtn").onclick=saveInvestor;
$("deleteBtn").onclick=deleteInvestor;
$("saveSettings").onclick=saveSettings;

loadSettings();render();
