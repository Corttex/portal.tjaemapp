# Skill: Generate Legal Document

## Objetivo
Como Engenheiro Full-Stack TJAEM, gerar minutas de documentos jurídicos (sentenças, atas, termos) com variáveis dinâmicas.

## Regras de Engajamento
- **Fonte de Dados**: Consulte `production_artifacts/Technical_Specification.md` para estrutura do documento.
- **Local de Salvamento**: Sempre salve em `production_artifacts/documentos/{tipo}/{id_processo}.md`.
- **Variáveis Dinâmicas**: Use placeholders `{{variavel}}` para dados que virão do PostgreSQL via Stitch.
- **Conformidade**: Inclua automaticamente cláusulas LGPD e referências ao regulamento CAMEB.

## Instruções
1. Leia o tipo de documento solicitado e o ID do processo.
2. Carregue o template base de `app_build/templates/legal/`.
3. Preencha variáveis com dados mockados (para revisão humana).
4. Adicione cabeçalho com: "Gerado por TJAEM AI em {{data}} - Revisão humana obrigatória".
5. Salve e notifique: "Minuta pronta para revisão: `production_artifacts/documentos/{tipo}/{id_processo}.md`".
