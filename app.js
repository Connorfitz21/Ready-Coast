const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="readyCoastV2";
const CATS=["Water & Food","Medical & Safety","Power & Communication","Shelter & Clothing","Documents & Cash","Sanitation","Pets","Tools","Other"];
const DEFAULT_INV=[
{id:"i1",name:"Drinking water",category:"Water & Food",qty:0,target:7,unit:"gallons",location:"",expiry:""},
{id:"i2",name:"Shelf-stable meals",category:"Water & Food",qty:0,target:21,unit:"meals",location:"",expiry:""},
{id:"i3",name:"First-aid kit",category:"Medical & Safety",qty:0,target:1,unit:"kit",location:"",expiry:""},
{id:"i4",name:"Flashlights",category:"Power & Communication",qty:0,target:2,unit:"units",location:"",expiry:""},
{id:"i5",name:"Weather radio",category:"Power & Communication",qty:0,target:1,unit:"unit",location:"",expiry:""},
{id:"i6",name:"Phone power banks",category:"Power & Communication",qty:0,target:2,unit:"units",location:"",expiry:""},
{id:"i7",name:"Cash in small bills",category:"Documents & Cash",qty:0,target:1,unit:"set aside",location:"",expiry:""},
{id:"i8",name:"Pet food",category:"Pets",qty:0,target:0,unit:"days",location:"",expiry:""}
];
const HAZARDS={
"Hurricane":["Know your evacuation zone and routes","Review official storm updates","Secure outdoor items","Charge phones and backup batteries","Fuel vehicles","Prepare water and food supplies","Protect important documents","Plan for pets","Test generator safely outdoors","Identify shelter options"],
"Flood":["Know whether your home is in a flood-prone area","Identify higher-ground routes","Move valuables above likely flood level","Never plan to drive through floodwater","Review insurance and document coverage","Protect medicines and documents in waterproof containers","Prepare for utility shutoff","Monitor official flood warnings"],
"Power Outage":["Test flashlights and lanterns","Charge battery banks","Review safe generator placement","Identify refrigerated medicines","Plan for food safety","Keep refrigerator and freezer closed","Check carbon monoxide alarms","List essential medical equipment power needs"],
"Tornado":["Identify a lowest-level interior shelter area","Store helmets and sturdy shoes nearby","Keep a weather radio available","Practice moving to shelter quickly","Secure outdoor objects","Plan for pets in the shelter area","Keep emergency supplies in or near shelter"],
"Wildfire":["Know evacuation routes in multiple directions","Create defensible space where applicable","Keep vehicle fueled","Prepare N95-style masks","Pack medications and records","Plan animal evacuation","Monitor official evacuation notices","Close windows and vents when directed"],
"Winter Storm":["Prepare alternate heat safely","Protect pipes from freezing","Stock warm clothing and blankets","Charge communications equipment","Keep vehicles winter-ready","Plan for medication and food needs","Check carbon monoxide alarms","Avoid unsafe indoor combustion"],
"Earthquake":["Secure heavy furniture and appliances","Identify safe drop-cover-hold locations","Store sturdy shoes near beds","Know utility shutoff procedures","Keep supplies accessible","Plan family communication","Expect aftershocks","Review structural concerns with qualified professionals"],
"Extreme Heat":["Identify air-conditioned locations","Store drinking water","Plan wellness checks for vulnerable people","Review medication heat sensitivity","Limit strenuous activity during peak heat","Prepare for power outages","Never leave people or pets in vehicles"]
};
function defaultData(){return{household:{name:"",area:"",adults:1,children:0,seniors:0,pets:0,needs:"",utilities:""},contacts:[],records:[],inventory:structuredClone(DEFAULT_INV),hazards:{},evac:{},calculator:{people:1,pets:0,days:7},selectedHazard:"Hurricane"}}
let data=load();
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));if(p?.inventory)return p}catch(e){}return defaultData()}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function today(){return new Date(new Date().toDateString())}
function daysUntil(d){if(!d)return 99999;return Math.ceil((new Date(d+"T00:00:00")-today())/86400000)}
function pct(n,d){return d?Math.round(n/d*100):0}
function navigate(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));scrollTo({top:0,behavior:"smooth"})}
$$(".tabs button").forEach(b=>b.onclick=()=>navigate(b.dataset.view));$$("[data-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.jump));$("#printBtn").onclick=()=>print();

function householdCompletion(){const fields=["name","adults","area","needs","utilities"];return pct(fields.filter(k=>String(data.household[k]??"").trim()!=="").length,fields.length)}
function inventoryCoverage(){const required=data.inventory.filter(i=>i.target>0);return pct(required.filter(i=>+i.qty>=+i.target).length,required.length)}
function hazardCompletion(){let done=0,total=0;Object.entries(HAZARDS).forEach(([h,items])=>{if(data.hazards[h]){total+=items.length;done+=Object.values(data.hazards[h]).filter(Boolean).length}});return pct(done,total)}
function evacCompletion(){const keys=["homeMeeting","neighborhoodMeeting","primaryDestination","backupDestination","primaryRoute","transport"];return pct(keys.filter(k=>(data.evac[k]||"").trim()).length,keys.length)}
function overallScore(){return Math.round((householdCompletion()+inventoryCoverage()+hazardCompletion()+evacCompletion())/4)}
function renderDashboard(){
 const score=overallScore();$("#scoreValue").textContent=score;$("#profileMetric").textContent=householdCompletion()+"%";$("#inventoryMetric").textContent=inventoryCoverage()+"%";
 const planned=Object.keys(data.hazards).filter(h=>Object.values(data.hazards[h]||{}).some(Boolean)).length;$("#hazardMetric").textContent=planned;
 const exp=data.inventory.filter(i=>{const d=daysUntil(i.expiry);return d>=0&&d<=60}).length;$("#expiryMetric").textContent=exp;
 const priorities=[];
 if(householdCompletion()<60)priorities.push("Complete your household profile and medical considerations.");
 if(inventoryCoverage()<70)priorities.push("Bring core supply quantities closer to target.");
 if(!planned)priorities.push("Select at least one local hazard and complete its checklist.");
 if(evacCompletion()<60)priorities.push("Document primary and backup evacuation plans.");
 if(!data.contacts.length)priorities.push("Add an out-of-area emergency contact.");
 $("#priorityList").innerHTML=(priorities.length?priorities:["Review expiration dates and practice your plan."]).slice(0,5).map((x,i)=>`<div class="priority"><i>${i+1}</i><div>${esc(x)}</div></div>`).join("");
 const cov=[["Household",householdCompletion()],["Inventory",inventoryCoverage()],["Hazards",hazardCompletion()],["Evacuation",evacCompletion()]];
 $("#coverageBars").innerHTML=cov.map(([n,v])=>`<div class="coverage-row"><div><span>${n}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join("");
 const upcoming=data.inventory.filter(i=>i.expiry).sort((a,b)=>a.expiry.localeCompare(b.expiry)).slice(0,5);
 $("#upcomingList").innerHTML=upcoming.length?upcoming.map(i=>{const d=daysUntil(i.expiry);return `<div><b>${esc(i.name)}</b><br><small>${d<0?`Expired ${Math.abs(d)} days ago`:d===0?"Expires today":`Expires in ${d} days`} • ${esc(i.location||"No location")}</small></div>`}).join(""):"<div>No expiration dates have been added.</div>";
}
function fillHousehold(){Object.entries(data.household).forEach(([k,v])=>{const e=$(`#householdForm [name="${k}"]`);if(e)e.value=v})}
$("#householdForm").onsubmit=e=>{e.preventDefault();data.household=Object.fromEntries(new FormData(e.target));save();$("#householdStatus").textContent="Saved on this device.";setTimeout(()=>$("#householdStatus").textContent="",2000)}
function renderContacts(){$("#contactList").innerHTML=data.contacts.length?data.contacts.map(c=>`<div class="list-card"><div><h3>${esc(c.name)}</h3><small>${esc(c.role||"Contact")}</small></div><div>${esc(c.phone||"")}</div><div>${esc(c.email||"")}</div><div>${esc(c.notes||"")}</div><button class="icon-btn" data-del-contact="${c.id}">×</button></div>`).join(""):"<div>No contacts added.</div>";$$("[data-del-contact]").forEach(b=>b.onclick=()=>{data.contacts=data.contacts.filter(x=>x.id!==b.dataset.delContact);save()})}
function renderRecords(){$("#recordList").innerHTML=data.records.length?data.records.map(r=>`<div class="list-card"><div><h3>${esc(r.name)}</h3><small>${esc(r.type||"Record")}</small></div><div>${esc(r.location||"")}</div><div>${esc(r.owner||"")}</div><div>${esc(r.notes||"")}</div><button class="icon-btn" data-del-record="${r.id}">×</button></div>`).join(""):"<div>No records added.</div>";$$("[data-del-record]").forEach(b=>b.onclick=()=>{data.records=data.records.filter(x=>x.id!==b.dataset.delRecord);save()})}
function openDialog(title,fields,onSave){
 $("#dialogFields").innerHTML=`<h2>${esc(title)}</h2>`+fields.map(f=>`<label>${esc(f.label)}${f.type==="textarea"?`<textarea name="${f.name}" rows="3"></textarea>`:`<input name="${f.name}" type="${f.type||"text"}" ${f.required?"required":""}>`}</label>`).join("");
 const dlg=$("#genericDialog"),form=$("#genericForm");dlg.showModal();
 form.onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();onSave(Object.fromEntries(new FormData(form)));dlg.close()}
}
$("#addContactBtn").onclick=()=>openDialog("Add emergency contact",[{name:"name",label:"Name",required:true},{name:"role",label:"Role"},{name:"phone",label:"Phone"},{name:"email",label:"Email",type:"email"},{name:"notes",label:"Notes",type:"textarea"}],v=>{data.contacts.push({...v,id:"c"+Date.now()});save()});
$("#addRecordBtn").onclick=()=>openDialog("Add important record",[{name:"name",label:"Record name",required:true},{name:"type",label:"Type"},{name:"location",label:"Where it is stored"},{name:"owner",label:"Person responsible"},{name:"notes",label:"Notes",type:"textarea"}],v=>{data.records.push({...v,id:"r"+Date.now()});save()});

function populateCategories(){const sel=$("#inventoryCategory");if(sel.options.length===1)CATS.forEach(c=>sel.insertAdjacentHTML("beforeend",`<option>${esc(c)}</option>`))}
function itemState(i){const d=daysUntil(i.expiry);if(d<0)return"expired";if(d<=60)return"expiring";if(+i.target>0&&+i.qty<+i.target)return"low";return"ok"}
function renderInventory(){
 populateCategories();const cat=$("#inventoryCategory").value,state=$("#inventoryState").value;
 const list=data.inventory.filter(i=>(cat==="all"||i.category===cat)&&(state==="all"||itemState(i)===state));
 const total=data.inventory.length,low=data.inventory.filter(i=>itemState(i)==="low").length,expiring=data.inventory.filter(i=>itemState(i)==="expiring").length,expired=data.inventory.filter(i=>itemState(i)==="expired").length;
 $("#inventorySummary").innerHTML=[["Total items",total],["Low stock",low],["Expiring soon",expiring],["Expired",expired]].map(([n,v])=>`<article class="card metric"><span>${n}</span><b>${v}</b></article>`).join("");
 $("#inventoryList").innerHTML=list.length?list.map(i=>{const s=itemState(i),tag=s==="ok"?'<span class="tag good">Ready</span>':s==="low"?'<span class="tag warn">Low stock</span>':s==="expiring"?'<span class="tag warn">Expiring</span>':'<span class="tag danger">Expired</span>';return `<article class="card list-card"><div><h3>${esc(i.name)}</h3><small>${esc(i.category)} • ${esc(i.location||"No location")}</small></div><div><b>${esc(i.qty)} / ${esc(i.target)}</b><br><small>${esc(i.unit)}</small></div><div>${tag}</div><div><small>${i.expiry?esc(i.expiry):"No expiry"}</small></div><div><button class="secondary small" data-edit-inv="${i.id}">Edit</button> <button class="icon-btn" data-del-inv="${i.id}">×</button></div></article>`}).join(""):"<article class='card'>No supplies match this filter.</article>";
 $$("[data-del-inv]").forEach(b=>b.onclick=()=>{data.inventory=data.inventory.filter(x=>x.id!==b.dataset.delInv);save()});
 $$("[data-edit-inv]").forEach(b=>b.onclick=()=>editInventory(b.dataset.editInv));
}
$("#inventoryCategory").onchange=renderInventory;$("#inventoryState").onchange=renderInventory;
function editInventory(id){
 const i=data.inventory.find(x=>x.id===id)||{id:"i"+Date.now(),name:"",category:"Other",qty:0,target:1,unit:"units",location:"",expiry:""};
 $("#dialogFields").innerHTML=`<h2>${id?"Edit supply":"Add supply"}</h2>
 <label>Name<input name="name" required value="${esc(i.name)}"></label>
 <label>Category<select name="category">${CATS.map(c=>`<option ${c===i.category?"selected":""}>${esc(c)}</option>`).join("")}</select></label>
 <div class="form-grid two"><label>Quantity<input name="qty" type="number" min="0" step="0.1" value="${esc(i.qty)}"></label><label>Target<input name="target" type="number" min="0" step="0.1" value="${esc(i.target)}"></label></div>
 <label>Unit<input name="unit" value="${esc(i.unit)}"></label><label>Storage location<input name="location" value="${esc(i.location)}"></label><label>Expiration / review date<input name="expiry" type="date" value="${esc(i.expiry)}"></label>`;
 const dlg=$("#genericDialog"),form=$("#genericForm");dlg.showModal();form.onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const v=Object.fromEntries(new FormData(form));Object.assign(i,v);if(!id)data.inventory.push(i);save();dlg.close()}
}
$("#addInventoryBtn").onclick=()=>editInventory(null);

function renderHazards(){
 const selected=data.selectedHazard||Object.keys(HAZARDS)[0];
 $("#hazardCards").innerHTML=Object.entries(HAZARDS).map(([h,items])=>{const done=Object.values(data.hazards[h]||{}).filter(Boolean).length;return `<article class="card hazard-card ${h===selected?"active":""}" data-hazard="${esc(h)}"><p class="eyebrow dark">HAZARD</p><h3>${esc(h)}</h3><div class="hazard-meta"><span>${done}/${items.length} complete</span><span>${pct(done,items.length)}%</span></div></article>`}).join("");
 $$("[data-hazard]").forEach(c=>c.onclick=()=>{data.selectedHazard=c.dataset.hazard;save()});
 const items=HAZARDS[selected];$("#hazardDetailIntro").textContent=`${selected}: ${Object.values(data.hazards[selected]||{}).filter(Boolean).length} of ${items.length} complete.`;
 $("#hazardChecklist").innerHTML=items.map((x,i)=>`<div class="check-row"><input type="checkbox" data-hcheck="${i}" ${data.hazards[selected]?.[i]?"checked":""}><label>${esc(x)}</label></div>`).join("");
 $$("[data-hcheck]").forEach(c=>c.onchange=()=>{data.hazards[selected]??={};data.hazards[selected][c.dataset.hcheck]=c.checked;save()});
}
function fillEvac(){Object.entries(data.evac||{}).forEach(([k,v])=>{const e=$(`#evacForm [name="${k}"]`);if(e)e.value=v})}
$("#evacForm").onsubmit=e=>{e.preventDefault();data.evac=Object.fromEntries(new FormData(e.target));save();$("#evacStatus").textContent="Evacuation plan saved.";setTimeout(()=>$("#evacStatus").textContent="",2000)}
function updateCalculators(){
 const p=Math.max(1,+$("#calcPeople").value||1),pets=Math.max(0,+$("#calcPets").value||0),days=Math.max(3,+$("#calcDays").value||7);data.calculator={people:p,pets,days};
 $("#calcWater").textContent=`${p*days} gal`;$("#calcMeals").textContent=(p*days*3).toLocaleString();$("#calcPetWater").textContent=`${Math.ceil(pets*days*.5*10)/10} gal`;
 const watts=(+$("#wattsFridge").value||0)+(+$("#wattsSmall").value||0)+(+$("#wattsOther").value||0),hrs=+$("#runtimeHours").value||0;$("#powerResult").textContent=(watts*hrs/1000).toFixed(1)+" kWh";
 const fd=$("#fuelDate").value,m=+$("#fuelMonths").value||0;if(fd){const d=new Date(fd+"T00:00:00");d.setMonth(d.getMonth()+m);$("#fuelResult").textContent=d.toLocaleDateString()}else $("#fuelResult").textContent="Select a date";
 localStorage.setItem(KEY,JSON.stringify(data));
}
["calcPeople","calcPets","calcDays","wattsFridge","wattsSmall","wattsOther","runtimeHours","fuelDate","fuelMonths"].forEach(id=>$("#"+id).addEventListener("input",updateCalculators));
Object.entries(data.calculator||{}).forEach(([k,v])=>{const e=$("#calc"+k[0].toUpperCase()+k.slice(1));if(e)e.value=v});

function alertCard(a){const p=a.properties||{},sev=["Extreme","Severe"].includes(p.severity);return `<article class="card alert-card ${sev?"severe":""}"><div class="alert-meta"><span class="pill">${esc(p.severity||"Unknown")}</span><span class="pill">${esc(p.urgency||"")}</span></div><h2>${esc(p.event||"Weather alert")}</h2><small>${esc(p.areaDesc||"")}</small><p>${esc((p.headline||p.description||"").slice(0,1600))}</p></article>`}
$("#locationBtn").onclick=()=>{if(!navigator.geolocation){$("#alertStatus").textContent="Location is not supported.";return}$("#alertStatus").textContent="Requesting location…";navigator.geolocation.getCurrentPosition(async pos=>{try{$("#alertStatus").textContent="Checking active alerts…";const {latitude,longitude}=pos.coords,res=await fetch(`https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`,{headers:{Accept:"application/geo+json"}});if(!res.ok)throw Error();const j=await res.json(),arr=j.features||[];$("#alertStatus").textContent=arr.length?`${arr.length} active alert${arr.length===1?"":"s"} found.`:"No active NWS alerts were returned.";$("#alertList").innerHTML=arr.map(alertCard).join("")}catch(e){$("#alertStatus").textContent="Alerts could not be loaded. Use Weather.gov for official information."}},e=>$("#alertStatus").textContent=e.code===1?"Location permission was not granted.":"Location could not be determined.",{timeout:10000,maximumAge:300000})};

$("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ready-coast-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)};
$("#importInput").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!j.inventory)throw Error();data=j;localStorage.setItem(KEY,JSON.stringify(data));location.reload()}catch(err){alert("That file is not a valid Ready Coast backup.")}e.target.value=""};
$("#resetBtn").onclick=()=>{if(confirm("Delete all Ready Coast data stored in this browser?")){data=defaultData();localStorage.setItem(KEY,JSON.stringify(data));location.reload()}};

let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true};if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));

function renderAll(){renderDashboard();renderContacts();renderRecords();renderInventory();renderHazards()}
fillHousehold();fillEvac();renderAll();updateCalculators();
