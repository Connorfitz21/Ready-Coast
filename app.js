console.log("Ready Coast V3 loaded");
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="readyCoastV7";
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
function defaultData(){return{
 household:{name:"",area:"",adults:0,children:0,seniors:0,pets:0,needs:"",utilities:"",hasMedicalNeeds:false,hasAccessNeeds:false},
 contacts:[],records:[],inventory:structuredClone(DEFAULT_INV),hazards:{},selectedHazards:[],evac:{},
 calculator:{people:1,pets:0,days:7},selectedHazard:"Hurricane",onboardingComplete:false,onboardingDismissed:false
}}
let data=load();
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));if(p?.inventory)return p}catch(e){}return defaultData()}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function today(){return new Date(new Date().toDateString())}
function daysUntil(d){if(!d)return 99999;return Math.ceil((new Date(d+"T00:00:00")-today())/86400000)}
function pct(n,d){return d?Math.round(n/d*100):0}
function navigate(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));scrollTo({top:0,behavior:"smooth"})}
$$(".tabs button").forEach(b=>b.onclick=()=>navigate(b.dataset.view));$$("[data-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.jump));$("#printBtn").onclick=()=>print();

function householdPeople(){
 return Math.max(0,(+data.household.adults||0)+(+data.household.children||0)+(+data.household.seniors||0));
}
function invByName(name){return data.inventory.find(i=>i.name===name)}
function ratio(value,target){return target>0?Math.max(0,Math.min(1,(+value||0)/target)):0}
function truthyCount(values){return values.filter(Boolean).length}

function scoreModel(){
 if(!data.onboardingComplete){
  return {total:0,categories:[
   {key:"water",name:"Water",weight:20,earned:0},
   {key:"food",name:"Food",weight:15,earned:0},
   {key:"medical",name:"Medical & safety",weight:15,earned:0},
   {key:"communication",name:"Communication",weight:10,earned:0},
   {key:"power",name:"Power & lighting",weight:10,earned:0},
   {key:"evacuation",name:"Evacuation",weight:10,earned:0},
   {key:"documents",name:"Documents & cash",weight:10,earned:0},
   {key:"hazards",name:"Hazard actions",weight:5,earned:0},
   {key:"needs",name:"Household needs",weight:5,earned:0}
  ]};
 }
 const people=Math.max(1,householdPeople());
 const water=invByName("Drinking water"), food=invByName("Shelf-stable meals");
 const waterEarned=20*ratio(water?.qty,people*3);
 const foodEarned=15*ratio(food?.qty,people*3*3);

 const firstAid=+((invByName("First-aid kit")?.qty)||0)>=1;
 const medsAddressed=!data.household.hasMedicalNeeds || Boolean((data.household.needs||"").trim());
 const needsDocumented=Boolean((data.household.needs||"").trim()) || (!data.household.hasMedicalNeeds&&!data.household.hasAccessNeeds);
 const medicalEarned=15*((firstAid?0.4:0)+(medsAddressed?0.35:0)+(needsDocumented?0.25:0));

 const hasContact=data.contacts.length>0;
 const meeting=Boolean((data.evac.homeMeeting||"").trim()||(data.evac.neighborhoodMeeting||"").trim());
 const radio=+((invByName("Weather radio")?.qty)||0)>=1;
 const communicationEarned=10*((hasContact?0.4:0)+(meeting?0.3:0)+(radio?0.3:0));

 const flashlight=+((invByName("Flashlights")?.qty)||0)>=1;
 const powerBank=+((invByName("Phone power banks")?.qty)||0)>=1;
 const outagePlan=Boolean((data.household.utilities||"").trim());
 const powerEarned=10*((flashlight?0.4:0)+(powerBank?0.3:0)+(outagePlan?0.3:0));

 const evacChecks=[
  data.evac.primaryDestination,data.evac.backupDestination,data.evac.primaryRoute,
  data.evac.transport,data.evac.bagLocations
 ].map(v=>Boolean((v||"").trim()));
 const evacuationEarned=10*(truthyCount(evacChecks)/evacChecks.length);

 const records=data.records.length>0;
 const cash=+((invByName("Cash in small bills")?.qty)||0)>=1;
 const backup=Boolean(localStorage.getItem("readyCoastBackupExported"));
 const documentsEarned=10*((records?0.45:0)+(cash?0.35:0)+(backup?0.2:0));

 const chosen=data.selectedHazards||[];
 let hazardDone=0,hazardTotal=0;
 chosen.forEach(h=>{(HAZARDS[h]||[]).forEach((_,i)=>{hazardTotal++;if(data.hazards[h]?.[i])hazardDone++})});
 const hazardsEarned=chosen.length?5*(hazardTotal?hazardDone/hazardTotal:0):0;

 const petPlan=(+data.household.pets||0)===0 || Boolean((data.evac.petPlan||"").trim()) || +((invByName("Pet food")?.qty)||0)>0;
 const accessReviewed=!data.household.hasAccessNeeds || Boolean((data.household.needs||"").trim());
 const utilitiesReviewed=Boolean((data.household.utilities||"").trim());
 const needsEarned=5*((petPlan?0.35:0)+(accessReviewed?0.35:0)+(utilitiesReviewed?0.3:0));

 const categories=[
  {key:"water",name:"Water",weight:20,earned:waterEarned},
  {key:"food",name:"Food",weight:15,earned:foodEarned},
  {key:"medical",name:"Medical & safety",weight:15,earned:medicalEarned},
  {key:"communication",name:"Communication",weight:10,earned:communicationEarned},
  {key:"power",name:"Power & lighting",weight:10,earned:powerEarned},
  {key:"evacuation",name:"Evacuation",weight:10,earned:evacuationEarned},
  {key:"documents",name:"Documents & cash",weight:10,earned:documentsEarned},
  {key:"hazards",name:"Hazard actions",weight:5,earned:hazardsEarned},
  {key:"needs",name:"Household needs",weight:5,earned:needsEarned}
 ];
 return {total:Math.round(categories.reduce((sum,c)=>sum+c.earned,0)),categories};
}
function householdCompletion(){return data.onboardingComplete?100:0}
function inventoryCoverage(){const m=scoreModel();return Math.round(((m.categories[0].earned+m.categories[1].earned)/(35))*100)}
function hazardCompletion(){const c=scoreModel().categories.find(x=>x.key==="hazards");return Math.round((c.earned/c.weight)*100)}
function evacCompletion(){const c=scoreModel().categories.find(x=>x.key==="evacuation");return Math.round((c.earned/c.weight)*100)}
function overallScore(){return scoreModel().total}
function renderDashboard(){
 const model=scoreModel(),score=model.total,people=Math.max(1,householdPeople());
 $("#scoreValue").textContent=score;

 const water=+((invByName("Drinking water")?.qty)||0);
 const meals=+((invByName("Shelf-stable meals")?.qty)||0);
 const waterDays=Math.floor((water/people)*10)/10;
 const foodDays=Math.floor((meals/(people*3))*10)/10;
 $("#waterDaysMetric").textContent=`${waterDays} day${waterDays===1?"":"s"}`;
 $("#foodDaysMetric").textContent=`${foodDays} day${foodDays===1?"":"s"}`;
 $("#waterNeedMetric").textContent=data.onboardingComplete?`${Math.max(0,people*3-water).toFixed(1)} gallons to 3-day minimum`:"Complete setup to calculate";
 $("#foodNeedMetric").textContent=data.onboardingComplete?`${Math.max(0,people*9-meals)} meals to 3-day minimum`:"Complete setup to calculate";

 const planPieces=[
  data.contacts.length>0,
  Boolean((data.evac.homeMeeting||"").trim()||(data.evac.neighborhoodMeeting||"").trim()),
  Boolean((data.evac.primaryDestination||"").trim()),
  Boolean((data.evac.primaryRoute||"").trim())
 ];
 const planPct=Math.round(truthyCount(planPieces)/planPieces.length*100);
 $("#planMetric").textContent=!data.onboardingComplete?"Not started":planPct===100?"Ready":planPct>=50?"In progress":"Needs work";

 const attention=data.inventory.filter(i=>["low","expiring","expired"].includes(itemState(i))).length+
   (data.contacts.length?0:1)+(data.evac.primaryDestination?0:1);
 $("#attentionMetric").textContent=data.onboardingComplete?attention:0;

 const message=$("#readinessMessage"),detail=$("#readinessDetail");
 if(!data.onboardingComplete){
  message.textContent="Complete the setup to receive a household-specific baseline.";
  detail.textContent="Ready Coast starts at 0 because it should not assume you own supplies or have a plan.";
 }else if(score<25){
  message.textContent="Your basic needs are not yet covered for a three-day disruption.";
  detail.textContent="Start with water, food, medications, lighting, and one emergency contact.";
 }else if(score<50){
  message.textContent="You have started, but several critical gaps remain.";
  detail.textContent="Focus on the highest-point actions below before buying specialized gear.";
 }else if(score<75){
  message.textContent="Your household has a useful foundation.";
  detail.textContent="Strengthen evacuation, communication, and hazard-specific actions.";
 }else if(score<90){
  message.textContent="Your recorded plan covers most core preparedness areas.";
  detail.textContent="Review expiration dates, practice the plan, and work toward a longer home supply.";
 }else{
  message.textContent="Your recorded plan is strong across the core categories.";
  detail.textContent="Maintain supplies, practice regularly, and follow current official instructions during an emergency.";
 }

 const actionPool=[];
 const addAction=(text,points,jump,priority)=>actionPool.push({text,points,jump,priority});
 if(!data.onboardingComplete)addAction("Complete the two-minute household setup",0,"setup",100);
 else{
  const waterMissing=Math.max(0,people*3-water);
  const foodMissing=Math.max(0,people*9-meals);
  if(waterMissing>0)addAction(`Add ${waterMissing.toFixed(1)} gallons of water to reach the three-day minimum`,Math.ceil(20-model.categories[0].earned),"inventory",98);
  if(foodMissing>0)addAction(`Add ${Math.ceil(foodMissing)} shelf-stable meals to reach the three-day minimum`,Math.ceil(15-model.categories[1].earned),"inventory",95);
  if(+((invByName("First-aid kit")?.qty)||0)<1)addAction("Add an accessible first-aid kit",6,"inventory",90);
  if(data.household.hasMedicalNeeds&&!(data.household.needs||"").trim())addAction("Document medication and medical-equipment needs",5,"household",89);
  if(!data.contacts.length)addAction("Add an out-of-area emergency contact",4,"household",86);
  if(+((invByName("Weather radio")?.qty)||0)<1)addAction("Add a battery or hand-crank weather radio",3,"inventory",80);
  if(+((invByName("Flashlights")?.qty)||0)<1)addAction("Add working flashlights",4,"inventory",78);
  if(!data.evac.primaryDestination)addAction("Choose a primary evacuation destination",2,"evacuation",75);
  if(!data.evac.primaryRoute)addAction("Document a primary evacuation route",2,"evacuation",73);
  if(!data.records.length)addAction("Record where critical documents are stored",5,"household",68);
 }
 actionPool.sort((a,b)=>b.priority-a.priority);
 $("#priorityList").innerHTML=actionPool.length?actionPool.slice(0,5).map((a,i)=>`<button class="priority action-button" data-action-jump="${a.jump}"><i>${i+1}</i><div><b>${esc(a.text)}</b>${a.points?`<small>Up to +${a.points} points</small>`:"<small>Creates your baseline</small>"}</div></button>`).join(""):"<div class='priority'><i>✓</i><div><b>No immediate gaps detected from the information entered.</b><small>Review, maintain, and practice your plan.</small></div></div>";
 $$("[data-action-jump]").forEach(b=>b.onclick=()=>b.dataset.actionJump==="setup"?openOnboarding():navigate(b.dataset.actionJump));

 $("#coverageBars").innerHTML=model.categories.map(c=>{const categoryPct=Math.round(c.earned/c.weight*100);return `<div class="coverage-row"><div><span>${esc(c.name)}</span><b>${Math.round(c.earned)}/${c.weight}</b></div><div class="bar"><i style="width:${categoryPct}%"></i></div></div>`}).join("");

 const upcoming=data.inventory.filter(i=>i.expiry).sort((a,b)=>a.expiry.localeCompare(b.expiry)).slice(0,5);
 $("#upcomingList").innerHTML=upcoming.length?upcoming.map(i=>{const d=daysUntil(i.expiry);return `<div><b>${esc(i.name)}</b><br><small>${d<0?`Expired ${Math.abs(d)} days ago`:d===0?"Expires today":`Expires in ${d} days`} • ${esc(i.location||"No location")}</small></div>`}).join(""):"<div>No expiration or review dates have been entered.</div>";
 renderScoreBreakdown();
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

$("#exportBtn").onclick=()=>{localStorage.setItem("readyCoastBackupExported","true");const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ready-coast-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)};
$("#importInput").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!j.inventory)throw Error();data=j;localStorage.setItem(KEY,JSON.stringify(data));location.reload()}catch(err){alert("That file is not a valid Ready Coast backup.")}e.target.value=""};
$("#resetBtn").onclick=()=>{if(confirm("Delete all Ready Coast data stored in this browser?")){data=defaultData();localStorage.setItem(KEY,JSON.stringify(data));location.reload()}};


