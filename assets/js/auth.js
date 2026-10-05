/**
 * ============================================================
 * AUTHENTICATION
 * Salão Kelson - Menongue
 * ============================================================
 * Lógica de login, logout e redirecionamento por role.
 * ============================================================
 */

(function() {
    'use strict';

    // ===== ELEMENTOS DO DOM =====
    const form = document.getElementById('loginForm');
    const telefoneInput = document.getElementById('telefone');
    const senhaInput = document.getElementById('senha');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginError = document.getElementById('loginError');
    const loginErrorText = document.getElementById('loginErrorText');

    // ===== DOMÍNIO DOS EMAILS =====
    const EMAIL_DOMAIN = '@salaokellson.local';

    /**
     * ============================================================
     * VALIDAR TELEFONE (9 dígitos, começa com 9)
     * ============================================================
     */
    function validarTelefone(telefone) {
        const regex = /^9\d{8}$/;
        return regex.test(telefone);
    }

    /**
     * ============================================================
     * CONVERTER TELEFONE EM EMAIL
     * ============================================================
     * Ex: 929627627 → 929627627@salaokellson.local
     */
    function telefoneParaEmail(telefone) {
        return telefone + EMAIL_DOMAIN;
    }

    /**
     * ============================================================
     * MOSTRAR ERRO
     * ============================================================
     */
    function mostrarErro(mensagem) {
        loginErrorText.textContent = mensagem;
        loginError.style.display = 'flex';
        
        // Auto-esconder após 5 segundos
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 5000);
    }

    /**
     * ============================================================
     * LIMPAR ERRO
     * ============================================================
     */
    function limparErro() {
        loginError.style.display = 'none';
        loginErrorText.textContent = '';
    }

    /**
     * ============================================================
     * ATIVAR/DESATIVAR BOTÃO
     * ============================================================
     */
    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        if (isLoading) {
            loginBtnText.textContent = 'A entrar';
            loginBtn.classList.add('loading');
        } else {
            loginBtnText.textContent = 'Entrar';
            loginBtn.classList.remove('loading');
        }
    }

    /**
     * ============================================================
     * TRADUZIR ERROS DO FIREBASE
     * ============================================================
     */
    function traduzirErro(error) {
        const mensagens = {
            'auth/user-not-found': 'Telefone não encontrado. Contacte o administrador.',
            'auth/wrong-password': 'Senha incorreta. Tente novamente.',
            'auth/invalid-email': 'Formato de telefone inválido.',
            'auth/too-many-requests': 'Demasiadas tentativas. Aguarde alguns minutos.',
            'auth/network-request-failed': 'Erro de rede. Verifique a sua internet.',
            'auth/user-disabled': 'Conta desativada. Contacte o administrador.',
            'auth/invalid-credential': 'Telefone ou senha incorretos.',
        };
        return mensagens[error.code] || 'Erro ao entrar. Tente novamente.';
    }

    /**
     * ============================================================
     * FAZER LOGIN
     * ============================================================
     */
    async function fazerLogin(event) {
        event.preventDefault();
        limparErro();

        // Limpar espaços e caracteres não numéricos
        const telefone = telefoneInput.value.replace(/\D/g, '').trim();
        const senha = senhaInput.value;

        // Validações
        if (!telefone || !senha) {
            mostrarErro('Preencha todos os campos.');
            return;
        }

        if (!validarTelefone(telefone)) {
            mostrarErro('Telefone deve ter 9 dígitos e começar com 9.');
            return;
        }

        setLoading(true);

        try {
            // Converter telefone em email
            const email = telefoneParaEmail(telefone);

            console.log('🔐 Tentando login:', email);

            // Fazer login
            const userCredential = await FirebaseApp.auth.signInWithEmailAndPassword(email, senha);
            const user = userCredential.user;

            console.log('✅ Login OK! UID:', user.uid);

            // Procurar o funcionário na base de dados
            const docRef = FirebaseApp.db.collection('funcionarios').doc(user.uid);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                console.error('❌ Funcionário não encontrado na base de dados');
                await FirebaseApp.auth.signOut();
                mostrarErro('Funcionário não encontrado. Contacte o administrador.');
                setLoading(false);
                return;
            }

            const dados = docSnap.data();
            console.log('👤 Dados:', dados.nome, '|', dados.role);

            // Verificar se está ativo
            if (dados.ativo === false) {
                await FirebaseApp.auth.signOut();
                mostrarErro('Conta desativada. Contacte o administrador.');
                setLoading(false);
                return;
            }

            // Guardar dados do utilizador na sessão
            sessionStorage.setItem('userUID', user.uid);
            sessionStorage.setItem('userNome', dados.nome);
            sessionStorage.setItem('userRole', dados.role);
            sessionStorage.setItem('userTelefone', dados.telefone);

            console.log('🎯 Redirecionando...');

            // Redirecionar por role
            if (dados.role === 'admin') {
                window.location.href = 'admin.html';
            } else if (dados.role === 'barbeiro') {
                window.location.href = 'barbeiro.html';
            } else {
                await FirebaseApp.auth.signOut();
                mostrarErro('Tipo de utilizador inválido.');
                setLoading(false);
            }

        } catch (error) {
            console.error('❌ Erro no login:', error);
            mostrarErro(traduzirErro(error));
            setLoading(false);
        }
    }

    /**
     * ============================================================
     * MOSTRAR/ESCONDER SENHA
     * ============================================================
     */
    function togglePasswordVisibility() {
        const isPassword = senhaInput.type === 'password';
        senhaInput.type = isPassword ? 'text' : 'password';
        
        const icon = togglePassword.querySelector('.material-icons');
        icon.textContent = isPassword ? 'visibility_off' : 'visibility';
    }

    /**
     * ============================================================
     * FORMATAÇÃO AUTOMÁTICA DO TELEFONE
     * ============================================================
     */
    function formatarTelefoneInput() {
        let valor = telefoneInput.value.replace(/\D/g, '');
        
        // Limitar a 9 dígitos
        if (valor.length > 9) {
            valor = valor.substring(0, 9);
        }
        
        telefoneInput.value = valor;
    }

    /**
     * ============================================================
     * VERIFICAR SE JÁ ESTÁ LOGADO
     * ============================================================
     */
    function verificarSessaoAtiva() {
        FirebaseApp.auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('🔄 Sessão já ativa:', user.uid);
                
                // Procurar o funcionário
                try {
                    const docSnap = await FirebaseApp.db.collection('funcionarios').doc(user.uid).get();
                    
                    if (docSnap.exists) {
                        const dados = docSnap.data();
                        
                        if (dados.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else if (dados.role === 'barbeiro') {
                            window.location.href = 'barbeiro.html';
                        }
                    }
                } catch (error) {
                    console.error('Erro ao verificar sessão:', error);
                }
            }
        });
    }

    /**
     * ============================================================
     * INICIALIZAÇÃO
     * ============================================================
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Verificar se já está logado
        verificarSessaoAtiva();

        // Ligar eventos
        if (form) {
            form.addEventListener('submit', fazerLogin);
        }

        if (togglePassword) {
            togglePassword.addEventListener('click', togglePasswordVisibility);
        }

        if (telefoneInput) {
            telefoneInput.addEventListener('input', formatarTelefoneInput);
        }

        // Focar no campo de telefone automaticamente
        if (telefoneInput) {
            telefoneInput.focus();
        }

        console.log('🔐 Página de login pronta');
    });

})();