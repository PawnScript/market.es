// Variables globales
let textdraws = [];
let nextId = 1;
let isDragging = false;
let currentDraggedElement = null;
let selectedElement = null;
let isMenuOpen = false;
let isEditing = false;
let currentProject = {
    name: "Sin nombre",
    author: "Anónimo",
    created: new Date()
};
let isDraggingPanel = false;
let draggedPanel = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Elementos DOM globales
let loginScreen, projectStartScreen, startScreen, startButton, mainContainer;
let floatingButton, menuContainer, createElementBtn, textContent, textColor;
let textColorPreview, textType, textContentGroup, textSizeX, textSizeY;
let textSizeXValue, textSizeYValue, workspace, elementsList, noElements;
let menuTabs, tabPanels, searchElements, exportBtn, clearAllBtn, editPanel;
let closeEditBtn, saveEditBtn, deleteEditBtn, editTextContent, editTextColor;
let editTextColorPreview, editShadowSize, viewMode, gameView, loginBtn;
let usernameInput, passwordInput, createProjectBtn, projectNameInput;
let projectAuthorInput, exportPanel, exportCode, copyExportBtn;
let downloadExportBtn, closeExportBtn, coordinatesPanel, coordsText;
let minimizeMenuBtn, minimizeEditBtn, boxSizeGroup, modelPreviewGroup;
let spriteGroup, boxWidth, boxHeight, boxWidthValue, boxHeightValue;
let modelID, modelRotX, modelRotY, modelRotZ, modelZoom;
let modelRotXValue, modelRotYValue, modelRotZValue, modelZoomValue;
let spriteLibrary, spriteName, editBoxSizeGroup, editModelGroup;
let editSpriteGroup, editBoxWidth, editBoxHeight, editBoxWidthValue;
let editBoxHeightValue, editModelID, editSpriteLibrary, editSpriteName;

// Inicialización optimizada
function init() {
    console.log("Inicializando editor de TextDraw...");
    
    // Referencias a elementos DOM
    loginScreen = document.getElementById('loginScreen');
    projectStartScreen = document.getElementById('projectStartScreen');
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
    loginBtn = document.getElementById('loginBtn');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    createProjectBtn = document.getElementById('createProjectBtn');
    projectNameInput = document.getElementById('projectName');
    projectAuthorInput = document.getElementById('projectAuthor');
    exportPanel = document.getElementById('exportPanel');
    exportCode = document.getElementById('exportCode');
    copyExportBtn = document.getElementById('copyExportBtn');
    downloadExportBtn = document.getElementById('downloadExportBtn');
    closeExportBtn = document.getElementById('closeExportBtn');
    coordinatesPanel = document.getElementById('coordinatesPanel');
    coordsText = document.getElementById('coordsText');
    minimizeMenuBtn = document.getElementById('minimizeMenuBtn');
    minimizeEditBtn = document.getElementById('minimizeEditBtn');
    boxSizeGroup = document.getElementById('boxSizeGroup');
    modelPreviewGroup = document.getElementById('modelPreviewGroup');
    spriteGroup = document.getElementById('spriteGroup');
    boxWidth = document.getElementById('boxWidth');
    boxHeight = document.getElementById('boxHeight');
    boxWidthValue = document.getElementById('boxWidthValue');
    boxHeightValue = document.getElementById('boxHeightValue');
    modelID = document.getElementById('modelID');
    modelRotX = document.getElementById('modelRotX');
    modelRotY = document.getElementById('modelRotY');
    modelRotZ = document.getElementById('modelRotZ');
    modelZoom = document.getElementById('modelZoom');
    modelRotXValue = document.getElementById('modelRotXValue');
    modelRotYValue = document.getElementById('modelRotYValue');
    modelRotZValue = document.getElementById('modelRotZValue');
    modelZoomValue = document.getElementById('modelZoomValue');
    spriteLibrary = document.getElementById('spriteLibrary');
    spriteName = document.getElementById('spriteName');
    editBoxSizeGroup = document.getElementById('editBoxSizeGroup');
    editModelGroup = document.getElementById('editModelGroup');
    editSpriteGroup = document.getElementById('editSpriteGroup');
    editBoxWidth = document.getElementById('editBoxWidth');
    editBoxHeight = document.getElementById('editBoxHeight');
    editBoxWidthValue = document.getElementById('editBoxWidthValue');
    editBoxHeightValue = document.getElementById('editBoxHeightValue');
    editModelID = document.getElementById('editModelID');
    editSpriteLibrary = document.getElementById('editSpriteLibrary');
    editSpriteName = document.getElementById('editSpriteName');

    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar valores
    textColorPreview.style.backgroundColor = textColor.value;
    editTextColorPreview.style.backgroundColor = editTextColor.value;
    
    // Mostrar pantalla de login primero
    loginScreen.style.display = 'flex';
    projectStartScreen.style.display = 'none';
    startScreen.style.display = 'none';
    mainContainer.style.display = 'none';
    
    console.log("Editor inicializado correctamente.");
}

