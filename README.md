# AminoLab 🧬

Calculadora simples e interativa de **proteínas, leucina, glicina e outros aminoácidos**, com 18 alimentos selecionados.

**[Abrir AminoLab](https://bollux78.github.io/AminoLab/)**

## Como usar

Ajuste o slider de cada alimento ou digite seu peso em gramas. Os totais de proteína, calorias, carboidratos, gorduras, fibras e aminoácidos são atualizados instantaneamente. É possível ajustar a meta de leucina, salvar a seleção no navegador e exportar CSV.

- **Carnes:** peso cru, sem osso; aves sem pele.
- **Feijões, lentilha, grão-de-bico, ervilha e arroz:** peso depois de cozidos/escorridos.
- **Aveia e PTS:** peso seco.
- **Tofu e iogurte:** peso como consumidos; **ovo:** peso cru sem casca.
- **Whey 70%:** peso do pó.

## Dados e fontes

Os 18 registros foram escolhidos a partir do download oficial **USDA FoodData Central — SR Legacy, abril de 2018**, usando os campos de aminoácidos reportados no próprio conjunto. Todos têm dados para os **nove aminoácidos essenciais**, além de **glicina e prolina**. Em geral são 18 aminoácidos por alimento; algumas carnes têm 19.

Cada alimento indica o **FDC ID** e a descrição original. Os dados por 100 g estão em `foods.js`, de modo que a página não precisa acessar APIs nem baixar bancos enormes.

**Cuidado com as aproximações:** feijão-pinto dos EUA foi usado como substituto do feijão carioca; aveia em grão para flocos; farinha de soja desengordurada para PTS; carne escura sem pele para coxa e sobrecoxa; top round bovino magro para patinho; o peito cru do conjunto USDA contém solução adicionada. Esses registros são marcados como **APROX.** no site.

**Whey 70%:** os aminoácidos foram **estimados**, escalando o perfil do soro de leite doce desidratado do USDA para 70% de proteína; os macronutrientes são uma referência genérica, não análises do produto comercial. Ele é marcado **ESTIMADO**. Para dados precisos de uma marca específica, é necessário seu laudo aminoacídico.

Aminoácidos não reportados ficam como **ausentes**, não como zero. Quantidades totais de aminoácidos não são indicadores diretos de digestibilidade, biodisponibilidade ou DIAAS.

**Fonte:** [USDA FoodData Central — baixar conjuntos oficiais](https://fdc.nal.usda.gov/download-datasets/). SR Legacy é uma base histórica e não terá novas edições.

## Implementação

HTML + CSS + JavaScript estáticos; site publicado no GitHub Pages. Os scripts antigos de importação de grandes catálogos permanecem no histórico do projeto, mas **não são mais usados pelo aplicativo**.
