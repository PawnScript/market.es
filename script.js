// Variables globales
let textdraws = [];
let nextId = 1;
let isDragging = false;
let currentDraggedElement = null;
let selectedElement = null;
let isMenuOpen = false;
let isEditing = false;
let floatingButtonPos = { x: window.innerWidth - 80, y: 20 };

// Elementos DOM globales
let startScreen, startButton, mainContainer, floatingButton, menuContainer;
let createElementBtn, textContent, textColor, textColorPreview, textType;
let textContentGroup, textSizeX, textSizeY, textSizeXValue, textSizeYValue;
let workspace, elementsList, noElements, menuTabs, tabPanels, searchElements;
let exportBtn, clearAllBtn, editPanel, closeEditBtn, saveEditBtn, deleteEditBtn;
let editTextContent, editTextColor, editTextColorPreview, editShadowSize;
let viewMode, gameView;

// Inicialización
function init() {
    // Referencias a elementos DOM
    startScreen = document.getElementById('startScreen');
    startButton = document.getElementById('startButton');
    mainContainer = document.getElementById('mainContainer');
    floatingButton = document.getElementById('floatingButton');
    menuContainer = document.getElementById('menuContainer');
    createElementBtn = document.getElementById('createElementBtn');
    textContent = document.getElementById('textContent');
    textColor = document.getElementById('textColor');
    textColorPreview = document.getElementById('textColorPreview');
    textType = document.getElementById('textType');
    textContentGroup = document.getElementById('textContentGroup');
    textSizeX = document.getElementById('textSizeX');
    textSizeY = document.getElementById('textSizeY');
    textSizeXValue = document.getElementById('textSizeXValue');
    textSizeYValue = document.getElementById('textSizeYValue');
    workspace = document.getElementById('workspace');
    elementsList = document.getElementById('elementsList');
    noElements = document.getElementById('noElements');
    menuTabs = document.querySelectorAll('.menu-tab');
    tabPanels = document.querySelectorAll('.tab-panel');
    searchElements = document.getElementById('searchElements');
    exportBtn = document.getElementById('exportBtn');
    clearAllBtn = document.getElementById('clearAllBtn');
    editPanel = document.getElementById('editPanel');
    closeEditBtn = document.getElementById('closeEditBtn');
    saveEditBtn = document.getElementById('saveEditBtn');
    deleteEditBtn = document.getElementById('deleteEditBtn');
    editTextContent = document.getElementById('editTextContent');
    editTextColor = document.getElementById('editTextColor');
    editTextColorPreview = document.getElementById('editTextColorPreview');
    editShadowSize = document.getElementById('editShadowSize');
    viewMode = document.getElementById('viewMode');
    gameView = document.getElementById('gameView');

    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar valores
    textColorPreview.style.backgroundColor = textColor.value;
    editTextColorPreview.style.backgroundColor = editTextColor.value;
    
    // Posicionar botón flotante
    floatingButton.style.left = `${floatingButtonPos.x}px`;
    floatingButton.style.top = `${floatingButtonPos.y}px`;
}

