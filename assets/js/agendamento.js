/**
 * ============================================================
 * AGENDAMENTO ONLINE
 * Salão Kelson - Menongue
 * ============================================================
 * Lógica de agendamento público (clientes).
 * ============================================================
 */

(function() {
    'use strict';

    // ===== ESTADO =====
    let servicos = [];
    let barbeiros = [];
    let agendamentosExistentes = [];
    let servicoSelecionado = null;
    let barbeiroSelecionado = null;
    let comprovativoBase64 = null;

    // ===== ELEMENTOS =====
    const form = document.getElementById('agendamentoForm');
    const servicesContainer = document.getElementById('agendamentoServices');
    const barbeirosContainer = document.getElementById('agendamentoBarbeiros');
    const dataInput = document.getElementById('agendamentoData');
    const horaSelect = document.getElementById('agendamentoHora');
    const infoHora = document.getElementById('agendamentoInfoHora');
    const nomeInput = document.getElementById('agendamentoNome');
    const telefoneInput = document.getElementById('agendamentoTelefone');
    const comprovativoDiv = document.getElementById('agendamentoComprovativo');
    const comprovativoInput = document.getElementById('agendamentoComprovativoInput');
    const filePreview = document.getElementById('agendamentoFilePreview');
    const errorBox = document.getElementById('agendamentoError');
    const errorText = document.getElementById('agendamentoErrorText');
    const successBox = document.getElementById('agendamentoSuccess');
    const successText = document.getElementById('agendamentoSuccessText');
    const submitBtn = document.getElementById('agendamentoSubmit');
    const submitText = document.getElementById('agendamentoSubmitText');
    const resumo = document.getElementById('agendamentoResumo');
    const resumoServico = document.getElementById('resumoServico');
    const resumoBarbeiro = document.getElementById('resumoBarbeiro');
    const resumoData = document.getElementById('resumoData');
    const resumoHora = document.getElementById('resumoHora');
    const resumoTotal = document.getElementById('resumoTotal');
    const whatsappBtn = document.getElementById('agendamentoWhatsapp');

    // ===== CONFIGURAÇÃO =====
    const HORARIOS = {
        semana: { inicio: 8, fim: 19 },   // Seg-Sex: 08h-19h
        sabado: { inicio: 8, fim: 17 }    // Sábado: 08h-17h
    };

    // ===== UTILITÁRIOS =====
    function formatarKz(valor) {
        return valor.toLocaleString('pt-AO') + ' Kz';
    }

    function getIniciais(nome) {
        return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    function getHoje() {
        const hoje = new Date();
        return hoje.toISOString().split('T')[0];
    }

    function gerarSlotsDisponiveis(data) {
        const d = new Date(data + 'T00:00:00');
        const diaSemana = d.getDay(); // 0=Dom, 6=Sáb

        if (diaSemana === 0) {
            return []; // Domingo fechado
        }

        const config = diaSemana === 6 ? HORARIOS.sabado : HORARIOS.semana;
        const slots = [];

        for (let h = config.inicio; h < config.fim; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
        }

        return slots;
    }

    function filtrarSlotsOcupados(data, barbeiroId) {
        const ocupados = agendamentosExistentes
            .filter(a => 
                a.data === data && 
                a.barbeiroId === barbeiroId &&
                a.status !== 'cancelado'
            )
            .map(a => a.horaInicio);

        return ocupados;
    }

    // ===== MOSTRAR ERRO =====
    function mostrarErro(msg) {
        errorText.textContent = msg;
        errorBox.style.display = 'flex';
        setTimeout(() => {
            errorBox.style.display = 'none';
        }, 6000);
    }

    // ===== CARREGAR SERVIÇOS =====
    async function carregarServicos() {
        try {
            const snap = await FirebaseApp.db.collection('servicos')
                .where('ativo', '==', true)
                .get();

            servicos = [];
            snap.forEach(doc => {
                servicos.push({ id: doc.id, ...doc.data() });
            });

            console.log('✅ Serviços carregados:', servicos.length);

            if (servicos.length === 0) {
                servicesContainer.innerHTML = `
                    <div class="agendamento-loading">Nenhum serviço disponível.</div>
                `;
                return;
            }

            let html = '';
            servicos.forEach(s => {
                html += `
                    <button type="button" class="agendamento-service" data-id="${s.id}" data-nome="${s.nome}" data-preco="${s.preco}">
                        <div class="agendamento-service__info">
                            <span class="agendamento-service__name">${s.nome}</span>
                            <span class="agendamento-service__price">${formatarKz(s.preco)}</span>
                        </div>
                        <span class="material-icons agendamento-service__check">check_circle</span>
                    </button>
                `;
            });

            servicesContainer.innerHTML = html;

            // Ligar eventos
            servicesContainer.querySelectorAll('.agendamento-service').forEach(btn => {
                btn.addEventListener('click', () => {
                    servicesContainer.querySelectorAll('.agendamento-service').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');

                    servicoSelecionado = {
                        id: btn.dataset.id,
                        nome: btn.dataset.nome,
                        preco: parseInt(btn.dataset.preco)
                    };

                    console.log('🎯 Serviço selecionado:', servicoSelecionado);
                    atualizarResumo();
                });
            });

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            servicesContainer.innerHTML = `<div class="agendamento-loading">Erro ao carregar. Recarregue a página.</div>`;
        }
    }

    // ===== CARREGAR BARBEIROS =====
    async function carregarBarbeiros() {
        try {
            const snap = await FirebaseApp.db.collection('funcionarios')
                .where('ativo', '==', true)
                .get();

            barbeiros = [];
            snap.forEach(doc => {
                barbeiros.push({ id: doc.id, ...doc.data() });
            });

            console.log('✅ Barbeiros carregados:', barbeiros.length);

            if (barbeiros.length === 0) {
                barbeirosContainer.innerHTML = `
                    <div class="agendamento-loading">Nenhum profissional disponível.</div>
                `;
                return;
            }

            let html = '';
            barbeiros.forEach(b => {
                const avatarHtml = b.fotoUrl 
                    ? `<img src="${b.fotoUrl}" alt="${b.nome}">`
                    : getIniciais(b.nome);

                html += `
                    <button type="button" class="agendamento-barbeiro" data-id="${b.id}" data-nome="${b.nome}">
                        <div class="agendamento-barbeiro__avatar">${avatarHtml}</div>
                        <span class="agendamento-barbeiro__name">${b.nome}</span>
                    </button>
                `;
            });

            barbeirosContainer.innerHTML = html;

            // Ligar eventos
            barbeirosContainer.querySelectorAll('.agendamento-barbeiro').forEach(btn => {
                btn.addEventListener('click', () => {
                    barbeirosContainer.querySelectorAll('.agendamento-barbeiro').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');

                    barbeiroSelecionado = {
                        id: btn.dataset.id,
                        nome: btn.dataset.nome
                    };

                    console.log('🎯 Barbeiro selecionado:', barbeiroSelecionado);

                    // Se já tem data, recalcular slots
                    if (dataInput.value) {
                        atualizarSlots();
                    }

                    atualizarResumo();
                });
            });

        } catch (error) {
            console.error('Erro ao carregar barbeiros:', error);
            barbeirosContainer.innerHTML = `<div class="agendamento-loading">Erro ao carregar. Recarregue a página.</div>`;
        }
    }

    // ===== CARREGAR AGENDAMENTOS EXISTENTES =====
    async function carregarAgendamentosExistentes() {
        try {
            const hoje = getHoje();
            const snap = await FirebaseApp.db.collection('agendamentos')
                .where('data', '>=', hoje)
                .get();

            agendamentosExistentes = [];
            snap.forEach(doc => {
                agendamentosExistentes.push({ id: doc.id, ...doc.data() });
            });

            console.log('✅ Agendamentos existentes:', agendamentosExistentes.length);

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }

    // ===== ATUALIZAR SLOTS DE HORA =====
    function atualizarSlots() {
        const data = dataInput.value;
        const barbeiroId = barbeiroSelecionado?.id;

        if (!data) {
            horaSelect.innerHTML = '<option value="">Escolha primeiro a data</option>';
            horaSelect.disabled = true;
            infoHora.style.display = 'none';
            return;
        }

        // Verificar se é domingo
        const d = new Date(data + 'T00:00:00');
        if (d.getDay() === 0) {
            horaSelect.innerHTML = '<option value="">Domingo - Fechado</option>';
            horaSelect.disabled = true;
            infoHora.style.display = 'block';
            infoHora.innerHTML = '<strong>⚠️ Domingo estamos fechados.</strong> Escolha outro dia.';
            return;
        }

        const slots = gerarSlotsDisponiveis(data);
        
        if (slots.length === 0) {
            horaSelect.innerHTML = '<option value="">Sem horários</option>';
            horaSelect.disabled = true;
            return;
        }

        // Filtrar slots ocupados
        const ocupados = barbeiroId ? filtrarSlotsOcupados(data, barbeiroId) : [];
        const disponiveis = slots.filter(s => !ocupados.includes(s));

        if (disponiveis.length === 0) {
            horaSelect.innerHTML = '<option value="">Tudo ocupado</option>';
            horaSelect.disabled = true;
            infoHora.style.display = 'block';
            infoHora.innerHTML = '<strong>⚠️ Todos os horários deste dia estão ocupados.</strong> Escolha outro dia ou outro profissional.';
            return;
        }

        let html = '<option value="">Escolha a hora</option>';
        disponiveis.forEach(s => {
            html += `<option value="${s}">${s}</option>`;
        });

        horaSelect.innerHTML = html;
        horaSelect.disabled = false;
        infoHora.style.display = 'none';

        console.log(`📅 ${disponiveis.length} slots disponíveis para ${data}`);
    }

    // ===== ATUALIZAR RESUMO =====
    function atualizarResumo() {
        if (!servicoSelecionado && !barbeiroSelecionado && !dataInput.value && !horaSelect.value) {
            resumo.style.display = 'none';
            return;
        }

        resumo.style.display = 'block';
        resumoServico.textContent = servicoSelecionado?.nome || '—';
        resumoBarbeiro.textContent = barbeiroSelecionado?.nome || '—';
        resumoData.textContent = dataInput.value ? new Date(dataInput.value + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
        resumoHora.textContent = horaSelect.value || '—';
        resumoTotal.textContent = servicoSelecionado ? formatarKz(servicoSelecionado.preco) : '—';
    }

    // ===== UPLOAD DE COMPROVATIVO =====
    async function converterComprovativo(file) {
        return new Promise((resolve, reject) => {
            if (file.size > 800 * 1024) {
                reject(new Error('Ficheiro muito grande. Máximo 800 KB.'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ===== SUBMETER FORMULÁRIO =====
    async function submeterAgendamento(event) {
        event.preventDefault();
        errorBox.style.display = 'none';
        successBox.style.display = 'none';

        // Validações
        if (!servicoSelecionado) {
            mostrarErro('Escolha um serviço.');
            return;
        }
        if (!barbeiroSelecionado) {
            mostrarErro('Escolha um profissional.');
            return;
        }
        if (!dataInput.value) {
            mostrarErro('Escolha uma data.');
            return;
        }
        if (!horaSelect.value) {
            mostrarErro('Escolha uma hora.');
            return;
        }
        
        const nome = nomeInput.value.trim();
        const telefone = telefoneInput.value.replace(/\D/g, '').trim();

        if (!nome || nome.length < 3) {
            mostrarErro('Digite o seu nome completo.');
            return;
        }

        const nomeRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
        if (!nomeRegex.test(nome)) {
            mostrarErro('O nome só pode conter letras e espaços.');
            return;
        }

        if (!/^9\d{8}$/.test(telefone)) {
            mostrarErro('Telefone deve ter 9 dígitos e começar com 9.');
            return;
        }

        const pagamento = document.querySelector('input[name="pagamento"]:checked');
        if (!pagamento) {
            mostrarErro('Escolha a forma de pagamento.');
            return;
        }

        if (pagamento.value === 'express' && !comprovativoBase64) {
            mostrarErro('Anexe o comprovativo do Multicai Express.');
            return;
        }

        // Bloquear botão
        submitBtn.disabled = true;
        submitText.textContent = 'A enviar...';

        try {
            // Verificar se o slot ainda está disponível (evitar race condition)
            const snap = await FirebaseApp.db.collection('agendamentos')
                .where('data', '==', dataInput.value)
                .where('horaInicio', '==', horaSelect.value)
                .where('barbeiroId', '==', barbeiroSelecionado.id)
                .where('status', '!=', 'cancelado')
                .get();

            if (!snap.empty) {
                throw new Error('Este horário acabou de ser reservado. Escolha outro.');
            }

            // Criar agendamento
            const horaInicio = horaSelect.value;
            const [h] = horaInicio.split(':');
            const horaFim = `${String(parseInt(h) + 1).padStart(2, '0')}:00`;

            const agendamento = {
                clienteNome: nome,
                clienteTelefone: telefone,
                servicoId: servicoSelecionado.id,
                servicoNome: servicoSelecionado.nome,
                servicoPreco: servicoSelecionado.preco,
                barbeiroId: barbeiroSelecionado.id,
                barbeiroNome: barbeiroSelecionado.nome,
                data: dataInput.value,
                horaInicio: horaInicio,
                horaFim: horaFim,
                formaPagamento: pagamento.value,
                comprovativoBase64: pagamento.value === 'express' ? comprovativoBase64 : null,
                status: 'pendente',
                pago: false,
                valorFinal: servicoSelecionado.preco,
                taxaAtraso: 0,
                criadoEm: FirebaseApp.firestore.FieldValue.serverTimestamp(),
                concluidoEm: null,
                concluidoPor: null
            };

            const docRef = await FirebaseApp.db.collection('agendamentos').add(agendamento);
            console.log('✅ Agendamento criado:', docRef.id);

            // Montar mensagem WhatsApp
            const dataFormatada = new Date(dataInput.value + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long', day: '2-digit', month: 'long'
            });

            let mensagem = `*🍔 Salão Kelson - Novo Agendamento*\n\n`;
            mensagem += `*Cliente:* ${nome}\n`;
            mensagem += `*Telefone:* ${telefone}\n\n`;
            mensagem += `*Serviço:* ${servicoSelecionado.nome}\n`;
            mensagem += `*Profissional:* ${barbeiroSelecionado.nome}\n`;
            mensagem += `*Data:* ${dataFormatada}\n`;
            mensagem += `*Hora:* ${horaInicio} - ${horaFim}\n\n`;
            mensagem += `*Total:* ${formatarKz(servicoSelecionado.preco)}\n`;
            mensagem += `*Pagamento:* ${pagamento.value === 'cash' ? '💵 Dinheiro' : '📱 Multicai Express'}\n\n`;
            mensagem += `_Aguardo confirmação. Obrigado!_`;

            const whatsappURL = `https://wa.me/244923063962?text=${encodeURIComponent(mensagem)}`;

            // Mostrar sucesso
            successBox.style.display = 'flex';
            successText.innerHTML = `
                Pedido <strong>#${docRef.id.substring(0, 6).toUpperCase()}</strong> registado!<br>
                Será redirecionado para o WhatsApp em 2 segundos...
            `;

            submitText.textContent = '✅ Agendado!';

            // Guardar URL para o botão
            whatsappBtn.onclick = () => window.open(whatsappURL, '_blank');
            whatsappBtn.style.display = 'flex';

            // Redirecionar automaticamente
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 2000);

            // Reset do formulário após 8 segundos
            setTimeout(() => {
                form.reset();
                servicoSelecionado = null;
                barbeiroSelecionado = null;
                comprovativoBase64 = null;
                servicesContainer.querySelectorAll('.agendamento-service').forEach(b => b.classList.remove('selected'));
                barbeirosContainer.querySelectorAll('.agendamento-barbeiro').forEach(b => b.classList.remove('selected'));
                horaSelect.innerHTML = '<option value="">Escolha primeiro a data</option>';
                horaSelect.disabled = true;
                comprovativoDiv.style.display = 'none';
                filePreview.innerHTML = '';
                resumo.style.display = 'none';
                successBox.style.display = 'none';
                submitBtn.disabled = false;
                submitText.textContent = 'Confirmar Agendamento';
                whatsappBtn.style.display = 'none';
            }, 8000);

        } catch (error) {
            console.error('❌ Erro:', error);
            mostrarErro(error.message || 'Erro ao agendar. Tente novamente.');
            submitBtn.disabled = false;
            submitText.textContent = 'Confirmar Agendamento';
        }
    }

    // ===== LIGAR EVENTOS =====
    function ligarEventos() {
        // Data
        if (dataInput) {
            // Impedir datas passadas
            dataInput.min = getHoje();
            dataInput.addEventListener('change', () => {
                atualizarSlots();
                atualizarResumo();
            });
        }

        // Hora
        if (horaSelect) {
            horaSelect.addEventListener('change', atualizarResumo);
        }

        // Telefone - formatar
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 9) v = v.substring(0, 9);
                e.target.value = v;
            });
        }

        // Pagamento
        document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'express') {
                    comprovativoDiv.style.display = 'block';
                } else {
                    comprovativoDiv.style.display = 'none';
                    comprovativoBase64 = null;
                    filePreview.innerHTML = '';
                }
            });
        });

        // Comprovativo
        if (comprovativoInput) {
            comprovativoInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    comprovativoBase64 = await converterComprovativo(file);
                    
                    if (file.type.startsWith('image/')) {
                        filePreview.innerHTML = `<img src="${comprovativoBase64}" alt="Comprovativo">`;
                    } else {
                        filePreview.innerHTML = `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                    }
                } catch (error) {
                    mostrarErro(error.message);
                    comprovativoInput.value = '';
                    comprovativoBase64 = null;
                    filePreview.innerHTML = '';
                }
            });
        }

        // Form submit
        if (form) {
            form.addEventListener('submit', submeterAgendamento);
        }
    }

    // ===== INICIALIZAÇÃO =====
    async function init() {
        console.log('🚀 Iniciando agendamento...');

        ligarEventos();

        await Promise.all([
            carregarServicos(),
            carregarBarbeiros(),
            carregarAgendamentosExistentes()
        ]);

        console.log('✅ Agendamento pronto!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();