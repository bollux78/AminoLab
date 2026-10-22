// Catálogos compactados, hospedados pelo próprio AminoLab.
// Os downloads originais são convertidos automaticamente pelo workflow do GitHub.
(()=>{"use strict";
const sourceNames={"usda-foundation":"USDA Foundation (2026)","usda-legacy":"USDA SR Legacy (2018)","usda-fndds":"USDA FNDDS (2021–2023)","canada":"Canadian Nutrient File (2026)"};
const sources=Object.keys(sourceNames);
const status=document.getElementById("offline-status");
const accents=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
let loaded=0,failed=0,records=0;
const update=()=>{status.textContent=records?records.toLocaleString("pt-BR")+" alimentos importados das bases internacionais • "+loaded+"/"+sources.length+" fontes carregadas"+(failed?" • "+failed+" indisponíveis":""):"Bases internacionais ainda não disponíveis. A TACO permanece como fonte principal."};
function valid(item){return item&&typeof item.id==="string"&&typeof item.name==="string"&&typeof item.aa==="object"&&item.aa!==null}
async function loadSource(source){try{
 const resp=await fetch("data/"+source+".json",{cache:"no-cache"});
 if(!resp.ok)throw Error("HTTP "+resp.status);
 const arr=await resp.json();if(!Array.isArray(arr))throw Error("Formato inválido");
 const existing=new Set(foods.map(f=>f.id));
 let count=0;
 for(const item of arr){
   if(!valid(item)||existing.has(item.id))continue;
   const miss=["kcal","protein","carbs","fat","fiber"].filter(k=>typeof item[k]!=="number"||!Number.isFinite(item[k]));
   foods.push({...item,group:sourceNames[source],missingMacros:miss,
     kcal:item.kcal??0,protein:item.protein??0,carbs:item.carbs??0,
     fat:item.fat??0,fiber:item.fiber??0,
     searchText:accents(item.name+" "+(item.original||"")+" "+sourceNames[source])});
   count++;
 }
 records+=count;loaded++;update();catalog();
 }catch(err){failed++;update();console.warn("AminoLab:",source,err.message)}
}
async function init(){
 status.textContent="Carregando catálogos internacionais armazenados no GitHub…";
 // Sequential downloads avoid UI freezes on mobile devices.
 for(const source of sources)await loadSource(source);
}
init();
})();
