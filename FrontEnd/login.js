document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email === 'admin' && password === 'admin') {
            messageDiv.textContent = 'Connexion réussie ! Redirection en cours...';
            messageDiv.classList.remove('error');
            messageDiv.classList.add('success');

            localStorage.setItem('isLoggedIn', 'true');

            setTimeout(() => {
                window.location.href = './index_edit.html';
            }, 1000);
        } else {
            messageDiv.textContent = 'Erreur dans l’identifiant ou le mot de passe.';
            messageDiv.classList.remove('success');
            messageDiv.classList.add('error');
        }
    });
});