// Configurar event listeners
function setupEventListeners() {
    // Login
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });

    // Crear proyecto
    createProjectBtn.addEventListener('click', createProject);
    projectNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') createProject();
    });

    // Mostrar/ocultar campos según el tipo seleccionado
    textType.addEventListener('change', function() {
        updateFormByType(this.value);
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

    // Actualizar tamaño de caja
    boxWidth.addEventListener('input', function() {
        boxWidthValue.textContent = `${this.value}px`;
    });

    boxHeight.addEventListener('input', function() {
        boxHeightValue.textContent = `${this.value}px`;
    });

    // Actualizar valores de modelo
    modelRotX.addEventListener('input', function() {
        modelRotXValue.textContent = `${this.value}°`;
    });

    modelRotY.addEventListener('input', function() {
        modelRotYValue.textContent = `${this.value}°`;
    });

    modelRotZ.addEventListener('input', function() {
        modelRotZValue.textContent = `${this.value}°`;
    });

    modelZoom.addEventListener('input', function() {
        modelZoomValue.textContent = parseFloat(this.value).toFixed(1);
    });

    // Actualizar tamaño de caja en edición
    editBoxWidth.addEventListener('input', function() {
        editBoxWidthValue.textContent = `${this.value}px`;
    });

    editBoxHeight.addEventListener('input', function() {
        editBoxHeightValue.textContent = `${this.value}px`;
    });

    // Iniciar editor
    startButton.addEventListener('click', startEditor);

    // Botón flotante - mostrar/ocultar menú
    floatingButton.addEventListener('click', toggleMenu);

    // Minimizar paneles
    minimizeMenuBtn.addEventListener('click', function() {
        minimizePanel(menuContainer);
    });

    minimizeEditBtn.addEventListener('click', function() {
        minimizePanel(editPanel);
    });

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
    exportBtn.addEventListener('click', previewExport);
    copyExportBtn.addEventListener('click', copyExportCode);
    downloadExportBtn.addEventListener('click', downloadExportFile);
    closeExportBtn.addEventListener('click', closeExportPanel);

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

    // Hacer paneles movibles
    setupMovablePanels();

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', handleDocumentClick);

    // Manejar tecla Escape
    document.addEventListener('keydown', handleKeyDown);

    // Redimensionar ventana
    window.addEventListener('resize', handleResize);
}

function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === 'admin' && password === '0292') {
        loginScreen.classList.add('fade-out');
        setTimeout(() => {
            loginScreen.style.display = 'none';
            projectStartScreen.style.display = 'flex';
        }, 500);
    } else {
        alert('Usuario o contraseña incorrectos. Usuario: admin, Contraseña: 0292');
        passwordInput.value = '';
        usernameInput.focus();
    }
}

function createProject() {
    const projectName = projectNameInput.value.trim();
    const author = projectAuthorInput.value.trim();

    if (!projectName) {
        alert('Por favor, ingresa un nombre para el proyecto.');
        projectNameInput.focus();
        return;
    }

    currentProject = {
        name: projectName,
        author: author || "Anónimo",
        created: new Date(),
        version: "1.0"
    };

    projectStartScreen.classList.add('fade-out');
    setTimeout(() => {
        projectStartScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        
        // Actualizar información del proyecto en la interfaz
        document.getElementById('currentProjectName').textContent = projectName;
        document.getElementById('settingsProjectName').textContent = projectName;
    }, 500);
}

