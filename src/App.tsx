import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ── Data ──
const GEO_DATA = {
  Africa: {
    "Northern Africa": ["Algeria","Egypt","Libya","Morocco","Sudan","Tunisia","Western Sahara"],
    "Eastern Africa": ["Burundi","Comoros","Djibouti","Eritrea","Ethiopia","Kenya","Madagascar","Malawi","Mauritius","Mozambique","Rwanda","Seychelles","Somalia","South Sudan","Uganda","Tanzania","Zambia","Zimbabwe"],
    "Middle Africa": ["Angola","Cameroon","Central African Republic","Chad","Congo","DR Congo","Equatorial Guinea","Gabon","São Tomé and Príncipe"],
    "Southern Africa": ["Botswana","Eswatini","Lesotho","Namibia","South Africa"],
    "Western Africa": ["Benin","Burkina Faso","Cabo Verde","Côte d'Ivoire","Gambia","Ghana","Guinea","Guinea-Bissau","Liberia","Mali","Mauritania","Niger","Nigeria","Senegal","Sierra Leone","Togo"]
  },
  Americas: {
    "Caribbean": ["Antigua and Barbuda","Bahamas","Barbados","Cuba","Dominica","Dominican Republic","Grenada","Haiti","Jamaica","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Trinidad and Tobago"],
    "Central America": ["Belize","Costa Rica","El Salvador","Guatemala","Honduras","Mexico","Nicaragua","Panama"],
    "South America": ["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"],
    "Northern America": ["Bermuda","Canada","Greenland","United States"]
  },
  Asia: {
    "Central Asia": ["Kazakhstan","Kyrgyzstan","Tajikistan","Turkmenistan","Uzbekistan"],
    "Eastern Asia": ["China","Hong Kong","Macao","North Korea","Japan","Mongolia","South Korea","Taiwan"],
    "South-Eastern Asia": ["Brunei","Cambodia","Indonesia","Laos","Malaysia","Myanmar","Philippines","Singapore","Thailand","Timor-Leste","Vietnam"],
    "Southern Asia": ["Afghanistan","Bangladesh","Bhutan","India","Iran","Maldives","Nepal","Pakistan","Sri Lanka"],
    "Western Asia": ["Armenia","Azerbaijan","Bahrain","Cyprus","Georgia","Iraq","Israel","Jordan","Kuwait","Lebanon","Oman","Qatar","Saudi Arabia","Palestine","Syria","Türkiye","United Arab Emirates","Yemen"]
  },
  Europe: {
    "Eastern Europe": ["Belarus","Bulgaria","Czechia","Hungary","Poland","Moldova","Romania","Russia","Slovakia","Ukraine"],
    "Northern Europe": ["Denmark","Estonia","Finland","Iceland","Ireland","Latvia","Lithuania","Norway","Sweden","United Kingdom"],
    "Southern Europe": ["Albania","Andorra","Bosnia and Herzegovina","Croatia","Gibraltar","Greece","Holy See","Italy","Malta","Montenegro","North Macedonia","Portugal","San Marino","Serbia","Slovenia","Spain","Kosovo"],
    "Western Europe": ["Austria","Belgium","France","Germany","Liechtenstein","Luxembourg","Monaco","Netherlands","Switzerland"]
  },
  Oceania: {
    "Australia and New Zealand": ["Australia","New Zealand"],
    "Melanesia": ["Fiji","New Caledonia","Papua New Guinea","Solomon Islands","Vanuatu"],
    "Micronesia": ["Guam","Kiribati","Marshall Islands","Micronesia","Nauru","Palau"],
    "Polynesia": ["American Samoa","Cook Islands","French Polynesia","Niue","Samoa","Tokelau","Tonga","Tuvalu"]
  }
};
const SUBDIVISIONS = {
  "United States": ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],
  "Canada": ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan","Northwest Territories","Nunavut","Yukon"],
  "Australia": ["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania","Australian Capital Territory","Northern Territory"],
  "Brazil": ["Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"],
  "India": ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"],
  "France": ["Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","Bretagne","Centre-Val de Loire","Corse","Grand Est","Hauts-de-France","Île-de-France","Normandie","Nouvelle-Aquitaine","Occitanie","Pays de la Loire","Provence-Alpes-Côte d'Azur"],
  "Germany": ["Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt","Schleswig-Holstein","Thuringia"],
  "Mexico": ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Guanajuato","Guerrero","Hidalgo","Jalisco","México","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"]
};
const hasSubs = c => !!SUBDIVISIONS[c];
const getSubs = c => SUBDIVISIONS[c] || [];
const getAllCSr = sr => { for (const c of Object.keys(GEO_DATA)) if (GEO_DATA[c][sr]) return GEO_DATA[c][sr]; return []; };
const getAllSrCont = cont => Object.keys(GEO_DATA[cont] || {});
const getAllCCont = cont => { let r = []; for (const sr of getAllSrCont(cont)) r.push(...GEO_DATA[cont][sr]); return r; };
const findCont = name => Object.keys(GEO_DATA).find(c => Object.values(GEO_DATA[c]).flat().includes(name));
const findSr = (cont, name) => cont && Object.keys(GEO_DATA[cont]).find(s => GEO_DATA[cont][s].includes(name));
const CHAIR_COLORS = ["#4F46E5","#0891B2","#059669","#D97706","#DC2626","#7C3AED","#DB2777","#2563EB"];

