const DEFAULT_ITEMS=[
["Water & Food","Water: at least 1 gallon per person per day"],
["Water & Food","Nonperishable food"],
["Water & Food","Manual can opener"],
["Water & Food","Eating utensils and basic cookware"],
["Safety & Medical","First-aid kit"],
["Safety & Medical","Prescription medications"],
["Safety & Medical","N95-style masks"],
["Safety & Medical","Sanitation and hygiene supplies"],
["Power & Communication","Flashlights or headlamps"],
["Power & Communication","Extra batteries"],
["Power & Communication","Battery or hand-crank weather radio"],
["Power & Communication","Phone charging banks and cables"],
["Documents & Cash","Copies of identification and insurance documents"],
["Documents & Cash","Emergency contact list"],
["Documents & Cash","Cash in small bills"],
["Clothing & Shelter","Weather-appropriate clothing"],
["Clothing & Shelter","Blankets or sleeping bags"],
["Clothing & Shelter","Sturdy shoes"],
["Pets","Pet food and water"],
["Pets","Leash, carrier, and vaccination records"]
].map((x,i)=>({id:"base-"+i,category:x[0],name:x[1],done:false,custom:false}));

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="readyCoastDataV1";
let data=load();

function load(){
 try{
  const parsed=JSON.parse(localStorage.getItem(KEY));
  if(parsed?.items) return parsed;
 }catch(e){}
 return {items:structuredClone(DEFAULT_ITEMS),plan:{},calculator:{people:1,pets:0,days:7}};
}
function save(){localStorage.setItem(KEY,JSON.stringify(data)); updateDashboard();}
function escapeHTML(str=""){return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function navigate(id){
 $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
 $$(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
 window.scrollTo({top:0,behavior:"smooth"});
}
$$(".tabs button").forEach(b=>b.onclick=()=>navigate(b.dataset.view));
$$("[data-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.jump));

function updateCalculator(){
 const people=Math.max(1,+$("#people").value||1), pets=Math.max(0,+$("#pets").value||0), days=Math.max(3,+$("#days").value||7);
 data.calculator={people,pets,days};
 const water=people*days, meals=people*days*3, petWater=Math.ceil(pets*days*.5*10)/10;
 $("#waterResult").textContent=`${water} gal`;
 $("#mealResult").textContent=meals.toLocaleString();
 $("#petWaterResult").textContent=`${petWater} gal`;
 $("#waterSummary").textContent=`${water} gallons`;
 save();
}
["people","pets","days"].forEach(id=>$("#"+id).addEventListener("input",updateCalculator));
Object.entries(data.calculator||{}).forEach(([k,v])=>{if($("#"+k))$("#"+k).value=v});

function updateDashboard(){
 const done=data.items.filter(i=>i.done).length,total=data.items.length,pct=total?Math.round(done/total*100):0;
 $("#completionValue").textContent=pct+"%"; $("#completionBar").style.width=pct+"%";
 const remaining=data.items.filter(i=>!i.done).slice(0,3);
 $("#nextActions").innerHTML=remaining.length?remaining.map(i=>`<div><b>${escapeHTML(i.name)}</b><br><small>${escapeHTML(i.category)}</small></div>`).join(""):"<div><b>Your current checklist is complete.</b><br><small>Review supplies and expiration dates regularly.</small></div>";
}

function renderKit(){
 const filter=$("#kitFilter").value;
 const shown=data.items.filter(i=>filter==="all"||(filter==="done"?i.done:!i.done));
 const cats=[...new Set(shown.map(i=>i.category))];
 $("#kitList").innerHTML=cats.map(cat=>`<section class="kit-category"><h2>${escapeHTML(cat)}</h2>${shown.filter(i=>i.category===cat).map(i=>`
 <div class="kit-item ${i.done?"checked":""}">
  <input aria-label="Mark ${escapeHTML(i.name)} complete" type="checkbox" data-id="${i.id}" ${i.done?"checked":""}>
  <label>${escapeHTML(i.name)}</label>
  ${i.custom?`<button class="delete-item" data-delete="${i.id}" aria-label="Delete item">×</button>`:""}
 </div>`).join("")}</section>`).join("")||'<article class="card">No items match this filter.</article>';
 $$("[data-id]").forEach(c=>c.onchange=()=>{const item=data.items.find(i=>i.id===c.dataset.id);item.done=c.checked;save();renderKit()});
 $$("[data-delete]").forEach(b=>b.onclick=()=>{data.items=data.items.filter(i=>i.id!==b.dataset.delete);save();renderKit()});
}
$("#kitFilter").onchange=renderKit;
$("#addItemBtn").onclick=()=>$("#itemDialog").showModal();
$("#itemForm").onsubmit=e=>{
 if(e.submitter?.value==="cancel")return;
 e.preventDefault();
 const name=$("#customName").value.trim();
 if(!name)return;
 data.items.push({id:"custom-"+Date.now(),category:$("#customCategory").value,name,done:false,custom:true});
 $("#customName").value="";$("#itemDialog").close();save();renderKit();
};

function fillPlan(){Object.entries(data.plan||{}).forEach(([k,v])=>{const el=$(`#planForm [name="${k}"]`);if(el)el.value=v})}
$("#planForm").onsubmit=e=>{e.preventDefault();data.plan=Object.fromEntries(new FormData(e.target));save();$("#saveStatus").textContent="Saved on this device.";setTimeout(()=>$("#saveStatus").textContent="",2500)};
$("#exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ready-coast-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
};
$("#importInput").onchange=async e=>{
 try{
  const imported=JSON.parse(await e.target.files[0].text());
  if(!Array.isArray(imported.items))throw new Error();
  data=imported;save();fillPlan();renderKit();updateCalculator();$("#saveStatus").textContent="Backup imported.";
 }catch(err){$("#saveStatus").textContent="That file is not a valid Ready Coast backup."}
 e.target.value="";
};

function alertCard(a){
 const p=a.properties||{}, severe=["Extreme","Severe"].includes(p.severity);
 return `<article class="card alert-card ${severe?"severe":""}">
 <div class="alert-meta"><span class="pill">${escapeHTML(p.severity||"Unknown severity")}</span><span class="pill">${escapeHTML(p.urgency||"")}</span></div>
 <h2>${escapeHTML(p.event||"Weather alert")}</h2>
 <small>${escapeHTML(p.areaDesc||"")}</small>
 <p>${escapeHTML((p.headline||p.description||"").slice(0,1200))}</p>
 ${p.web?`<a class="secondary" href="${encodeURI(p.web)}" target="_blank" rel="noopener">Official details</a>`:""}
 </article>`;
}
$("#locationBtn").onclick=()=>{
 if(!navigator.geolocation){$("#alertStatus").textContent="Location is not supported by this browser.";return}
 $("#alertStatus").textContent="Requesting location…";$("#alertList").innerHTML="";
 navigator.geolocation.getCurrentPosition(async pos=>{
  $("#alertStatus").textContent="Checking active alerts…";
  const {latitude,longitude}=pos.coords;
  try{
   const res=await fetch(`https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`,{headers:{"Accept":"application/geo+json"}});
   if(!res.ok)throw new Error("Service unavailable");
   const json=await res.json(), alerts=json.features||[];
   $("#alertStatus").textContent=alerts.length?`${alerts.length} active alert${alerts.length===1?"":"s"} found.`:"No active NWS alerts were returned for this location.";
   $("#alertList").innerHTML=alerts.map(alertCard).join("");
  }catch(e){$("#alertStatus").textContent="Alerts could not be loaded. Open Weather.gov from Resources for official information."}
 },err=>{$("#alertStatus").textContent=err.code===1?"Location permission was not granted.":"Your location could not be determined."},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
};

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});
$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true};
window.addEventListener("appinstalled",()=>$("#installBtn").hidden=true);

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
fillPlan();renderKit();updateCalculator();updateDashboard();
