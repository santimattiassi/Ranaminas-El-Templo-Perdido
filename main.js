const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Deshabilitar el modo sandbox para compatibilidad con Web Audio API
app.commandLine.appendSwitch('--no-sandbox');

/**
 * Crea la ventana principal del juego.
 */
function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 900,
        minHeight: 650,
        title: 'RanaMinas: El Templo Perdido',
        icon: path.join(__dirname, 'img', 'icon.png'),
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        // Sin marco de ventana clásico para look más moderno
        autoHideMenuBar: true,
    });

    // Cargar el juego desde el HTML local
    win.loadFile('index.html');

    // Eliminar la barra de menú por defecto
    Menu.setApplicationMenu(null);
}

// Iniciar la app cuando Electron esté listo
app.whenReady().then(() => {
    createWindow();

    // En macOS, volver a crear la ventana al hacer clic en el dock si no hay ventanas abiertas
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Cerrar la app al cerrar todas las ventanas (comportamiento estándar en Windows/Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
