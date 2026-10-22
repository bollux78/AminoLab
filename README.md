# AminoLab 🧬

Calculadora de aminoácidos e macronutrientes para **21 entradas selecionadas**, com sliders individuais e metas diárias personalizadas pelo peso corporal.

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
- **A PTS e o Whey Integralmédica 100% Pure de baunilha possuem perfis cadastrados; a média genérica de whey 70% e o W Vegan Rice Protein dispõe de aminograma de rótulo incompleto e inconsistente** até encontrarmos um perfil adequado. A PTS utiliza o perfil de referência publicado pelo MEXT Japão (2023, alimento 04055), cujos aminoácidos são estimados na tabela, e não medidas específicas de uma marca.
- Carnes são apresentadas com peso cru. Feijões, arroz, grão-de-bico e lentilha usam peso cozido. A correspondência entre variedades americanas e brasileiras é aproximada.
- A porcentagem diária representa aminoácidos totais ingeridos, **não corrige digestibilidade ou biodisponibilidade**.

O site é estático em HTML, CSS e JavaScript, sem chave de API.

### Evidência brasileira complementar sobre PTS

[Pires et al. (2006), *Qualidade nutricional e escore químico de aminoácidos de diferentes fontes protéicas*](https://www.scielo.br/j/cta/a/rZc6S4hLs5dLqhbmNgqwhPb/?lang=pt) avaliou PTS comercial brasileira: digestibilidade verdadeira de 86,41% e PDCAAS de 64,81% no método e no padrão usados pelos autores; metionina+cisteína foram limitantes. **Esses percentuais não são multiplicadores da ingestão de aminoácidos no AminoLab**. O perfil numérico atualmente usado para PTS vem da [tabela japonesa MEXT 2023, registro 04055](https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=04_04055_6&MODE=1), que marca seus aminoácidos como estimativas (valores entre parênteses). O estudo brasileiro é uma comparação complementar, não fonte dos números por 100 g inseridos no aplicativo.

### Suplementos de rótulo (v1.2)

- **Integralmédica 100% Pure Whey — baunilha:** rótulo informado pelo usuário, porção de 30 g, 21 g de proteína e 2.030 mg de leucina. Composição, macros e aminograma convertidos proporcionalmente para 100 g de pó. Trata-se de declaração do fabricante, não ensaio independente.
- **Max Protein W Vegan Rice Protein Neutro (isolado de arroz):** rótulo fornecido pelo usuário, porção de 33 g, 25 g de proteína, 115 kcal e 2,74 g de leucina. Perfil calculado para 100 g de pó. Há uma inconsistência no rótulo: 16 aminoácidos declarados totalizam 28,50 g, acima dos 25 g de proteína informados. Além disso, falta fenilalanina: os valores de fenilalanina + tirosina são **mínimos parciais**, não um total completo. Glutamina (5,80 g por porção) é mantida distinta de ácido glutâmico. Por transparência, o item fica disponível com alerta, mas não é considerado um perfil validado completo.
- **Profit Labs 100% Premium Whey:** aminograma publicado em [fonte oficial](https://www.profitlabs.com.br/proteinas/100-premium-whey). A soma dos aminoácidos divulgados é de aproximadamente 70,13 g por 100 g de produto, compatível com o valor declarado de 70 g de proteínas; inclui aminoácidos livres adicionados na formulação. Sua inclusão numa média de wheys precisa separar whey puro de misturas com aminoácidos acrescentados.

### Gelatina sem sabor em pó (v1.4)

Adicionado o perfil **USDA SR Legacy, FDC 169599 / NDB 19177**, para gelatina seca, sem sabor e sem açúcar. Por 100 g: 335 kcal, 85,6 g de proteína, 19,049 g de glicina, 12,295 g de prolina e 2,454 g de leucina. **Triptofano = 0 g** e cistina = 0 g na fonte; portanto, não constitui uma proteína completa. Valores se referem ao pó seco, não à gelatina preparada com água. Fonte: [USDA FoodData Central](https://fdc.nal.usda.gov/food-details/169599/nutrients).