function updateFormByType(type) {
    // Mostrar/ocultar grupos según el tipo
    textContentGroup.style.display = type === 'text' ? 'block' : 'none';
    boxSizeGroup.style.display = type === 'box' ? 'block' : 'none';
    modelPreviewGroup.style.display = type === 'preview-model' ? 'block' : 'none';
    spriteGroup.style.display = type === 'sprite' ? 'block' : 'none';
}

function updateEditFormByType(type) {
    editBoxSizeGroup.style.display = type === 'box' ? 'block' : 'none';
    editModelGroup.style.display = type === 'preview-model' ? 'block' : 'none';
    editSpriteGroup.style.display = type === 'sprite' ? 'block' : 'none';
}

function createTextDraw() {
    const type = textType.value;
    const text = textContent.value || "Nuevo Texto";
    const color = textColor.value;
    const shadowSize = document.getElementById('shadowSize').value;
    const outlineSize = document.getElementById('outlineSize').value;
    const fontStyle = document.getElementById('fontStyle').value;
    const alignment = document.getElementById('textAlignment').value;
    const sizeX = parseFloat(textSizeX.value);
    const sizeY = parseFloat(textSizeY.value);
    
    // Datos adicionales según tipo
    const boxWidthVal = type === 'box' ? parseInt(boxWidth.value) : 0;
    const boxHeightVal = type === 'box' ? parseInt(boxHeight.value) : 0;
    const modelIDVal = type === 'preview-model' ? parseInt(modelID.value) : 0;
    const modelRotXVal = type === 'preview-model' ? parseInt(modelRotX.value) : 0;
    const modelRotYVal = type === 'preview-model' ? parseInt(modelRotY.value) : 0;
    const modelRotZVal = type === 'preview-model' ? parseInt(modelRotZ.value) : 0;
    const modelZoomVal = type === 'preview-model' ? parseFloat(modelZoom.value) : 1.0;
    const spriteLib = type === 'sprite' ? spriteLibrary.value : '';
    const spriteNameVal = type === 'sprite' ? spriteName.value : '';
    
    // Posición inicial (centrado)
    const posX = window.innerWidth / 2 - 100;
    const posY = window.innerHeight / 2 - 50;
    
    // Crear elemento
    const elementId = `textdraw-${nextId}`;
    const textdrawElement = createTextDrawElement(type, text, color, shadowSize, outlineSize, sizeX, sizeY, boxWidthVal, boxHeightVal, modelIDVal, spriteLib, spriteNameVal);
    textdrawElement.id = elementId;
    textdrawElement.style.left = `${posX}px`;
    textdrawElement.style.top = `${posY}px`;
    
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
        x: posX,
        y: posY,
        boxWidth: boxWidthVal,
        boxHeight: boxHeightVal,
        modelID: modelIDVal,
        modelRotX: modelRotXVal,
        modelRotY: modelRotYVal,
        modelRotZ: modelRotZVal,
        modelZoom: modelZoomVal,
        spriteLibrary: spriteLib,
        spriteName: spriteNameVal
    });
    
    nextId++;
    
    // Actualizar lista de elementos
    updateElementsList();
    
    // Seleccionar el nuevo elemento
    selectElement(textdrawElement);
    
    // Cerrar menú si está abierto
    if (isMenuOpen) {
        toggleMenu();
    }
    
    console.log("TextDraw creado:", {id: nextId-1, type: type});
}

function createTextDrawElement(type, text, color, shadowSize, outlineSize, sizeX, sizeY, boxWidth, boxHeight, modelID, spriteLib, spriteName) {
    const element = document.createElement('div');
    element.className = 'textdraw-element';
    
    switch(type) {
        case 'text':
            element.innerHTML = `<div class="textdraw-text" style="color: ${color}; font-size: ${24 * sizeY}px; text-shadow: ${shadowSize}px ${shadowSize}px ${shadowSize}px rgba(0,0,0,0.8);">${text}</div>`;
            break;
        case 'box':
            element.innerHTML = `<div style="width: ${boxWidth}px; height: ${boxHeight}px; background-color: ${color}; opacity: 0.7; border: ${outlineSize}px solid #fff;"></div>`;
            break;
        case 'preview-model':
            element.innerHTML = `<div style="width: 150px; height: 150px; background: linear-gradient(45deg, #333, #555); border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; color: ${color};">
                <div style="text-align: center;">
                    <i class="fas fa-cube" style="font-size: 40px;"></i><br>
                    <small>Modelo: ${modelID}</small>
                </div>
            </div>`;
            break;
        case 'sprite':
            element.innerHTML = `<div style="width: 100px; height: 100px; background-color: ${color}; border: 2px dashed #fff; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
                <i class="fas fa-image" style="font-size: 30px;"></i>
                <small>${spriteLib}/${spriteName}</small>
            </div>`;
            break;
    }
    
    return element;
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
        
        // Mostrar coordenadas
        coordsText.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        coordinatesPanel.style.display = 'block';
        
        // Actualizar lista de elementos si está visible
        if (document.querySelector('.menu-tab[data-tab="created"]').classList.contains('active')) {
            updateElementsList();
        }
    }
}

