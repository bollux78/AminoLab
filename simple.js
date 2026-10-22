"use strict";
const DEFINITIONS=[
['carioca','Feijão carioca, cozido'],['preto','Feijão preto, cozido'],['arroz','Arroz branco, cozido'],
['aveia','Aveia em flocos, seca'],['ervilha','Ervilha congelada, cozida'],['tofu','Tofu firme'],
['pts','PTS de soja, seca'],['ovo','Ovo inteiro, cru'],['iogurte','Iogurte natural desnatado'],
['whey','Whey 70%, em pó'],['peito','Peito de frango, cru'],['coxa','Coxa de frango, crua'],
['sobrecoxa','Sobrecoxa de frango, crua'],['bisteca','Bisteca suína, crua'],['lombo','Lombo suíno, cru'],
['patinho','Patinho moído, cru'],['grao','Grão-de-bico, cozido'],['lentilha','Lentilha, cozida'],['integral-pure','Integralmédica 100% Pure Whey, baunilha'],['wvegan-max','W Vegan Max Protein (arroz e ervilha)']
];
const REQUIREMENTS=[
{label:'Histidina',keys:['histidine'],mg:10},
{label:'Isoleucina',keys:['isoleucine'],mg:20},
{label:'Leucina',keys:['leucine'],mg:39},
{label:'Lisina',keys:['lysine'],mg:30},
{label:'Metionina + cistina',keys:['methionine','cystine'],mg:15},
{label:'Fenilalanina + tirosina',keys:['phenylalanine','tyrosine'],mg:25},
{label:'Treonina',keys:['threonine'],mg:15},
{label:'Triptofano',keys:['tryptophan'],mg:4},
{label:'Valina',keys:['valine'],mg:26}
];
const OTHER=[['glycine','Glicina'],['proline','Prolina'],['alanine','Alanina'],['arginine','Arginina'],
['aspartic_acid','Ácido aspártico'],['glutamic_acid','Ácido glutâmico'],['glutamine','Glutamina'],['serine','Serina'],
['hydroxyproline','Hidroxiprolina']];
const $=id=>document.getElementById(id);
const fmt=(v,d=2)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const amount={};const selected=new Map(DEFINITIONS.map(([k,n])=>[k,{key:k,name:n,available:false,reason:'Aguardando extração USDA'}]));
let pending=true;
function foodPanel(){
 $('foods').innerHTML=DEFINITIONS.map(([key,name])=>{
 const f=selected.get(key),val=amount[key]??0;
 return '<div class="food '+(!f.available?'unavailable':'')+'"><h3>'+safe(name)+'</h3><small>'+
 (f.available?safe(f.source||'USDA')+' · '+safe(f.sourceId||'')+' · '+safe(f.original||'')+(f.validationWarning?' ⚠ '+safe(f.validationWarning):'') :
 safe(f.reason||'Perfil analítico ainda não disponível'))+'</small>'+
 (f.available?'<div class="slider"><input type="range" min="0" max="500" step="5" value="'+val+'" data-range="'+key+'" aria-label="Quantidade de '+safe(name)+'"><input type="number" min="0" max="2000" step="1" value="'+val+'" data-number="'+key+'" aria-label="Gramas de '+safe(name)+'"></div>':'')+'</div>';
 }).join('');
}
function calc(){
 const weight=Math.max(20,Math.min(350,Number($('bodyweight').value)||70));
 const proteinTarget=Math.max(.4,Math.min(4,Number($('protein-target').value)||1.6));
 const active=[...selected.values()].filter(f=>f.available&&(amount[f.key]||0)>0);
 const total=k=>active.reduce((s,f)=>s+(Number.isFinite(f[k])?f[k]*(amount[f.key]/100):0),0);
 const incomplete=k=>active.some(f=>!Number.isFinite(f[k]));
 const nutrients=[['Energia','kcal','kcal'],['Proteínas','protein','g'],['Carboidratos','carbs','g'],['Gorduras','fat','g'],['Fibras','fiber','g']];
 $('metrics').innerHTML=nutrients.map(([label,key,unit])=>'<div class="metric"><span>'+label+'</span><strong>'+(incomplete(key)?'≥ ':'')+fmt(total(key),1)+'</strong><span>'+unit+'</span></div>').join('')+
 '<div class="metric"><span>Proteína / meta</span><strong>'+fmt(total('protein')/(weight*proteinTarget)*100,0)+'%</strong><span>'+fmt(weight*proteinTarget,1)+' g/dia</span></div>';
 const aaSum=key=>active.reduce((s,f)=>s+(Number.isFinite(f.aa?.[key])?f.aa[key]*(amount[f.key]/100):0),0);
 const aaMissing=keys=>active.some(f=>keys.some(k=>!Number.isFinite(f.aa?.[k])));
 $('essential').innerHTML=REQUIREMENTS.map(r=>{
 const grams=r.keys.reduce((sum,key)=>sum+aaSum(key),0);
 const missing=aaMissing(r.keys);
 const percent=grams*100000/(weight*r.mg);
 const isUnknown=missing;
 return '<div class="amino"><span>'+r.label+'</span><span class="number">'+(isUnknown?'≥ ':'')+fmt(grams,2)+' g</span>'+
 '<div class="bar" title="'+fmt(percent,0)+'%"><div style="width:'+Math.min(100,percent)+'%"></div></div>'+
 '<span class="number">'+(isUnknown?'≥ ':'')+fmt(percent,0)+'%</span></div>';
 }).join('');
 $('other').innerHTML=OTHER.map(([key,label])=>'<div><span>'+label+'</span><strong>'+
 (aaMissing([key])?'≥ ':'')+fmt(aaSum(key),2)+' g</strong></div>').join('');
}
function restore(){
 try{const raw=JSON.parse(localStorage.getItem('aminolab_v1')||'null');if(raw){
  for(const [key] of DEFINITIONS)amount[key]=Math.max(0,Math.min(2000,Number(raw.amount?.[key])||0));
  if(raw.weight)$('bodyweight').value=raw.weight;
  if(raw.target)$('protein-target').value=raw.target;
 }}catch(e){console.warn('Não foi possível recuperar dados antigos',e)}
 foodPanel();calc();
}
$('foods').addEventListener('input',event=>{
 const el=event.target;
 const key=el.dataset.range||el.dataset.number;
 if(!key)return;
 const value=Math.max(0,Math.min(2000,Number(el.value)||0));
 amount[key]=value;
 // Change the paired input in place, without replacing the input that has focus.
 const pair=$('foods').querySelector((el.dataset.range?'[data-number="':'[data-range="')+key+'"]');
 if(pair)pair.value=value;
 calc();
});
$('bodyweight').addEventListener('input',calc);
$('protein-target').addEventListener('input',calc);
$('clear').onclick=()=>{for(const key of Object.keys(amount))amount[key]=0;foodPanel();calc()};
$('save').onclick=()=>{try{localStorage.setItem('aminolab_v1',JSON.stringify({amount,weight:$('bodyweight').value,target:$('protein-target').value}));$('status').textContent='Refeição salva neste navegador.'}catch(e){$('status').textContent='Armazenamento indisponível.'}};
$('restore').onclick=restore;
async function load(){
 try{
  const response=await fetch('data/curated-foods.json?v=100',{cache:'no-cache'});
  if(!response.ok)throw new Error('arquivo de dados ainda não publicado (HTTP '+response.status+')');
  const rows=await response.json();if(!Array.isArray(rows))throw new Error('formato inválido');
  try {const extraResponse=await fetch('data/user-supplements.json?v=110',{cache:'no-cache'});if(extraResponse.ok){const extras=await extraResponse.json();if(Array.isArray(extras))rows.push(...extras)}}catch(error){console.warn('Suplementos adicionais indisponíveis',error)}
  for(const row of rows){if(!selected.has(row.key))continue;
    const complete=REQUIREMENTS.every(r=>r.keys.every(k=>Number.isFinite(row.aa?.[k])));
    if(row.available && (complete || row.validationWarning)){selected.set(row.key,{...row,available:true})}
    else selected.set(row.key,{...row,available:false,reason:row.reason||'Perfil incompleto para os requisitos FAO/OMS'});
  }
  const count=[...selected.values()].filter(x=>x.available).length;
  const partial=[...selected.values()].filter(x=>x.available && REQUIREMENTS.some(r=>r.keys.some(k=>!Number.isFinite(x.aa?.[k])))).length;
  $('status').textContent=count+' de '+DEFINITIONS.length+' alimentos utilizáveis'+(partial?' • '+partial+' perfil parcial com aviso':'')+' • USDA, MEXT e rótulos identificados.';
 }catch(err){$('status').textContent='Ainda não foi publicado o arquivo de perfis selecionados: '+err.message+'. Os sliders serão liberados quando a extração estiver concluída.';}
 pending=false;restore();
}
load();
