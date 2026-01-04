// ===========================================
// CONFIGURACIÓN PRINCIPAL
// ===========================================

// Precios definidos
const PRICES = {
    SYSTEM: 5.00,
    DESCRIPTION_LENGTH: {
        OVER_72: 1.00,
        OVER_100: 2.00,
        OVER_150: 3.00,
        OVER_200: 3.00
    },
    TYPES: {
        filterscript: 3.00,
        modular: 2.00,
        adaptable: 0.00
    },
    STORAGE: {
        mysql: 3.00,
        file: 2.00
    },
    TIME: {
        '2': 3.00,
        '3': 2.00,
        '4': 1.00,
        '5': 0.00
    }
};

// CLAVE DE ADMINISTRACIÓN - ¡CAMBIA ESTA CLAVE!
const ADMIN_PASSWORD = "ADMIN_PAWN_SYSTEMS_2024";

// ===========================================
// VARIABLES GLOBALES
// ===========================================

let descriptionProvided = false;

// ===========================================
// FUNCIONES PRINCIPALES DE LA TIENDA
// ===========================================

// Actualizar precio del tiempo seleccionado
function updateTimePrice() {
    const selectedTime = timeLimitSelect.value;
    const price = PRICES.TIME[selectedTime];
    timePriceSpan.textContent = `$${price.toFixed(2)}`;
}

// Función para calcular precio según longitud de descripción
function calculateDescriptionPrice(description) {
    let price = PRICES.SYSTEM;
    const length = description.length;
    
    if (length > 72) price += PRICES.DESCRIPTION_LENGTH.OVER_72;
    if (length > 100) price += PRICES.DESCRIPTION_LENGTH.OVER_100;
    if (length > 150) price += PRICES.DESCRIPTION_LENGTH.OVER_150;
    if (length > 200) price += PRICES.DESCRIPTION_LENGTH.OVER_200;
    
    return price;
}

// Función para validar título
function validateTitle() {
    const title = systemTitleInput.value.trim();
    
    if (!title) {
        systemTitleInput.classList.add('error');
        return false;
    } else if (title.length > 30) {
        systemTitleInput.classList.add('error');
        return false;
    } else {
        systemTitleInput.classList.remove('error');
        return true;
    }
}

// Función para validar si el título es entendible
function isTitleMeaningful(title) {
    const meaningfulWords = [
        'sistema', 'sistemas', 'pawn', 'gamemode', 'filterscript',
        'admin', 'administración', 'casa', 'casas', 'vehículo', 'vehículos',
        'negocio', 'negocios', 'empresa', 'empresas', 'banco', 'bancos',
        'trabajo', 'trabajos', 'score', 'scoreboard', 'login', 'registro',
        'skin', 'skins', 'arma', 'armas', 'inventario', 'ranking'
    ];
    
    const titleLower = title.toLowerCase();
    let hasMeaningfulWord = false;
    
    for (const word of meaningfulWords) {
        if (titleLower.includes(word)) {
            hasMeaningfulWord = true;
            break;
        }
    }
    
    return hasMeaningfulWord || title.split(' ').length >= 2;
}

// Función para validar si la descripción es entendible
function isDescriptionMeaningful(description) {
    const minWords = 5;
    const words = description.trim().split(/\s+/);
    
    if (words.length < minWords) {
        return false;
    }
    
    const meaningfulWords = [
        'quiero', 'necesito', 'debe', 'pueda', 'funcion',
        'característica', 'opción', 'menú', 'comando', 'dialog',
        'textdraw', 'guardar', 'cargar', 'mostrar', 'crear',
        'eliminar', 'editar', 'modificar', 'actualizar', 'seleccionar'
    ];
    
    const descLower = description.toLowerCase();
    let meaningfulCount = 0;
    
    for (const word of meaningfulWords) {
        if (descLower.includes(word)) {
            meaningfulCount++;
        }
    }
    
    return meaningfulCount >= 2 || words.length >= 15;
}

// Función para validar descripción
function validateDescription() {
    const description = systemDescriptionInput.value.trim();
    descriptionProvided = description.length > 0;
    
    if (!descriptionProvided) {
        systemDescriptionInput.classList.add('error');
    } else if (description.length < 10) {
        systemDescriptionInput.classList.add('error');
    } else {
        systemDescriptionInput.classList.remove('error');
    }
    
    return descriptionProvided && description.length >= 10;
}

