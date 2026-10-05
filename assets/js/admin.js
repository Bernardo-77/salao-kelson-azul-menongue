/**
 * ============================================================
 * ADMIN DASHBOARD
 * Salão Kelson - Menongue
 * ============================================================
 */

(function() {
    'use strict';

    // ===== ESTADO GLOBAL =====
    let currentUser = null;
    let funcionarios = [];
    let agendamentos = [];
    let editandoFuncionarioId = null; // 🔥 Se null = adicionar, se ID = editar

    // ===== ELEMENTOS DO DOM =====
    const adminUserName = document.getElementById('adminUserName');
    const btnLogout = document.getElementById('btnLogout');
    const statToday = document.getElementById('statToday');
    const statTodayMoney = document.getElementById('statTodayMoney');
    const statWeek = document.getElementById('statWeek');
    const statWeekMoney = document.getElementById('statWeekMoney');
    const statMonth = document.getElementById('statMonth');
    const statMonthMoney = document.getElementById('statMonthMoney');
    const statYear = document.getElementById('statYear');
    const statYearMoney = document.getElementById('statYearMoney');

    // Modal
    const funcionarioModal = document.getElementById('funcionarioModal');
    const funcionarioModalTitle = document.getElementById('funcionarioModalTitle');
    const funcionarioModalSubtitle = document.getElementById('funcionarioModalSubtitle');
    const btnFecharModalFuncionario = document.getElementById('btnFecharModalFuncionario');
    const btnCancelarFuncionario = document.getElementById('btnCancelarFuncionario');
    const formFuncionario = document.getElementById('formFuncionario');
    const funcNome = document.getElementById('funcNome');
    const funcTelefone = document.getElementById('funcTelefone');
    const funcSenha = document.getElementById('funcSenha');
    const funcSenhaField = document.getElementById('funcSenhaField');
    const funcRole = document.getElementById('funcRole');
    const funcFoto = document.getElementById('funcFoto');
    const funcInfoCriacao = document.getElementById('funcInfoCriacao');
    const funcInfoTexto = document.getElementById('funcInfoTexto');
    const funcError = document.getElementById('funcError');
    const funcErrorText = document.getElementById('funcErrorText');
    const btnGuardarFuncionario = document.getElementById('btnGuardarFuncionario');

    // ===== CONSTANTES =====
    const EMAIL_DOMAIN = '@salaokellson.local';

    // ===== UTILITÁRIOS DE DATA =====
    function getTodayRange() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function getWeekRange() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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

    function getYearRange() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
    }

    function formatarKz(valor) {
        return (valor || 0).toLocaleString('pt-AO') + ' Kz';
    }

    function formatarData(timestamp) {
        if (!timestamp) return '—';
        const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function validarTelefone(t) {
        return /^9\d{8}$/.test(t);
    }

    function validarNome(n) {
        return /^[a-zA-ZÀ-ÿ\s\-']+$/.test(n) && n.trim().length >= 3;
    }

    function telefoneParaEmail(telefone) {
        return telefone + EMAIL_DOMAIN;
    }

    // ===== VERIFICAR AUTENTICAÇÃO =====
    async function verificarAuth() {
        return new Promise((resolve) => {
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
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
                    if (dados.role !== 'admin') {
                        setTimeout(() => { window.location.href = 'barbeiro.html'; }, 100);
                        resolve(false);
                        return;
                    }

                    currentUser = { uid: user.uid, ...dados };
                    adminUserName.textContent = `Bem-vindo, ${dados.nome}`;
                    console.log('✅ Admin autenticado:', dados.nome);
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

    // ===== CARREGAR FUNCIONÁRIOS =====
    async function carregarFuncionarios() {
        try {
            const snap = await FirebaseApp.db.collection('funcionarios').get();
            funcionarios = [];
            snap.forEach(doc => {
                funcionarios.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar: admin primeiro, depois por nome
            funcionarios.sort((a, b) => {
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;
                return (a.nome || '').localeCompare(b.nome || '');
            });
            console.log('👥 Funcionários:', funcionarios.length);
            return funcionarios;
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    // ===== CARREGAR AGENDAMENTOS =====
    async function carregarAgendamentos() {
        try {
            const snap = await FirebaseApp.db.collection('agendamentos').limit(500).get();
            agendamentos = [];
            snap.forEach(doc => {
                agendamentos.push({ id: doc.id, ...doc.data() });
            });
            console.log('📋 Agendamentos:', agendamentos.length);
            return agendamentos;
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    // ===== CALCULAR ESTATÍSTICAS =====
    function calcularEstatisticas() {
        const hoje = getTodayRange();
        const semana = getWeekRange();
        const mes = getMonthRange();
        const ano = getYearRange();

        function contarPorRange(range) {
            let count = 0, money = 0;
            agendamentos.forEach(a => {
                if (!a.concluidoEm) return;
                const data = a.concluidoEm.toDate ? a.concluidoEm.toDate() : new Date(a.concluidoEm);
                if (data >= range.start && data <= range.end && a.status === 'concluido') {
                    count++;
                    money += (a.valorFinal || 0);
                }
            });
            return { count, money };
        }

        const sHoje = contarPorRange(hoje);
        const sSemana = contarPorRange(semana);
        const sMes = contarPorRange(mes);
        const sAno = contarPorRange(ano);

        statToday.textContent = sHoje.count;
        statTodayMoney.textContent = formatarKz(sHoje.money);
        statWeek.textContent = sSemana.count;
        statWeekMoney.textContent = formatarKz(sSemana.money);
        statMonth.textContent = sMes.count;
        statMonthMoney.textContent = formatarKz(sMes.money);
        statYear.textContent = sAno.count;
        statYearMoney.textContent = formatarKz(sAno.money);
    }

    // ===== ABRIR COMPROVATIVO =====
    function abrirComprovativo(pedido) {
        const overlay = document.createElement('div');
        overlay.className = 'comprovativo-overlay';
        overlay.innerHTML = `
            <div class="comprovativo-modal">
                <div class="comprovativo-modal__header">
                    <div>
                        <h3>📱 Comprovativo Multicai Express</h3>
                        <p>${pedido.clienteNome} • ${formatarKz(pedido.valorFinal)}</p>
                    </div>
                    <button class="comprovativo-modal__close" aria-label="Fechar">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="comprovativo-modal__body">
                    <img src="${pedido.comprovativoBase64}" alt="Comprovativo">
                </div>
                <div class="comprovativo-modal__footer">
                    <a href="${pedido.comprovativoBase64}" download="comprovativo-${pedido.id}.png" class="admin-btn admin-btn--primary">
                        <span class="material-icons">download</span>
                        Descarregar
                    </a>
                    <button class="admin-btn admin-btn--ghost comprovativo-modal__close-btn">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const fechar = () => {
            overlay.remove();
            document.body.style.overflow = '';
        };

        overlay.querySelector('.comprovativo-modal__close').addEventListener('click', fechar);
        overlay.querySelector('.comprovativo-modal__close-btn').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });
        const escHandler = (e) => { if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    }

    // ===== RENDERIZAR TAB PEDIDOS =====
    function renderizarPedidos() {
        const container = document.getElementById('tab-pedidos');
        if (!container) return;

        if (agendamentos.length === 0) {
            container.innerHTML = `
                <div class="admin-empty">
                    <span class="material-icons">inbox</span>
                    <h3>Nenhum pedido ainda</h3>
                    <p>Quando os clientes agendarem, aparecerão aqui.</p>
                </div>
            `;
            return;
        }

        const ordenados = [...agendamentos].sort((a, b) => {
            const da = a.criadoEm?.toDate?.() || new Date(0);
            const db = b.criadoEm?.toDate?.() || new Date(0);
            return db - da;
        });

        let html = `
            <div class="admin-pedidos">
                <div class="admin-pedidos__header">
                    <h3>📋 Todos os Pedidos (${ordenados.length})</h3>
                </div>
                <div class="admin-pedidos__list">
        `;

        ordenados.forEach(a => {
            const statusColor = {
                'pendente': '#dd6b20',
                'concluido': '#38a169',
                'cancelado': '#e53e3e',
                'no_show': '#718096'
            }[a.status] || '#718096';

            const statusLabel = {
                'pendente': '⏳ Pendente',
                'concluido': '✅ Concluído',
                'cancelado': '❌ Cancelado',
                'no_show': '⚠️ Não compareceu'
            }[a.status] || a.status;

            const isProprioAdmin = a.barbeiroId === currentUser.uid;
            const isPendente = a.status === 'pendente';
            const isConcluido = a.status === 'concluido';
            const isExpress = a.formaPagamento === 'express';
            const temComprovativo = isExpress && a.comprovativoBase64;

            let comprovativoHTML = '';
            if (isExpress) {
                if (temComprovativo) {
                    comprovativoHTML = `
                        <div class="pedido-card__comprovativo">
                            <button class="admin-btn admin-btn--comprovativo" data-comprovativo="${a.id}">
                                <span class="material-icons">receipt_long</span>
                                Ver Comprovativo Multicai
                            </button>
                        </div>
                    `;
                } else {
                    comprovativoHTML = `
                        <div class="pedido-card__comprovativo pedido-card__comprovativo--missing">
                            <span class="material-icons">warning</span>
                            ⚠️ Comprovativo não anexado
                        </div>
                    `;
                }
            }

            html += `
                <div class="pedido-card" style="border-left: 4px solid ${statusColor};">
                    <div class="pedido-card__header">
                        <div>
                            <h4>${a.clienteNome || 'Cliente'}</h4>
                            <p class="pedido-card__phone">📞 ${a.clienteTelefone || '—'}</p>
                        </div>
                        <span class="pedido-card__status" style="background: ${statusColor}; color: white;">
                            ${statusLabel}
                        </span>
                    </div>
                    <div class="pedido-card__body">
                        <div class="pedido-card__row">
                            <span>✂️ <strong>${a.servicoNome || '—'}</strong></span>
                            <span>💰 ${formatarKz(a.valorFinal || a.servicoPreco || 0)}</span>
                        </div>
                        <div class="pedido-card__row">
                            <span>📅 ${a.data || '—'} às ${a.horaInicio || '—'}</span>
                            <span>🏍️ ${a.barbeiroNome || '—'}</span>
                        </div>
                        <div class="pedido-card__row pedido-card__row--small">
                            <span>💳 ${isExpress ? '📱 Multicai Express' : '💵 Dinheiro'}</span>
                            <span>Criado: ${formatarData(a.criadoEm)}</span>
                        </div>
                    </div>
                    ${comprovativoHTML}
                    ${isProprioAdmin && isPendente ? `
                        <div class="pedido-card__actions">
                            <button class="admin-btn admin-btn--success" data-action="concluir" data-id="${a.id}">
                                <span class="material-icons">check_circle</span>
                                Cliente Chegou — Receber
                            </button>
                            <button class="admin-btn admin-btn--danger" data-action="no_show" data-id="${a.id}">
                                <span class="material-icons">cancel</span>
                                Não Compareceu
                            </button>
                        </div>
                    ` : isProprioAdmin && isConcluido ? `
                        <div class="pedido-card__actions">
                            <button class="admin-btn admin-btn--ghost" disabled>
                                <span class="material-icons">check_circle</span>
                                Concluído por ${a.concluidoPor === currentUser.uid ? 'si' : 'outro'}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;

        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                if (action === 'concluir') concluirPedidoAdmin(id);
                if (action === 'no_show') marcarNoShowAdmin(id);
            });
        });

        container.querySelectorAll('[data-comprovativo]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.comprovativo;
                const pedido = agendamentos.find(p => p.id === id);
                if (pedido && pedido.comprovativoBase64) abrirComprovativo(pedido);
                else alert('Comprovativo não disponível.');
            });
        });
    }

    // ===== CONCLUIR PEDIDO (Admin) =====
    async function concluirPedidoAdmin(id) {
        const pedido = agendamentos.find(p => p.id === id);
        if (!pedido) return;

        const confirmar = confirm(`Confirmar receção de ${formatarKz(pedido.valorFinal)} de ${pedido.clienteNome}?`);
        if (!confirmar) return;

        try {
            let valorFinal = pedido.valorFinal;
            let taxaAtraso = 0;

            const agora = new Date();
            const [h, m] = pedido.horaInicio.split(':').map(Number);
            const horaAgendada = new Date(pedido.data + 'T00:00:00');
            horaAgendada.setHours(h, m, 0, 0);
            const diffMin = (agora - horaAgendada) / 1000 / 60;

            if (diffMin > 30) {
                const resposta = confirm(`⚠️ Cliente chegou ${Math.round(diffMin)} minutos atrasado.\n\nAplicar taxa de atraso de 10% (${formatarKz(Math.round(pedido.valorFinal * 0.1))})?`);
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

            alert(`✅ Pedido concluído!\n\nValor recebido: ${formatarKz(valorFinal)}`);

            await carregarAgendamentos();
            calcularEstatisticas();
            renderizarPedidos();
            renderizarFinancas();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao concluir.');
        }
    }

    // ===== MARCAR NO-SHOW (Admin) =====
    async function marcarNoShowAdmin(id) {
        const pedido = agendamentos.find(p => p.id === id);
        if (!pedido) return;

        const confirmar = confirm(`Marcar ${pedido.clienteNome} como NÃO COMPARECEU?`);
        if (!confirmar) return;

        try {
            await FirebaseApp.db.collection('agendamentos').doc(id).update({
                status: 'no_show',
                concluidoEm: FirebaseApp.firestore.FieldValue.serverTimestamp(),
                concluidoPor: currentUser.uid
            });

            alert('Pedido marcado como não compareceu.');

            await carregarAgendamentos();
            calcularEstatisticas();
            renderizarPedidos();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro.');
        }
    }

    // ===== RENDERIZAR TAB FUNCIONÁRIOS =====
    function renderizarFuncionarios() {
        const container = document.getElementById('tab-funcionarios');
        if (!container) return;

        let html = `
            <div class="admin-funcionarios">
                <div class="admin-funcionarios__header">
                    <h3>👥 Funcionários (${funcionarios.length})</h3>
                    <button class="admin-btn admin-btn--primary" id="btnNovoFuncionario">
                        <span class="material-icons">person_add</span>
                        Adicionar
                    </button>
                </div>
                <div class="admin-funcionarios__list">
        `;

        funcionarios.forEach(f => {
            const inicial = (f.nome || '?').charAt(0).toUpperCase();
            const roleLabel = f.role === 'admin' ? '👑 Admin' : '💼 Barbeiro';
            const isAtivo = f.ativo !== false;
            const isProprio = f.id === currentUser.uid;

            html += `
                <div class="funcionario-card ${isAtivo ? '' : 'funcionario-card--inativo'}">
                    <div class="funcionario-card__avatar">
                        ${f.fotoUrl ? `<img src="${f.fotoUrl}" alt="${f.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : inicial}
                    </div>
                    <div class="funcionario-card__info">
                        <h4>${f.nome || '—'} ${isProprio ? '(você)' : ''}</h4>
                        <p>📞 ${f.telefone || '—'}</p>
                        <p class="funcionario-card__role">
                            ${roleLabel}
                            ${!isAtivo ? '<span class="funcionario-card__badge-inativo">Inativo</span>' : ''}
                        </p>
                    </div>
                    <div class="funcionario-card__actions">
                        <button class="admin-btn" data-action="editar" data-id="${f.id}" title="Editar">
                            <span class="material-icons">edit</span>
                        </button>
                        ${!isProprio ? `
                            <button class="admin-btn" data-action="toggle-ativo" data-id="${f.id}" title="${isAtivo ? 'Desativar' : 'Reativar'}">
                                <span class="material-icons">${isAtivo ? 'block' : 'check_circle'}</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;

        // Botão adicionar
        const btnNovo = document.getElementById('btnNovoFuncionario');
        if (btnNovo) btnNovo.addEventListener('click', abrirModalAdicionar);

        // Botões editar / toggle
        container.querySelectorAll('[data-action="editar"]').forEach(btn => {
            btn.addEventListener('click', () => abrirModalEditar(btn.dataset.id));
        });

        container.querySelectorAll('[data-action="toggle-ativo"]').forEach(btn => {
            btn.addEventListener('click', () => toggleAtivo(btn.dataset.id));
        });
    }

    // ===== MODAL: ABRIR PARA ADICIONAR =====
    function abrirModalAdicionar() {
        editandoFuncionarioId = null;
        funcionarioModalTitle.textContent = 'Novo Funcionário';
        funcionarioModalSubtitle.textContent = 'Preencha os dados do novo funcionário';
        formFuncionario.reset();
        funcRole.value = 'barbeiro';
        funcSenhaField.style.display = 'flex'; // mostra senha
        funcSenha.value = gerarSenhaAleatoria();
        funcInfoCriacao.style.display = 'flex';
        funcInfoTexto.innerHTML = `
            <strong>⚠️ Importante - Criação de conta:</strong>
            <p>1. Copia a <b>senha gerada</b> acima.</p>
            <p>2. Vai ao <a href="https://console.firebase.google.com/project/salao-kellson-menongue/authentication/users" target="_blank">Firebase Console → Authentication</a></p>
            <p>3. Clica <b>"Adicionar utilizador"</b></p>
            <p>4. Email: <code id="funcEmailPreview">—</code></p>
            <p>5. Cola a senha e clica Guardar.</p>
            <p>6. Copia o <b>UID</b> e cola no campo abaixo.</p>
            <p>7. Volta aqui, cola o UID e clica Guardar.</p>
        `;
        // Mostrar campo UID
        mostrarCampoUID(true);
        funcError.style.display = 'none';
        funcionarioModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => funcNome.focus(), 100);
    }

    // ===== MODAL: ABRIR PARA EDITAR =====
    function abrirModalEditar(id) {
        const f = funcionarios.find(x => x.id === id);
        if (!f) return;

        editandoFuncionarioId = id;
        funcionarioModalTitle.textContent = 'Editar Funcionário';
        funcionarioModalSubtitle.textContent = `Editando: ${f.nome}`;
        funcNome.value = f.nome || '';
        funcTelefone.value = f.telefone || '';
        funcRole.value = f.role || 'barbeiro';
        funcFoto.value = f.fotoUrl || '';
        funcSenhaField.style.display = 'none'; // esconde senha (não alteramos)
        funcInfoCriacao.style.display = 'none';
        mostrarCampoUID(false);
        funcError.style.display = 'none';
        funcionarioModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // ===== CAMPO UID (para adicionar) =====
    function mostrarCampoUID(mostrar) {
        let uidField = document.getElementById('funcUIDField');
        if (mostrar && !uidField) {
            uidField = document.createElement('div');
            uidField.id = 'funcUIDField';
            uidField.className = 'funcionario-modal__field';
            uidField.innerHTML = `
                <label for="funcUID">
                    <span class="material-icons">fingerprint</span>
                    UID do Firebase (copiar do Console)
                </label>
                <input type="text" id="funcUID" placeholder="Ex: aBc123XyZ..." required>
                <span class="funcionario-modal__hint">Authentication → Users → clicar no utilizador → copiar User UID</span>
            `;
            funcInfoCriacao.parentNode.insertBefore(uidField, funcInfoCriacao.nextSibling);
        } else if (!mostrar && uidField) {
            uidField.remove();
        }
    }

    // ===== GERAR SENHA ALEATÓRIA =====
    function gerarSenhaAleatoria() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let senha = 'K'; // sempre começa com K
        for (let i = 0; i < 9; i++) {
            senha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return senha + '!';
    }

    // ===== FECHAR MODAL =====
    function fecharModalFuncionario() {
        funcionarioModal.style.display = 'none';
        document.body.style.overflow = '';
        funcError.style.display = 'none';
        editandoFuncionarioId = null;
    }

    // ===== MOSTRAR ERRO NO MODAL =====
    function mostrarErroModal(msg) {
        funcErrorText.textContent = msg;
        funcError.style.display = 'flex';
    }

    // ===== GUARDAR FUNCIONÁRIO (Adicionar ou Editar) =====
    async function guardarFuncionario(e) {
        e.preventDefault();
        funcError.style.display = 'none';

        const nome = funcNome.value.trim();
        const telefone = funcTelefone.value.replace(/\D/g, '').trim();
        const role = funcRole.value;
        const fotoUrl = funcFoto.value.trim();

        // Validações
        if (!validarNome(nome)) {
            mostrarErroModal('Nome deve ter pelo menos 3 letras (sem números).');
            return;
        }
        if (!validarTelefone(telefone)) {
            mostrarErroModal('Telefone deve ter 9 dígitos e começar com 9.');
            return;
        }

        btnGuardarFuncionario.disabled = true;
        btnGuardarFuncionario.innerHTML = '<span class="material-icons">hourglass_empty</span> A guardar...';

        try {
            if (editandoFuncionarioId) {
                // ===== EDITAR =====
                await FirebaseApp.db.collection('funcionarios').doc(editandoFuncionarioId).update({
                    nome,
                    telefone,
                    role,
                    fotoUrl: fotoUrl || '',
                    atualizadoEm: FirebaseApp.firestore.FieldValue.serverTimestamp()
                });

                console.log('✅ Funcionário editado:', editandoFuncionarioId);
                alert('✅ Funcionário atualizado com sucesso!');

            } else {
                // ===== ADICIONAR =====
                const uid = document.getElementById('funcUID')?.value.trim();
                const senha = funcSenha.value.trim();

                if (!uid || uid.length < 20) {
                    mostrarErroModal('Cole o UID do Firebase Console (obrigatório).');
                    btnGuardarFuncionario.disabled = false;
                    btnGuardarFuncionario.innerHTML = '<span class="material-icons">save</span> Guardar Funcionário';
                    return;
                }

                // Verificar se UID já existe
                const checkDoc = await FirebaseApp.db.collection('funcionarios').doc(uid).get();
                if (checkDoc.exists) {
                    mostrarErroModal('Este UID já existe na base de dados.');
                    btnGuardarFuncionario.disabled = false;
                    btnGuardarFuncionario.innerHTML = '<span class="material-icons">save</span> Guardar Funcionário';
                    return;
                }

                const email = telefoneParaEmail(telefone);

                await FirebaseApp.db.collection('funcionarios').doc(uid).set({
                    nome,
                    telefone,
                    email,
                    role,
                    fotoUrl: fotoUrl || '',
                    ativo: true,
                    criadoEm: FirebaseApp.firestore.FieldValue.serverTimestamp()
                });

                console.log('✅ Funcionário adicionado:', uid);

                // Copiar email e senha para área de transferência
                try {
                    await navigator.clipboard.writeText(`Email: ${email}\nSenha: ${senha}`);
                } catch (e) { /* ignore */ }

                alert(`✅ Funcionário adicionado!\n\n📧 Email: ${email}\n🔑 Senha: ${senha}\n\nGuarda estes dados para dar ao funcionário.`);
            }

            await carregarFuncionarios();
            renderizarFuncionarios();
            fecharModalFuncionario();

        } catch (error) {
            console.error('❌ Erro:', error);
            mostrarErroModal(error.message || 'Erro ao guardar.');
        } finally {
            btnGuardarFuncionario.disabled = false;
            btnGuardarFuncionario.innerHTML = '<span class="material-icons">save</span> Guardar Funcionário';
        }
    }

    // ===== TOGGLE ATIVO/INATIVO =====
    async function toggleAtivo(id) {
        const f = funcionarios.find(x => x.id === id);
        if (!f) return;

        const isAtivo = f.ativo !== false;
        const acao = isAtivo ? 'desativar' : 'reativar';
        const confirmar = confirm(`${acao.toUpperCase()} o funcionário "${f.nome}"?`);
        if (!confirmar) return;

        try {
            await FirebaseApp.db.collection('funcionarios').doc(id).update({
                ativo: !isAtivo
            });

            console.log(`✅ Funcionário ${acao}do:`, id);
            alert(`Funcionário ${acao}do com sucesso!`);

            await carregarFuncionarios();
            renderizarFuncionarios();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro ao atualizar.');
        }
    }

    // ===== RENDERIZAR TAB FINANÇAS =====
    function renderizarFinancas() {
        const container = document.getElementById('tab-financas');
        if (!container) return;

        const concluidos = agendamentos.filter(a => a.status === 'concluido');
        const totalReceita = concluidos.reduce((sum, a) => sum + (a.valorFinal || 0), 0);

        container.innerHTML = `
            <div class="admin-financas">
                <div class="financas-card">
                    <span class="material-icons">payments</span>
                    <h3>Receita Total</h3>
                    <p class="financas-card__value">${formatarKz(totalReceita)}</p>
                    <p class="financas-card__sub">${concluidos.length} pedidos concluídos</p>
                </div>
            </div>
        `;
    }

    // ===== TABS =====
    function configurarTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        const contents = document.querySelectorAll('.admin-tab__content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('admin-tab--active'));
                contents.forEach(c => c.classList.remove('admin-tab__content--active'));
                tab.classList.add('admin-tab--active');
                const content = document.getElementById(`tab-${target}`);
                if (content) content.classList.add('admin-tab__content--active');
            });
        });
    }

    // ===== GERAR PDF =====
    function gerarPDF(tipo) {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert('Biblioteca PDF não carregada.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const agora = new Date();

            let pedidosFiltrados = [];
            let titulo = '';

            const hoje = getTodayRange();
            const semana = getWeekRange();
            const mes = getMonthRange();
            const ano = getYearRange();
            const concluidos = agendamentos.filter(a => a.status === 'concluido');

            function dentroDoRange(data, range) {
                if (!data) return false;
                const d = data.toDate ? data.toDate() : new Date(data);
                return d >= range.start && d <= range.end;
            }

            switch (tipo) {
                case 'today': titulo = 'Relatório de Hoje'; pedidosFiltrados = concluidos.filter(a => dentroDoRange(a.concluidoEm, hoje)); break;
                case 'week': titulo = 'Relatório Semanal'; pedidosFiltrados = concluidos.filter(a => dentroDoRange(a.concluidoEm, semana)); break;
                case 'month': titulo = 'Relatório Mensal'; pedidosFiltrados = concluidos.filter(a => dentroDoRange(a.concluidoEm, mes)); break;
                case 'year': titulo = 'Relatório Anual'; pedidosFiltrados = concluidos.filter(a => dentroDoRange(a.concluidoEm, ano)); break;
            }

            doc.setFontSize(20);
            doc.setTextColor(214, 51, 132);
            doc.text('Salão de Beleza Kelson', 14, 20);

            doc.setFontSize(14);
            doc.setTextColor(45, 55, 72);
            doc.text(titulo, 14, 30);

            doc.setFontSize(10);
            doc.setTextColor(113, 128, 150);
            doc.text(`Gerado em: ${agora.toLocaleString('pt-BR')}`, 14, 37);
            doc.text(`Total: ${pedidosFiltrados.length}`, 14, 43);

            const totalReceita = pedidosFiltrados.reduce((sum, a) => sum + (a.valorFinal || 0), 0);
            doc.setFontSize(12);
            doc.setTextColor(214, 51, 132);
            doc.text(`Receita: ${formatarKz(totalReceita)}`, 14, 52);

            const rows = pedidosFiltrados.map(a => [
                a.data || '—',
                a.horaInicio || '—',
                a.clienteNome || '—',
                a.servicoNome || '—',
                a.barbeiroNome || '—',
                formatarKz(a.valorFinal || 0),
                a.formaPagamento === 'cash' ? 'Dinheiro' : 'Multicai'
            ]);

            doc.autoTable({
                startY: 60,
                head: [['Data', 'Hora', 'Cliente', 'Serviço', 'Barbeiro', 'Valor', 'Pag.']],
                body: rows,
                theme: 'striped',
                headStyles: { fillColor: [214, 51, 132], textColor: 255, fontSize: 9 },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 20 }, 1: { cellWidth: 15 }, 2: { cellWidth: 35 },
                    3: { cellWidth: 30 }, 4: { cellWidth: 30 }, 5: { cellWidth: 22 }, 6: { cellWidth: 20 }
                }
            });

            const nomeFicheiro = `relatorio-${tipo}-${agora.toISOString().split('T')[0]}.pdf`;
            doc.save(nomeFicheiro);

        } catch (error) {
            console.error('❌ Erro PDF:', error);
            alert('Erro: ' + error.message);
        }
    }

    // ===== INIT =====
    async function init() {
        console.log('🚀 Inicializando admin...');

        const autenticado = await verificarAuth();
        if (!autenticado) return;

        configurarTabs();

        await Promise.all([carregarFuncionarios(), carregarAgendamentos()]);

        calcularEstatisticas();
        renderizarPedidos();
        renderizarFuncionarios();
        renderizarFinancas();

        if (btnLogout) btnLogout.addEventListener('click', fazerLogout);

        // Botões PDF
        document.querySelectorAll('[data-pdf]').forEach(btn => {
            btn.addEventListener('click', () => gerarPDF(btn.dataset.pdf));
        });

        // Modal de funcionário — eventos
        if (btnFecharModalFuncionario) btnFecharModalFuncionario.addEventListener('click', fecharModalFuncionario);
        if (btnCancelarFuncionario) btnCancelarFuncionario.addEventListener('click', fecharModalFuncionario);
        if (formFuncionario) formFuncionario.addEventListener('submit', guardarFuncionario);
        if (funcTelefone) funcTelefone.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').substring(0, 9);
            e.target.value = v;
            const preview = document.getElementById('funcEmailPreview');
            if (preview) preview.textContent = v ? v + EMAIL_DOMAIN : '—';
        });
        if (funcionarioModal) funcionarioModal.addEventListener('click', (e) => {
            if (e.target === funcionarioModal) fecharModalFuncionario();
        });

        console.log('✅ Admin pronto!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();