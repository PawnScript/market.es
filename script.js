// Variables globales
let textdraws = [];
let nextId = 1;
let isDragging = false;
let currentDraggedElement = null;
let selectedElement = null;
let isMenuOpen = false;
let isEditing = false;
let currentProject = {
    name: "Proyecto sin nombre",
    author: "Anónimo",
    version: "1.0",
    created: new Date().toLocaleDateString('es-ES'),
    elements: 0
};
let isDraggingPanel = false;
let draggedPanel = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Elementos DOM globales
let loginScreen, mainContainer, floatingButton, menuContainer;
let createElementBtn, textContent, textColor, textColorPreview;
let textType, textContentGroup, textSizeX, textSizeY, textSizeXValue;
let textSizeYValue, workspace, elementsList, noElements, menuTabs;
let tabPanels, searchElements, exportBtn, clearAllBtn, editPanel;
let closeEditBtn, saveEditBtn, deleteEditBtn, editTextContent;
let editTextColor, editTextColorPreview, editShadowSize, viewMode;
let gameView, loginBtn, usernameInput, passwordInput, exportPanel;
let exportCode, copyExportBtn, downloadExportBtn, closeExportBtn;
let coordinatesPanel, coordsText, minimizeMenuBtn, minimizeEditBtn;
let boxSizeGroup, modelPreviewGroup, spriteGroup, boxWidth, boxHeight;
let boxWidthValue, boxHeightValue, modelID, modelRotX, modelRotY;
let modelRotZ, modelZoom, modelRotXValue, modelRotYValue, modelRotZValue;
let modelZoomValue, spriteLibrary, spriteName, editBoxSizeGroup;
let editModelGroup, editSpriteGroup, editBoxWidth, editBoxHeight;
let editBoxWidthValue, editBoxHeightValue, editModelID, editSpriteLibrary;
let editSpriteName, projectNameInput, projectAuthorInput, projectVersionInput;
let saveProjectBtn, loadProjectBtn, renameProjectBtn, deleteProjectBtn;
let totalElementsSpan, projectDateSpan, closeMenuBtn;

// Inicialización
function init() {
    console.log("Inicializando editor de TextDraw...");
    
    // Referencias a elementos DOM
    loginScreen = document.getElementById('loginScreen');
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
    projectNameInput = document.getElementById('projectName');
    projectAuthorInput = document.getElementById('projectAuthor');
    projectVersionInput = document.getElementById('projectVersion');
    saveProjectBtn = document.getElementById('saveProjectBtn');
    loadProjectBtn = document.getElementById('loadProjectBtn');
    renameProjectBtn = document.getElementById('renameProjectBtn');
    deleteProjectBtn = document.getElementById('deleteProjectBtn');
    totalElementsSpan = document.getElementById('totalElements');
    projectDateSpan = document.getElementById('projectDate');
    closeMenuBtn = document.getElementById('closeMenuBtn');

    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar valores
    textColorPreview.style.backgroundColor = textColor.value;
    editTextColorPreview.style.backgroundColor = editTextColor.value;
    
    // Mostrar pantalla de login primero
    loginScreen.style.display = 'flex';
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

    // Botón flotante - mostrar/ocultar menú
    floatingButton.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);

    // Minimizar paneles
    minimizeMenuBtn.addEventListener('click', function() {
        minimizePanel(menuContainer);
    });

    minimizeEditBtn.addEventListener('click', function() {
        minimizePanel(editPanel);
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

    // Gestión de proyectos
    saveProjectBtn.addEventListener('click', saveProject);
    loadProjectBtn.addEventListener('click', loadProject);
    renameProjectBtn.addEventListener('click', renameProject);
    deleteProjectBtn.addEventListener('click', deleteProject);

    // Inicializar valores del proyecto
    updateProjectInfo();

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
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === 'admin' && password === '0292') {
        loginScreen.classList.add('fade-out');
        setTimeout(() => {
            loginScreen.style.display = 'none';
            mainContainer.style.display = 'block';
            
            // Cargar imagen de fondo solo después del login
            preloadBackgroundImage();
            
            // Mostrar el botón flotante
            floatingButton.style.display = 'flex';
            
            // Mostrar menú de proyecto al inicio
            switchTab('project');
            menuContainer.style.display = 'block';
            isMenuOpen = true;
            
            console.log("Login exitoso. Editor listo.");
        }, 300);
    } else {
        alert('Usuario o contraseña incorrectos. Usuario: admin, Contraseña: 0292');
        passwordInput.value = '';
        usernameInput.focus();
    }
}

function preloadBackgroundImage() {
    const img = new Image();
    img.src = 'https://i.wpfc.ml/34/8cz1em.jpg';
    img.onload = function() {
        console.log("Imagen de fondo cargada");
        gameView.style.backgroundImage = 'url("https://i.wpfc.ml/34/8cz1em.jpg")';
        gameView.style.backgroundSize = 'cover';
        gameView.style.backgroundPosition = 'center';
        gameView.style.filter = 'brightness(0.8)';
    };
    img.onerror = function() {
        console.log("Error al cargar imagen de fondo");
        gameView.style.backgroundImage = 'none';
        gameView.style.backgroundColor = '#1a1a1a';
    };
}

