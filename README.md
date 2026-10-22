# AminoLab 🧬

Calculadora de refeições com macronutrientes, fibras e aminoácidos em português — hospedada no GitHub Pages.

**[Abrir AminoLab](https://bollux78.github.io/AminoLab/)**

## Fontes nutricionais

| Fonte | Atualização da origem | Integração |
|---|---|---|
| TACO — NEPA/UNICAMP | 4ª ed., 2011 | Consulta online em português, 597 alimentos |
| USDA Foundation Foods | abril de 2026 | Download oficial, conversão para JSON compacto |
| USDA SR Legacy | abril de 2018 | Download oficial, conversão para JSON compacto |
| USDA FNDDS | 2021–2023 | Download oficial, conversão para JSON compacto |
| Canadian Nutrient File | 2026 | Download oficial CSV, conversão para JSON compacto |

Os dados internacionais são processados por `.github/workflows/update-food-data.yml` e `scripts/build_catalogs.py`. O workflow publica arquivos em `data/` na branch `main`; **até que ele conclua com sucesso, o navegador não poderá carregar essas bases**. A interface usa catálogos estáticos, sem exigir chave de API.

## Tradução e pesquisa

Uma lista de termos alimentares traduz descrições frequentes do inglês para o português. Nomes originais são preservados em `original` para auditoria e pesquisa; **a tradução é parcial e não equivale a uma tradução humana de todos os registros**. A busca ignora acentos.

## Dados e cautelas

- Valores por 100 g de parte comestível, conforme cada fonte.
- Cada alimento retém seu identificador e banco de origem; nenhum alimento brasileiro é automaticamente combinado com outro estrangeiro.
- Aminoácidos ausentes não são tratados como zero.
- Perfis de aminoácidos são incompletos para parte dos registros; a cobertura TACO é limitada.
- Os nove itens demonstrativos originais continuam no catálogo, mas não representam análises oficiais.

## Manutenção

No GitHub, abra **Actions → Atualizar bases nutricionais → Run workflow** se desejar regenerar os catálogos. O workflow também é acionado quando seu script muda e executa atualização periódica mensal. Ele exige permissão do GitHub Actions para gravar no repositório (**Settings → Actions → General → Workflow permissions → Read and write permissions**).

## Créditos

- [TACO/NEPA/UNICAMP](https://nepa.unicamp.br/publicacoes/) via [brolesi/taco](https://github.com/brolesi/taco)
- [USDA FoodData Central — downloads oficiais](https://fdc.nal.usda.gov/download-datasets/) (CC0)
- [Canadian Nutrient File — 2026](https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109) (Open Government Licence — Canada)

Interface: HTML, CSS e JavaScript. Importador: Python padrão, sem pacotes externos.