// Función para crear un elemento del pedido
function createOrderItem(label, value, price, description = '') {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    
    itemDiv.innerHTML = `
        <div class="order-item-main">
            <div class="item-label">${label}</div>
            <div class="item-value">${value}</div>
            ${description ? `<div class="item-description">${description}</div>` : ''}
        </div>
        <div class="item-price">$${price.toFixed(2)}</div>
    `;
    
    return itemDiv;
}

// Función para mostrar la plantilla de pedido
function showOrderTemplate() {
    // Obtener valores del formulario
    let title = systemTitleInput.value.trim();
    let description = systemDescriptionInput.value.trim();
    const systemType = document.querySelector('input[name="systemType"]:checked').value;
    const storageType = document.querySelector('input[name="storageType"]:checked').value;
    const timeLimit = timeLimitSelect.value;
    
    // Validar contenido entendible
    const isTitleValid = isTitleMeaningful(title);
    const isDescriptionValid = isDescriptionMeaningful(description);
    
    if (!isTitleValid) {
        alert('El título debe ser más específico. Ejemplo: "Sistema de Empresas" o "Sistema de Administración"');
        systemTitleInput.focus();
        return;
    }
    
    if (!isDescriptionValid) {
        alert('La descripción debe ser más detallada y entendible. Ejemplo: "Necesito un sistema de empresas que permita crear empresas, contratar empleados y gestionar ganancias."');
        systemDescriptionInput.focus();
        return;
    }
    
    // Si no hay título, usar uno genérico
    if (!title) {
        title = 'Sistema Personalizado';
    }
    
    // Calcular precios individuales
    const systemPrice = calculateDescriptionPrice(description);
    const typePrice = PRICES.TYPES[systemType] || 0;
    const storagePrice = PRICES.STORAGE[storageType] || 0;
    const timePrice = PRICES.TIME[timeLimit] || 0;
    
    // Calcular precio total
    const totalPrice = systemPrice + typePrice + storagePrice + timePrice;
    
    // Limpiar el contenido anterior
    orderInfo.innerHTML = '';
    
    // Añadir elementos del pedido
    
    // 1. Sistema personalizado
    orderInfo.appendChild(createOrderItem(
        '<i class="fas fa-code"></i> Sistema personalizado',
        title,
        systemPrice,
        description.substring(0, 100) + (description.length > 100 ? '...' : '')
    ));
    
    // 2. Tipo de sistema
    const typeNames = {
        'filterscript': 'Filterscript',
        'modular': 'Modular',
        'adaptable': 'Adaptable'
    };
    orderInfo.appendChild(createOrderItem(
        '<i class="fas fa-cogs"></i> Tipo de sistema',
        typeNames[systemType],
        typePrice
    ));
    
    // 3. Almacenamiento
    const storageNames = {
        'mysql': 'MySQL',
        'file': 'Archivos .txt'
    };
    orderInfo.appendChild(createOrderItem(
        '<i class="fas fa-database"></i> Almacenamiento',
        storageNames[storageType],
        storagePrice
    ));
    
    // 4. Tiempo de entrega
    const timeNames = {
        '2': '2 días',
        '3': '3 días',
        '4': '4 días',
        '5': '5 días'
    };
    orderInfo.appendChild(createOrderItem(
        '<i class="fas fa-clock"></i> Tiempo de entrega',
        timeNames[timeLimit],
        timePrice
    ));
    
    // Actualizar precio total
    orderTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    
    // Mostrar la plantilla
    orderTemplate.classList.remove('hidden');
    
    // Desplazarse hacia la plantilla
    orderTemplate.scrollIntoView({ behavior: 'smooth' });
}

// Función para resetear el formulario
function resetForm() {
    form.reset();
    titleError.textContent = '';
    descriptionError.textContent = '';
    systemTitleInput.classList.remove('error');
    systemDescriptionInput.classList.remove('error');
    descriptionProvided = false;
    orderTemplate.classList.add('hidden');
    updateTimePrice(); // Actualizar precio del tiempo
}

// ===========================================
// SISTEMA DE ADMINISTRACIÓN
// ===========================================

