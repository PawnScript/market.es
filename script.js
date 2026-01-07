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

// Configuración de correos
const EMAIL_CONFIG = {
    ADMIN_EMAIL: 'branlycastromoreno@gmail.com',
    SUBJECT_PREFIX: '📋 Pedido Pawn System - '
};

// Variables globales
let currentOrders = JSON.parse(localStorage.getItem('pawnOrders')) || [];
let currentOrderId = null;

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM principales
    const form = document.getElementById('pawnSystemForm');
    const userEmailInput = document.getElementById('userEmail');
    const emailError = document.getElementById('emailError');
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
    const emailInfoBtn = document.getElementById('emailInfoBtn');
    const emailInfoModal = document.getElementById('emailInfoModal');
    const closeEmailInfoModal = document.getElementById('closeEmailInfoModal');
    
    // Elementos para la plantilla de pedido
    const orderInfo = document.querySelector('.order-info');
    const orderTotalPrice = document.getElementById('orderTotalPrice');
    
    // Botones de acción
    const confirmOrderButton = document.getElementById('confirmOrder');
    const editOrderButton = document.getElementById('editOrder');
    const deleteOrderButton = document.getElementById('deleteOrder');
    
    // Variables de estado
    let descriptionProvided = false;
    
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
    
    // Función para validar correo electrónico
    function validateEmail() {
        const email = userEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            userEmailInput.classList.add('error');
            return false;
        } else if (!emailRegex.test(email)) {
            userEmailInput.classList.add('error');
            return false;
        } else {
            userEmailInput.classList.remove('error');
            return true;
        }
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
            return false;
        } else if (description.length < 10) {
            systemDescriptionInput.classList.add('error');
            return false;
        } else {
            systemDescriptionInput.classList.remove('error');
            return true;
        }
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
    
    // Función para enviar pedido por correo (simulación)
    function sendOrderEmail(order, userEmail) {
        // En un entorno real, aquí se implementaría el envío real de correos
        // Por ahora, simularemos el envío mostrando un mensaje en consola
        
        const adminEmailContent = `
            📋 NUEVO PEDIDO PAWN SYSTEM 📋
            
            ID del Pedido: ${order.id}
            Fecha: ${new Date().toLocaleString()}
            
            👤 INFORMACIÓN DEL CLIENTE:
            Correo: ${userEmail}
            
            📝 DETALLES DEL PEDIDO:
            Título: ${order.title}
            Descripción: ${order.description}
            Tipo de Sistema: ${order.systemType}
            Almacenamiento: ${order.storageType}
            Tiempo de Entrega: ${order.timeLimit} días
            Precio Total: $${order.totalPrice.toFixed(2)}
            
            -------------------------------
            Este pedido fue generado desde Pawn Systems Market
        `;
        
        const userEmailContent = `
            ✅ CONFIRMACIÓN DE PEDIDO ✅
            
            ¡Gracias por tu pedido en Pawn Systems Market!
            
            ID del Pedido: ${order.id}
            Fecha: ${new Date().toLocaleString()}
            
            📝 RESUMEN DE TU PEDIDO:
            Título: ${order.title}
            Tipo de Sistema: ${order.systemType}
            Almacenamiento: ${order.storageType}
            Tiempo de Entrega: ${order.timeLimit} días
            Precio Total: $${order.totalPrice.toFixed(2)}
            
            ⏳ PRÓXIMOS PASOS:
            1. Nuestros programadores revisarán tu pedido
            2. Te contactaremos en las próximas 24 horas
            3. Coordinaremos los detalles del desarrollo
            4. Comenzaremos a trabajar en tu sistema Pawn
            
            📧 Contacto: branlycastromoreno@gmail.com
            
            -------------------------------
            Pawn Systems Market - Especialistas en desarrollo para SA-MP
        `;
        
        // Simulación de envío (en producción se usaría EmailJS, SMTP, etc.)
        console.log('📧 Enviando correo al administrador:', EMAIL_CONFIG.ADMIN_EMAIL);
        console.log('Contenido del correo al admin:', adminEmailContent);
        
        console.log('📧 Enviando correo al usuario:', userEmail);
        console.log('Contenido del correo al usuario:', userEmailContent);
        
        // Aquí iría el código real para enviar el correo
        // Ejemplo con EmailJS:
        /*
        emailjs.send('service_id', 'template_id', {
            to_email: EMAIL_CONFIG.ADMIN_EMAIL,
            from_email: userEmail,
            subject: EMAIL_CONFIG.SUBJECT_PREFIX + order.title,
            message: adminEmailContent
        });
        
        emailjs.send('service_id', 'template_id', {
            to_email: userEmail,
            from_email: EMAIL_CONFIG.ADMIN_EMAIL,
            subject: '✅ Confirmación de Pedido - ' + order.title,
            message: userEmailContent
        });
        */
        
        return true;
    }
    
    // Función para mostrar la plantilla de pedido
    function showOrderTemplate() {
        // Obtener valores del formulario
        const userEmail = userEmailInput.value.trim();
        let title = systemTitleInput.value.trim();
        let description = systemDescriptionInput.value.trim();
        const systemType = document.querySelector('input[name="systemType"]:checked').value;
        const storageType = document.querySelector('input[name="storageType"]:checked').value;
        const timeLimit = timeLimitSelect.value;
        
        // Validar correo
        if (!validateEmail()) {
            alert('Por favor, ingresa un correo electrónico válido');
            userEmailInput.focus();
            return;
        }
        
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
        
        // 1. Correo electrónico
        orderInfo.appendChild(createOrderItem(
            '<i class="fas fa-envelope"></i> Correo electrónico',
            userEmail,
            0.00
        ));
        
        // 2. Sistema personalizado
        orderInfo.appendChild(createOrderItem(
            '<i class="fas fa-code"></i> Sistema personalizado',
            title,
            systemPrice,
            description.substring(0, 100) + (description.length > 100 ? '...' : '')
        ));
        
        // 3. Tipo de sistema
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
        
        // 4. Almacenamiento
        const storageNames = {
            'mysql': 'MySQL',
            'file': 'Archivos .txt'
        };
        orderInfo.appendChild(createOrderItem(
            '<i class="fas fa-database"></i> Almacenamiento',
            storageNames[storageType],
            storagePrice
        ));
        
        // 5. Tiempo de entrega
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
    
    // Función para guardar y enviar el pedido
    function saveAndSendOrder() {
        const userEmail = userEmailInput.value.trim();
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
            userEmail: userEmail,
            title: title || 'Sistema Personalizado',
            description: description,
            systemType: systemType,
            storageType: storageType,
            timeLimit: timeLimit,
            totalPrice: totalPrice,
            date: new Date().toLocaleString(),
            status: 'active'
        };
        
        // Agregar a la lista de pedidos (local storage)
        currentOrders.push(order);
        localStorage.setItem('pawnOrders', JSON.stringify(currentOrders));
        
        // Enviar pedido por correo
        const emailSent = sendOrderEmail(order, userEmail);
        
        if (emailSent) {
            // Mostrar modal de confirmación
            confirmationModal.classList.remove('hidden');
            
            // Resetear formulario
            resetForm();
        } else {
            alert('Hubo un error al enviar el pedido. Por favor, intenta de nuevo.');
        }
        
        return order;
    }
    
    // Función para resetear el formulario
    function resetForm() {
        form.reset();
        emailError.textContent = '';
        titleError.textContent = '';
        descriptionError.textContent = '';
        userEmailInput.classList.remove('error');
        systemTitleInput.classList.remove('error');
        systemDescriptionInput.classList.remove('error');
        descriptionProvided = false;
        orderTemplate.classList.add('hidden');
        updateTimePrice(); // Actualizar precio del tiempo
    }
    
    // Función para mostrar modal de información del correo
    function showEmailInfoModal() {
        emailInfoModal.classList.remove('hidden');
    }
    
    // ========== EVENT LISTENERS PRINCIPALES ==========
    
    // Validación de correo
    userEmailInput.addEventListener('input', function() {
        validateEmail();
        emailError.textContent = '';
    });
    
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
    
    // Botón de información del correo
    emailInfoBtn.addEventListener('click', showEmailInfoModal);
    
    // Cerrar modal de información del correo
    closeEmailInfoModal.addEventListener('click', function() {
        emailInfoModal.classList.add('hidden');
    });
    
    // Cerrar modal de información del correo haciendo clic fuera
    emailInfoModal.addEventListener('click', function(e) {
        if (e.target === emailInfoModal) {
            emailInfoModal.classList.add('hidden');
        }
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validaciones
        const isEmailValid = validateEmail();
        const isTitleValid = validateTitle();
        const isDescriptionValid = validateDescription();
        
        // Verificar si hay errores
        if (!isEmailValid) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
            alert('Por favor, ingresa un correo electrónico válido.');
            userEmailInput.focus();
            return;
        }
        
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
    
    // Botón "Enviar pedido"
    addToCartButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validaciones
        const isEmailValid = validateEmail();
        const isTitleValid = validateTitle();
        const isDescriptionValid = validateDescription();
        
        // Verificar si hay errores
        if (!isEmailValid) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
            alert('Por favor, ingresa un correo electrónico válido.');
            userEmailInput.focus();
            return;
        }
        
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
        
        // Validar correo
        if (!validateEmail()) {
            alert('Por favor, ingresa un correo electrónico válido antes de confirmar el pedido.');
            userEmailInput.focus();
            return;
        }
        
        // Guardar y enviar el pedido
        saveAndSendOrder();
    });
    
    // Editar pedido
    editOrderButton.addEventListener('click', function() {
        // Ocultar plantilla y desplazar hacia el formulario
        orderTemplate.classList.add('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Eliminar pedido
    deleteOrderButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cancelar este pedido? Se perderán todos los datos.')) {
            resetForm();
        }
    });
    
    // Cerrar modal de confirmación
    closeModalButton.addEventListener('click', function() {
        confirmationModal.classList.add('hidden');
    });
    
    // Cerrar modal haciendo clic fuera de él
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            confirmationModal.classList.add('hidden');
        }
    });
    
    // ========== INICIALIZACIÓN ==========
    
    // Inicializar validación de correo
    validateEmail();
    
    // Inicializar validación de título
    validateTitle();
    
    // Inicializar validación de descripción
    validateDescription();
    
    // Inicializar precio del tiempo
    updateTimePrice();
});