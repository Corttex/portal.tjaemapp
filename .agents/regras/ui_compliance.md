# Rule: UI Design Compliance - ALWAYS ON
## Trigger: Toda geração de HTML/CSS/React/Vue/Tailwind
## Agentes Afetados: @engineer_tjaem, @integrator

### Constraints Rígidas:
1. ANTES de gerar qualquer componente, leia:
   - `.agents/design-system/tokens.json`
   - `.agents/design-system/components.md`
   - `.agents/design-system/guidelines.md`
2. NUNCA invente cores, fontes, espaçamentos ou sombras. Use APENAS variáveis dos tokens.
3. Se o pedido for "dashboard", "card", "modal" ou "formulário", siga EXATAMENTE a estrutura de `components.md`.
4. Após gerar, execute auto-verificação:
   - [ ] Usa variáveis de `tokens.json`?
   - [ ] Segue hierarquia de `guidelines.md`?
   - [ ] Acessível (contraste, ARIA, foco visível)?
   - [ ] Sem estilos inline ou `!important`?
5. Se falhar em qualquer item: REFAÇA antes de mostrar ao usuário.

### Exceção:
- Apenas com autorização explícita do usuário: `/override_design "motivo justificável"`