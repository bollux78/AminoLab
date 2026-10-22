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
- [FAO/OMS/UNU, WHO Technical Report Series 935 (2007)](https://iris.who.int/handle/10665/43411): referências diárias para adultos.
- `scripts/build_selected_foods.py` escolhe os registros compatíveis e exige nove aminoácidos essenciais medidos. `.github/workflows/build-selected.yml` gera `data/curated-foods.json`.
- **16 alimentos estão atualmente disponíveis; PTS seca e whey 70% permanecem desabilitados** por falta de correspondência analítica satisfatória no conjunto consultado.
- Carnes são apresentadas com peso cru. Feijões, arroz, grão-de-bico e lentilha usam peso cozido. A correspondência entre variedades americanas e brasileiras é aproximada.
- A porcentagem diária representa aminoácidos totais ingeridos, **não corrige digestibilidade ou biodisponibilidade**.

O site é estático em HTML, CSS e JavaScript, sem chave de API.
