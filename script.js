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

// Variables globales
let currentOrders = JSON.parse(localStorage.getItem('pawnOrders')) || [];
let currentOrderId = null;
let isOffline = false;
let offlineOrders = JSON.parse(localStorage.getItem('offlineOrders')) || [];
let lastSyncTime = localStorage.getItem('lastSyncTime') || 'Nunca';

// Cache Management
const CacheManager = {
    isSupported: 'serviceWorker' in navigator && 'caches' in window,
    
    async getCacheInfo() {
        if (!this.isSupported) return null;
        
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'CACHE_INFO') {
                    resolve(event.data);
                }
            };
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_CACHE_INFO' },
                    [messageChannel.port2]
                );
            } else {
                resolve(null);
            }
        });
    },
    
    async clearCache() {
        if (!this.isSupported) return false;
        
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'CACHE_CLEARED') {
                    resolve(event.data.success);
                }
            };
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            } else {
                resolve(false);
            }
        });
    },
    
    async updateCache() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ 
                type: 'UPDATE_CACHE' 
            });
            return true;
        }
        return false;
    }
};

// Offline Management
const OfflineManager = {
    checkConnection() {
        return navigator.onLine;
    },
    
    saveOfflineOrder(order) {
        offlineOrders.push({
            ...order,
            offline: true,
            timestamp: Date.now()
        });
        localStorage.setItem('offlineOrders', JSON.stringify(offlineOrders));
        this.updateOfflineUI();
    },
    
    syncOfflineOrders() {
        if (!this.checkConnection()) return;
        
        if (offlineOrders.length > 0) {
            // Simular sincronización con el servidor
            offlineOrders.forEach(order => {
                if (order.offline) {
                    // Aquí iría la lógica para enviar al servidor
                    order.offline = false;
                    order.synced = true;
                    order.syncTime = new Date().toLocaleString();
                }
            });
            
            // Guardar los pedidos sincronizados
            const syncedOrders = offlineOrders.filter(order => order.synced);
            syncedOrders.forEach(order => {
                currentOrders.push(order);
            });
            
            // Actualizar localStorage
            localStorage.setItem('pawnOrders', JSON.stringify(currentOrders));
            localStorage.setItem('offlineOrders', JSON.stringify([]));
            
            // Actualizar tiempo de última sincronización
            lastSyncTime = new Date().toLocaleString();
            localStorage.setItem('lastSyncTime', lastSyncTime);
            
            offlineOrders = [];
            this.updateOfflineUI();
            
            // Mostrar notificación
            this.showSyncNotification(syncedOrders.length);
        }
    },
    
    showSyncNotification(count) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sincronización completada', {
                body: `${count} pedido(s) sincronizado(s) con éxito`,
                icon: '/icon-192.png'
            });
        }
    },
    
    updateOfflineUI() {
        const offlineBtn = document.getElementById('offlineModeBtn');
        const offlineCount = document.getElementById('offlineOrdersCount');
        const lastSync = document.getElementById('lastSyncTime');
        
        if (offlineBtn && offlineCount && lastSync) {
            offlineBtn.innerHTML = isOffline ? 
                `<i class="fas fa-wifi-slash"></i> Modo Offline (${offlineOrders.length})` :
                `<i class="fas fa-wifi"></i> Modo Online`;
            
            offlineBtn.classList.toggle('offline-mode', isOffline);
            offlineCount.textContent = offlineOrders.length;
            lastSync.textContent = lastSyncTime;
        }
    },
    
    toggleOfflineMode() {
        isOffline = !isOffline;
        this.updateOfflineUI();
        
        if (isOffline) {
            document.getElementById('offlineModal').classList.remove('hidden');
        }
    }
};

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM principales
    const form = document.getElementById('pawnSystemForm');
    const systemTitleInput = document.getElementById('systemTitle');
    const titleError = document.getElementById('titleError');
    const systemDescriptionInput = document.getElementById('systemDescription');
    const descriptionError = document.getElementById('descriptionError');
    const addToCartButton = document.getElementById('addToCart');
    const orderTemplate = document.getElementById('orderTemplate');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModalButton = document.getElementById('closeModal');
    const timeLimitSelect = document.getElementById('timeLimit');
    const timePriceSpan = document.getElementById('timePrice');
    
    // Elementos para la plantilla de pedido
    const orderInfo = document.querySelector('.order-info');
    const orderTotalPrice = document.getElementById('orderTotalPrice');
    
    // Botones de acción
    const confirmOrderButton = document.getElementById('confirmOrder');
    const editOrderButton = document.getElementById('editOrder');
    const deleteOrderButton = document.getElementById('deleteOrder');
    
    // Elementos del Panel Admin
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const mainContent = document.getElementById('mainContent');
    const adminPanel = document.getElementById('adminPanel');
    const adminLogin = document.getElementById('adminLogin');
    const adminMainPanel = document.getElementById('adminMainPanel');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginError = document.getElementById('adminLoginError');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminOrdersList = document.getElementById('adminOrdersList');
    
    // Elementos de Cache
    const cacheStatus = document.getElementById('cacheStatus');
    const adminCacheStatus = document.getElementById('adminCacheStatus');
    const cacheVersion = document.getElementById('cacheVersion');
    const cacheSize = document.getElementById('cacheSize');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const updateCacheBtn = document.getElementById('updateCacheBtn');
    const cacheModal = document.getElementById('cacheModal');
    const clearAllCacheBtn = document.getElementById('clearAllCacheBtn');
    const closeCacheModal = document.getElementById('closeCacheModal');
    const swStatus = document.getElementById('swStatus');
    const offlineStatus = document.getElementById('offlineStatus');
    const modalCacheVersion = document.getElementById('modalCacheVersion');
    const modalCacheSize = document.getElementById('modalCacheSize');
    
    // Elementos Offline
    const offlineModeBtn = document.getElementById('offlineModeBtn');
    const offlineModal = document.getElementById('offlineModal');
    const closeOfflineModal = document.getElementById('closeOfflineModal');
    
    // Modal Admin
    const adminOrderModal = document.getElementById('adminOrderModal');
    const adminOrderDetails = document.getElementById('adminOrderDetails');
    const adminCancelOrderBtn = document.getElementById('adminCancelOrderBtn');
    const adminCloseModalBtn = document.getElementById('adminCloseModalBtn');
    
    // Variables de estado
    let descriptionProvided = false;
    
    // Cargar pedidos existentes
    loadAdminOrders();
    
    // Inicializar estado de conexión
    updateConnectionStatus();
    
    // Inicializar UI offline
    OfflineManager.updateOfflineUI();
    
    // Función para generar un ID único
    function generateOrderId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
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
    
    // Función para guardar el pedido
    function saveOrder() {
        const title = systemTitleInput.value.trim();
        const description = systemDescriptionInput.value.trim();
        const systemType = document.querySelector('input[name="systemType"]:checked').value;
        const storageType = document.querySelector('input[name="storageType"]:checked').value;
        const timeLimit = timeLimitSelect.value;
        
        // Calcular precios
        const systemPrice = calculateDescriptionPrice(description);
        const typePrice = PRICES.TYPES[systemType] || 0;
        const storagePrice = PRICES.STORAGE[storageType] || 0;
        const timePrice = PRICES.TIME[timeLimit] || 0;
        const totalPrice = systemPrice + typePrice + storagePrice + timePrice;
        
        // Crear objeto del pedido
        const order = {
            id: generateOrderId(),
            title: title || 'Sistema Personalizado',
            description: description,
            systemType: systemType,
            storageType: storageType,
            timeLimit: timeLimit,
            totalPrice: totalPrice,
            date: new Date().toLocaleString(),
            status: 'active'
        };
        
        // Si estamos en modo offline, guardar localmente
        if (isOffline) {
            OfflineManager.saveOfflineOrder(order);
            alert('Pedido guardado en modo offline. Se sincronizará cuando haya conexión.');
        } else {
            // Agregar a la lista de pedidos
            currentOrders.push(order);
            
            // Guardar en localStorage
            localStorage.setItem('pawnOrders', JSON.stringify(currentOrders));
            
            // Actualizar la lista en el panel admin
            loadAdminOrders();
        }
        
        return order;
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
    
    // ========== FUNCIONES DE CACHE ==========
    
    async function updateCacheStatus() {
        if (!CacheManager.isSupported) {
            cacheStatus.innerHTML = '<i class="fas fa-times-circle"></i> Cache no soportado';
            cacheStatus.className = 'cache-offline';
            return;
        }
        
        try {
            const cacheInfo = await CacheManager.getCacheInfo();
            
            if (cacheInfo) {
                cacheStatus.innerHTML = `<i class="fas fa-check-circle"></i> Cache activo (v${cacheInfo.version})`;
                cacheStatus.className = 'cache-online';
                
                // Actualizar info en panel admin
                if (adminCacheStatus) {
                    adminCacheStatus.textContent = 'Activo';
                    adminCacheStatus.style.color = '#00ff88';
                }
                if (cacheVersion) cacheVersion.textContent = cacheInfo.version;
                if (cacheSize) cacheSize.textContent = cacheInfo.cacheSize;
                
                // Actualizar info en modal
                if (swStatus) swStatus.textContent = 'Registrado';
                if (modalCacheVersion) modalCacheVersion.textContent = cacheInfo.version;
                if (modalCacheSize) modalCacheSize.textContent = cacheInfo.cacheSize;
            } else {
                cacheStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Cache no inicializado';
                cacheStatus.className = 'cache-offline';
            }
        } catch (error) {
            console.error('Error obteniendo info del cache:', error);
            cacheStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error de cache';
            cacheStatus.className = 'cache-offline';
        }
    }
    
    function updateConnectionStatus() {
        const isOnline = navigator.onLine;
        
        if (offlineStatus) {
            offlineStatus.textContent = isOnline ? 'No' : 'Sí';
            offlineStatus.style.color = isOnline ? '#00ff88' : '#ffaa00';
        }
        
        // Si volvemos a tener conexión, sincronizar pedidos offline
        if (isOnline && offlineOrders.length > 0) {
            setTimeout(() => {
                OfflineManager.syncOfflineOrders();
            }, 2000);
        }
    }
    
    // ========== FUNCIONES DEL PANEL ADMIN ==========
    
    // Función para alternar entre vista normal y admin
    function toggleAdminPanel() {
        if (mainContent.classList.contains('hidden')) {
            // Volver a vista normal
            mainContent.classList.remove('hidden');
            adminPanel.classList.add('hidden');
            adminToggleBtn.innerHTML = '<i class="fas fa-user-shield"></i> Panel Admin';
        } else {
            // Ir a vista admin
            mainContent.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            adminToggleBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
            
            // Resetear login
            adminLogin.classList.remove('hidden');
            adminMainPanel.classList.add('hidden');
            adminUsernameInput.value = '';
            adminPasswordInput.value = '';
            adminLoginError.textContent = '';
            
            // Actualizar info de cache
            updateCacheStatus();
        }
    }
    
    // Función para iniciar sesión admin
    function adminLoginFunction() {
        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();
        
        if (username === 'admin' && password === '0292') {
            // Login exitoso
            adminLogin.classList.add('hidden');
            adminMainPanel.classList.remove('hidden');
            adminLoginError.textContent = '';
            
            // Actualizar info de cache
            updateCacheStatus();
        } else {
            // Login fallido
            adminLoginError.textContent = 'Usuario o contraseña incorrectos';
            adminUsernameInput.classList.add('error');
            adminPasswordInput.classList.add('error');
        }
    }
    
    // Función para cerrar sesión admin
    function adminLogoutFunction() {
        adminLogin.classList.remove('hidden');
        adminMainPanel.classList.add('hidden');
        adminUsernameInput.value = '';
        adminPasswordInput.value = '';
        adminLoginError.textContent = '';
    }
    
    // Función para cargar pedidos en el panel admin
    function loadAdminOrders() {
        adminOrdersList.innerHTML = '';
        
        if (currentOrders.length === 0) {
            adminOrdersList.innerHTML = `
                <div class="no-orders-message">
                    <i class="fas fa-inbox"></i>
                    <p>No hay pedidos activos en este momento</p>
                </div>
            `;
            return;
        }
        
        // Filtrar solo pedidos activos
        const activeOrders = currentOrders.filter(order => order.status === 'active');
        
        if (activeOrders.length === 0) {
            adminOrdersList.innerHTML = `
                <div class="no-orders-message">
                    <i class="fas fa-inbox"></i>
                    <p>No hay pedidos activos en este momento</p>
                </div>
            `;
            return;
        }
        
        // Crear elementos para cada pedido
        activeOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'admin-order-item';
            orderElement.dataset.orderId = order.id;
            
            orderElement.innerHTML = `
                <div class="admin-order-header">
                    <div class="admin-order-title">
                        <i class="fas fa-file-alt"></i>
                        <span>${order.title}</span>
                    </div>
                    <div class="admin-order-price">$${order.totalPrice.toFixed(2)}</div>
                </div>
                <div class="admin-order-info">
                    <div class="admin-order-date">
                        <i class="fas fa-calendar"></i>
                        ${order.date}
                    </div>
                    <div class="admin-order-status status-active">
                        <i class="fas fa-circle"></i>
                        Activo
                    </div>
                </div>
            `;
            
            adminOrdersList.appendChild(orderElement);
        });
    }
    
    // Función para mostrar detalles del pedido en modal admin
    function showAdminOrderDetails(orderId) {
        const order = currentOrders.find(o => o.id === orderId);
        
        if (!order) {
            alert('Pedido no encontrado');
            return;
        }
        
        currentOrderId = orderId;
        
        // Construir HTML de detalles
        adminOrderDetails.innerHTML = `
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-heading"></i> Título:</strong>
                <span>${order.title}</span>
            </div>
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-align-left"></i> Descripción:</strong>
                <p class="admin-order-description">${order.description}</p>
            </div>
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-cogs"></i> Tipo de sistema:</strong>
                <span>${order.systemType}</span>
            </div>
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-database"></i> Almacenamiento:</strong>
                <span>${order.storageType}</span>
            </div>
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-clock"></i> Tiempo de entrega:</strong>
                <span>${order.timeLimit} días</span>
            </div>
            <div class="admin-order-detail-item">
                <strong><i class="fas fa-calendar"></i> Fecha del pedido:</strong>
                <span>${order.date}</span>
            </div>
            <div class="admin-order-detail-item total-price">
                <strong><i class="fas fa-money-bill-wave"></i> Precio total:</strong>
                <span class="admin-total-price">$${order.totalPrice.toFixed(2)}</span>
            </div>
        `;
        
        adminOrderModal.classList.remove('hidden');
    }
    
    // Función para cancelar un pedido
    function cancelOrder(orderId) {
        if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
            return;
        }
        
        // Encontrar el pedido y marcarlo como cancelado
        const orderIndex = currentOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            currentOrders[orderIndex].status = 'cancelled';
            localStorage.setItem('pawnOrders', JSON.stringify(currentOrders));
            
            // Cerrar modal y actualizar lista
            adminOrderModal.classList.add('hidden');
            loadAdminOrders();
            
            alert('Pedido cancelado exitosamente');
        }
    }
    
    // ========== EVENT LISTENERS PRINCIPALES ==========
    
    // Validación de título
    systemTitleInput.addEventListener('input', function() {
        validateTitle();
        titleError.textContent = '';
    });
    
    // Validación de descripción
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
    
    // Botón "Agregar al carrito"
    addToCartButton.addEventListener('click', function(e) {
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
        // Validar que la descripción esté presente (ya debería estar validado)
        if (!descriptionProvided) {
            alert('Error: La descripción es obligatoria para confirmar el pedido.');
            return;
        }
        
        // Guardar el pedido
        saveOrder();
        
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
    
    // Cerrar modal de confirmación
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
    
    // ========== EVENT LISTENERS DEL PANEL ADMIN ==========
    
    // Botón para alternar panel admin
    adminToggleBtn.addEventListener('click', toggleAdminPanel);
    
    // Botón de login admin
    adminLoginBtn.addEventListener('click', adminLoginFunction);
    
    // Permitir login con Enter
    adminPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adminLoginFunction();
        }
    });
    
    // Botón de logout admin
    adminLogoutBtn.addEventListener('click', adminLogoutFunction);
    
    // Clic en un pedido de la lista
    adminOrdersList.addEventListener('click', function(e) {
        const orderItem = e.target.closest('.admin-order-item');
        if (orderItem) {
            const orderId = orderItem.dataset.orderId;
            showAdminOrderDetails(orderId);
        }
    });
    
    // Botón para cancelar pedido en modal
    adminCancelOrderBtn.addEventListener('click', function() {
        if (currentOrderId) {
            cancelOrder(currentOrderId);
        }
    });
    
    // Botón para cerrar modal admin
    adminCloseModalBtn.addEventListener('click', function() {
        adminOrderModal.classList.add('hidden');
        currentOrderId = null;
    });
    
    // Cerrar modal admin haciendo clic fuera
    adminOrderModal.addEventListener('click', function(e) {
        if (e.target === adminOrderModal) {
            adminOrderModal.classList.add('hidden');
            currentOrderId = null;
        }
    });
    
    // ========== EVENT LISTENERS DE CACHE ==========
    
    // Botón para limpiar cache
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', async function() {
            if (confirm('¿Estás seguro de que quieres limpiar todo el cache? Esto mejorará la carga de nuevas actualizaciones.')) {
                const success = await CacheManager.clearCache();
                if (success) {
                    alert('Cache limpiado exitosamente. La página se recargará.');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    alert('Error al limpiar el cache.');
                }
            }
        });
    }
    
    // Botón para actualizar cache
    if (updateCacheBtn) {
        updateCacheBtn.addEventListener('click', async function() {
            const success = await CacheManager.updateCache();
            if (success) {
                alert('Cache actualizado. Verificando cambios...');
                updateCacheStatus();
            }
        });
    }
    
    // Botón para mostrar modal de cache
    if (clearAllCacheBtn) {
        clearAllCacheBtn.addEventListener('click', function() {
            cacheModal.classList.remove('hidden');
        });
    }
    
    // Cerrar modal de cache
    if (closeCacheModal) {
        closeCacheModal.addEventListener('click', function() {
            cacheModal.classList.add('hidden');
        });
    }
    
    // Cerrar modal de cache haciendo clic fuera
    if (cacheModal) {
        cacheModal.addEventListener('click', function(e) {
            if (e.target === cacheModal) {
                cacheModal.classList.add('hidden');
            }
        });
    }
    
    // ========== EVENT LISTENERS OFFLINE ==========
    
    // Botón modo offline
    if (offlineModeBtn) {
        offlineModeBtn.addEventListener('click', function() {
            OfflineManager.toggleOfflineMode();
        });
    }
    
    // Cerrar modal offline
    if (closeOfflineModal) {
        closeOfflineModal.addEventListener('click', function() {
            offlineModal.classList.add('hidden');
        });
    }
    
    // Cerrar modal offline haciendo clic fuera
    if (offlineModal) {
        offlineModal.addEventListener('click', function(e) {
            if (e.target === offlineModal) {
                offlineModal.classList.add('hidden');
            }
        });
    }
    
    // ========== LISTENERS DE CONEXIÓN ==========
    
    // Escuchar cambios en la conexión
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // ========== INICIALIZACIÓN ==========
    
    // Inicializar validación de título
    validateTitle();
    
    // Inicializar validación de descripción
    validateDescription();
    
    // Inicializar precio del tiempo
    updateTimePrice();
    
    // Inicializar estado del cache
    setTimeout(() => {
        updateCacheStatus();
    }, 1000);
    
    // Actualizar estado de conexión
    updateConnectionStatus();
});