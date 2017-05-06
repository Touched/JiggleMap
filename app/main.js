const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const installExtensions = async () => {
  const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS',
  ];

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  // TODO: Use async interation statement.
  //       Waiting on https://github.com/tc39/proposal-async-iteration
  //       Promises will fail silently, which isn't what we want in development
  return Promise
      .all(extensions.map((name) => installer.default(installer[name], forceDownload)))
      .catch(console.log); // eslint-disable-line no-console
};

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://${process.env.HOST}:${process.env.PORT}`);
  } else {
    const htmlPath = path.join(app.getAppPath(), 'build/index.html');
    mainWindow.loadURL(`file://${htmlPath}`);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        },
      }]).popup(mainWindow);
    });
  }
});
