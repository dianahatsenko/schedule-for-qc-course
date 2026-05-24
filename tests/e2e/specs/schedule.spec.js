const { test, expect } = require('@playwright/test');

const EMAIL = 'manager@gmail.com';
const PASSWORD = 'Qwerty!123';

async function login(page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email').fill(EMAIL);
    await page.getByPlaceholder('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(EMAIL.toUpperCase())).toBeVisible();
}

async function goToAdmin(page) {
    await page.getByText(EMAIL.toUpperCase()).click();
    await page.waitForTimeout(500);
    await page.getByRole('menuitem', { name: 'Admin' }).click();
    await page.waitForLoadState('networkidle');
}

async function goToRooms(page) {
    await goToAdmin(page);
    await page.getByRole('button', { name: 'More' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Rooms' }).click();
    await page.waitForLoadState('networkidle');
}

// Тест 1: Відображення головної сторінки
test('schedule page loads with main elements visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Group', { exact: true })).toBeVisible();
    await expect(page.getByText('Teacher', { exact: true })).toBeVisible();
    await expect(page.getByText('Department', { exact: true })).toBeVisible();
    await expect(page.getByText('Schedule is empty')).toBeVisible();
});

// Тест 2: Успішний логін
test('successful login redirects to schedule page', async ({ page }) => {
    await login(page);
    await expect(page.getByText(EMAIL.toUpperCase())).toBeVisible();
    await expect(page.getByText('Semester: desc')).toBeVisible();
});

// Тест 3: Неуспішний логін
test('failed login stays on login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email').fill('wrong@email.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page).toHaveURL(/login/);
});

// Тест 4: Навігація до Admin після логіну
test('navigation to admin panel after login', async ({ page }) => {
    await login(page);
    await goToAdmin(page);

    await expect(page).toHaveURL(/admin/);
    await expect(page.getByRole('button', { name: 'More' })).toBeVisible();
});

// Тест 5: Перегляд списку Rooms
test('view rooms list in admin panel', async ({ page }) => {
    await login(page);
    await goToRooms(page);

    await expect(page.getByText('Create room')).toBeVisible();
    await expect(page.getByText('Лекційна').first()).toBeVisible();
});

// Тест 6: Пошук кімнат
test('search rooms filters the list', async ({ page }) => {
    await login(page);
    await goToRooms(page);

    await page.locator('input[type="text"]').first().fill('15');
    await page.waitForTimeout(500);

    await expect(page.getByText('15')).toBeVisible();
});

// Тест 7: Навігація через More меню до Teachers
test('navigate to teachers page via More menu', async ({ page }) => {
    await login(page);
    await goToAdmin(page);

    await page.getByRole('button', { name: 'More' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Teachers' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/teachers/);
});