// ── Icons ──
const ChevronR = ({s:z=16}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevronD = ({s:z=16}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const CheckI = ({s:z=12}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const MinusI = ({s:z=12}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XI = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SearchI = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EditI = ({s:z=12}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const GlobeI = ({s:z=16}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const PlusI = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashI = ({s:z=13}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ArrowL = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const UserI = ({s:z=16}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LayersI = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const PackageI = ({s:z=14}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const UsersI = ({s:z=16}) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

// ── Shared ──
function Checkbox({state, onChange}) {
  const bg = state==="unchecked"?"transparent":"#4F46E5", border = state==="unchecked"?"#CBD5E1":"#4F46E5";
  return <button onClick={onChange} style={{width:18,height:18,borderRadius:4,border:`2px solid ${border}`,background:bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,padding:0,transition:"all 0.15s"}}>{state==="checked"&&<CheckI/>}{state==="partial"&&<MinusI/>}</button>;
}
function InlineEdit({value,onSave,onCancel,placeholder="Name…",width=160}) {
  const [v,setV]=useState(value); const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();},[]);
  const save=()=>{v.trim()?onSave(v.trim()):onCancel();};
  return <input ref={ref} value={v} onChange={e=>setV(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")onCancel();}} style={{border:"1px solid #A5B4FC",borderRadius:6,padding:"3px 8px",fontSize:13,fontWeight:600,outline:"none",width}} placeholder={placeholder}/>;
}
function Toast({msg}) { return <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#fff",padding:"10px 20px",borderRadius:8,fontSize:13,zIndex:999,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>{msg}</div>; }
function Bdg({children,bg,color}) { return <span style={{fontSize:10,fontWeight:700,color,background:bg,padding:"2px 7px",borderRadius:10,whiteSpace:"nowrap"}}>{children}</span>; }

function flattenScope(sel, subsets) {
  const units = [];
  for (const k of sel) {
    if(k.startsWith("continent:")) units.push({id:k,label:k.slice(10),type:"continent"});
    if(k.startsWith("subregion:")) units.push({id:k,label:k.slice(10),type:"subregion"});
    if(k.startsWith("country:")) units.push({id:k,label:k.slice(8),type:"country"});
  }
  for (const sub of subsets) units.push({id:`subset:${sub.id}`,label:sub.name,type:"subset",subset:sub});
  return units;
}

// Expand a unit into granular sub-units for vice chair assignment
function expandUnit(unit) {
  if (unit.type==="continent") {
    return getAllCCont(unit.label).map(c=>({id:`vc_country:${c}`,label:c,type:"country"}));
  }
  if (unit.type==="subregion") {
    return getAllCSr(unit.label).map(c=>({id:`vc_country:${c}`,label:c,type:"country"}));
  }
  if (unit.type==="country" && hasSubs(unit.label)) {
    return getSubs(unit.label).map(s=>({id:`vc_sub:${unit.label}:${s}`,label:s,type:"subdivision",parent:unit.label}));
  }
  if (unit.type==="subset" && unit.subset) {
    return unit.subset.subdivisions.map(s=>({id:`vc_sub:${unit.subset.country}:${s}`,label:s,type:"subdivision",parent:unit.subset.country}));
  }
  return null; // can't expand further
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step1({sel,setSel,subsets,setSubsets,onNext}) {
  const [expanded,setExpanded]=useState(new Set());
  const [search,setSearch]=useState("");
  const [subMode,setSubMode]=useState(new Set());
  const [subSel,setSubSel]=useState({});
  const [toast,setToast]=useState(null);
  const [namingSub,setNamingSub]=useState(null);
  const [editSub,setEditSub]=useState(null);

  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(t);}},[toast]);

  const usedSubs=useCallback(country=>{const u=new Set();subsets.filter(s=>s.country===country).forEach(s=>s.subdivisions.forEach(x=>u.add(x)));return u;},[subsets]);
  const isSelected=useCallback(k=>sel.has(k),[sel]);

  const getCS=useCallback((type,name)=>{
    if(type==="continent"){if(isSelected(`continent:${name}`))return"checked";const srs=getAllSrCont(name),cs=getAllCCont(name);if(srs.some(s=>isSelected(`subregion:${s}`))||cs.some(c=>isSelected(`country:${c}`))||cs.some(c=>subsets.some(sub=>sub.country===c)))return"partial";return"unchecked";}
    if(type==="subregion"){if(isSelected(`subregion:${name}`))return"checked";const cont=Object.keys(GEO_DATA).find(c=>GEO_DATA[c][name]);if(cont&&isSelected(`continent:${cont}`))return"checked";const cs=getAllCSr(name);if(cs.some(c=>isSelected(`country:${c}`))||cs.some(c=>subsets.some(sub=>sub.country===c)))return"partial";return"unchecked";}
    if(type==="country"){if(isSelected(`country:${name}`))return"checked";const cont=findCont(name);if(cont&&isSelected(`continent:${cont}`))return"checked";const sr=findSr(cont,name);if(sr&&isSelected(`subregion:${sr}`))return"checked";if(subsets.some(s=>s.country===name))return"partial";return"unchecked";}
    return"unchecked";
  },[sel,isSelected,subsets]);

  const toggle=useCallback((type,name)=>{
    setSel(prev=>{const next=new Set(prev);
      if(type==="continent"){if(next.has(`continent:${name}`)){next.delete(`continent:${name}`);}else{getAllSrCont(name).forEach(s=>next.delete(`subregion:${s}`));getAllCCont(name).forEach(c=>next.delete(`country:${c}`));next.add(`continent:${name}`);}}
      else if(type==="subregion"){const cont=Object.keys(GEO_DATA).find(c=>GEO_DATA[c][name]);if(next.has(`subregion:${name}`)){next.delete(`subregion:${name}`);}else if(cont&&next.has(`continent:${cont}`)){next.delete(`continent:${cont}`);getAllSrCont(cont).forEach(s=>next.add(`subregion:${s}`));next.delete(`subregion:${name}`);}else{getAllCSr(name).forEach(c=>next.delete(`country:${c}`));next.add(`subregion:${name}`);if(cont){const all=getAllSrCont(cont);if(all.every(s=>next.has(`subregion:${s}`))){all.forEach(s=>next.delete(`subregion:${s}`));next.add(`continent:${cont}`);}}}}
      else if(type==="country"){const cont=findCont(name),sr=findSr(cont,name),cs=getCS("country",name);if(cs==="checked"){if(next.has(`continent:${cont}`)){next.delete(`continent:${cont}`);getAllSrCont(cont).forEach(s=>next.add(`subregion:${s}`));next.delete(`subregion:${sr}`);getAllCSr(sr).forEach(c=>{if(c!==name)next.add(`country:${c}`);});}else if(sr&&next.has(`subregion:${sr}`)){next.delete(`subregion:${sr}`);getAllCSr(sr).forEach(c=>{if(c!==name)next.add(`country:${c}`);});}else{next.delete(`country:${name}`);}}else{setSubsets(p=>p.filter(s=>s.country!==name));next.add(`country:${name}`);if(sr){const allC=getAllCSr(sr);if(allC.every(c=>next.has(`country:${c}`))){allC.forEach(c=>next.delete(`country:${c}`));next.add(`subregion:${sr}`);if(cont){const allS=getAllSrCont(cont);if(allS.every(s=>next.has(`subregion:${s}`))){allS.forEach(s=>next.delete(`subregion:${s}`));next.add(`continent:${cont}`);}}}}}setSubMode(p=>{const n=new Set(p);n.delete(name);return n;});}
      return next;});
  },[getCS,setSel,setSubsets]);

  const enterSubMode=country=>{setSel(p=>{const n=new Set(p);n.delete(`country:${country}`);return n;});setSubMode(p=>{const n=new Set(p);n.add(country);return n;});setExpanded(p=>{const n=new Set(p);n.add(`subs:${country}`);return n;});setSubSel(p=>({...p,[country]:new Set()}));};
  const toggleSubSel=(country,sub)=>{setSubSel(p=>{const cur=new Set(p[country]||[]);cur.has(sub)?cur.delete(sub):cur.add(sub);return{...p,[country]:cur};});};
  const createSubset=(country,name)=>{const subs=Array.from(subSel[country]||[]);if(subs.length===0||!name.trim())return;setSubsets(p=>[...p,{id:`${country}_${Date.now()}`,country,name:name.trim(),subdivisions:subs}]);setSubSel(p=>({...p,[country]:new Set()}));setNamingSub(null);setToast(`Subset "${name.trim()}" created`);};
  const removeSubset=id=>{setSubsets(p=>p.filter(s=>s.id!==id));};
  const renameSubset=(id,name)=>{setSubsets(p=>p.map(s=>s.id===id?{...s,name}:s));setEditSub(null);};

  const toggleExpand=k=>setExpanded(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;});
  const sL=search.toLowerCase(),ms=n=>!search||n.toLowerCase().includes(sL),srM=sr=>ms(sr)||getAllCSr(sr).some(ms),coM=co=>ms(co)||getAllSrCont(co).some(srM);

  const summary=useMemo(()=>{const items=[];for(const k of sel){if(k.startsWith("continent:"))items.push({type:"continent",name:k.slice(10)});if(k.startsWith("subregion:"))items.push({type:"subregion",name:k.slice(10)});if(k.startsWith("country:"))items.push({type:"country",name:k.slice(8)});}return items;},[sel]);
  const totalSel=summary.length+subsets.length;
  const removeFromSummary=item=>{setSel(p=>{const n=new Set(p);n.delete(`${item.type}:${item.name}`);return n;});};

  function TR({depth,name,type,cCount,hasKids,ek}) {
    const [h,setH]=useState(false); const st=getCS(type,name),isE=expanded.has(ek);
    const subsCount=hasSubs(name)?getSubs(name).length:0,usedCount=hasSubs(name)?usedSubs(name).size:0;
    return (
      <div style={{display:"flex",alignItems:"center",gap:6,padding:`4px 12px 4px ${12+depth*20}px`,cursor:"pointer",background:h?"#F1F5F9":"transparent",transition:"background 0.1s",userSelect:"none",minHeight:30}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
        {hasKids?<button style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"none",border:"none",cursor:"pointer",padding:0,color:"#94A3B8"}} onClick={e=>{e.stopPropagation();toggleExpand(ek);}}>{isE?<ChevronD s={14}/>:<ChevronR s={14}/>}</button>:<span style={{width:20,flexShrink:0}}/>}
        <Checkbox state={st} onChange={()=>toggle(type,name)}/>
        <span style={{flex:1,fontSize:13}} onClick={()=>hasKids?toggleExpand(ek):toggle(type,name)}>{name}</span>
        {cCount>0&&!hasSubs(name)&&<span style={{fontSize:11,color:"#94A3B8"}}>{cCount}</span>}
        {type==="country"&&hasSubs(name)&&(
          <button onClick={e=>{e.stopPropagation();enterSubMode(name);}} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,padding:"2px 8px",fontSize:11,color:"#6366F1",cursor:"pointer",fontWeight:500,display:"inline-flex",alignItems:"center",gap:4}}>
            <LayersI s={11}/> {subsCount} states
            {usedCount>0&&<span style={{background:"#EF4444",color:"#fff",borderRadius:99,fontSize:9,fontWeight:700,padding:"1px 5px",marginLeft:2}}>{usedCount}</span>}
          </button>
        )}
      </div>
    );
  }

  function SubPanel({country}) {
    const allS=getSubs(country),used=usedSubs(country),avail=allS.filter(s=>!used.has(s)),curSel=subSel[country]||new Set(),cSubs=subsets.filter(s=>s.country===country);
    return (
      <div style={{marginLeft:52,marginRight:12,marginBottom:8,background:"#FAFBFD",border:"1px solid #E2E8F0",borderRadius:10,overflow:"hidden"}}>
        {cSubs.length>0&&<div style={{padding:"8px 12px",borderBottom:"1px solid #E2E8F0"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:6}}>EXISTING SUBSETS</div>
          {cSubs.map(sub=>(
            <div key={sub.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",marginBottom:4,background:"#fff",border:"1.5px dashed #A5B4FC",borderRadius:8,fontSize:12}}>
              <PackageI s={12}/>
              {editSub===sub.id?<InlineEdit value={sub.name} onSave={v=>renameSubset(sub.id,v)} onCancel={()=>setEditSub(null)} width={130}/>:(
                <><span style={{fontWeight:600,flex:1}}>{sub.name}</span><Bdg bg="#EEF2FF" color="#6366F1">{sub.subdivisions.length}</Bdg><button onClick={()=>setEditSub(sub.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#6366F1",padding:2,display:"flex"}}><EditI/></button></>
              )}
              <button onClick={()=>removeSubset(sub.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#CBD5E1",padding:2,display:"flex"}}><XI s={12}/></button>
            </div>
          ))}
        </div>}
        {avail.length>0&&<div style={{padding:"8px 12px"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",marginBottom:6}}>SELECT STATES FOR A NEW SUBSET ({curSel.size} selected)</div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:4}}>
            {avail.filter(ms).map(sub=>{const checked=curSel.has(sub);return(
              <button key={sub} onClick={()=>toggleSubSel(country,sub)} style={{padding:"3px 10px",fontSize:11,borderRadius:6,border:checked?"1.5px solid #4F46E5":"1px solid #E2E8F0",background:checked?"#EEF2FF":"#fff",color:checked?"#4F46E5":"#64748B",cursor:"pointer",fontWeight:checked?600:400,transition:"all 0.12s"}}>{sub}</button>
            );})}
          </div>
          {curSel.size>0&&<div style={{marginTop:8}}>
            {namingSub===country?<div style={{display:"flex",gap:6,alignItems:"center"}}><InlineEdit value="" placeholder="Subset name…" onSave={v=>createSubset(country,v)} onCancel={()=>setNamingSub(null)} width={150}/><span style={{fontSize:11,color:"#94A3B8"}}>{curSel.size} states</span></div>
            :<button onClick={()=>setNamingSub(country)} style={{padding:"5px 14px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}><PlusI s={12}/> Create subset ({curSel.size})</button>}
          </div>}
        </div>}
        {avail.length===0&&cSubs.length>0&&<div style={{padding:"8px 12px",fontSize:12,color:"#94A3B8"}}>All states assigned to subsets</div>}
      </div>
    );
  }

  const chipS=t=>({display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#FFF",border:t==="subset"?"1.5px dashed #A5B4FC":"1px solid #E2E8F0",borderRadius:10,marginBottom:6,fontSize:13});
  const rmBtn={marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:2,display:"flex",flexShrink:0};

  return (
    <div style={{display:"flex",flex:1,minHeight:0}}>
      <div style={{flex:"1 1 60%",display:"flex",flexDirection:"column",borderRight:"1px solid #E2E8F0",background:"#fff"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><GlobeI s={18}/><span style={{fontWeight:700,fontSize:16}}>Geographic Scope</span></div>
          <div style={{fontSize:12,color:"#64748B",marginTop:2}}>Select areas or create named subsets from states/provinces</div>
          <div style={{position:"relative",marginTop:10}}><span style={{position:"absolute",left:10,top:8,color:"#94A3B8"}}><SearchI/></span><input style={{width:"100%",padding:"7px 12px 7px 32px",border:"1px solid #E2E8F0",borderRadius:8,fontSize:13,outline:"none",background:"#F8FAFC",boxSizing:"border-box"}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          {Object.keys(GEO_DATA).filter(coM).map(cont=>(
            <div key={cont}>
              <TR depth={0} name={cont} type="continent" cCount={getAllCCont(cont).length} hasKids ek={`co:${cont}`}/>
              {expanded.has(`co:${cont}`)&&getAllSrCont(cont).filter(srM).map(sr=>(
                <div key={sr}>
                  <TR depth={1} name={sr} type="subregion" cCount={getAllCSr(sr).length} hasKids ek={`sr:${sr}`}/>
                  {expanded.has(`sr:${sr}`)&&getAllCSr(sr).filter(ms).map(c=>(
                    <div key={c}>
                      <TR depth={2} name={c} type="country" cCount={0} hasKids={subMode.has(c)} ek={`subs:${c}`}/>
                      {subMode.has(c)&&expanded.has(`subs:${c}`)&&<SubPanel country={c}/>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{padding:"10px 20px",borderTop:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#64748B"}}>{totalSel===0?"No areas selected":`${totalSel} area${totalSel>1?"s":""} selected`}</span>
          <button onClick={()=>{if(totalSel>0)onNext();}} style={{padding:"8px 24px",background:totalSel>0?"#4F46E5":"#CBD5E1",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:totalSel>0?"pointer":"default"}}>Next: Academy Chairs →</button>
        </div>
      </div>
      <div style={{flex:"1 1 40%",display:"flex",flexDirection:"column",background:"#F8FAFC",maxWidth:400}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}><div style={{fontWeight:700,fontSize:15}}>Scope Summary</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>Source of truth</div></div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
          {totalSel===0&&<div style={{padding:40,textAlign:"center",color:"#94A3B8",fontSize:13}}><GlobeI s={28}/><div style={{marginTop:10}}>Select areas from the tree</div></div>}
          {[{k:"continent",l:"Continents",f:i=>i.type==="continent"},{k:"subregion",l:"Sub-regions",f:i=>i.type==="subregion"},{k:"country",l:"Countries",f:i=>i.type==="country"}].map(({k,l,f})=>{
            const items=summary.filter(f);if(!items.length)return null;
            return(<div key={k} style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{l}</div>
              {items.map(item=>(<div key={item.name} style={chipS(item.type)}>{item.type==="continent"&&<GlobeI s={14}/>}<span style={{fontWeight:item.type==="continent"?600:500}}>{item.name}</span>{item.type==="continent"&&<Bdg bg="#D1FAE5" color="#059669">Full</Bdg>}{item.type==="subregion"&&<Bdg bg="#EEF2FF" color="#6366F1">Sub-region</Bdg>}<button style={rmBtn} onClick={()=>removeFromSummary(item)}><XI s={14}/></button></div>))}
            </div>);
          })}
          {subsets.length>0&&<div style={{marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Subsets</div>
            {subsets.map(sub=>(<div key={sub.id} style={chipS("subset")}><div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><PackageI s={13}/><span style={{fontWeight:600}}>{sub.name}</span><span style={{fontSize:11,color:"#94A3B8"}}>{sub.country}</span><Bdg bg="#EEF2FF" color="#6366F1">{sub.subdivisions.length} states</Bdg></div>
              <div style={{fontSize:11,color:"#64748B",marginTop:3,lineHeight:"15px"}}>{sub.subdivisions.slice(0,4).join(", ")}{sub.subdivisions.length>4&&` +${sub.subdivisions.length-4} more`}</div>
            </div><button style={rmBtn} onClick={()=>removeSubset(sub.id)}><XI s={14}/></button></div>))}
          </div>}
        </div>
      </div>
      {toast&&<Toast msg={toast}/>}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step2({sel,subsets,chairs,setChairs,assignments,setAssignments,onBack,onNext}) {
  const [dd,setDd]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [editCh,setEditCh]=useState(null);

  const units=useMemo(()=>flattenScope(sel,subsets),[sel,subsets]);
  const unassigned=units.filter(u=>!assignments[u.id]);
  const assigned=id=>units.filter(u=>assignments[u.id]===id);
  const assignTo=(uid,cid)=>{setAssignments(p=>({...p,[uid]:cid}));setDd(null);};
  const unassign=uid=>{setAssignments(p=>{const n={...p};delete n[uid];return n;});};
  const addChair=name=>{if(!name.trim())return;setChairs(p=>[...p,{id:`ch_${Date.now()}`,name:name.trim(),color:CHAIR_COLORS[p.length%CHAIR_COLORS.length]}]);setShowNew(false);};
  const removeChair=id=>{setChairs(p=>p.filter(c=>c.id!==id));setAssignments(p=>{const n={...p};for(const k of Object.keys(n))if(n[k]===id)delete n[k];return n;});};
  const renameChair=(id,name)=>{setChairs(p=>p.map(c=>c.id===id?{...c,name}:c));setEditCh(null);};
  const total=units.length,assignedCount=units.filter(u=>assignments[u.id]).length,allDone=assignedCount===total&&total>0;

  const uChip=(unit,{showAssign,showRemove,chairColor}={})=>(
    <div key={unit.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12,position:"relative",borderLeft:chairColor?`3px solid ${chairColor}`:undefined}}>
      <span style={{flex:1,fontWeight:500}}>{unit.label}</span>
      {unit.type==="subset"&&<Bdg bg="#EEF2FF" color="#6366F1">subset</Bdg>}
      {showAssign&&<button onClick={e=>{e.stopPropagation();setDd(dd===unit.id?null:unit.id);}} style={{background:"#F1F5F9",border:"1px solid #E2E8F0",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#4F46E5",fontWeight:500}}>Assign</button>}
      {showRemove&&<button onClick={()=>unassign(unit.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:2,display:"flex"}}><XI s={12}/></button>}
      {dd===unit.id&&(
        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:50,minWidth:180,padding:4}}>
          {chairs.map(ch=>(
            <button key={ch.id} onClick={()=>assignTo(unit.id,ch.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 10px",background:"none",border:"none",cursor:"pointer",fontSize:12,borderRadius:6,textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{width:8,height:8,borderRadius:4,background:ch.color,flexShrink:0}}/>{ch.name}
            </button>
          ))}
          {chairs.length===0&&<div style={{padding:"8px 10px",fontSize:12,color:"#94A3B8"}}>Create a chair first</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{display:"flex",flex:1,minHeight:0}} onClick={()=>setDd(null)}>
      <div style={{flex:"1 1 65%",display:"flex",flexDirection:"column",borderRight:"1px solid #E2E8F0",background:"#fff"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}><div style={{display:"flex",alignItems:"center",gap:8}}><UserI s={18}/><span style={{fontWeight:700,fontSize:16}}>Assign Academy Chairs</span></div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>Assign each area to an Academy Chair</div></div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Unassigned ({unassigned.length})</div>
            {unassigned.length===0&&<div style={{padding:12,textAlign:"center",fontSize:12,color:"#059669"}}>All areas assigned ✓</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}} onClick={e=>e.stopPropagation()}>{unassigned.map(u=>uChip(u,{showAssign:true}))}</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
            {chairs.map(ch=>{const items=assigned(ch.id);return(
              <div key={ch.id} style={{flex:"1 1 260px",maxWidth:340,minWidth:230,background:"#FAFBFD",border:"1px solid #E2E8F0",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:8,background:`${ch.color}08`}}>
                  <span style={{width:10,height:10,borderRadius:5,background:ch.color,flexShrink:0}}/>
                  {editCh===ch.id?<InlineEdit value={ch.name} onSave={v=>renameChair(ch.id,v)} onCancel={()=>setEditCh(null)}/>:<span style={{fontWeight:600,fontSize:13,flex:1,cursor:"pointer"}} onClick={()=>setEditCh(ch.id)}>{ch.name}</span>}
                  <span style={{fontSize:11,color:"#94A3B8"}}>{items.length}</span>
                  <button onClick={()=>removeChair(ch.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#CBD5E1",padding:2,display:"flex"}}><TrashI/></button>
                </div>
                <div style={{padding:10,display:"flex",flexDirection:"column",gap:6,minHeight:48}}>
                  {items.length===0&&<div style={{padding:12,textAlign:"center",fontSize:12,color:"#CBD5E1"}}>No areas</div>}
                  {items.map(u=>uChip(u,{showRemove:true,chairColor:ch.color}))}
                </div>
              </div>
            );})}
            <div style={{flex:"1 1 260px",maxWidth:340,minWidth:230}}>
              {showNew?<div style={{background:"#FAFBFD",border:"1.5px dashed #A5B4FC",borderRadius:12,padding:14}}><InlineEdit value="" onSave={addChair} onCancel={()=>setShowNew(false)} placeholder="Chair name…"/></div>:<button onClick={()=>setShowNew(true)} style={{width:"100%",padding:14,background:"transparent",border:"1.5px dashed #CBD5E1",borderRadius:12,cursor:"pointer",color:"#94A3B8",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><PlusI/> Add Academy Chair</button>}
            </div>
          </div>
        </div>
        <div style={{padding:"10px 20px",borderTop:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onBack} style={{padding:"7px 14px",background:"none",border:"1px solid #E2E8F0",borderRadius:8,fontSize:13,cursor:"pointer",color:"#64748B",display:"flex",alignItems:"center",gap:6}}><ArrowL/> Back</button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,color:allDone?"#059669":"#D97706",fontWeight:500}}>{assignedCount}/{total} assigned</span>
            <button onClick={()=>{if(allDone)onNext();}} style={{padding:"8px 24px",background:allDone?"#4F46E5":"#CBD5E1",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:allDone?"pointer":"default"}}>Next: Vice Chairs →</button>
          </div>
        </div>
      </div>
      <div style={{flex:"1 1 35%",display:"flex",flexDirection:"column",background:"#F8FAFC",maxWidth:360}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}><div style={{fontWeight:700,fontSize:15}}>Event Scope</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>Read-only reference</div></div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
          {units.map(u=>{const ch=chairs.find(c=>c.id===assignments[u.id]);return(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",marginBottom:3,fontSize:12,color:"#64748B",borderRadius:6,background:ch?`${ch.color}10`:"transparent"}}>
              {ch&&<span style={{width:6,height:6,borderRadius:3,background:ch.color}}/>}
              <span style={{flex:1}}>{u.label}</span>
              {ch?<span style={{fontSize:10,color:"#94A3B8"}}>{ch.name}</span>:<span style={{fontSize:10,color:"#D97706"}}>unassigned</span>}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — Vice Chair Assignment
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step3({sel,subsets,chairs,assignments,vcChairs,setVcChairs,vcAssignments,setVcAssignments,onBack}) {
  const [activeChairId,setActiveChairId]=useState(chairs[0]?.id||null);
  const [dd,setDd]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [editVc,setEditVc]=useState(null);
  const [expandedUnits,setExpandedUnits]=useState({}); // { unitId: expandedGranularUnits[] }

  const allUnits=useMemo(()=>flattenScope(sel,subsets),[sel,subsets]);
  const chairUnits=useMemo(()=>allUnits.filter(u=>assignments[u.id]===activeChairId),[allUnits,assignments,activeChairId]);
  const activeChair=chairs.find(c=>c.id===activeChairId);

  // VC chairs scoped to active academy chair
  const myVcs=useMemo(()=>(vcChairs[activeChairId]||[]),[vcChairs,activeChairId]);
  const myAss=useMemo(()=>(vcAssignments[activeChairId]||{}),[vcAssignments,activeChairId]);

  // Build the assignable unit list — can be original units or expanded granular units
  const assignableUnits=useMemo(()=>{
    const result=[];
    for(const u of chairUnits){
      if(expandedUnits[u.id]){
        result.push(...expandedUnits[u.id]);
      } else {
        result.push(u);
      }
    }
    return result;
  },[chairUnits,expandedUnits]);

  const unassigned=assignableUnits.filter(u=>!myAss[u.id]);
  const assignedTo=vcId=>assignableUnits.filter(u=>myAss[u.id]===vcId);

  const canExpand=u=>{
    const ex=expandUnit(u);
    return ex!==null&&ex.length>1;
  };

  const doExpand=u=>{
    const ex=expandUnit(u);
    if(!ex)return;
    // Remove any assignment for the parent unit
    setVcAssignments(p=>{const cur={...(p[activeChairId]||{})};delete cur[u.id];return{...p,[activeChairId]:cur};});
    setExpandedUnits(p=>({...p,[u.id]:ex}));
  };

  const doCollapse=u=>{
    // Remove assignments for granular children
    const ex=expandedUnits[u.id]||[];
    setVcAssignments(p=>{const cur={...(p[activeChairId]||{})};ex.forEach(e=>delete cur[e.id]);return{...p,[activeChairId]:cur};});
    setExpandedUnits(p=>{const n={...p};delete n[u.id];return n;});
  };

  const assignTo=(uid,vcId)=>{setVcAssignments(p=>({...p,[activeChairId]:{...(p[activeChairId]||{}),[uid]:vcId}}));setDd(null);};
  const unassign=uid=>{setVcAssignments(p=>{const cur={...(p[activeChairId]||{})};delete cur[uid];return{...p,[activeChairId]:cur};});};
  const addVc=name=>{if(!name.trim())return;const id=`vc_${Date.now()}`;setVcChairs(p=>({...p,[activeChairId]:[...(p[activeChairId]||[]),{id,name:name.trim(),color:CHAIR_COLORS[((p[activeChairId]||[]).length)%CHAIR_COLORS.length]}]}));setShowNew(false);};
  const removeVc=id=>{setVcChairs(p=>({...p,[activeChairId]:(p[activeChairId]||[]).filter(v=>v.id!==id)}));setVcAssignments(p=>{const cur={...(p[activeChairId]||{})};for(const k of Object.keys(cur))if(cur[k]===id)delete cur[k];return{...p,[activeChairId]:cur};});};
  const renameVc=(id,name)=>{setVcChairs(p=>({...p,[activeChairId]:(p[activeChairId]||[]).map(v=>v.id===id?{...v,name}:v)}));setEditVc(null);};

  const totalU=assignableUnits.length,assignedCount=assignableUnits.filter(u=>myAss[u.id]).length,allDone=assignedCount===totalU&&totalU>0;

  // Is a unit the parent of currently expanded children?
  const isParentExpanded=uid=>!!expandedUnits[uid];

  const uChip=(unit,{showAssign,showRemove,vcColor,parentUnit}={})=>(
    <div key={unit.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12,position:"relative",borderLeft:vcColor?`3px solid ${vcColor}`:undefined}}>
      <span style={{flex:1,fontWeight:500}}>{unit.label}</span>
      {unit.type==="subset"&&<Bdg bg="#EEF2FF" color="#6366F1">subset</Bdg>}
      {unit.type==="subdivision"&&<Bdg bg="#FEF3C7" color="#92400E">{unit.parent}</Bdg>}
      {showAssign&&<button onClick={e=>{e.stopPropagation();setDd(dd===unit.id?null:unit.id);}} style={{background:"#F1F5F9",border:"1px solid #E2E8F0",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#4F46E5",fontWeight:500}}>Assign</button>}
      {showRemove&&<button onClick={()=>unassign(unit.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:2,display:"flex"}}><XI s={12}/></button>}
      {dd===unit.id&&(
        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:50,minWidth:180,padding:4}}>
          {myVcs.map(vc=>(
            <button key={vc.id} onClick={()=>assignTo(unit.id,vc.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 10px",background:"none",border:"none",cursor:"pointer",fontSize:12,borderRadius:6,textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{width:8,height:8,borderRadius:4,background:vc.color,flexShrink:0}}/>{vc.name}
            </button>
          ))}
          {myVcs.length===0&&<div style={{padding:"8px 10px",fontSize:12,color:"#94A3B8"}}>Create a Vice Chair first</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{display:"flex",flex:1,minHeight:0}} onClick={()=>setDd(null)}>
      <div style={{flex:"1 1 65%",display:"flex",flexDirection:"column",borderRight:"1px solid #E2E8F0",background:"#fff"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><UsersI s={18}/><span style={{fontWeight:700,fontSize:16}}>Assign Vice Chairs</span></div>
          <div style={{fontSize:12,color:"#64748B",marginTop:2}}>Select an Academy Chair, then assign their areas to Vice Chairs</div>
          {/* Chair selector tabs */}
          <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
            {chairs.map(ch=>{
              const isActive=ch.id===activeChairId;
              const chAss=vcAssignments[ch.id]||{};
              const chUnits=allUnits.filter(u=>assignments[u.id]===ch.id);
              // rough progress
              let chExpandedUnits=[];
              for(const u of chUnits){if(expandedUnits[u.id])chExpandedUnits.push(...expandedUnits[u.id]);else chExpandedUnits.push(u);}
              const chTotal=chExpandedUnits.length;
              const chDone=chExpandedUnits.filter(u=>chAss[u.id]).length;
              return(
                <button key={ch.id} onClick={()=>setActiveChairId(ch.id)} style={{padding:"6px 14px",borderRadius:8,border:isActive?`2px solid ${ch.color}`:"1px solid #E2E8F0",background:isActive?`${ch.color}10`:"#fff",color:isActive?ch.color:"#64748B",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:4,background:ch.color}}/>
                  {ch.name}
                  {chTotal>0&&<span style={{fontSize:10,color:chDone===chTotal?"#059669":"#94A3B8"}}>{chDone}/{chTotal}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {!activeChair&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#94A3B8",fontSize:13}}>No Academy Chair selected</div>}

        {activeChair&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {/* Unassigned pool */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>Unassigned ({unassigned.length})</div>
            </div>
            {unassigned.length===0&&assignableUnits.length>0&&<div style={{padding:12,textAlign:"center",fontSize:12,color:"#059669"}}>All areas assigned ✓</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}} onClick={e=>e.stopPropagation()}>
              {/* Show original chair units with expand/collapse option */}
              {chairUnits.map(u=>{
                const isExp=isParentExpanded(u.id);
                const canExp=canExpand(u);
                const granularChildren=expandedUnits[u.id]||[];
                const unassignedChildren=granularChildren.filter(g=>!myAss[g.id]);

                if(isExp){
                  // Show collapsed header + expanded children
                  return(
                    <div key={u.id}>
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12,marginBottom:4}}>
                        <button onClick={()=>doCollapse(u)} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"#94A3B8",display:"flex"}}><ChevronD s={14}/></button>
                        <span style={{fontWeight:600,flex:1}}>{u.label}</span>
                        <Bdg bg="#FEF3C7" color="#92400E">{granularChildren.length} sub-units</Bdg>
                      </div>
                      <div style={{marginLeft:20,display:"flex",flexDirection:"column",gap:4}}>
                        {unassignedChildren.map(g=>uChip(g,{showAssign:true}))}
                      </div>
                    </div>
                  );
                }

                // Not expanded — show as regular chip with expand button
                if(!myAss[u.id]){
                  return(
                    <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12,position:"relative"}}>
                      <span style={{flex:1,fontWeight:500}}>{u.label}</span>
                      {u.type==="subset"&&<Bdg bg="#EEF2FF" color="#6366F1">subset</Bdg>}
                      {canExp&&<button onClick={e=>{e.stopPropagation();doExpand(u);}} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,padding:"2px 8px",fontSize:11,color:"#D97706",cursor:"pointer",fontWeight:500,display:"inline-flex",alignItems:"center",gap:3}}><LayersI s={10}/> Split</button>}
                      <button onClick={e=>{e.stopPropagation();setDd(dd===u.id?null:u.id);}} style={{background:"#F1F5F9",border:"1px solid #E2E8F0",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#4F46E5",fontWeight:500}}>Assign</button>
                      {dd===u.id&&(
                        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:50,minWidth:180,padding:4}}>
                          {myVcs.map(vc=>(
                            <button key={vc.id} onClick={()=>assignTo(u.id,vc.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 10px",background:"none",border:"none",cursor:"pointer",fontSize:12,borderRadius:6,textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                              <span style={{width:8,height:8,borderRadius:4,background:vc.color,flexShrink:0}}/>{vc.name}
                            </button>
                          ))}
                          {myVcs.length===0&&<div style={{padding:"8px 10px",fontSize:12,color:"#94A3B8"}}>Create a Vice Chair first</div>}
                        </div>
                      )}
                    </div>
                  );
                }
                return null; // already assigned, shown in VC column
              })}
            </div>
          </div>

          {/* Vice Chair columns */}
          <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
            {myVcs.map(vc=>{const items=assignedTo(vc.id);return(
              <div key={vc.id} style={{flex:"1 1 260px",maxWidth:340,minWidth:230,background:"#FAFBFD",border:"1px solid #E2E8F0",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:8,background:`${vc.color}08`}}>
                  <span style={{width:10,height:10,borderRadius:5,background:vc.color,flexShrink:0}}/>
                  {editVc===vc.id?<InlineEdit value={vc.name} onSave={v=>renameVc(vc.id,v)} onCancel={()=>setEditVc(null)}/>:<span style={{fontWeight:600,fontSize:13,flex:1,cursor:"pointer"}} onClick={()=>setEditVc(vc.id)}>{vc.name}</span>}
                  <span style={{fontSize:11,color:"#94A3B8"}}>{items.length}</span>
                  <button onClick={()=>removeVc(vc.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#CBD5E1",padding:2,display:"flex"}}><TrashI/></button>
                </div>
                <div style={{padding:10,display:"flex",flexDirection:"column",gap:6,minHeight:48}}>
                  {items.length===0&&<div style={{padding:12,textAlign:"center",fontSize:12,color:"#CBD5E1"}}>No areas</div>}
                  {items.map(u=>uChip(u,{showRemove:true,vcColor:vc.color}))}
                </div>
              </div>
            );})}
            <div style={{flex:"1 1 260px",maxWidth:340,minWidth:230}}>
              {showNew?<div style={{background:"#FAFBFD",border:"1.5px dashed #A5B4FC",borderRadius:12,padding:14}}><InlineEdit value="" onSave={addVc} onCancel={()=>setShowNew(false)} placeholder="Vice Chair name…"/></div>:<button onClick={()=>setShowNew(true)} style={{width:"100%",padding:14,background:"transparent",border:"1.5px dashed #CBD5E1",borderRadius:12,cursor:"pointer",color:"#94A3B8",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><PlusI/> Add Vice Chair</button>}
            </div>
          </div>
        </div>}

        <div style={{padding:"10px 20px",borderTop:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onBack} style={{padding:"7px 14px",background:"none",border:"1px solid #E2E8F0",borderRadius:8,fontSize:13,cursor:"pointer",color:"#64748B",display:"flex",alignItems:"center",gap:6}}><ArrowL/> Back</button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {activeChair&&<span style={{fontSize:13,color:allDone?"#059669":"#D97706",fontWeight:500}}>{assignedCount}/{totalU} assigned</span>}
            <button style={{padding:"8px 24px",background:"#059669",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>Finish ✓</button>
          </div>
        </div>
      </div>

      {/* RIGHT — All chairs overview */}
      <div style={{flex:"1 1 35%",display:"flex",flexDirection:"column",background:"#F8FAFC",maxWidth:360}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #E2E8F0"}}><div style={{fontWeight:700,fontSize:15}}>Chairs Overview</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>All Academy Chairs & Vice Chair progress</div></div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
          {chairs.map(ch=>{
            const chUnits=allUnits.filter(u=>assignments[u.id]===ch.id);
            const chVcs=vcChairs[ch.id]||[];
            const chAss=vcAssignments[ch.id]||{};
            const isActive=ch.id===activeChairId;
            // Count assignable (consider expanded)
            let chAssignable=[];
            for(const u of chUnits){if(expandedUnits[u.id])chAssignable.push(...expandedUnits[u.id]);else chAssignable.push(u);}
            const chTotal=chAssignable.length;
            const chDone=chAssignable.filter(u=>chAss[u.id]).length;
            return(
              <div key={ch.id} style={{marginBottom:12,padding:12,border:isActive?`2px solid ${ch.color}`:"1px solid #E2E8F0",borderRadius:10,background:isActive?"#fff":"#FAFBFD",cursor:"pointer"}} onClick={()=>setActiveChairId(ch.id)}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:10,height:10,borderRadius:5,background:ch.color}}/>
                  <span style={{fontWeight:600,fontSize:13,flex:1}}>{ch.name}</span>
                  <span style={{fontSize:11,color:chDone===chTotal&&chTotal>0?"#059669":"#94A3B8"}}>{chDone}/{chTotal}</span>
                </div>
                {/* Progress bar */}
                <div style={{height:4,background:"#E2E8F0",borderRadius:2,marginBottom:8}}>
                  <div style={{height:4,background:chDone===chTotal&&chTotal>0?"#059669":ch.color,borderRadius:2,width:`${chTotal?Math.round(chDone/chTotal*100):0}%`,transition:"width 0.3s"}}/>
                </div>
                {/* Vice chairs list */}
                {chVcs.map(vc=>{
                  const vcItems=chAssignable.filter(u=>chAss[u.id]===vc.id);
                  return(
                    <div key={vc.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11,color:"#64748B"}}>
                      <span style={{width:6,height:6,borderRadius:3,background:vc.color}}/>
                      <span style={{flex:1}}>{vc.name}</span>
                      <span>{vcItems.length} area{vcItems.length!==1?"s":""}</span>
                    </div>
                  );
                })}
                {chVcs.length===0&&<div style={{fontSize:11,color:"#CBD5E1"}}>No Vice Chairs yet</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [step,setStep]=useState(1);
  const [sel,setSel]=useState(new Set());
  const [subsets,setSubsets]=useState([]);
  const [chairs,setChairs]=useState([]);
  const [assignments,setAssignments]=useState({});
  const [vcChairs,setVcChairs]=useState({}); // { chairId: [{id,name,color}] }
  const [vcAssignments,setVcAssignments]=useState({}); // { chairId: { unitId: vcId } }

  return (
    <div style={{fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",height:"100vh",display:"flex",flexDirection:"column",color:"#1E293B",fontSize:14}}>
      <div style={{display:"flex",padding:"0 20px",borderBottom:"1px solid #E2E8F0",background:"#FAFBFD",flexShrink:0}}>
        {[{n:1,l:"1. Define Scope"},{n:2,l:"2. Academy Chairs"},{n:3,l:"3. Vice Chairs"}].map(({n,l})=>(
          <div key={n} style={{padding:"12px 16px",fontSize:12,fontWeight:step===n?700:500,color:step===n?"#4F46E5":n<step?"#059669":"#94A3B8",borderBottom:step===n?"2px solid #4F46E5":"2px solid transparent",cursor:n<=step?"pointer":"default"}} onClick={()=>{if(n<=step)setStep(n);}}>
            {n<step?"✓ ":""}{l}
          </div>
        ))}
      </div>
      {step===1&&<Step1 sel={sel} setSel={setSel} subsets={subsets} setSubsets={setSubsets} onNext={()=>setStep(2)}/>}
      {step===2&&<Step2 sel={sel} subsets={subsets} chairs={chairs} setChairs={setChairs} assignments={assignments} setAssignments={setAssignments} onBack={()=>setStep(1)} onNext={()=>setStep(3)}/>}
      {step===3&&<Step3 sel={sel} subsets={subsets} chairs={chairs} assignments={assignments} vcChairs={vcChairs} setVcChairs={setVcChairs} vcAssignments={vcAssignments} setVcAssignments={setVcAssignments} onBack={()=>setStep(2)}/>}
    </div>
  );
}
