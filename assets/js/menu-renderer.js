/**
 * Menu Renderer for Kopi Saropah
 * Loads menu items from Supabase (table: menu_items) and renders them dynamically
 */

const MenuRenderer = {
    // Escape HTML to prevent XSS
    escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    },

    formatPrice(price) {
        const n = Number(price) || 0;
        return 'Rp ' + n.toLocaleString('id-ID');
    },

    async init() {
        const menuContainer = document.querySelector('.menu-grid');
        if (!menuContainer) return;

        const categoryId = document.body.dataset.category;
        const url = window.SAROPAH_SUPABASE_URL;
        const key = window.SAROPAH_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.error('Supabase belum dikonfigurasi (cek supabase-config.js)');
            menuContainer.innerHTML = '<p class="error">Gagal memuat menu. Silakan coba lagi nanti.</p>';
            return;
        }

        try {
            const endpoint = `${url}/rest/v1/menu_items?select=*&category=eq.${encodeURIComponent(categoryId)}&active=eq.true&order=sort_order.asc`;
            const response = await fetch(endpoint, {
                headers: { apikey: key, Authorization: `Bearer ${key}` }
            });
            if (!response.ok) throw new Error('Menu data not found');

            const items = await response.json();

            if (items && items.length > 0) {
                this.renderMenu(menuContainer, items);
            } else {
                console.warn('No active items found for category:', categoryId);
                menuContainer.innerHTML = '<p class="error">Menu tidak ditemukan.</p>';
            }
        } catch (error) {
            console.error('Error loading menu:', error);
            menuContainer.innerHTML = '<p class="error">Gagal memuat menu. Silakan coba lagi nanti.</p>';
        }
    },

    renderMenu(container, items) {
        container.innerHTML = items.map(item => {
            // Sanitize inputs
            const safeName = this.escapeHTML(item.name);
            const safePrice = this.escapeHTML(this.formatPrice(item.price));
            const safeImage = this.escapeHTML(item.image_url || 'assets/images/logo.webp');

            return `
            <div class="menu-item fade-in">
                <div class="item-image">
                    <img src="${safeImage}" alt="${safeName}" loading="lazy">
                </div>
                <div class="item-details">
                    <div class="item-header">
                        <h4>${safeName}</h4>
                        <span class="price">${safePrice}</span>
                    </div>
                    <div class="item-actions mt-sm">
                        <a data-order-link href="order.html" class="btn-order">Order Now</a>
                    </div>
                </div>
            </div>
        `}).join('');

        // Trigger animation for dynamic items
        setTimeout(() => {
            container.querySelectorAll('.menu-item').forEach(item => {
                item.classList.add('visible');
            });
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => MenuRenderer.init());