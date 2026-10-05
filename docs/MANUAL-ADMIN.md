# 📖 Manual do Administrador

**Painel Admin — Salão de Beleza Kelson**

---

## 🔐 Como Fazer Login

1. Acede a: `https://salaokelson.com/login.html`
2. Insere:
   - **Telefone:** 929627627
   - **Senha:** (a senha definida)
3. Clica **"ENTRAR"**

⚠️ **Se esqueceres a senha**, contacta o suporte técnico.

---

## 🏠 O Painel Admin

Depois do login, vais ver:




---

## 📋 1. Gestão de Pedidos

### Ver Pedidos

Clica na tab **"Pedidos"**. Vais ver a lista completa, ordenada do mais recente para o mais antigo.

**Cada pedido mostra:**
- Nome e telefone do cliente
- Serviço
- Barbeiro
- Data e hora
- Forma de pagamento
- Valor
- Status

### Status Possíveis

| Status | Significado |
|--------|-------------|
| ⏳ **Pendente** | Aguarda atendimento |
| ✅ **Concluído** | Cliente foi atendido |
| ❌ **Cancelado** | Cancelado |
| ⚠️ **Não Compareceu** | Cliente faltou |

### Botões de Ação

**Quando o pedido é do próprio admin** (Kelson), aparecem 2 botões:

1. **✅ "Cliente Chegou — Receber"**
   - Clica quando o cliente chega
   - Confirma o recebimento do valor
   - Sistema marca como concluído
   - Adiciona aos totais

2. **❌ "Não Compareceu"**
   - Clica quando o cliente não aparece
   - Não conta para receita
   - Fica no histórico

### Ver Comprovativo Multicai

Se o pedido tiver pagamento por **Multicai Express**:
- Aparece botão **"📱 Ver Comprovativo Multicai"**
- Clica → abre modal com a imagem
- Botão **"Descarregar"** para guardar

---

## 👥 2. Gestão de Funcionários

### Ver Funcionários

Clica na tab **"Funcionários"**. Vais ver todos os funcionários.

### Adicionar Novo Funcionário

1. Clica em **"Adicionar"**
2. Preenche:
   - **Nome completo** (apenas letras)
   - **Telefone** (9 dígitos)
   - **Senha** (gerada automaticamente — copia!)
   - **Função:** Barbeiro ou Admin
   - **Foto URL** (opcional)
3. Sistema gera o **email** automaticamente
4. **⚠️ IMPORTANTE:** Segue as instruções do modal:
   - Copia a senha
   - Vai ao Firebase Console
   - Cria conta com o email mostrado
   - Copia o UID gerado
   - Cola no campo UID
5. Clica **"Guardar Funcionário"**
6. **Guarda o email e senha** para dar ao funcionário

### Editar Funcionário

1. Clica no botão **"✏️"** no card
2. Altera os dados (nome, telefone, função, foto)
3. **Não é possível alterar a senha aqui**
4. Clica **"Guardar"**

### Desativar Funcionário

1. Clica no botão **"🚫"** no card
2. Confirma
3. Funcionário fica **inativo** (não consegue fazer login)
4. Dados mantêm-se no histórico

### Reativar Funcionário

1. Clica no botão **"✅"** no funcionário inativo
2. Funcionário fica ativo novamente

---

## 💰 3. Finanças

Clica na tab **"Finanças"** para ver:
- Receita Total
- Número de pedidos concluídos

---

## 📄 4. Relatórios PDF

Clica na tab **"Relatórios"**. Escolhe:

- **📅 Relatório de Hoje** — pedidos de hoje
- **📅 Relatório Semanal** — esta semana
- **📅 Relatório Mensal** — este mês
- **📅 Relatório Anual** — este ano

Clica no botão → PDF é gerado e descarregado.

**O PDF inclui:**
- Cabeçalho com data
- Total de pedidos
- Receita total
- Tabela detalhada

---

## 🔓 Como Fazer Logout

Clica em **"Sair"** no canto superior direito.

---

## ❓ Perguntas Frequentes

### "Como sei que recebi um pedido novo?"
- Não há notificação (por agora)
- Verifica regularmente a tab **"Pedidos"**

### "Posso cancelar um pedido?"
- Por agora, não há botão de cancelar
- Marca como "Não Compareceu"

### "Como vejo apenas os pedidos de hoje?"
- Por agora, vê todos
- Filtros por data serão adicionados

### "Posso apagar um funcionário?"
- Não. **Desativa** para manter histórico
- Se precisares apagar, contacta suporte

### "Como contacto o cliente?"
- Por agora, usa o telefone do card
- Abrir WhatsApp será adicionado

---

## 🚨 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Não consigo fazer login | Verifica telefone (9 dígitos) e senha |
| Não vejo os pedidos | Recarrega a página (Ctrl+F5) |
| Sistema lento | Verifica a internet |
| Não consigo ver o comprovativo | Ficheiro pode estar corrompido |
| Não consigo guardar funcionário | Verifica se o UID está correto |

---

## 📞 Suporte

- 📧 Email: salaokelsonazulmenongue@gmail.com
- 📞 Telefone: +244 923 063 962
- 💬 WhatsApp: +244 923 063 962

---

**Última atualização:** Outubro de 2026