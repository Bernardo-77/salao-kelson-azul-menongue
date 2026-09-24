# 🌸 Landing Page - Salão de Beleza Kelson

Landing page profissional e responsiva para salão de beleza, com foco em conversão via WhatsApp.

## 📋 Características

- ✅ Design moderno e responsivo (mobile-first)
- ✅ Botões de WhatsApp em todos os pontos estratégicos
- ✅ Popup de captura de leads
- ✅ Galeria de fotos
- ✅ Google Maps integrado
- ✅ SEO otimizado (meta tags)
- ✅ Open Graph para partilhas em redes sociais
- ✅ Pronto para Google Analytics e Facebook Pixel
- ✅ Política de Privacidade incluída (obrigatório para anúncios)

## 🚀 Como Publicar (Deploy)

### Opção 1: Netlify (Recomendado - Gratuito)

1. Cria uma conta em [netlify.com](https://netlify.com)
2. Faz download de toda a pasta `salao-beleza-landing`
3. Arrasta a pasta para o painel do Netlify
4. O site fica online em segundos com um URL tipo `https://nome-aleatorio.netlify.app`
5. Podes configurar um domínio próprio nas configurações

### Opção 2: Vercel (Gratuito)

1. Cria uma conta em [vercel.com](https://vercel.com)
2. Instala o Vercel CLI: `npm i -g vercel`
3. Dentro da pasta do projeto, corre: `vercel`
4. Segue as instruções no terminal

### Opção 3: GitHub Pages (Gratuito)

1. Cria um repositório no GitHub
2. Faz upload de todos os ficheiros
3. Vai em Settings → Pages → Source: main branch
4. O site fica online em `https://teu-utilizador.github.io/nome-repo`

## ⚙️ Como Personalizar

### 1. Alterar Dados do Cliente

Edita o ficheiro `assets/js/config.js`:

```javascript
const CLIENTE_CONFIG = {
    nome: "Nome do Salão",
    whatsapp: "244XXXXXXXXX",  // Sem + e sem espaços
    whatsappMensagem: "Olá! Gostaria de agendar...",
    // ... etc
};