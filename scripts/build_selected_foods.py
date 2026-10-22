#!/usr/bin/env python3
"""Pick verified amino-acid profiles for the 18 AminoLab foods from existing USDA SR Legacy JSON.
Does not guess missing amino acids, rename non-equivalent products, or extrapolate.
Selection is reproducible and writes provenance for each chosen record.
"""
import json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/usda-legacy.json'
DEST=ROOT/'data/curated-foods.json'
AA9=['histidine','isoleucine','leucine','lysine','methionine','phenylalanine','threonine','tryptophan','valine']
AA_EXTRA=['cystine','tyrosine','glycine','proline','alanine','arginine','aspartic_acid','glutamic_acid','serine','hydroxyproline']
# Match strict food descriptions, excluding unrelated recipes/preparations.
# Positive patterns are anchors; hard exclusions reject incompatible cooking/raw states.
FOODS=[
('carioca','Feijão carioca, cozido e escorrido',[r'pinto beans?.*cooked',r'beans, pinto,.*boiled'],[r'canned',r'with salt','refried','fat added']),
('preto','Feijão preto, cozido e escorrido',[r'black beans?.*cooked',r'beans, black,.*boiled'],[r'canned','refried','with salt']),
('arroz','Arroz branco, cozido',[r'rice, white,.*cooked',r'white rice.*cooked'],[r'fried','pilaf','rice flour']),
('aveia','Aveia em flocos, seca',[r'oats,? raw',r'cereals, oats, regular and quick',r'oat flakes'],[r'prepared','cooked']),
('ervilha','Ervilha congelada, cozida',[r'peas, green, frozen,.*cooked',r'green peas, frozen, cooked'],[r'canned']),
('tofu','Tofu firme',[r'tofu,? (raw,? )?firm',r'tofu, firm'],[r'fried','silken']),
('pts','Proteína texturizada de soja, seca',[r'textured vegetable protein',r'textured soy protein'],[r'prepared','hydrated']),
('ovo','Ovo inteiro, cru',[r'egg, whole, raw, fresh',r'egg, whole, raw'],[r'fried','cooked']),
('iogurte','Iogurte natural desnatado, sem açúcar',[r'yogurt, plain, skim milk',r'yogurt, plain, nonfat',r'yogurt, nonfat, plain'],[r'flavored','fruit','sweetened']),
('whey','Whey 70%, em pó',[r'whey protein concentrate,? 70',r'whey protein,? concentrate'],[r'beverage','bar']),
('peito','Peito de frango, cru, sem pele',[r'chicken, broiler or fryers, breast, skinless, boneless, meat only, raw',r'chicken, broilers or fryers, breast, meat only, raw',r'chicken, breast, meat only, raw'],[r'cooked','roasted','added solution']),
('coxa','Coxa de frango, crua, sem pele',[r'chicken, broilers or fryers, dark meat, drumstick, meat only, raw',r'chicken, broilers or fryers, drumstick, meat only, raw',r'chicken, drumstick, meat only, raw'],[r'cooked']),
('sobrecoxa','Sobrecoxa de frango, crua, sem pele',[r'chicken, broilers or fryers, dark meat, thigh, meat only, raw',r'chicken, broilers or fryers, thigh, meat only, raw',r'chicken, thigh, meat only, raw'],[r'cooked']),
('bisteca','Bisteca suína, crua, parte comestível',[r'pork.*loin.*chops?.*raw',r'pork.*loin.*chops?.*lean only',r'pork, fresh, loin, chops, raw'],[r'cooked','breaded']),
('lombo','Lombo suíno, cru',[r'pork, fresh, loin,.*raw'],[r'cooked','chops','roasted']),
('patinho','Patinho bovino moído, cru',[r'beef, ground,.*(95% lean|90% lean).*raw',r'beef, ground,.*raw'],[r'cooked']),
('grao','Grão-de-bico, cozido e escorrido',[r'chickpeas.*cooked',r'garbanzo beans.*cooked'],[r'canned','hummus']),
('lentilha','Lentilha, cozida e escorrida',[r'lentils.*cooked',r'lentils, mature seeds, cooked'],[r'canned','soup'])
]
def search():
 if not SRC.exists():raise SystemExit('Source missing: '+str(SRC))
 data=json.loads(SRC.read_text(encoding='utf-8'))
 if not isinstance(data,list):raise SystemExit('Source is not a list')
 output=[]
 for key,label,patterns,banned in FOODS:
  candidates=[]
  for d in data:
   original=str(d.get('original') or d.get('name') or '')
   desc=original.lower()
   matches=[i for i,p in enumerate(patterns) if re.search(p,desc,re.I)]
   if not matches or any(re.search(p,desc,re.I) for p in banned):continue
   aa=d.get('aa') or {}
   n=sum(isinstance(aa.get(a),(int,float)) for a in AA9)
   extras=sum(isinstance(aa.get(a),(int,float)) for a in AA_EXTRA)
   # exact profiles only; never display partially complete data as fully populated
   if n!=9:continue
   score=(100-15*min(matches))+extras*2
   score-=len(desc)/25
   candidates.append((score,d))
  candidates.sort(key=lambda x:x[0],reverse=True)
  if not candidates:
   output.append({'key':key,'name':label,'available':False,'reason':'Nenhum perfil USDA equivalente com 9 aminoácidos essenciais foi identificado'})
   print(key,'MISSING')
   continue
  d=candidates[0][1]
  aa={k:round(float(v),5) for k,v in (d.get('aa') or {}).items() if isinstance(v,(int,float))}
  values={k:d.get(k) if isinstance(d.get(k),(int,float)) else None for k in ('kcal','protein','carbs','fat','fiber')}
  result={'key':key,'name':label,'available':True,'source':'USDA SR Legacy 2018',
    'sourceId':d.get('id'),'original':d.get('original') or d.get('name'),
    'stateNote':'Referência USDA; equivalente aproximado. Não é análise de produto brasileiro específico.',
    'aa':aa,**values}
  if key=='whey' and (result.get('protein') is None or not 67<=result['protein']<=73):
   output.append({'key':key,'name':label,'available':False,'reason':'Nenhum whey 70% com perfil analítico equivalente encontrado'})
   print(key,'NO_EQUIVALENT')
   continue
  output.append(result)
  print(key,'FOUND',result['sourceId'],result['original'],len(aa))
 DEST.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Available',sum(d['available'] for d in output),'/',len(output))
 # Record matching diagnostics for targeted scientific review.
 diagnostic={}
 for term in ('chicken','pork','soy','whey'):
  rows=[]
  for d in data:
   description=str(d.get('original') or d.get('name') or '')
   if term not in description.lower():continue
   aa=d.get('aa') or {}
   count=sum(isinstance(aa.get(k),(int,float)) for k in AA9)
   if count>=7 and (term!='chicken' or 'raw' in description.lower()):
    rows.append({'id':d.get('id'),'name':description,'essential':count,'glycine':isinstance(aa.get('glycine'),(int,float))})
  diagnostic[term]=sorted(rows,key=lambda x:(-x['essential'],x['name']))[:150]
 (ROOT/'data/curation-diagnostics.json').write_text(json.dumps(diagnostic,ensure_ascii=False,indent=2)+'\\n',encoding='utf-8')

if __name__=='__main__':search()