function toggleMenu() {
    if (isMenuOpen) {
        menuContainer.style.display = 'none';
        isMenuOpen = false;
    } else {
        menuContainer.style.display = 'block';
        isMenuOpen = true;
    }
}

function switchTab(tabId) {
    console.log("Cambiando a pestaña:", tabId);
    
    // Actualizar pestañas activas
    menuTabs.forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.menu-tab[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Mostrar panel correspondiente
    tabPanels.forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(`${tabId}-panel`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // Si es la pestaña de creados, actualizar la lista
    if (tabId === 'created') {
        updateElementsList();
    }
}

function updateFormByType(type) {
    // Mostrar/ocultar grupos según el tipo
    textContentGroup.style.display = type === 'text' ? 'block' : 'none';
    boxSizeGroup.style.display = type === 'box' ? 'block' : 'none';
    modelPreviewGroup.style.display = type === 'preview-model' ? 'block' : 'none';
    spriteGroup.style.display = type === 'sprite' ? 'block' : 'none';
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
    
    // Actualizar contador de elementos del proyecto
    currentProject.elements = textdraws.length;
    updateProjectInfo();
    
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

function setupElementDragging(element) {
    element.addEventListener('mousedown', startElementDrag);
    element.addEventListener('touchstart', startElementDragTouch, { passive: false });
    element.addEventListener('click', function(e) {
        e.stopPropagation();
        selectElement(element);
    });
}

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
    setTimeout(() => {
        coordinatesPanel.style.display = 'none';
    }, 1000);
    document.removeEventListener('mousemove', dragElement);
    document.removeEventListener('mouseup', stopElementDrag);
}

function stopElementDragTouch() {
    isDragging = false;
    currentDraggedElement = null;
    setTimeout(() => {
        coordinatesPanel.style.display = 'none';
    }, 1000);
    document.removeEventListener('touchmove', dragElementTouch);
    document.removeEventListener('touchend', stopElementDragTouch);
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

function updateEditFormByType(type) {
    editBoxSizeGroup.style.display = type === 'box' ? 'block' : 'none';
    editModelGroup.style.display = type === 'preview-model' ? 'block' : 'none';
    editSpriteGroup.style.display = type === 'sprite' ? 'block' : 'none';
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

function closeEditPanel() {
    editPanel.style.display = 'none';
    isEditing = false;
    
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
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
            
            // Actualizar contador
            currentProject.elements = textdraws.length;
            updateProjectInfo();
            
            // Actualizar lista
            updateElementsList();
            
            // Cerrar panel de edición si estaba abierto
            if (selectedElement && selectedElement.id === `textdraw-${id}`) {
                closeEditPanel();
            }
        }
    }
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
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteElement(parseInt(this.getAttribute('data-id')));
        });
    });
}

function editElement(id) {
    const td = textdraws.find(t => t.id === id);
    if (td) {
        const element = document.getElementById(td.elementId);
        selectElement(element);
        toggleMenu();
    }
}

function clearAllElements() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los elementos?')) {
        textdraws = [];
        workspace.innerHTML = '';
        currentProject.elements = 0;
        updateProjectInfo();
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

