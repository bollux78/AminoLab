#!/usr/bin/env python3
"""Build compact AminoLab catalogue from official USDA and Canadian releases.
Usage: python scripts/build_catalogs.py
Missing sources are logged, never silently substituted.
"""
import csv, io, json, os, re, unicodedata, urllib.request, zipfile
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]/"data"
BASE.mkdir(parents=True,exist_ok=True)
SOURCES={
 "usda-foundation":"https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2026-04-30.zip",
 "usda-legacy":"https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2018-04.zip",
 "usda-fndds":"https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_survey_food_json_2021-2023.zip",
 "canada":"https://open.canada.ca/data/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109/resource/019f2a90-e3a9-489d-b6e1-f74f4ba1d006/download/cnf_fcen_all-files-data_2026.zip"
}
# Translation is intentionally conservative: matching canonical English food terms only.
# Preserve original description for scientific traceability.
WORDS={
"chicken":"frango","breast":"peito","thigh":"coxa","wing":"asa","skinless":"sem pele",
"beef":"carne bovina","pork":"carne suína","turkey":"peru","fish":"peixe",
"salmon":"salmão","tuna":"atum","cod":"bacalhau","shrimp":"camarão",
"egg":"ovo","eggs":"ovos","whole":"inteiro","white":"branco","yolk":"gema",
"milk":"leite","cheese":"queijo","yogurt":"iogurte","butter":"manteiga",
"rice":"arroz","brown":"integral","bread":"pão","wheat":"trigo","oats":"aveia",
"corn":"milho","flour":"farinha","pasta":"macarrão","noodles":"macarrão",
"beans":"feijão","bean":"feijão","lentils":"lentilha","chickpeas":"grão-de-bico",
"soybeans":"soja","soy":"soja","peas":"ervilha","peanuts":"amendoim",
"almonds":"amêndoas","walnuts":"nozes","cashews":"castanha de caju",
"potato":"batata","sweet":"doce","cassava":"mandioca","carrot":"cenoura",
"tomato":"tomate","onion":"cebola","garlic":"alho","cabbage":"repolho",
"broccoli":"brócolis","spinach":"espinafre","lettuce":"alface",
"apple":"maçã","banana":"banana","orange":"laranja","strawberry":"morango",
"avocado":"abacate","grapes":"uvas","mango":"manga","papaya":"mamão",
"raw":"cru","cooked":"cozido","boiled":"cozido","fried":"frito",
"roasted":"assado","baked":"assado","grilled":"grelhado","steamed":"no vapor",
"frozen":"congelado","fresh":"fresco","dried":"seco","canned":"enlatado",
"without":"sem","with":"com","salt":"sal","added":"adicionado",
"fat":"gordura","lean":"magro","ground":"moído","boneless":"sem osso",
"unsweetened":"sem açúcar","sweetened":"adoçado","low":"baixo",
"fat-free":"sem gordura","plain":"natural","powder":"pó",
"oil":"óleo","olive":"azeitona","olive oil":"azeite de oliva",
"water":"água","coconut":"coco","sugar":"açúcar",
"firm":"firme","tofu":"tofu","gelatin":"gelatina","protein":"proteína",
"leg":"perna","liver":"fígado","heart":"coração","kidney":"rim",
"meat":"carne","dark":"escuro","light":"claro","skin":"pele",
"seed":"semente","seeds":"sementes","peppers":"pimentões","pepper":"pimentão",
"mushrooms":"cogumelos","mushroom":"cogumelo","cucumber":"pepino",
"pumpkin":"abóbora","squash":"abóbora","zucchini":"abobrinha",
"cauliflower":"couve-flor","asparagus":"aspargos",
"pineapple":"abacaxi","lemon":"limão","lime":"lima","pear":"pera",
"watermelon":"melancia","melon":"melão","peach":"pêssego",
"coffee":"café","tea":"chá","juice":"suco",
}
PHRASES={k:v for k,v in WORDS.items() if " " in k}
SINGLES={k:v for k,v in WORDS.items() if " " not in k}
def translate(s):
    t=s.lower()
    for a,b in sorted(PHRASES.items(),key=lambda x:-len(x[0])):
        t=re.sub(r"\b"+re.escape(a)+r"\b",b,t)
    for a,b in SINGLES.items():
        t=re.sub(r"\b"+re.escape(a)+r"\b",b,t)
    return t[0].upper()+t[1:] if t else s
def norm(s): return unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode().lower()
def num(v):
    try:
        x=float(v)
        return round(x,5) if x>=0 and x<1e7 else None
    except (ValueError,TypeError): return None
def download(url):
    req=urllib.request.Request(url,headers={"User-Agent":"AminoLab-builder/1.0 (public food data)"})
    with urllib.request.urlopen(req,timeout=180) as response: return response.read()