// Configurar event listeners
function setupEventListeners() {
    // Mostrar/ocultar campos según el tipo seleccionado
    textType.addEventListener('change', function() {
        textContentGroup.style.display = this.value === 'text' ? 'block' : 'none';
    });

    // Actualizar vista previa de color
    textColor.addEventListener('input', function() {
        textColorPreview.style.backgroundColor = this.value;
    });

    // Actualizar valores de tamaño
    textSizeX.addEventListener('input', function() {
        textSizeXValue.textContent = parseFloat(this.value).toFixed(2);
    });

    textSizeY.addEventListener('input', function() {
        textSizeYValue.textContent = parseFloat(this.value).toFixed(2);
    });

    // Iniciar editor
    startButton.addEventListener('click', startEditor);

    // Botón flotante - arrastrar
    floatingButton.addEventListener('mousedown', startDrag);
    floatingButton.addEventListener('touchstart', startDragTouch, { passive: false });

    // Botón flotante - mostrar/ocultar menú
    floatingButton.addEventListener('click', toggleMenuClick, true);

    // Cambiar pestañas del menú
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    // Crear nuevo elemento
    createElementBtn.addEventListener('click', createTextDraw);

    // Buscar elementos
    searchElements.addEventListener('input', function() {
        updateElementsList(this.value);
    });

    // Exportar textdraws
    exportBtn.addEventListener('click', exportTextDraws);

    // Limpiar todos los elementos
    clearAllBtn.addEventListener('click', clearAllElements);

    // Cambiar modo de visualización
    viewMode.addEventListener('change', changeViewMode);

    // Funciones del panel de edición
    closeEditBtn.addEventListener('click', closeEditPanel);
    saveEditBtn.addEventListener('click', saveEditChanges);
    deleteEditBtn.addEventListener('click', deleteSelectedElement);

    // Actualizar vista previa de color en edición
    editTextColor.addEventListener('input', function() {
        editTextColorPreview.style.backgroundColor = this.value;
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', handleDocumentClick);

    // Manejar tecla Escape
    document.addEventListener('keydown', handleKeyDown);

    // Redimensionar ventana
    window.addEventListener('resize', handleResize);
}

// Funciones principales
function startEditor() {
    startScreen.classList.add('fade-out');
    setTimeout(() => {
        startScreen.style.display = 'none';
        mainContainer.style.display = 'block';
    }, 800);
}

function toggleMenuClick(e) {
    e.stopPropagation();
    e.preventDefault();
    toggleMenu();
}

function toggleMenu() {
    if (menuContainer.style.display === 'block') {
        menuContainer.style.display = 'none';
        isMenuOpen = false;
    } else {
        menuContainer.style.display = 'block';
        isMenuOpen = true;
        // Cambiar a pestaña de crear
        switchTab('create');
    }
}

function switchTab(tabId) {
    // Actualizar pestañas activas
    menuTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.menu-tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Mostrar panel correspondiente
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabId}-panel`).classList.add('active');
    
    // Si es la pestaña de creados, actualizar la lista
    if (tabId === 'created') {
        updateElementsList();
    }
}

function createTextDraw() {
    const text = textContent.value || "Nuevo Texto";
    const color = textColor.value;
    const shadowSize = document.getElementById('shadowSize').value;
    const outlineSize = document.getElementById('outlineSize').value;
    const fontStyle = document.getElementById('fontStyle').value;
    const alignment = document.getElementById('textAlignment').value;
    const sizeX = parseFloat(textSizeX.value);
    const sizeY = parseFloat(textSizeY.value);
    const type = textType.value;
    
    // Posición inicial (centro de la pantalla)
    const centerX = (window.innerWidth / 2) - 50;
    const centerY = (window.innerHeight / 2) - 20;
    
    // Crear elemento
    const elementId = `textdraw-${nextId}`;
    const textdrawElement = createTextDrawElement(type, text, color, shadowSize, outlineSize, sizeX, sizeY);
    textdrawElement.id = elementId;
    textdrawElement.style.left = `${centerX}px`;
    textdrawElement.style.top = `${centerY}px`;
    
    // Hacer elemento arrastrable
    setupElementDragging(textdrawElement);
    
    // Añadir al área de trabajo
    workspace.appendChild(textdrawElement);
    
    // Guardar en array
    textdraws.push({
        id: nextId,
        elementId: elementId,
        type: type,
        text: text,
        color: color,
        shadowSize: shadowSize,
        outlineSize: outlineSize,
        fontStyle: fontStyle,
        alignment: alignment,
        sizeX: sizeX,
        sizeY: sizeY,
        x: centerX,
        y: centerY
    });
    
    nextId++;
    
    // Actualizar lista de elementos
    updateElementsList();
    
    // Seleccionar el nuevo elemento
    selectElement(textdrawElement);
    
    // Cerrar menú si está abierto
    toggleMenu();
}

function createTextDrawElement(type, text, color, shadowSize, outlineSize, sizeX, sizeY) {
    const element = document.createElement('div');
    element.className = 'textdraw-element';
    
    switch(type) {
        case 'text':
            element.innerHTML = `<div class="textdraw-text" style="color: ${color}; font-size: ${24 * sizeY}px; text-shadow: ${shadowSize}px ${shadowSize}px ${shadowSize}px rgba(0,0,0,0.8);">${text}</div>`;
            break;
        case 'box':
            element.innerHTML = `<div style="width: 200px; height: 100px; background-color: ${color}; opacity: 0.7; border: ${outlineSize}px solid #fff;"></div>`;
            break;
        case 'preview-model':
            element.innerHTML = `<div style="width: 150px; height: 150px; background: linear-gradient(45deg, #333, #555); border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; color: ${color};"><i class="fas fa-cube" style="font-size: 40px;"></i></div>`;
            break;
        case 'sprite':
            element.innerHTML = `<div style="width: 100px; height: 100px; background-color: ${color}; border: 2px dashed #fff; display: flex; align-items: center; justify-content: center; color: white;"><i class="fas fa-image" style="font-size: 30px;"></i></div>`;
            break;
    }
    
    return element;
}

function setupElementDragging(element) {
    element.addEventListener('mousedown', startElementDrag);
    element.addEventListener('touchstart', startElementDragTouch, { passive: false });
    element.addEventListener('click', function(e) {
        e.stopPropagation();
        selectElement(element);
    });
}

function updateElementsList(filter = '') {
    elementsList.innerHTML = '';
    
    const filteredTextdraws = textdraws.filter(td => 
        td.text.toLowerCase().includes(filter.toLowerCase()) ||
        td.type.toLowerCase().includes(filter.toLowerCase())
    );
    
    if (filteredTextdraws.length === 0) {
        elementsList.appendChild(noElements);
        noElements.style.display = 'block';
        return;
    }
    
    noElements.style.display = 'none';
    
    filteredTextdraws.forEach(td => {
        const elementItem = createElementListItem(td);
        elementsList.appendChild(elementItem);
    });
    
    // Añadir eventos a los botones de acción
    attachElementActions();
}

function createElementListItem(td) {
    const elementItem = document.createElement('div');
    elementItem.className = 'element-item';
    elementItem.dataset.id = td.id;
    
    let typeText = '';
    switch(td.type) {
        case 'text': typeText = 'Texto'; break;
        case 'box': typeText = 'Caja'; break;
        case 'preview-model': typeText = 'Modelo'; break;
        case 'sprite': typeText = 'Sprite'; break;
    }
    
    elementItem.innerHTML = `
        <div class="element-info">
            <div>${td.text.substring(0, 20)}${td.text.length > 20 ? '...' : ''}</div>
            <div class="element-type">${typeText} - (${Math.round(td.x)}, ${Math.round(td.y)})</div>
        </div>
        <div class="element-actions">
            <button class="action-btn edit-btn" title="Editar" data-id="${td.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn move-btn" title="Mover" data-id="${td.id}">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="action-btn delete-btn" title="Eliminar" data-id="${td.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return elementItem;
}

function attachElementActions() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            editElement(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.move-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            moveToElement(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteElement(parseInt(this.getAttribute('data-id')));
        });
    });
}

