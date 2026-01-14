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
let totalElementsSpan, projectDateSpan;

// Inicialización optimizada
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

    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar valores
    textColorPreview.style.backgroundColor = textColor.value;
    editTextColorPreview.style.backgroundColor = editTextColor.value;
    
    // Mostrar pantalla de login primero (sin imagen de fondo)
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

    // Gestión de proyectos
    saveProjectBtn.addEventListener('click', saveProject);
    loadProjectBtn.addEventListener('click', loadProject);
    renameProjectBtn.addEventListener('click', renameProject);
    deleteProjectBtn.addEventListener('click', deleteProject);

    // Inicializar valores del proyecto
    projectNameInput.value = currentProject.name;
    projectAuthorInput.value = currentProject.author;
    projectVersionInput.value = currentProject.version;
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
            
            // Mostrar el botón flotante y cargar proyecto por defecto
            floatingButton.style.display = 'flex';
            
            // Mostrar menú de proyecto al inicio
            switchTab('project');
            menuContainer.style.display = 'block';
            isMenuOpen = true;
            
            console.log("Login exitoso. Editor listo.");
        }, 500);
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
    };
    img.onerror = function() {
        console.log("Error al cargar imagen de fondo");
        gameView.style.backgroundImage = 'none';
        gameView.style.backgroundColor = '#1a1a1a';
    };
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

// ... (resto de las funciones como createTextDrawElement, setupElementDragging, etc. se mantienen igual)

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

// El resto de las funciones permanecen iguales...
// [Todas las otras funciones del código anterior se mantienen aquí]

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);