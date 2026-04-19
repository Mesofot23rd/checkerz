
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
// const { startGame } = require('./index.js');
// import { startGame } from './index.js'


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Set to true for better security if not using Node features in renderer
        }
    });

    win.loadFile('index.html');
}

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            { role: 'quit' },
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: "Options",
        submenu: [
            {
                label: 'Restart Game',
                accelerator: 'CmdOrCtrl+L',
                click(menuItem, browserWindow) {
                    if (browserWindow) {
                        browserWindow.webContents.send('restart-game');
                    }
                }
            },
        ]
    }
];

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
