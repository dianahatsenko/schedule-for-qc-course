class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('Email');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.homeLink = page.getByRole('link', { name: 'Home' });
        this.loginLink = page.getByRole('link', { name: 'Login' });
    }

    // Метод 1: відкрити сторінку логіну
    async goto() {
        await this.page.goto('/login');
        await this.page.waitForLoadState('networkidle');
    }

    // Метод 2: заповнити форму і залогінитись
    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Метод 3: перевірити що форма логіну видима
    async isLoginFormVisible() {
        return await this.emailInput.isVisible();
    }

    // Метод 4: перевірити що залогінились успішно
    async isLoggedIn(email) {
        return await this.page.getByText(email.toUpperCase()).isVisible();
    }
}

module.exports = { LoginPage };