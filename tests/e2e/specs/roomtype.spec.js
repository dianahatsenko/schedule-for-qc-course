const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { RoomTypePage } = require('../pages/RoomTypePage');

const EMAIL = 'manager@gmail.com';
const PASSWORD = 'Qwerty!123';

test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
});

// Завд 2: Page Object Model

test('LoginPage PO - login form is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const isVisible = await loginPage.isLoginFormVisible();
    expect(isVisible).toBe(true);
});

test('LoginPage PO - user is logged in after login', async ({ page }) => {
    await expect(page.getByText(EMAIL.toUpperCase())).toBeVisible();
});

test('RoomTypePage PO - page loads correctly', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);
    await expect(page.getByText('Create room')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'New type' })).toBeVisible();
});

test('RoomTypePage PO - search rooms via PO method', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);
    await roomTypePage.searchRoom('15');
    await expect(page.getByText('15')).toBeVisible();
});

test('RoomTypePage PO - existing room type is visible', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);
    await expect(page.getByText('Лекційна').first()).toBeVisible();
});

// Завд 3: Складні сценарії

// CRUD
test('CRUD - create, view, edit and delete room type via UI', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);
    await page.waitForTimeout(1000);

    const typeName = `TestType_${Date.now()}`;

    // CREATE
    await roomTypePage.createRoomType(typeName);
    await page.waitForTimeout(1000);

    // VIEW
    await expect(page.getByText(typeName).first()).toBeVisible();

    // EDIT
    const typeRow = page.locator('li').filter({ hasText: typeName });
    await typeRow.locator('svg').first().click();
    await page.waitForTimeout(500);
    const editInput = page.locator('input[placeholder="add_type_label"]');
    await editInput.fill(`Updated_${typeName}`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await expect(page.getByText(`Updated_${typeName}`).first()).toBeVisible();

    // DELETE
    const updatedRow = page.locator('li').filter({ hasText: `Updated_${typeName}` });
    await updatedRow.locator('svg').last().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(`Updated_${typeName}`)).not.toBeVisible();
});

// Валідація форм
test('Form validation - save button disabled when room type is empty', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);

    const saveButton = page.getByRole('button', { name: 'SAVE' }).last();
    await expect(saveButton).toBeDisabled();
});

// Валідація форми кімнати
test('Form validation - cannot save room without required fields', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);

    const saveRoomButton = page.getByRole('button', { name: 'SAVE' }).first();
    await expect(saveRoomButton).toBeDisabled();
});

// Завд 4 SQL для тестування
const { getRoomTypeByName, deleteRoomTypeByName, closePool } = require('../helpers/database');

test.afterAll(async () => {
    await closePool();
});

test('SQL - room type saved to database after UI creation', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);

    const typeName = `SQLTest_${Date.now()}`;

    // Setup створюємо через UI
    await roomTypePage.createRoomType(typeName);
    await page.waitForTimeout(1000);

    // Verification
    const dbRecord = await getRoomTypeByName(typeName);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.description).toBe(typeName);

    // Cleanup
    await deleteRoomTypeByName(typeName);
});

test('SQL - room type removed from database after UI deletion', async ({ page }) => {
    const roomTypePage = new RoomTypePage(page);
    await roomTypePage.goto(EMAIL);

    const typeName = `SQLDelete_${Date.now()}`;

    // Setup створюємо через UI
    await roomTypePage.createRoomType(typeName);
    await page.waitForTimeout(1000);

    // Перевіряємо що є в БД перед видаленням
    const before = await getRoomTypeByName(typeName);
    expect(before).not.toBeNull();

    // Видаляємо через UI
    const typeRow = page.locator('li').filter({ hasText: typeName });
    await typeRow.locator('svg').last().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(500);

    // Verification
    const after = await getRoomTypeByName(typeName);
    expect(after).toBeNull();
});