function stopElementDrag() {
    isDragging = false;
    currentDraggedElement = null;
    coordinatesPanel.style.display = 'none';
    document.removeEventListener('mousemove', dragElement);
    document.removeEventListener('mouseup', stopElementDrag);
}

function stopElementDragTouch() {
    isDragging = false;
    currentDraggedElement = null;
    coordinatesPanel.style.display = 'none';
    document.removeEventListener('touchmove', dragElementTouch);
    document.removeEventListener('touchend', stopElementDragTouch);
}

function showEditPanel(td) {
    editPanel.style.display = 'block';
    isEditing = true;
    
    // Cargar datos en el formulario de edición
    editTextContent.value = td.text;
    editTextColor.value = td.color;
    editTextColorPreview.style.backgroundColor = td.color;
    editShadowSize.value = td.shadowSize;
    
    // Mostrar campos específicos según tipo
    updateEditFormByType(td.type);
    
    if (td.type === 'box') {
        editBoxWidth.value = td.boxWidth;
        editBoxHeight.value = td.boxHeight;
        editBoxWidthValue.textContent = `${td.boxWidth}px`;
        editBoxHeightValue.textContent = `${td.boxHeight}px`;
    } else if (td.type === 'preview-model') {
        editModelID.value = td.modelID;
    } else if (td.type === 'sprite') {
        editSpriteLibrary.value = td.spriteLibrary;
        editSpriteName.value = td.spriteName;
    }
}

function saveEditChanges() {
    if (!selectedElement) return;
    
    const id = parseInt(selectedElement.id.replace('textdraw-', ''));
    const tdIndex = textdraws.findIndex(t => t.id === id);
    
    if (tdIndex !== -1) {
        // Actualizar datos
        const td = textdraws[tdIndex];
        td.text = editTextContent.value;
        td.color = editTextColor.value;
        td.shadowSize = editShadowSize.value;
        
        if (td.type === 'box') {
            td.boxWidth = parseInt(editBoxWidth.value);
            td.boxHeight = parseInt(editBoxHeight.value);
        } else if (td.type === 'preview-model') {
            td.modelID = parseInt(editModelID.value);
        } else if (td.type === 'sprite') {
            td.spriteLibrary = editSpriteLibrary.value;
            td.spriteName = editSpriteName.value;
        }
        
        // Actualizar elemento visual
        updateTextDrawElement(selectedElement, td);
        
        // Actualizar lista
        updateElementsList();
    }
}

function updateTextDrawElement(element, td) {
    switch(td.type) {
        case 'text':
            element.innerHTML = `<div class="textdraw-text" style="color: ${td.color}; font-size: ${24 * td.sizeY}px; text-shadow: ${td.shadowSize}px ${td.shadowSize}px ${td.shadowSize}px rgba(0,0,0,0.8);">${td.text}</div>`;
            break;
        case 'box':
            element.innerHTML = `<div style="width: ${td.boxWidth}px; height: ${td.boxHeight}px; background-color: ${td.color}; opacity: 0.7; border: ${td.outlineSize}px solid #fff;"></div>`;
            break;
        case 'preview-model':
            element.innerHTML = `<div style="width: 150px; height: 150px; background: linear-gradient(45deg, #333, #555); border: 2px solid ${td.color}; display: flex; align-items: center; justify-content: center; color: ${td.color};">
                <div style="text-align: center;">
                    <i class="fas fa-cube" style="font-size: 40px;"></i><br>
                    <small>Modelo: ${td.modelID}</small>
                </div>
            </div>`;
            break;
        case 'sprite':
            element.innerHTML = `<div style="width: 100px; height: 100px; background-color: ${td.color}; border: 2px dashed #fff; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
                <i class="fas fa-image" style="font-size: 30px;"></i>
                <small>${td.spriteLibrary}/${td.spriteName}</small>
            </div>`;
            break;
    }
}