function selectElement(element) {
    // Deseleccionar elemento anterior
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    
    // Seleccionar nuevo elemento
    element.classList.add('selected');
    selectedElement = element;
    
    // Obtener datos del textdraw
    const id = parseInt(element.id.replace('textdraw-', ''));
    const td = textdraws.find(t => t.id === id);
    
    if (td) {
        // Mostrar panel de edición
        showEditPanel(td);
    }
}

function showEditPanel(td) {
    editPanel.style.display = 'block';
    isEditing = true;
    
    // Cargar datos en el formulario de edición
    editTextContent.value = td.text;
    editTextColor.value = td.color;
    editTextColorPreview.style.backgroundColor = td.color;
    editShadowSize.value = td.shadowSize;
}

function editElement(id) {
    const td = textdraws.find(t => t.id === id);
    if (td) {
        const element = document.getElementById(td.elementId);
        selectElement(element);
        toggleMenu();
    }
}

function moveToElement(id) {
    const td = textdraws.find(t => t.id === id);
    if (td) {
        const element = document.getElementById(td.elementId);
        selectElement(element);
        toggleMenu();
        
        // Scroll suave a la posición del elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
}

function saveEditChanges() {
    if (!selectedElement) return;
    
    const id = parseInt(selectedElement.id.replace('textdraw-', ''));
    const tdIndex = textdraws.findIndex(t => t.id === id);
    
    if (tdIndex !== -1) {
        // Actualizar datos
        textdraws[tdIndex].text = editTextContent.value;
        textdraws[tdIndex].color = editTextColor.value;
        textdraws[tdIndex].shadowSize = editShadowSize.value;
        
        // Actualizar elemento visual
        const td = textdraws[tdIndex];
        if (td.type === 'text') {
            selectedElement.innerHTML = `<div class="textdraw-text" style="color: ${td.color}; font-size: ${24 * td.sizeY}px; text-shadow: ${td.shadowSize}px ${td.shadowSize}px ${td.shadowSize}px rgba(0,0,0,0.8);">${td.text}</div>`;
        }
        
        // Actualizar lista
        updateElementsList();
    }
}

function deleteSelectedElement() {
    if (!selectedElement) return;
    const id = parseInt(selectedElement.id.replace('textdraw-', ''));
    deleteElement(id);
}

function deleteElement(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
        const tdIndex = textdraws.findIndex(t => t.id === id);
        
        if (tdIndex !== -1) {
            // Eliminar elemento visual
            const element = document.getElementById(textdraws[tdIndex].elementId);
            if (element) element.remove();
            
            // Eliminar del array
            textdraws.splice(tdIndex, 1);
            
            // Actualizar lista
            updateElementsList();
            
            // Cerrar panel de edición si estaba abierto
            if (selectedElement && selectedElement.id === `textdraw-${id}`) {
                closeEditPanel();
            }
        }
    }
}

