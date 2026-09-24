/**
 * ============================================================
 * SCRIPT PRINCIPAL
 * ============================================================
 * Lógica de interação, WhatsApp, analytics e popup.
 * ============================================================
 */

(function() {
    'use strict';

    // ===== OBTER CONFIGURAÇÕES =====
    const config = window.CLIENTE_CONFIG || {};
    const whatsapp = config.whatsapp || "244923456789";
    const mensagem = encodeURIComponent(config.whatsappMensagem || "Olá! Gostaria de agendar um horário.");

    // ===== URL DO WHATSAPP =====
    const whatsappURL = `https://wa.me/${whatsapp}?text=${mensagem}`;

    /**
     * ============================================================
     * 1. ABRIR WHATSAPP
     * ============================================================
     */
    function abrirWhatsApp(origem) {
        // Registar evento de conversão (se ativo)
        if (config.trackConversions) {
            registarConversao(origem);
        }

        // Abrir WhatsApp numa nova aba
        window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }

    /**
     * ============================================================
     * 2. REGISTAR CONVERSÃO (ANALYTICS + PIXEL)
     * ============================================================
     */
    function registarConversao(origem) {
        console.log(`[Conversão] Clique no WhatsApp - Origem: ${origem}`);

        // Google Analytics 4 (se configurado)
        if (typeof gtag === 'function' && config.googleAnalyticsId) {
            gtag('event', 'conversion', {
                'event_category': 'WhatsApp',
                'event_label': origem,
                'value': 1
            });
        }

        // Facebook Pixel (se configurado)
        if (typeof fbq === 'function' && config.facebookPixelId) {
            fbq('track', 'Contact', {
                content_name: 'WhatsApp Click',
                content_category: origem
            });
        }
    }

    /**
     * ============================================================
     * 3. LIGAR TODOS OS BOTÕES DE WHATSAPP
     * ============================================================
     */
    function ligarBotoesWhatsApp() {
        // Header
        const btnHeader = document.getElementById('btnWhatsappHeader');
        if (btnHeader) {
            btnHeader.addEventListener('click', () => abrirWhatsApp('header'));
        }

        // Hero
        const btnHero = document.getElementById('btnWhatsappHero');
        if (btnHero) {
            btnHero.addEventListener('click', () => abrirWhatsApp('hero'));
        }

        // Localização
        const btnLocalizacao = document.getElementById('btnWhatsappLocalizacao');
        if (btnLocalizacao) {
            btnLocalizacao.addEventListener('click', () => abrirWhatsApp('localizacao'));
        }

        // CTA Final
        const btnCTA = document.getElementById('btnWhatsappCTA');
        if (btnCTA) {
            btnCTA.addEventListener('click', () => abrirWhatsApp('cta_final'));
        }

        // Botão Flutuante
        const btnFloat = document.getElementById('btnWhatsappFloat');
        if (btnFloat) {
            btnFloat.href = whatsappURL;
            btnFloat.addEventListener('click', (e) => {
                e.preventDefault();
                abrirWhatsApp('botao_flutuante');
            });
        }
    }

    /**
     * ============================================================
     * 4. POPUP DE CAPTURA
     * ============================================================
     */
    function iniciarPopup() {
        if (!config.mostrarPopup) return;

        const overlay = document.getElementById('popupOverlay');
        const btnClose = document.getElementById('popupClose');
        const btnWhats = document.getElementById('popupWhatsapp');
        const inputNome = document.getElementById('popupNome');

        if (!overlay) return;

        // Mostrar popup após X segundos (apenas uma vez por sessão)
        if (!sessionStorage.getItem('popupMostrado')) {
            setTimeout(() => {
                overlay.style.display = 'flex';
                sessionStorage.setItem('popupMostrado', 'true');
            }, (config.popupDelaySegundos || 15) * 1000);
        }

        // Fechar popup
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                overlay.style.display = 'none';
            });
        }

        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });

        // Botão do WhatsApp no popup
        if (btnWhats) {
            btnWhats.addEventListener('click', () => {
                const nome = inputNome ? inputNome.value.trim() : '';
                const msg = nome 
                    ? `Olá! O meu nome é ${nome} e gostaria de agendar um horário com o desconto de 10%.`
                    : mensagem;
                const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
                overlay.style.display = 'none';
                registarConversao('popup');
            });
        }
    }

    /**
     * ============================================================
     * 5. SCROLL SUAVE PARA LINKS INTERNOS
     * ============================================================
     */
    function ligarScrollSuave() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /**
     * ============================================================
     * 6. HEADER COM EFEITO AO SCROLL
     * ============================================================
     */
    function efeitoHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        });
    }

    /**
     * ============================================================
     * 7. ANIMAÇÃO DE ENTRADA DOS ELEMENTOS
     * ============================================================
     */
    function animarElementos() {
        const elementos = document.querySelectorAll('.service-card, .gallery-item, .section-header');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animado');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elementos.forEach(el => observer.observe(el));
    }

    /**
     * ============================================================
     * 8. GOOGLE ANALYTICS (se configurado)
     * ============================================================
     */
    function iniciarAnalytics() {
        if (!config.googleAnalyticsId) return;

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', config.googleAnalyticsId);
        window.gtag = gtag;
    }

    /**
     * ============================================================
     * 9. FACEBOOK PIXEL (se configurado)
     * ============================================================
     */
    function iniciarFacebookPixel() {
        if (!config.facebookPixelId) return;

        !function(f,b,e,v,n,t,s) {
            if (f.fbq) return;
            n = f.fbq = function() {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', config.facebookPixelId);
        fbq('track', 'PageView');
    }

    /**
     * ============================================================
     * INICIALIZAÇÃO
     * ============================================================
     */
    document.addEventListener('DOMContentLoaded', () => {
        ligarBotoesWhatsApp();
        ligarScrollSuave();
        efeitoHeader();
        animarElementos();
        iniciarPopup();
        iniciarAnalytics();
        iniciarFacebookPixel();
    });

})();