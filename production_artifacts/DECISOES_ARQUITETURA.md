# 📝 Registro de Decisões de Arquitetura (ADR) - TJAEM

Este documento registra as decisões técnicas e arquiteturais do projeto TJAEM para garantir rastreabilidade e compliance.

## [ADR-001] Implementação da Estrutura de Agentes Antigravity
**Data**: 2026-04-13
**Status**: Aceito
**Contexto**: Necessidade de centralizar a inteligência e automação do projeto TJAEM seguindo as melhores práticas do Google Antigravity.
**Decisão**: Adotar a estrutura de pastas `.agents/` contendo `agents.md`, `rules/`, `skills/` e `workflows/`.
**Consequências**:
- Maior especialização das respostas da IA.
- Compliance LGPD e CAMEB nativo em todos os fluxos.
- Facilidade de manutenção e escala das automações.

## [ADR-002] Consolidação da Aplicação em `app_build`
**Data**: 2026-04-13
**Status**: Aceito
**Contexto**: Organização dos arquivos da aplicação web para evitar conflitos com metadados de agentes.
**Decisão**: Mover todo o conteúdo da pasta `web/` para `app_build/`.
**Consequências**: Estrutura de diretórios mais limpa e alinhada com o Guia de Agentes.

---
*Gerado automaticamente pelo Antigravity Orchestrator*