function closeEditPanel() {
    editPanel.style.display = 'none';
    isEditing = false;
    
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
}

function exportTextDraws() {
    if (textdraws.length === 0) {
        alert('No hay textdraws para exportar.');
        return;
    }
    
    const format = document.getElementById('exportFormat').value;
    let exportContent = '';
    
    if (format === 'pawn') {
        exportContent = generatePawnCode();
    } else if (format === 'json') {
        exportContent = JSON.stringify(textdraws, null, 2);
    } else {
        exportContent = generatePlainText();
    }
    
    downloadFile(exportContent, format);
    alert(`Se exportaron ${textdraws.length} textdraw(s) correctamente.`);
}

function generatePawnCode() {
    let code = `// TextDraws generados por el editor\n`;
    code += `// Cantidad: ${textdraws.length}\n\n`;
    
    textdraws.forEach((td, index) => {
        code += `// TextDraw ${index + 1}\n`;
        code += `TextDraw${index + 1} = TextDrawCreate(${td.x.toFixed(2)}, ${td.y.toFixed(2)}, "${td.text}");\n`;
        code += `TextDrawColor(TextDraw${index + 1}, ${hexToRgba(td.color)});\n`;
        code += `TextDrawFont(TextDraw${index + 1}, ${td.fontStyle});\n`;
        code += `TextDrawSetShadow(TextDraw${index + 1}, ${td.shadowSize});\n`;
        code += `TextDrawSetOutline(TextDraw${index + 1}, ${td.outlineSize});\n`;
        
        if (td.alignment === 'center') {
            code += `TextDrawAlignment(TextDraw${index + 1}, 2);\n`;
        } else if (td.alignment === 'right') {
            code += `TextDrawAlignment(TextDraw${index + 1}, 3);\n`;
        } else {
            code += `TextDrawAlignment(TextDraw${index + 1}, 1);\n`;
        }
        
        code += `TextDrawLetterSize(TextDraw${index + 1}, ${td.sizeX.toFixed(2)}, ${td.sizeY.toFixed(2)});\n\n`;
    });
    
    return code;
}

