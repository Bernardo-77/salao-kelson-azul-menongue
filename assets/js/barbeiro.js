/**
 * ============================================================
 * PAINEL DO BARBEIRO
 * Salão Kelson - Menongue
 * ============================================================
 */

(function() {
    'use strict';

    // ===== ESTADO =====
    let currentUser = null;
    let pedidos = [];
    let filtroAtual = 'pendentes';

    // ===== ELEMENTOS =====
    const barbeiroUserName = document.getElementById('barbeiroUserName');
    const btnLogout = document.getElementById('btnLogout');
    const pedidosContainer = document.getElementById('pedidosContainer');
    const statToday = document.getElementById('statToday');
    const statTodayMoney = document.getElementById('statTodayMoney');
    const statWeek = document.getElementById('statWeek');
    const statWeekMoney = document.getElementById('statWeekMoney');
    const statMonth = document.getElementById('statMonth');
    const statMonthMoney = document.getElementById('statMonthMoney');
    const badgePendentes = document.getElementById('badgePendentes');

    // ===== UTILITÁRIOS DE DATA =====
    function getTodayRange() {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function getWeekRange() {
        const now = new Date();
        const dow = now.getDay();
        const diff = dow === 0 ? 6 : dow - 1;
        const start = new Date(now);
        start.setDate(now.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function getMonthRange() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function formatarKz(valor) {
        return (valor || 0).toLocaleString('pt-AO') + ' Kz';
    }

    function formatarDataCompleta(dataStr) {
        if (!dataStr) return '—';
        const d = new Date(dataStr + 'T00:00:00');
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);

        if (d.getTime() === hoje.getTime()) return '📅 HOJE';
        if (d.getTime() === amanha.getTime()) return '📅 AMANHÃ';

        return d.toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: 'long'
        });
    }

    function telefoneParaWhatsapp(telefone) {
        return '244' + telefone.replace(/\D/g, '');
    }

    // ===== VERIFICAR AUTENTICAÇÃO =====
    async function verificarAuth() {
        return new Promise((resolve) => {
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) { resolved = true; resolve(false); }
            }, 5000);

            const unsubscribe = FirebaseApp.auth.onAuthStateChanged(async (user) => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);
                unsubscribe();

                if (!user) {
                    setTimeout(() => { window.location.href = 'login.html'; }, 100);
                    resolve(false);
                    return;
                }

                try {
                    const docSnap = await FirebaseApp.db.collection('funcionarios').doc(user.uid).get();
                    if (!docSnap.exists) {
                        setTimeout(() => { window.location.href = 'login.html'; }, 100);
                        resolve(false);
                        return;
                    }

                    const dados = docSnap.data();

                    // Admin também pode usar o painel barbeiro
                    currentUser = { uid: user.uid, ...dados };
                    barbeiroUserName.textContent = `Bem-vindo, ${dados.nome}`;
                    console.log('✅ Barbeiro autenticado:', dados.nome);
                    resolve(true);

                } catch (error) {
                    console.error('❌ Erro:', error);
                    setTimeout(() => { window.location.href = 'login.html'; }, 100);
                    resolve(false);
                }
            });
        });
    }

    // ===== LOGOUT =====
    async function fazerLogout() {
        try {
            await FirebaseApp.auth.signOut();
            sessionStorage.clear();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    }

    // ===== CARREGAR PEDIDOS =====
    async function carregarPedidos() {
        try {
            const snap = await FirebaseApp.db.collection('agendamentos')
                .where('barbeiroId', '==', currentUser.uid)
                .get();

            pedidos = [];
            snap.forEach(doc => {
                pedidos.push({ id: doc.id, ...doc.data() });
            });

            // Ordenar: pendentes com data mais próxima primeiro, depois os concluídos recentes
            pedidos.sort((a, b) => {
                const da = `${a.data} ${a.horaInicio}`;
                const db = `${b.data} ${b.horaInicio}`;
                return da.localeCompare(db);
            });

            console.log('📋 Pedidos carregados:', pedidos.length);

        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    // ===== CALCULAR ESTATÍSTICAS =====
    function calcularEstatisticas() {
        const hoje = getTodayRange();
        const semana = getWeekRange();
        const mes = getMonthRange();

        function contarPorRange(range) {
            let count = 0, money = 0;
            pedidos.forEach(p => {
                if (p.status !== 'concluido' || !p.concluidoEm) return;
                const data = p.concluidoEm.toDate ? p.concluidoEm.toDate() : new Date(p.concluidoEm);
                if (data >= range.start && data <= range.end) {
                    count++;
                    money += (p.valorFinal || 0);
                }
            });
            return { count, money };
        }

        const sHoje = contarPorRange(hoje);
        const sSemana = contarPorRange(semana);
        const sMes = contarPorRange(mes);

        statToday.textContent = sHoje.count;
        statTodayMoney.textContent = formatarKz(sHoje.money);

        statWeek.textContent = sSemana.count;
        statWeekMoney.textContent = formatarKz(sSemana.money);

        statMonth.textContent = sMes.count;
        statMonthMoney.textContent = formatarKz(sMes.money);

        // Badge de pendentes
        const pendentes = pedidos.filter(p => p.status === 'pendente').length;
        badgePendentes.textContent = pendentes;
    }

    // ===== FILTRAR PEDIDOS =====
    function filtrarPedidos() {
        const hoje = new Date().toISOString().split('T')[0];
        const semana = getWeekRange();
        const mes = getMonthRange();

        let filtrados = [];

        switch (filtroAtual) {
            case 'pendentes':
                filtrados = pedidos.filter(p => p.status === 'pendente');
                break;
            case 'hoje':
                filtrados = pedidos.filter(p => p.data === hoje);
                break;
            case 'semana':
                filtrados = pedidos.filter(p => {
                    if (!p.data) return false;
                    const d = new Date(p.data + 'T00:00:00');
                    return d >= semana.start && d <= semana.end;
                });
                break;
            case 'todas':
                filtrados = [...pedidos];
                break;
        }

        return filtrados;
    }

    // ===== RENDERIZAR =====
    function renderizar() {
        const filtrados = filtrarPedidos();

        if (filtrados.length === 0) {
            pedidosContainer.innerHTML = `
                <div class="barbeiro-empty">
                    <span class="material-icons">event_available</span>
                    <h3>Sem pedidos</h3>
                    <p>Não há pedidos ${filtroAtual === 'pendentes' ? 'pendentes' : 'neste período'}.</p>
                </div>
            `;
            return;
        }

        let html = '';
        filtrados.forEach(p => {
            const isHoje = p.data === new Date().toISOString().split('T')[0];
            const isPendente = p.status === 'pendente';
            const isConcluido = p.status === 'concluido';

            const statusClass = `status-${p.status}`;
            const statusLabel = {
                'pendente': '⏳ Pendente',
                'concluido': '✅ Concluído',
                'cancelado': '❌ Cancelado',
                'no_show': '⚠️ Não compareceu'
            }[p.status] || p.status;

            const pedidoClass = `barbeiro-pedido barbeiro-pedido--${p.status} ${isHoje ? 'barbeiro-pedido--hoje' : ''}`;

            const whatsappUrl = `https://wa.me/${telefoneParaWhatsapp(p.clienteTelefone)}?text=${encodeURIComponent(`Olá ${p.clienteNome}, confirmo o seu agendamento para ${p.data} às ${p.horaInicio}. Até logo!`)}`;

            html += `
                <div class="${pedidoClass}">
                    <div class="barbeiro-pedido__header">
                        <div class="barbeiro-pedido__hora">
                            <span class="barbeiro-pedido__hora-strong">${p.horaInicio}</span>
                            <span class="barbeiro-pedido__data">${formatarDataCompleta(p.data)}</span>
                        </div>
                        <span class="barbeiro-pedido__status ${statusClass}">${statusLabel}</span>
                    </div>

                    <div class="barbeiro-pedido__cliente">
                        <h4>${p.clienteNome}</h4>
                        <a href="${whatsappUrl}" target="_blank" rel="noopener">
                            <span class="material-icons">whatsapp</span>
                            ${p.clienteTelefone}
                        </a>
                    </div>

                    <div class="barbeiro-pedido__detalhes">
                        <div class="barbeiro-pedido__linha">
                            <span>✂️ Serviço:</span>
                            <strong>${p.servicoNome}</strong>
                        </div>
                        <div class="barbeiro-pedido__linha">
                            <span>💳 Pagamento:</span>
                            <strong>${p.formaPagamento === 'cash' ? '💵 Dinheiro' : '📱 Multicai'}</strong>
                        </div>
                        <div class="barbeiro-pedido__linha">
                            <span>💰 Valor:</span>
                            <strong class="barbeiro-pedido__valor">${formatarKz(p.valorFinal)}</strong>
                        </div>
                    </div>

                    ${isPendente ? `
                        <div class="barbeiro-pedido__actions">
                            <button class="barbeiro-btn barbeiro-btn--success" data-action="concluir" data-id="${p.id}">
                                <span class="material-icons">check_circle</span>
                                Cliente Chegou — Receber
                            </button>
                            <button class="barbeiro-btn barbeiro-btn--danger" data-action="no_show" data-id="${p.id}">
                                <span class="material-icons">cancel</span>
                                Não Compareceu
                            </button>
                        </div>
                    ` : isConcluido ? `
                        <div class="barbeiro-pedido__actions">
                            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="barbeiro-btn barbeiro-btn--whatsapp">
                                <span class="material-icons">whatsapp</span>
                                Contactar Cliente
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        pedidosContainer.innerHTML = html;

        // Ligar botões de ação
        pedidosContainer.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                if (action === 'concluir') concluirPedido(id);
                if (action === 'no_show') marcarNoShow(id);
            });
        });
    }

    // ===== CONCLUIR PEDIDO =====
    async function concluirPedido(id) {
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido) return;

        const confirmar = confirm(
            `Confirmar receção de ${formatarKz(pedido.valorFinal)} de ${pedido.clienteNome}?`
        );
        if (!confirmar) return;

        try {
            // Calcular taxa de atraso se aplicável
            let valorFinal = pedido.valorFinal;
            let taxaAtraso = 0;

            // Verificar se está dentro do horário (com 15 min de tolerância)
            const agora = new Date();
            const [h, m] = pedido.horaInicio.split(':').map(Number);
            const horaAgendada = new Date(pedido.data + 'T00:00:00');
            horaAgendada.setHours(h, m, 0, 0);
            const diffMin = (agora - horaAgendada) / 1000 / 60;

            // Se cliente chegou mais de 30 min depois, aplicar 10%
            if (diffMin > 30) {
                const resposta = confirm(
                    `⚠️ Cliente chegou ${Math.round(diffMin)} minutos atrasado.\n\nAplicar taxa de atraso de 10% (${formatarKz(Math.round(pedido.valorFinal * 0.1))})?\n\nOK = Aplicar taxa\nCancelar = Sem taxa`
                );
                if (resposta) {
                    taxaAtraso = Math.round(pedido.valorFinal * 0.1);
                    valorFinal = pedido.valorFinal + taxaAtraso;
                }
            }

            await FirebaseApp.db.collection('agendamentos').doc(id).update({
                status: 'concluido',
                pago: true,
                valorFinal: valorFinal,
                taxaAtraso: taxaAtraso,
                concluidoEm: FirebaseApp.firestore.FieldValue.serverTimestamp(),
                concluidoPor: currentUser.uid
            });

            console.log('✅ Pedido concluído:', id);
            alert(`✅ Pedido concluído com sucesso!\n\nValor recebido: ${formatarKz(valorFinal)}`);

            // Recarregar
            await carregarPedidos();
            calcularEstatisticas();
            renderizar();

        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao concluir pedido. Tente novamente.');
        }
    }

    // ===== MARCAR NO-SHOW =====
    async function marcarNoShow(id) {
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido) return;

        const confirmar = confirm(
            `Marcar ${pedido.clienteNome} como NÃO COMPARECEU?\n\nEsta ação não pode ser desfeita.`
        );
        if (!confirmar) return;

        try {
            await FirebaseApp.db.collection('agendamentos').doc(id).update({
                status: 'no_show',
                concluidoEm: FirebaseApp.firestore.FieldValue.serverTimestamp(),
                concluidoPor: currentUser.uid
            });

            console.log('⚠️ Pedido marcado como no-show:', id);
            alert('Pedido marcado como não compareceu.');

            await carregarPedidos();
            calcularEstatisticas();
            renderizar();

        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao atualizar. Tente novamente.');
        }
    }

    // ===== FILTROS =====
    function configurarFiltros() {
        document.querySelectorAll('.barbeiro-filtro').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.barbeiro-filtro').forEach(b => b.classList.remove('barbeiro-filtro--active'));
                btn.classList.add('barbeiro-filtro--active');
                filtroAtual = btn.dataset.filtro;
                console.log('🔄 Filtro:', filtroAtual);
                renderizar();
            });
        });
    }

    // ===== INIT =====
    async function init() {
        console.log('🚀 Iniciando painel barbeiro...');

        const autenticado = await verificarAuth();
        if (!autenticado) return;

        configurarFiltros();

        if (btnLogout) {
            btnLogout.addEventListener('click', fazerLogout);
        }

        await carregarPedidos();
        calcularEstatisticas();
        renderizar();

        console.log('✅ Painel barbeiro pronto!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();