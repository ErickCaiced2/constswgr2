// Configuración
const API_URL = 'http://localhost:3001';
const HUB_URL = 'http://localhost:3000';
let editingId = null;

// Elementos del DOM
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const message = document.getElementById('message');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const crudStatus = document.getElementById('crudStatus');
const hubStatus = document.getElementById('hubStatus');

// Verificar estado de los servidores
async function checkStatus() {
    try {
        const crudRes = await fetch(`${API_URL}/health`, { mode: 'cors' });
        crudStatus.textContent = crudRes.ok ? '✅ En línea' : '❌ Desconectado';
        crudStatus.className = 'status-badge ' + (crudRes.ok ? 'online' : 'offline');
    } catch (err) {
        crudStatus.textContent = '❌ Desconectado';
        crudStatus.className = 'status-badge offline';
    }

    try {
        const hubRes = await fetch(`${HUB_URL}/health`, { mode: 'no-cors' });
        // Con no-cors, siempre retorna ok si no hay error de red
        hubStatus.textContent = '✅ En línea';
        hubStatus.className = 'status-badge online';
    } catch (err) {
        hubStatus.textContent = '❌ Desconectado';
        hubStatus.className = 'status-badge offline';
    }
}

// Mostrar mensaje
function showMessage(text, type = 'success') {
    message.textContent = text;
    message.className = `message ${type}`;
    setTimeout(() => {
        message.className = 'message';
    }, 4000);
}

// Crear producto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const product = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        description: document.getElementById('description').value,
    };

    try {
        loadingSpinner.classList.add('active');
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        if (!res.ok) throw new Error('Error al crear producto');

        showMessage('✅ Producto creado exitosamente', 'success');
        productForm.reset();
        loadProducts();
    } catch (err) {
        showMessage(`❌ Error: ${err.message}`, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
});

// Cargar productos
async function loadProducts() {
    try {
        loadingSpinner.classList.add('active');
        const res = await fetch(`${API_URL}/products`);

        if (!res.ok) throw new Error('Error al cargar productos');

        const products = await res.json();
        displayProducts(products);
    } catch (err) {
        productList.innerHTML = `
            <div class="product-card empty">
                ❌ Error al cargar productos: ${err.message}
            </div>
        `;
    } finally {
        loadingSpinner.classList.remove('active');
    }
}

// Mostrar productos
function displayProducts(products) {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        productList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">
                    ${searchTerm ? 'No se encontraron productos' : 'No hay productos aún'}
                </div>
            </div>
        `;
        return;
    }

    productList.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-header">
                <div class="product-title">${escapeHtml(product.name)}</div>
                <span class="product-category">${escapeHtml(product.category)}</span>
            </div>

            ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}

            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">Cantidad</span>
                    <span class="detail-value quantity">${product.quantity} unidades</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Precio Unitario</span>
                    <span class="detail-value price">$${product.price.toFixed(2)}</span>
                </div>
            </div>

            <div class="product-actions">
                <button class="btn btn-edit" onclick="openEditModal(${product.id}, ${escapeJson(product)})">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id}, '${escapeHtml(product.name)}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Abrir modal de edición
function openEditModal(id, product) {
    editingId = id;
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editQuantity').value = product.quantity;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editDescription').value = product.description;
    editModal.classList.add('active');
}

// Cerrar modal
function closeEditModal() {
    editModal.classList.remove('active');
    editingId = null;
}

// Guardar cambios
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updates = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        price: parseFloat(document.getElementById('editPrice').value),
        description: document.getElementById('editDescription').value,
    };

    try {
        loadingSpinner.classList.add('active');
        const res = await fetch(`${API_URL}/products/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!res.ok) throw new Error('Error al actualizar producto');

        showMessage('✅ Producto actualizado exitosamente', 'success');
        closeEditModal();
        loadProducts();
    } catch (err) {
        showMessage(`❌ Error: ${err.message}`, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
});

// Eliminar producto
async function deleteProduct(id, name) {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return;

    try {
        loadingSpinner.classList.add('active');
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error('Error al eliminar producto');

        showMessage(`✅ Producto "${name}" eliminado`, 'success');
        loadProducts();
    } catch (err) {
        showMessage(`❌ Error: ${err.message}`, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
}

// Búsqueda
searchInput.addEventListener('input', () => {
    const products = Array.from(document.querySelectorAll('.product-card:not(.empty)'))
        .map(card => ({
            id: parseInt(card.dataset.id) || null,
            name: card.querySelector('.product-title').textContent,
            category: card.querySelector('.product-category').textContent,
        }));

    if (products.length > 0) {
        displayProducts(products);
    } else {
        loadProducts();
    }
});

// Botón actualizar
refreshBtn.addEventListener('click', () => {
    loadProducts();
});

// Modal close
closeBtn.addEventListener('click', closeEditModal);
cancelBtn.addEventListener('click', closeEditModal);

window.addEventListener('click', (event) => {
    if (event.target == editModal) {
        closeEditModal();
    }
});

// Funciones auxiliares
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeJson(obj) {
    return JSON.stringify(obj).replace(/"/g, '&quot;');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    loadProducts();

    // Verificar estado cada 10 segundos
    setInterval(checkStatus, 10000);

    // Recargar productos cada 30 segundos
    setInterval(loadProducts, 30000);
});