function generatePlainText() {
    let text = '';
    textdraws.forEach((td, index) => {
        text += `TextDraw ${index + 1}:\n`;
        text += `  Texto: ${td.text}\n`;
        text += `  Posición: (${td.x.toFixed(2)}, ${td.y.toFixed(2)})\n`;
        text += `  Color: ${td.color}\n`;
        text += `  Sombra: ${td.shadowSize}\n`;
        text += `  Borde: ${td.outlineSize}\n`;
        text += `  Tamaño: (${td.sizeX.toFixed(2)}, ${td.sizeY.toFixed(2)})\n`;
        text += `  Tipo: ${td.type}\n\n`;
    });
    return text;
}

function downloadFile(content, format) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extension = format === 'pawn' ? 'pwn' : format;
    a.download = `textdraws_export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function hexToRgba(hex) {
    hex = hex.replace('#', '');
    return `0xFF${hex.toUpperCase()}`;
}

function clearAllElements() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los elementos?')) {
        textdraws = [];
        workspace.innerHTML = '';
        updateElementsList();
        closeEditPanel();
    }
}

function changeViewMode() {
    const mode = viewMode.value;
    
    switch(mode) {
        case 'game':
            gameView.style.backgroundImage = 'url("https://i.wpfc.ml/34/8cz1em.jpg")';
            gameView.style.filter = 'brightness(0.8)';
            gameView.style.backgroundColor = 'transparent';
            break;
        case 'grid':
            gameView.style.backgroundImage = 'linear-gradient(rgba(50,50,50,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(50,50,50,0.5) 1px, transparent 1px)';
            gameView.style.backgroundSize = '50px 50px';
            gameView.style.filter = 'brightness(1)';
            gameView.style.backgroundColor = '#222';
            break;
        case 'simple':
            gameView.style.backgroundImage = 'none';
            gameView.style.backgroundColor = '#1a1a1a';
            gameView.style.filter = 'brightness(1)';
            break;
    }
}

// Funciones de arrastre
function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    currentDraggedElement = floatingButton;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function startDragTouch(e) {
    e.preventDefault();
    isDragging = true;
    currentDraggedElement = floatingButton;
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', stopDragTouch);
}

function drag(e) {
    if (!isDragging || !currentDraggedElement) return;
    updateFloatingButtonPosition(e.clientX - 30, e.clientY - 30);
}

function dragTouch(e) {
    if (!isDragging || !currentDraggedElement || !e.touches[0]) return;
    updateFloatingButtonPosition(e.touches[0].clientX - 30, e.touches[0].clientY - 30);
}

function updateFloatingButtonPosition(x, y) {
    // Limitar al área visible
    x = Math.max(10, Math.min(window.innerWidth - 70, x));
    y = Math.max(10, Math.min(window.innerHeight - 70, y));
    
    currentDraggedElement.style.left = `${x}px`;
    currentDraggedElement.style.top = `${y}px`;
    floatingButtonPos = { x, y };
}

function stopDrag() {
    isDragging = false;
    currentDraggedElement = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function stopDragTouch() {
    isDragging = false;
    currentDraggedElement = null;
    document.removeEventListener('touchmove', dragTouch);
    document.removeEventListener('touchend', stopDragTouch);
}

// Funciones de arrastre para elementos textdraw
function startElementDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    currentDraggedElement = e.target.closest('.textdraw-element');
    
    if (currentDraggedElement !== selectedElement) {
        selectElement(currentDraggedElement);
    }
    
    document.addEventListener('mousemove', dragElement);
    document.addEventListener('mouseup', stopElementDrag);
}

function startElementDragTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    currentDraggedElement = e.target.closest('.textdraw-element');
    
    if (currentDraggedElement !== selectedElement) {
        selectElement(currentDraggedElement);
    }
    
    document.addEventListener('touchmove', dragElementTouch);
    document.addEventListener('touchend', stopElementDragTouch);
}

function dragElement(e) {
    if (!isDragging || !currentDraggedElement) return;
    updateElementPosition(e.clientX, e.clientY);
}

function dragElementTouch(e) {
    if (!isDragging || !currentDraggedElement || !e.touches[0]) return;
    updateElementPosition(e.touches[0].clientX, e.touches[0].clientY);
}

function updateElementPosition(clientX, clientY) {
    const element = currentDraggedElement;
    let x = clientX - (element.offsetWidth / 2);
    let y = clientY - (element.offsetHeight / 2);
    
    // Limitar al área visible
    x = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, y));
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // Actualizar coordenadas en el array
    const id = parseInt(element.id.replace('textdraw-', ''));
    const tdIndex = textdraws.findIndex(t => t.id === id);
    
    if (tdIndex !== -1) {
        textdraws[tdIndex].x = x;
        textdraws[tdIndex].y = y;
        
        // Mostrar coordenadas si está habilitado
        if (document.getElementById('showCoordinates').checked) {
            console.log(`Posición: (${x.toFixed(2)}, ${y.toFixed(2)})`);
        }
        
        // Actualizar lista de elementos si está visible
        if (document.querySelector('.menu-tab[data-tab="created"]').classList.contains('active')) {
            updateElementsList();
        }
    }
}

function stopElementDrag() {
    isDragging = false;
    currentDraggedElement = null;
    document.removeEventListener('mousemove', dragElement);
    document.removeEventListener('mouseup', stopElementDrag);
}

function stopElementDragTouch() {
    isDragging = false;
    currentDraggedElement = null;
    document.removeEventListener('touchmove', dragElementTouch);
    document.removeEventListener('touchend', stopElementDragTouch);
}

// Event handlers
function handleDocumentClick(e) {
    // Cerrar menú al hacer clic fuera
    if (isMenuOpen && !menuContainer.contains(e.target) && !floatingButton.contains(e.target)) {
        menuContainer.style.display = 'none';
        isMenuOpen = false;
    }
    
    // Cerrar panel de edición al hacer clic fuera
    if (isEditing && !editPanel.contains(e.target) && 
        !e.target.closest('.textdraw-element') && 
        !e.target.classList.contains('textdraw-text')) {
        closeEditPanel();
    }
    
    // Deseleccionar elemento al hacer clic en el fondo
    if (selectedElement && !e.target.closest('.textdraw-element') && 
        !editPanel.contains(e.target) && 
        !e.target.classList.contains('textdraw-text')) {
        closeEditPanel();
    }
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (isMenuOpen) {
            menuContainer.style.display = 'none';
            isMenuOpen = false;
        }
        
        if (isEditing) {
            closeEditPanel();
        }
    }
}

function handleResize() {
    // Reajustar posición del botón flotante si está fuera de los límites
    if (floatingButtonPos.x > window.innerWidth - 70) {
        floatingButtonPos.x = window.innerWidth - 70;
        floatingButton.style.left = `${floatingButtonPos.x}px`;
    }
    
    if (floatingButtonPos.y > window.innerHeight - 70) {
        floatingButtonPos.y = window.innerHeight - 70;
        floatingButton.style.top = `${floatingButtonPos.y}px`;
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);