function generatePawnCode() {
    let code = `// TextDraws generados por el editor\n`;
    code += `// Proyecto: ${currentProject.name}\n`;
    code += `// Autor: ${currentProject.author}\n`;
    code += `// Versión: ${currentProject.version}\n`;
    code += `// Cantidad: ${textdraws.length}\n\n`;
    
    textdraws.forEach((td, index) => {
        code += `// TextDraw ${index + 1} - ${td.type}\n`;
        if (td.type === 'text') {
            code += `TextDraw${index + 1} = TextDrawCreate(${td.x.toFixed(2)}, ${td.y.toFixed(2)}, "${td.text}");\n`;
        } else if (td.type === 'box') {
            code += `TextDraw${index + 1} = TextDrawCreate(${td.x.toFixed(2)}, ${td.y.toFixed(2)}, "");\n`;
            code += `TextDrawTextSize(TextDraw${index + 1}, ${td.boxWidth}, ${td.boxHeight});\n`;
        }
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
    let text = `PROYECTO: ${currentProject.name}\n`;
    text += `AUTOR: ${currentProject.author}\n`;
    text += `VERSIÓN: ${currentProject.version}\n`;
    text += `ELEMENTOS: ${textdraws.length}\n\n`;
    
    textdraws.forEach((td, index) => {
        text += `[TEXTDRAW ${index + 1}]\n`;
        text += `  Tipo: ${td.type}\n`;
        text += `  Texto: ${td.text}\n`;
        text += `  Posición: (${td.x.toFixed(2)}, ${td.y.toFixed(2)})\n`;
        text += `  Color: ${td.color}\n`;
        text += `  Sombra: ${td.shadowSize}\n`;
        text += `  Borde: ${td.outlineSize}\n`;
        text += `  Tamaño: (${td.sizeX.toFixed(2)}, ${td.sizeY.toFixed(2)})\n`;
        if (td.type === 'box') {
            text += `  Dimensiones: ${td.boxWidth}x${td.boxHeight}\n`;
        }
        text += `\n`;
    });
    return text;
}

function hexToRgba(hex) {
    hex = hex.replace('#', '');
    return `0xFF${hex.toUpperCase()}`;
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

function updateProjectInfo() {
    // Actualizar información en todas las pestañas
    document.getElementById('currentProjectName').textContent = currentProject.name;
    document.getElementById('settingsProjectName').textContent = currentProject.name;
    totalElementsSpan.textContent = currentProject.elements;
    projectDateSpan.textContent = currentProject.created;
    
    // Actualizar campos del formulario de proyecto
    projectNameInput.value = currentProject.name;
    projectAuthorInput.value = currentProject.author;
    projectVersionInput.value = currentProject.version;
}

function saveProject() {
    const name = projectNameInput.value.trim();
    const author = projectAuthorInput.value.trim();
    const version = projectVersionInput.value.trim();
    
    if (!name) {
        alert('Por favor, ingresa un nombre para el proyecto.');
        projectNameInput.focus();
        return;
    }
    
    currentProject = {
        name: name,
        author: author || "Anónimo",
        version: version || "1.0",
        created: new Date().toLocaleDateString('es-ES'),
        elements: textdraws.length
    };
    
    updateProjectInfo();
    
    // Guardar en localStorage
    localStorage.setItem('textdraw_project', JSON.stringify({
        project: currentProject,
        textdraws: textdraws,
        nextId: nextId
    }));
    
    alert('Proyecto guardado correctamente!');
}

function loadProject() {
    const saved = localStorage.getItem('textdraw_project');
    if (!saved) {
        alert('No hay proyectos guardados.');
        return;
    }
    
    if (confirm('¿Cargar proyecto guardado? Se perderán los cambios no guardados.')) {
        const data = JSON.parse(saved);
        
        // Limpiar elementos actuales
        textdraws = [];
        workspace.innerHTML = '';
        
        // Cargar proyecto
        currentProject = data.project;
        textdraws = data.textdraws || [];
        nextId = data.nextId || textdraws.length + 1;
        
        // Recrear elementos visuales
        textdraws.forEach(td => {
            const element = createTextDrawElement(
                td.type, 
                td.text, 
                td.color, 
                td.shadowSize, 
                td.outlineSize, 
                td.sizeX, 
                td.sizeY, 
                td.boxWidth, 
                td.boxHeight, 
                td.modelID,
                td.spriteLibrary,
                td.spriteName
            );
            element.id = td.elementId;
            element.style.left = `${td.x}px`;
            element.style.top = `${td.y}px`;
            setupElementDragging(element);
            workspace.appendChild(element);
        });
        
        updateProjectInfo();
        updateElementsList();
        
        alert('Proyecto cargado correctamente!');
    }
}

function renameProject() {
    const newName = prompt('Nuevo nombre del proyecto:', currentProject.name);
    if (newName && newName.trim()) {
        currentProject.name = newName.trim();
        updateProjectInfo();
        alert('Proyecto renombrado correctamente!');
    }
}

function deleteProject() {
    if (confirm('¿Eliminar proyecto actual? Esta acción no se puede deshacer.')) {
        // Limpiar todo
        textdraws = [];
        workspace.innerHTML = '';
        nextId = 1;
        
        // Restablecer proyecto por defecto
        currentProject = {
            name: "Proyecto sin nombre",
            author: "Anónimo",
            version: "1.0",
            created: new Date().toLocaleDateString('es-ES'),
            elements: 0
        };
        
        updateProjectInfo();
        updateElementsList();
        
        // Eliminar de localStorage
        localStorage.removeItem('textdraw_project');
        
        alert('Proyecto eliminado correctamente!');
    }
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
        
        if (header) {
            header.addEventListener('mousedown', startPanelDrag);
            header.addEventListener('touchstart', startPanelDragTouch, { passive: false });
        }
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
    
    // Cerrar panel de exportación al hacer clic fuera
    if (exportPanel.style.display === 'block' && !exportPanel.contains(e.target)) {
        closeExportPanel();
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
        
        if (exportPanel.style.display === 'block') {
            closeExportPanel();
        }
    }
}

function handleResize() {
    // Ajustar posiciones de los elementos si es necesario
    textdraws.forEach(td => {
        const element = document.getElementById(td.elementId);
        if (element) {
            // Asegurarse de que el elemento no esté fuera de la pantalla
            let x = td.x;
            let y = td.y;
            
            if (x > window.innerWidth - element.offsetWidth) {
                x = window.innerWidth - element.offsetWidth;
                td.x = x;
            }
            
            if (y > window.innerHeight - element.offsetHeight) {
                y = window.innerHeight - element.offsetHeight;
                td.y = y;
            }
            
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    });
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);