// Verificar si estamos en modo administración
function checkAdminMode() {
    // Verificar si se accedió con parámetro admin en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    
    if (adminParam === 'true') {
        showAdminLogin();
        return true;
    }
    
    // Verificar sesión almacenada
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        const now = Date.now();
        
        // Si la sesión es válida, mostrar panel admin
        if (sessionData.expires > now) {
            showAdminPanel();
            return true;
        } else {
            // Sesión expirada, limpiar
            localStorage.removeItem('admin_session');
        }
    }
    return false;
}

// Mostrar login de administración
function showAdminLogin() {
    tiendaContainer.classList.add('hidden');
    adminLoginContainer.classList.remove('hidden');
    adminPasswordInput.focus();
}

// Ocultar login de administración
function hideAdminLogin() {
    adminLoginContainer.classList.add('hidden');
    tiendaContainer.classList.remove('hidden');
}

// Verificar clave de administración
function verifyAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

// Crear sesión de administración
function createAdminSession() {
    const session = {
        loggedIn: true,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
}

// Mostrar panel de administración
function showAdminPanel() {
    tiendaContainer.classList.add('hidden');
    adminContainer.classList.remove('hidden');
    
    // Cargar datos en el panel
    loadAdminPanel();
}

// Cargar datos en el panel de administración
function loadAdminPanel() {
    const orders = JSON.parse(localStorage.getItem('pawn_orders')) || [];
    
    const adminHTML = `
        <div class="admin-panel-header">
            <h1><i class="fas fa-cogs"></i> Panel de Administración - Pawn Systems Market</h1>
            <div class="admin-info">
                <span class="admin-status"><i class="fas fa-circle"></i> Conectado</span>
                <button id="logoutAdmin" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="admin-stats">
                <h2><i class="fas fa-chart-bar"></i> Estadísticas</h2>
                <div class="stats-grid" id="adminStats">
                    ${generateAdminStats(orders)}
                </div>
            </div>
            
            <div class="admin-orders">
                <h2><i class="fas fa-shopping-cart"></i> Pedidos Recientes</h2>
                <div class="orders-list" id="ordersList">
                    ${generateOrdersList(orders)}
                </div>
            </div>
            
            <div class="admin-actions">
                <h2><i class="fas fa-tools"></i> Acciones Rápidas</h2>
                <div class="actions-grid">
                    <button class="action-btn" id="exportOrders">
                        <i class="fas fa-file-export"></i> Exportar Pedidos
                    </button>
                    <button class="action-btn" id="clearOrders">
                        <i class="fas fa-trash"></i> Limpiar Historial
                    </button>
                    <button class="action-btn" id="backToStore">
                        <i class="fas fa-store"></i> Volver a Tienda
                    </button>
                </div>
            </div>
        </div>
        
        <div class="admin-footer">
            <p>Sesión activa hasta: <span id="sessionExpiry">${getSessionExpiry()}</span></p>
            <p><i class="fas fa-shield-alt"></i> Panel de Administración Seguro</p>
        </div>
    `;
    
    adminContainer.innerHTML = adminHTML;
    
    // Añadir event listeners a los botones del admin
    document.getElementById('logoutAdmin').addEventListener('click', logoutAdmin);
    document.getElementById('exportOrders').addEventListener('click', exportOrders);
    document.getElementById('clearOrders').addEventListener('click', clearOrders);
    document.getElementById('backToStore').addEventListener('click', backToStore);
}

// Generar estadísticas del admin
function generateAdminStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    const todayOrders = getTodayOrders(orders);
    
    return `
        <div class="stat-card">
            <h3>Pedidos Totales</h3>
            <div class="number">${totalOrders}</div>
        </div>
        <div class="stat-card">
            <h3>Ingresos Totales</h3>
            <div class="number">$${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Pedidos Hoy</h3>
            <div class="number">${todayOrders}</div>
        </div>
    `;
}