def write(name,records):
    dest=BASE/(name+".json")
    dest.write_text(json.dumps(records,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print(name,len(records),"records",dest.stat().st_size,"bytes",flush=True)
def match_nutrient(name,unit):
    name=name.lower().strip()
    if name in ("protein",): return "protein"
    if name in ("total lipid (fat)","total fat","fat, total"): return "fat"
    if name in ("carbohydrate, by difference","carbohydrate by difference","carbohydrate, total"): return "carbs"
    if name in ("fiber, total dietary","fibre, total dietary","fiber total dietary","fibre, total"): return "fiber"
    if name in ("energy","energy (atwater general factors)","energy (atwater specific factors)") and unit.lower()=="kcal": return "kcal"
    aa={
      "histidine":"histidine","isoleucine":"isoleucine","leucine":"leucine","lysine":"lysine",
      "methionine":"methionine","phenylalanine":"phenylalanine","threonine":"threonine",
      "tryptophan":"tryptophan","valine":"valine","alanine":"alanine","arginine":"arginine",
      "aspartic acid":"aspartic_acid","cystine":"cystine","glutamic acid":"glutamic_acid",
      "glycine":"glycine","proline":"proline","serine":"serine","tyrosine":"tyrosine",
      "hydroxyproline":"hydroxyproline"}
    return aa.get(name)
AA={"histidine","isoleucine","leucine","lysine","methionine","phenylalanine","threonine","tryptophan","valine","alanine","arginine","aspartic_acid","cystine","glutamic_acid","glycine","proline","serine","tyrosine","hydroxyproline"}
def unit_to_g(v,unit):
    u=unit.lower().strip()
    return v/1000 if u=="mg" else v/1e6 if u in ("ug","µg","mcg") else v if u=="g" else None
def record(id_,name,source,vals):
    aa={k:v for k,v in vals.items() if k in AA and v is not None}
    d={"id":id_,"name":translate(name),"original":name,"group":source,"source":source,
       "kcal":vals.get("kcal"),"protein":vals.get("protein"),"carbs":vals.get("carbs"),
       "fat":vals.get("fat"),"fiber":vals.get("fiber"),"aa":aa}
    return d
def usda_build(name,archive):
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        jsons=[x for x in z.namelist() if x.lower().endswith(".json")]
        if not jsons: raise RuntimeError("Missing JSON member")
        obj=json.loads(z.read(jsons[0]))
    if isinstance(obj,dict):
        arr=next((v for k,v in obj.items() if isinstance(v,list) and ("food" in k.lower())),None)
    else: arr=obj
    if not isinstance(arr,list): raise RuntimeError("Unexpected USDA format")
    out=[]
    for f in arr:
        vals={}
        for n in f.get("foodNutrients",[]):
            nutrient=n.get("nutrient",{})
            key=match_nutrient(nutrient.get("name",n.get("nutrientName","")),nutrient.get("unitName",n.get("unitName","")))
            value=num(n.get("amount",n.get("value")))
            if not key or value is None:continue
            if key in AA:
                value=unit_to_g(value,nutrient.get("unitName",n.get("unitName","")))
            if value is not None and key not in vals: vals[key]=value
        fdc=f.get("fdcId")
        desc=f.get("description","")
        if fdc and desc:out.append(record(name+"-"+str(fdc),desc,name,vals))
    write(name,out)
def canada_build(archive):
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        members=z.namelist()
        def read(kind):
            files=[p for p in members if p.lower().split("/")[-1]==kind+".csv"]
            if not files: files=[p for p in members if kind in p.lower() and p.lower().endswith(".csv")]
            if not files: raise RuntimeError("CSV missing: "+kind)
            raw=z.read(files[0])
            return list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig",errors="replace"))))
        names=read("food_name"); nutrients=read("nutrient_name"); amounts=read("nutrient_amount")
    def pick(row,*keys):
        d={norm(k).replace(" ","_"):v for k,v in row.items() if k}
        for k in keys:
            v=d.get(norm(k).replace(" ","_"))
            if v is not None:return v
        return None
    map_code={}
    for n in nutrients:
        code=pick(n,"Nutrient_Code")
        name=pick(n,"Nutrient_Name_EN")
        unit=pick(n,"Nutrient_Unit")
        if code and name:
            k=match_nutrient(name,unit or "")
            if k:map_code[code]=(k,unit or "")
    vals={}
    for row in amounts:
        code=pick(row,"Food_Code"); nut=pick(row,"Nutrient_Code")
        if not code or nut not in map_code:continue
        key,unit=map_code[nut]
        val=num(pick(row,"Nutrient_Amount"))
        if val is None:continue
        if key in AA:val=unit_to_g(val,unit)
        if val is not None:vals.setdefault(code,{}).setdefault(key,val)
    records=[]
    for f in names:
        code=pick(f,"Food_Code"); desc=pick(f,"Food_Description","Food_Description_EN","Food_Name_EN","Food_Name")
        if code and desc:records.append(record("canada-"+str(code),desc,"canada",vals.get(code,{})))
    write("canada",records)
def main():
    ok=0
    for name,url in SOURCES.items():
        try:
            print("Downloading",name,flush=True)
            archive=download(url)
            (canada_build if name=="canada" else lambda x:usda_build(name,x))(archive)
            ok+=1
        except Exception as e:
            print("ERROR",name,str(e),flush=True)
    if not ok:raise SystemExit("No data sources built; keeping previously published data")
if __name__=="__main__": main()
