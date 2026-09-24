/**
 * ============================================================
 * CONFIGURAÇÕES DO CLIENTE
 * ============================================================
 * Este ficheiro centraliza todas as configurações editáveis.
 * Basta alterar os valores abaixo para adaptar o site a outro cliente.
 * ============================================================
 */

const CLIENTE_CONFIG = {
    // ===== DADOS DO SALÃO =====
    nome: "Salão de Beleza Kelson",
    slogan: "A sua beleza é a nossa paixão",
    
    // ===== CONTACTOS =====
    // Número de WhatsApp no formato internacional (sem +, sem espaços)
    whatsapp: "244923063962",
    
    // Mensagem padrão que aparece no WhatsApp ao clicar
    whatsappMensagem: "Olá! Vi o vosso anúncio e gostaria de agendar um horário. Podem ajudar-me?",
    
    // Telefone para chamadas
    telefone: "+244923063962",
    
    // Email de contacto
    email: "salaokelsonazulmenongue@gmail.com",
    
    // ===== LOCALIZAÇÃO =====
    endereco: "Frente ao Palácio do Governador, Bairro Azul, Menongue, Cubango - Angola",
    
    // Coordenadas para o Google Maps (latitude, longitude)
    latitude: "-14.6",
    longitude: "15.7",
    
    // ===== REDES SOCIAIS =====
    facebook: "https://facebook.com/salaokelsonazulmenongue",
    instagram: "https://instagram.com/salaokelsonazulmenongue",
    
    // ===== ANALYTICS (opcional) =====
    // ID do Google Analytics (ex: "G-XXXXXXXXXX")
    googleAnalyticsId: "G-TD02LC7NCN",    

    // ID do Facebook Pixel (ex: "123456789012345")
    facebookPixelId: "",
    
    // ===== TRACKING DE CONVERSÃO =====
    // Se true, envia eventos de conversão quando o utilizador clica no WhatsApp
    trackConversions: true,
    
    // ===== POPUP =====
    // Se true, mostra o popup de captura após X segundos
    mostrarPopup: true,
    popupDelaySegundos: 15
};

// Exportar para uso global
window.CLIENTE_CONFIG = CLIENTE_CONFIG;