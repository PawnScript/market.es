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

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
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
    
    // Variables de estado
    let descriptionProvided = false;
    
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
    
    // Event listeners
    systemTitleInput.addEventListener('input', function() {
        validateTitle();
        titleError.textContent = '';
    });
    
    systemDescriptionInput.addEventListener('input', function() {
        validateDescription();
        descriptionError.textContent = '';
    });
    
    timeLimitSelect.addEventListener('change', updateTimePrice);
    
    // Envío del formulario - FIXED
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
    
    // También asegurarnos que el botón del carrito funcione
    addToCartButton.addEventListener('click', function(e) {
        // Prevenir el comportamiento por defecto
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
    
    // Inicializar validación de título
    validateTitle();
    
    // Inicializar validación de descripción
    validateDescription();
    
    // Inicializar precio del tiempo
    updateTimePrice();
});