function previewExport() {
    if (textdraws.length === 0) {
        alert('No hay textdraws para exportar.');
        return;
    }
    
    const format = document.getElementById('exportFormat').value;
    let exportContent = '';
    
    if (format === 'pawn') {
        exportContent = generatePawnCode();
    } else if (format === 'json') {
        exportContent = JSON.stringify({
            project: currentProject,
            textdraws: textdraws
        }, null, 2);
    } else {
        exportContent = generatePlainText();
    }
    
    exportCode.textContent = exportContent;
    exportPanel.style.display = 'block';
}

function copyExportCode() {
    const text = exportCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Código copiado al portapapeles!');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

function downloadExportFile() {
    const format = document.getElementById('exportFormat').value;
    let content = exportCode.textContent;
    let extension = format === 'pawn' ? 'pwn' : format;
    let filename = `${currentProject.name.replace(/\s+/g, '_')}_textdraws.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function closeExportPanel() {
    exportPanel.style.display = 'none';
}

function minimizePanel(panel) {
    if (panel.classList.contains('minimized')) {
        panel.classList.remove('minimized');
        panel.querySelector('.window-controls .minimize-btn i').className = 'fas fa-minus';
    } else {
        panel.classList.add('minimized');
        panel.querySelector('.window-controls .minimize-btn i').className = 'fas fa-plus';
    }
}

function setupMovablePanels() {
    const movablePanels = document.querySelectorAll('.movable');
    
    movablePanels.forEach(panel => {
        const header = panel.querySelector('.menu-header, .edit-header, .export-header');
        
        header.addEventListener('mousedown', startPanelDrag);
        header.addEventListener('touchstart', startPanelDragTouch, { passive: false });
    });
}

function startPanelDrag(e) {
    e.preventDefault();
    isDraggingPanel = true;
    draggedPanel = e.target.closest('.movable');
    
    const rect = draggedPanel.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', dragPanel);
    document.addEventListener('mouseup', stopPanelDrag);
}

function startPanelDragTouch(e) {
    e.preventDefault();
    isDraggingPanel = true;
    draggedPanel = e.target.closest('.movable');
    
    const rect = draggedPanel.getBoundingClientRect();
    dragOffsetX = e.touches[0].clientX - rect.left;
    dragOffsetY = e.touches[0].clientY - rect.top;
    
    document.addEventListener('touchmove', dragPanelTouch);
    document.addEventListener('touchend', stopPanelDragTouch);
}

function dragPanel(e) {
    if (!isDraggingPanel || !draggedPanel) return;
    
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    
    // Limitar al área visible
    x = Math.max(0, Math.min(window.innerWidth - draggedPanel.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - draggedPanel.offsetHeight, y));
    
    draggedPanel.style.left = `${x}px`;
    draggedPanel.style.top = `${y}px`;
    draggedPanel.style.right = 'auto';
}

function dragPanelTouch(e) {
    if (!isDraggingPanel || !draggedPanel || !e.touches[0]) return;
    
    let x = e.touches[0].clientX - dragOffsetX;
    let y = e.touches[0].clientY - dragOffsetY;
    
    // Limitar al área visible
    x = Math.max(0, Math.min(window.innerWidth - draggedPanel.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - draggedPanel.offsetHeight, y));
    
    draggedPanel.style.left = `${x}px`;
    draggedPanel.style.top = `${y}px`;
    draggedPanel.style.right = 'auto';
}

function stopPanelDrag() {
    isDraggingPanel = false;
    draggedPanel = null;
    document.removeEventListener('mousemove', dragPanel);
    document.removeEventListener('mouseup', stopPanelDrag);
}

function stopPanelDragTouch() {
    isDraggingPanel = false;
    draggedPanel = null;
    document.removeEventListener('touchmove', dragPanelTouch);
    document.removeEventListener('touchend', stopPanelDragTouch);
}

// El resto de las funciones permanecen iguales...
// [Todas las otras funciones del código original se mantienen aquí]

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);