let onboardingStep=1;
function setOnboardingStep(step){
 onboardingStep=Math.max(1,Math.min(4,step));
 $$(".onboarding-step").forEach(s=>s.classList.toggle("active",+s.dataset.step===onboardingStep));
 $("#onboardingProgress").style.width=`${onboardingStep*25}%`;
 $("#onboardingBack").hidden=onboardingStep===1;
 $("#onboardingNext").hidden=onboardingStep===4;
 $("#onboardingFinish").hidden=onboardingStep!==4;
}
function fillOnboarding(){
 const f=$("#onboardingForm");
 ["name","adults","children","seniors","pets","needs"].forEach(k=>{if(f.elements[k])f.elements[k].value=data.household[k]??""});
 if(f.elements.hasMedicalNeeds)f.elements.hasMedicalNeeds.checked=Boolean(data.household.hasMedicalNeeds);
 if(f.elements.hasAccessNeeds)f.elements.hasAccessNeeds.checked=Boolean(data.household.hasAccessNeeds);
 $$('input[name="hazard"]').forEach(c=>c.checked=(data.selectedHazards||[]).includes(c.value));
 const water=invByName("Drinking water"),food=invByName("Shelf-stable meals");
 f.elements.waterQty.value=water?.qty||0;f.elements.foodQty.value=food?.qty||0;
 f.elements.hasFirstAid.checked=+((invByName("First-aid kit")?.qty)||0)>=1;
 f.elements.hasFlashlights.checked=+((invByName("Flashlights")?.qty)||0)>=1;
 f.elements.hasRadio.checked=+((invByName("Weather radio")?.qty)||0)>=1;
 f.elements.hasPowerBanks.checked=+((invByName("Phone power banks")?.qty)||0)>=1;
 f.elements.hasCash.checked=+((invByName("Cash in small bills")?.qty)||0)>=1;
}
function openOnboarding(){fillOnboarding();setOnboardingStep(1);$("#onboardingDialog").showModal()}
$("#setupBtn").onclick=openOnboarding;
$("#onboardingBack").onclick=()=>setOnboardingStep(onboardingStep-1);
$("#onboardingNext").onclick=()=>{
 const section=$(`.onboarding-step[data-step="${onboardingStep}"]`);
 const required=[...section.querySelectorAll("[required]")];
 if(required.some(el=>!el.reportValidity()))return;
 if(onboardingStep===1){
  const f=$("#onboardingForm"),people=(+f.elements.adults.value||0)+(+f.elements.children.value||0)+(+f.elements.seniors.value||0);
  if(people<1){alert("Enter at least one person in the household.");return}
 }
 setOnboardingStep(onboardingStep+1);
};
$("#onboardingSkip").onclick=()=>{data.onboardingDismissed=true;localStorage.setItem(KEY,JSON.stringify(data));$("#onboardingDialog").close()};
$("#onboardingForm").onsubmit=e=>{
 e.preventDefault();const f=e.target;
 Object.assign(data.household,{
  name:f.elements.name.value.trim(),
  adults:+f.elements.adults.value||0,children:+f.elements.children.value||0,
  seniors:+f.elements.seniors.value||0,pets:+f.elements.pets.value||0,
  needs:f.elements.needs.value.trim(),
  hasMedicalNeeds:f.elements.hasMedicalNeeds.checked,
  hasAccessNeeds:f.elements.hasAccessNeeds.checked
 });
 data.selectedHazards=$$('input[name="hazard"]:checked').map(c=>c.value);
 if(data.selectedHazards.length)data.selectedHazard=data.selectedHazards[0];
 const setInv=(name,qty)=>{const item=invByName(name);if(item)item.qty=qty};
 setInv("Drinking water",+f.elements.waterQty.value||0);
 setInv("Shelf-stable meals",+f.elements.foodQty.value||0);
 setInv("First-aid kit",f.elements.hasFirstAid.checked?1:0);
 setInv("Flashlights",f.elements.hasFlashlights.checked?2:0);
 setInv("Weather radio",f.elements.hasRadio.checked?1:0);
 setInv("Phone power banks",f.elements.hasPowerBanks.checked?2:0);
 setInv("Cash in small bills",f.elements.hasCash.checked?1:0);
 const people=Math.max(1,householdPeople());
 const water=invByName("Drinking water"),food=invByName("Shelf-stable meals");
 if(water)water.target=people*3;
 if(food)food.target=people*9;
 const petFood=invByName("Pet food");if(petFood)petFood.target=(+data.household.pets||0)>0?3:0;
 data.calculator={people,pets:+data.household.pets||0,days:7};
 data.onboardingComplete=true;data.onboardingDismissed=false;
 localStorage.setItem(KEY,JSON.stringify(data));
 $("#onboardingDialog").close();fillHousehold();fillEvac();renderAll();updateCalculators();if(!data.onboardingComplete&&!data.onboardingDismissed)setTimeout(openOnboarding,350);
};
function renderScoreBreakdown(){
 const model=scoreModel();
 $("#scoreBreakdown").innerHTML=model.categories.map(c=>`<div><span>${esc(c.name)}</span><div class="mini-bar"><i style="width:${Math.round(c.earned/c.weight*100)}%"></i></div><b>${Math.round(c.earned)} / ${c.weight}</b></div>`).join("");
}
$("#scoreInfoBtn").onclick=()=>{$("#scoreDialog").showModal();renderScoreBreakdown()};
$("#closeScoreDialog").onclick=()=>$("#scoreDialog").close();

let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true};if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));

function renderAll(){renderDashboard();renderContacts();renderRecords();renderInventory();renderHazards()}
fillHousehold();fillEvac();renderAll();updateCalculators();if(!data.onboardingComplete&&!data.onboardingDismissed)setTimeout(openOnboarding,350);
