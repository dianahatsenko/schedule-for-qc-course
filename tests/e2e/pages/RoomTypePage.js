class RoomTypePage {
    constructor(page) {
        this.page = page;
        this.newTypeInput = page.locator('form').filter({ hasText: 'New type' }).locator('input');
        this.saveTypeButton = page.getByRole('button', { name: 'SAVE' }).last();
        this.searchInput = page.locator('input[type="text"]').first();
    }

    async goto(email) {
        await this.page.getByText(email.toUpperCase()).click();
        await this.page.waitForTimeout(500);
        await this.page.getByRole('menuitem', { name: 'Admin' }).click();
        await this.page.waitForLoadState('networkidle');
        await this.page.getByRole('button', { name: 'More' }).click();
        await this.page.waitForTimeout(300);
        await this.page.getByRole('option', { name: 'Rooms' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async createRoomType(typeName) {
        await this.newTypeInput.fill(typeName);
        await this.saveTypeButton.click();
        await this.page.waitForTimeout(500);
    }

    async isRoomTypeVisible(typeName) {
        const count = await this.page.getByText(typeName).count();
        return count > 0;
    }

    async deleteRoomType(typeName) {
        const row = this.page.locator('li').filter({ hasText: typeName });
        await row.getByRole('button').last().click();
        await this.page.waitForTimeout(500);
    }

    async searchRoom(query) {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(500);
    }
}

module.exports = { RoomTypePage };