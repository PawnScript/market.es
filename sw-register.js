// Registro del Service Worker para cache global

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el navegador soporta Service Workers
    if ('serviceWorker' in navigator) {
        console.log('Service Worker soportado, registrando...');
        
        // Registrar el Service Worker
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado con éxito:', registration);
                
                // Verificar si hay una nueva versión
                registration.onupdatefound = function() {
                    const installingWorker = registration.installing;
                    if (installingWorker == null) {
                        return;
                    }
                    
                    installingWorker.onstatechange = function() {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Nueva versión disponible
                                console.log('Nueva versión disponible. Por favor, recarga la página.');
                                
                                // Mostrar notificación al usuario
                                if (confirm('¡Nueva versión disponible! ¿Quieres recargar la página para obtener las últimas actualizaciones?')) {
                                    window.location.reload();
                                }
                            } else {
                                // Primera instalación
                                console.log('Contenido cachead