// Generar lista de pedidos
function generateOrdersList(orders) {
    if (orders.length === 0) {
        return '<p>No hay pedidos registrados.</p>';
    }
    
    return orders.map(order => `
        <div class="order-item-admin">
            <h4>${order.title || 'Pedido sin título'}</h4>
            <p>${order.description ? order.description.substring(0, 100) + '...' : 'Sin descripción'}</p>
            <div class="order-meta">
                <span>Tipo: ${order.type || 'N/A'}</span>
                <span>Precio: $${order.price || '0.00'}</span>
                <span>Fecha: ${new Date(order.date || Date.now()).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Obtener pedidos de hoy
function getTodayOrders(orders) {
    const today = new Date().toDateString();
    return orders.filter(order => {
        const orderDate = new Date(order.date || Date.now()).toDateString();
        return orderDate === today;
    }).length;
}

// Obtener fecha de expiración de sesión
function getSessionExpiry() {
    const session = JSON.parse(localStorage.getItem('admin_session'));
    if (session) {
        const expiryDate = new Date(session.expires);
        return expiryDate.toLocaleString();
    }
    return 'N/A';
}

// Cerrar sesión de administración
function logoutAdmin() {
    localStorage.removeItem('admin_session');
    tiendaContainer.classList.remove('hidden');
    adminContainer.classList.add('hidden');
    
    // Limpiar parámetro de la URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Exportar pedidos
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('pawn_orders')) || [];
    const dataStr = JSON.stringify(orders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pawn_orders_export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Limpiar historial de pedidos
function clearOrders() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los pedidos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('pawn_orders');
        loadAdminPanel(); // Recargar el panel
        alert('Todos los pedidos han sido eliminados.');
    }
}

// Volver a la tienda
function backToStore() {
    tiendaContainer.classList.remove('hidden');
    adminContainer.classList.add('hidden');
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Variables globales de elementos DOM
let systemTitleInput, titleError, systemDescriptionInput, descriptionError;
let addToCartButton, orderTemplate, confirmationModal, closeModalButton;
let timeLimitSelect, timePriceSpan, orderInfo, orderTotalPrice;
let confirmOrderButton, editOrderButton, deleteOrderButton, form;
let tiendaContainer, adminLoginContainer, adminContainer;
let adminPasswordInput, togglePasswordBtn, adminPasswordError;
let adminLoginBtn, cancelLoginBtn, adminAccessLink;

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM - Tienda
    form = document.getElementById('pawnSystemForm');
    systemTitleInput = document.getElementById('systemTitle');
    titleError = document.getElementById('titleError');
    systemDescriptionInput = document.getElementById('systemDescription');
    descriptionError = document.getElementById('descriptionError');
    addToCartButton = document.getElementById('addToCart');
    orderTemplate = document.getElementById('orderTemplate');
    confirmationModal = document.getElementById('confirmationModal');
    closeModalButton = document.getElementById('closeModal');
    timeLimitSelect = document.getElementById('timeLimit');
    timePriceSpan = document.getElementById('timePrice');
    
    // Elementos para la plantilla de pedido
    orderInfo = document.querySelector('.order-info');
    orderTotalPrice = document.getElementById('orderTotalPrice');
    
    // Botones de acción
    confirmOrderButton = document.getElementById('confirmOrder');
    editOrderButton = document.getElementById('editOrder');
    deleteOrderButton = document.getElementById('deleteOrder');
    
    // Contenedores principales
    tiendaContainer = document.getElementById('tiendaContainer');
    adminLoginContainer = document.getElementById('adminLoginContainer');
    adminContainer = document.getElementById('adminContainer');
    
    // Elementos del login admin
    adminPasswordInput = document.getElementById('adminPassword');
    togglePasswordBtn = document.getElementById('togglePassword');
    adminPasswordError = document.getElementById('adminPasswordError');
    adminLoginBtn = document.getElementById('adminLoginBtn');
    cancelLoginBtn = document.getElementById('cancelLogin');
    adminAccessLink = document.getElementById('adminAccessLink');
    
    // ===========================================
    // EVENT LISTENERS - TIENDA
    // ===========================================
    
    // Validación en tiempo real
    systemTitleInput.addEventListener('input', function() {
        validateTitle();
        titleError.textContent = '';
    });
    
    systemDescriptionInput.addEventListener('input', function() {
        validateDescription();
        descriptionError.textContent = '';
    });
    
    // Actualizar precio del tiempo
    timeLimitSelect.addEventListener('change', updateTimePrice);
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validaciones
        const isTitleValid = validateTitle();
        const isDescriptionValid = validateDescription();
        
        // Verificar si hay errores
        if (!isTitleValid) {
            titleError.textContent = 'El título es obligatorio y no debe exceder los 30 caracteres.';
            alert('El título es obligatorio y no debe exceder los 30 caracteres.');
            systemTitleInput.focus();
            return;
        }
        
        if (!isDescriptionValid) {
            descriptionError.textContent = 'La descripción es obligatoria y debe tener al menos 10 caracteres.';
            alert('La descripción es obligatoria y debe tener al menos 10 caracteres.');
            systemDescriptionInput.focus();
            return;
        }
        
        // Mostrar la plantilla de pedido
        showOrderTemplate();
    });
    
    // Confirmar pedido
    confirmOrderButton.addEventListener('click', function() {
        if (!descriptionProvided) {
            alert('Error: La descripción es obligatoria para confirmar el pedido.');
            return;
        }
        
        // Obtener datos del pedido
        const title = systemTitleInput.value.trim();
        const description = systemDescriptionInput.value.trim();
        const systemType = document.querySelector('input[name="systemType"]:checked').value;
        const storageType = document.querySelector('input[name="storageType"]:checked').value;
        const timeLimit = timeLimitSelect.value;
        
        // Calcular precio
        const systemPrice = calculateDescriptionPrice(description);
        const typePrice = PRICES.TYPES[systemType] || 0;
        const storagePrice = PRICES.STORAGE[storageType] || 0;
        const timePrice = PRICES.TIME[timeLimit] || 0;
        const totalPrice = systemPrice + typePrice + storagePrice + timePrice;
        
        // Guardar pedido en localStorage
        const orders = JSON.parse(localStorage.getItem('pawn_orders')) || [];
        orders.push({
            title: title,
            description: description,
            type: systemType,
            storage: storageType,
            timeLimit: timeLimit,
            price: totalPrice.toFixed(2),
            date: new Date().toISOString()
        });
        
        localStorage.setItem('pawn_orders', JSON.stringify(orders));
        
        // Mostrar modal de confirmación
        confirmationModal.classList.remove('hidden');
    });
    
    // Editar pedido
    editOrderButton.addEventListener('click', function() {
        // Ocultar plantilla y desplazar hacia el formulario
        orderTemplate.classList.add('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Eliminar pedido
    deleteOrderButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar este pedido? Se perderán todos los datos.')) {
            resetForm();
        }
    });
    
    // Cerrar modal
    closeModalButton.addEventListener('click', function() {
        confirmationModal.classList.add('hidden');
        resetForm();
    });
    
    // Cerrar modal haciendo clic fuera de él
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            confirmationModal.classList.add('hidden');
            resetForm();
        }
    });
    
    // ===========================================
    // EVENT LISTENERS - ADMINISTRACIÓN
    // ===========================================
    
    // Mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', function() {
        const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPasswordInput.setAttribute('type', type);
        
        // Cambiar icono
        const icon = this.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // Acceso al login admin desde el enlace
    adminAccessLink.addEventListener('click', function(e) {
        e.preventDefault();
        showAdminLogin();
    });
    
    // Botón de login admin
    adminLoginBtn.addEventListener('click', function() {
        const password = adminPasswordInput.value.trim();
        
        if (!password) {
            adminPasswordError.textContent = 'Por favor, ingresa la clave de administración';
            adminPasswordInput.focus();
            return;
        }
        
        if (verifyAdminPassword(password)) {
            createAdminSession();
            hideAdminLogin();
            showAdminPanel();
        } else {
            adminPasswordError.textContent = 'Clave incorrecta';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    });
    
    // Cancelar login admin
    cancelLoginBtn.addEventListener('click', function() {
        hideAdminLogin();
        
        // Limpiar parámetro de la URL si existe
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
    
    // ===========================================
    // INICIALIZACIÓN FINAL
    // ===========================================
    
    // Inicializar validaciones
    validateTitle();
    validateDescription();
    updateTimePrice();
    
    // Verificar modo admin
    if (!checkAdminMode()) {
        tiendaContainer.classList.remove('hidden');
        adminContainer.classList.add('hidden');
        adminLoginContainer.classList.add('hidden');
    }
});