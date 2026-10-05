# 🌸 Sistema Salão de Beleza Kelson

Sistema completo de gestão de agendamentos e controle financeiro para o **Salão de Beleza Kelson** em Menongue, Angola.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Deploy](#instalação-e-deploy)
- [Credenciais de Acesso](#credenciais-de-acesso)
- [Como Usar](#como-usar)
- [Documentação](#documentação)
- [Suporte](#suporte)

---

## 🎯 Visão Geral

O sistema oferece **três interfaces integradas**:

| Interface | Utilizador | Função |
|-----------|-----------|--------|
| 🌐 **Landing Page** | Cliente final | Ver serviços, agendar online, pagar |
| 👑 **Painel Admin** | Dono do salão | Gerir pedidos, funcionários, finanças |
| 💼 **Painel Barbeiro** | Barbeiro | Ver e gerir os seus pedidos |

**URL em produção:** [https://salao-kelson.netlify.app/](https://salao-kelson.netlify.app/)

---

## ✨ Funcionalidades

### 🌐 Para o Cliente
- ✅ Landing page responsiva e moderna
- ✅ Ver serviços com preços
- ✅ Galeria de trabalhos realizados
- ✅ Informações de localização com mapa
- ✅ **Agendamento online** com:
  - Escolha de serviço
  - Escolha de profissional (com foto)
  - Escolha de data e hora (slots de 1 hora)
  - Nome e telefone
  - Forma de pagamento (Dinheiro / Multicai Express)
  - Upload de comprovativo (Multicai)
- ✅ Confirmação por WhatsApp automática
- ✅ Sem sobreposição de horários

### 👑 Para o Admin (Dono)
- ✅ Login seguro por telefone (9 dígitos)
- ✅ 4 cards de estatísticas:
  - Hoje, Esta Semana, Este Mês, Este Ano
  - Total de pedidos + Receita
- ✅ **Gestão de Pedidos**:
  - Ver todos os pedidos
  - Filtrar por status
  - Marcar como "Cliente Chegou" → recebe valor
  - Marcar como "Não Compareceu"
  - Ver comprovativo Multicai (modal)
  - Sistema de taxa de atraso (10%)
- ✅ **Gestão de Funcionários (CRUD)**:
  - Adicionar novo funcionário
  - Editar dados
  - Desativar / Reativar
  - Criar conta Firebase automaticamente
- ✅ **Finanças**: receita total
- ✅ **Relatórios PDF** (Hoje, Semana, Mês, Ano)

### 💼 Para o Barbeiro
- ✅ Login seguro por telefone
- ✅ Ver apenas os seus pedidos
- ✅ Filtros: Pendentes, Hoje, Semana, Todas
- ✅ Estatísticas pessoais
- ✅ Marcar "Cliente Chegou" → concluir pedido
- ✅ Marcar "Não Compareceu"
- ✅ Contactar cliente via WhatsApp

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend / BaaS** | Firebase (Google) |
| **Base de Dados** | Cloud Firestore |
| **Autenticação** | Firebase Authentication |
| **Design** | Material Icons + Design Custom |
| **PDF** | jsPDF + AutoTable |
| **Hospedagem** | Netlify (gratuito) |
| **Repositório** | GitHub |
| **Analytics** | Google Analytics 4 |

---

## 📁 Estrutura do Projeto
