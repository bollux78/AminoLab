'use strict';
const foods=window.AMINOLAB_FOODS;
const $=id=>document.getElementById(id);
const fmt=(n,places=2)=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:places,maximumFractionDigits:places});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'" :'&#39;'}[c]));
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const qty=new Map(foods.map(f=>[f.id,0]));
const essentials=[['histidine','Histidina'],['isoleucine','Isoleucina'],['leucine','Leucina'],['lysine','Lisina'],['methionine','Metionina'],['phenylalanine','Fenilalanina'],['threonine','Treonina'],['tryptophan','Triptofano'],['valine','Valina']];
const others=[['glycine','Glicina'],['proline','Prolina'],['alanine','Alanina'],['arginine','Arginina'],['aspartic_acid','Ácido aspártico'],['cystine','Cistina'],['glutamic_acid','Ácido glutâmico'],['serine','Serina'],['tyrosine','Tirosina'],['hydroxyproline','Hidroxiprolina']];
function buildList(){
$('foods-list').innerHTML=foods.map(f=>{
 const n=qty.get(f.id)||0;
 return '<div class="food'+(n>0?' active-food':'')+'" data-food="'+f.id+'" data-search="'+esc(normalize(f.name+' '+f.group))+'">'+
 '<div class="food-top"><div><span class="food-name">'+esc(f.name)+'</span>'+(f.quality!=='direto'?'<span class="chip">'+(f.quality==='estimativa'?'ESTIMADO':'APROX.')+'</span>':'')+'<small class="food-group">'+esc(f.group)+' • '+esc(f.state)+'</small></div>'+
 '<span class="food-data">'+fmt(f.aa.leucine||0)+' g leucina / 100 g</span></div>'+
 '<div class="food-controls"><input type="range" aria-label="Quantidade de '+esc(f.name)+'" min="0" max="500" step="5" value="'+n+'" data-range="'+f.id+'"><input type="number" min="0" max="10000" step="1" value="'+n+'" data-number="'+f.id+'" aria-label="Gramas de '+esc(f.name)+'"><span class="muted">g</span></div>'+
 '<details><summary>Fonte e observações</summary><div class="details">USDA FDC <a target="_blank" rel="noopener" href="https://fdc.nal.usda.gov/food-details/'+f.fdcId+'/nutrients">'+f.fdcId+'</a> — '+esc(f.sourceDescription)+'<p>'+esc(f.note)+'</p></div></details></div>';
}).join('');
}
function totals(){
const selected=foods.filter(f=>(qty.get(f.id)||0)>0);
const keys=['kcal','protein','carbs','fat','fiber'];
const sums=Object.fromEntries(keys.map(k=>[k,0]));
const amino={};const missing={};
for(const f of selected){
 const factor=qty.get(f.id)/100;
 for(const k of keys)sums[k]+=(f[k]||0)*factor;
 for(const [k,v] of Object.entries(f.aa||{}))amino[k]=(amino[k]||0)+v*factor;
}
for(const [k] of [...essentials,...others])missing[k]=selected.some(f=>!(k in f.aa));
const metrics=[['Proteínas','protein','g'],['Leucina','leucine','g'],['Glicina','glycine','g'],['Calorias','kcal','kcal'],['Carboidratos','carbs','g'],['Gorduras','fat','g'],['Fibras','fiber','g']];
$('totals').innerHTML=metrics.map(([label,key,unit])=>'<div class="metric '+(key==='leucine'?'leu':key==='glycine'?'gly':'')+'"><small>'+label+'</small><strong>'+(key in sums?fmt(sums[key],key==='kcal'?0:1):key in amino?fmt(amino[key],2):selected.length?'—':'0,00')+'</strong><small>'+unit+'</small></div>').join('');
const goal=Math.max(.5,Number($('leucine-goal').value)||6);const leu=amino.leucine||0;
$('goal-progress').style.width=Math.min(100,100*leu/goal)+'%';
$('goal-caption').textContent=fmt(leu)+' g de '+fmt(goal)+' g de leucina ('+fmt(leu/goal*100,0)+'%) • '+selected.length+' alimentos selecionados';
function table(list,id){
 const max=Math.max(0.01,...list.map(([k])=>amino[k]||0));
 $(id).innerHTML=list.map(([key,name])=>{
 const value=amino[key];
 const textValue=selected.length&&value===undefined?'—':fmt(value||0,2)+(missing[key]?'*':'');
 return '<tr><td>'+name+'</td><td class="value">'+textValue+'</td><td class="graph"><div class="tinybar" title="'+fmt(value||0,2)+' g"><div style="width:'+Math.min(100,100*(value||0)/max)+'%"></div></div></td></tr>';
 }).join('');
}
table(essentials,'essential');table(others,'other');
}
function setQuantity(id,v,origin){
const value=Math.max(0,Math.min(10000,Number(v)||0));qty.set(id,value);
const row=document.querySelector('[data-food="'+id+'"]');if(!row)return;
row.classList.toggle('active-food',value>0);
const slider=row.querySelector('[data-range]'),number=row.querySelector('[data-number]');
if(origin!=='range')slider.value=Math.min(500,value);
if(origin!=='number')number.value=value;
totals();
}
$('foods-list').addEventListener('input',e=>{
const el=e.target;if(el.dataset.range!==undefined)setQuantity(el.dataset.range,el.value,'range');
else if(el.dataset.number!==undefined)setQuantity(el.dataset.number,el.value,'number');
});
$('search').addEventListener('input',()=>{
const q=normalize($('search').value.trim());
let shown=0;
for(const row of document.querySelectorAll('[data-food]')){
 const show=row.dataset.search.includes(q);row.hidden=!show;if(show)shown++;
}
$('foods-empty').style.display=shown?'none':'block';
$('food-count').textContent=shown+' de '+foods.length+' alimentos';
});
$('sample').onclick=()=>{for(const f of foods)setQuantity(f.id,0);for(const [name,grams] of [['Peito de frango',150],['Feijão carioca',120],['Arroz branco',100],['Ervilha congelada',80]]){const f=foods.find(x=>x.name.startsWith(name));if(f)setQuantity(f.id,grams)}};
$('clear').onclick=()=>{for(const f of foods)setQuantity(f.id,0)};
$('save').onclick=()=>{try{localStorage.setItem('aminolab-selection-v1',JSON.stringify(Object.fromEntries(qty)));alert('Seleção salva neste navegador.')}catch(e){alert('Não foi possível salvar: '+e.message)}};
$('restore').onclick=()=>{try{const data=JSON.parse(localStorage.getItem('aminolab-selection-v1')||'{}');for(const f of foods)setQuantity(f.id,data[f.id]||0)}catch(e){alert('Erro ao recuperar: '+e.message)}};
$('leucine-goal').addEventListener('input',totals);
$('export').onclick=()=>{
 const rows=[['Alimento','Quantidade (g)','Proteínas (g)','Leucina (g)','Glicina (g)','Energia (kcal)','FDC']];
 for(const f of foods){const g=qty.get(f.id)||0;if(!g)continue;const k=g/100;rows.push([f.name,g,fmt(f.protein*k),fmt((f.aa.leucine||0)*k),fmt((f.aa.glycine||0)*k),fmt(f.kcal*k),f.fdcId]);}
 const csv='\ufeff'+rows.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='aminolab-refeicao.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
};
buildList();$('search').dispatchEvent(new Event('input'));totals();
