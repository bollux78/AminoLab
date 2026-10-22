# AminoLab 🧬

Calculadora de aminoácidos e macronutrientes para **18 alimentos selecionados**, com sliders individuais e metas diárias personalizadas pelo peso corporal.

**[Abrir calculadora](https://bollux78.github.io/AminoLab/)**

### Recursos
- Quantidades ajustáveis em gramas, sem perder o foco ao digitar.
- Nove requisitos de aminoácidos essenciais para adultos, expressos em **gramas e % da necessidade diária** (FAO/OMS/UNU 2007, mg/kg/dia).
- Metionina + cistina e fenilalanina + tirosina calculadas conjuntamente.
- Glicina, prolina e outros aminoácidos, além de proteínas, calorias, carboidratos, gorduras e fibras.
- Meta personalizável de proteínas, salvamento local e restauração da refeição.

### Origem e integridade dos dados
- [USDA FoodData Central, SR Legacy](https://fdc.nal.usda.gov/download-datasets/): perfis rastreáveis pelo ID e pela descrição original.
- [MEXT Japão, composição de PTS granulada seca (2023)](https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=04_04055_6&MODE=1): aminoácidos por 100 g; valores estimados na tabela de origem.
- [FAO/OMS/UNU, WHO Technical Report Series 935 (2007)](https://iris.who.int/handle/10665/43411): referências diárias para adultos.
- `scripts/build_selected_foods.py` escolhe os registros compatíveis e exige nove aminoácidos essenciais medidos. `.github/workflows/build-selected.yml` gera `data/curated-foods.json`.
- **17 alimentos estão disponíveis; whey 70% permanece desabilitado** até encontrarmos um perfil adequado. A PTS utiliza o perfil de referência publicado pelo MEXT Japão (2023, alimento 04055), cujos aminoácidos são estimados na tabela, e não medidas específicas de uma marca.
- Carnes são apresentadas com peso cru. Feijões, arroz, grão-de-bico e lentilha usam peso cozido. A correspondência entre variedades americanas e brasileiras é aproximada.
- A porcentagem diária representa aminoácidos totais ingeridos, **não corrige digestibilidade ou biodisponibilidade**.

O site é estático em HTML, CSS e JavaScript, sem chave de API.

### Evidência brasileira complementar sobre PTS

[Pires et al. (2006), *Qualidade nutricional e escore químico de aminoácidos de diferentes fontes protéicas*](https://www.scielo.br/j/cta/a/rZc6S4hLs5dLqhbmNgqwhPb/?lang=pt) avaliou PTS comercial brasileira: digestibilidade verdadeira de 86,41% e PDCAAS de 64,81% no método e no padrão usados pelos autores; metionina+cisteína foram limitantes. **Esses percentuais não são multiplicadores da ingestão de aminoácidos no AminoLab**. O perfil numérico atualmente usado para PTS vem da [tabela japonesa MEXT 2023, registro 04055](https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=04_04055_6&MODE=1), que marca seus aminoácidos como estimativas (valores entre parênteses). O estudo brasileiro é uma comparação complementar, não fonte dos números por 100 g inseridos no aplicativo.
