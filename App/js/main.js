/*
	R3 Auto Map Gen.
	main.js
*/

const APP = {

	// Version
	hash: nw.App.manifest.hash,
	version: nw.App.manifest.version,

	// Path prefix
	pathPrefix: '',

	// Modules
	fs: void 0,
	path: void 0,
	memoryjs: void 0,
	spawnProcess: void 0,
	childProcess: void 0,

	// Import other files
	tools: temp_TOOLS,
	options: temp_OPTIONS,
	gameHook: temp_GAMEHOOK,
	graphics: temp_GRAPHICS,
	database: temp_DATABASE,
	filemanager: temp_FILEMANAGER,

	/*
		Functions
	*/

	// Start keyboard shortcuts
	startKbShortcuts: function(disableGlobal){

		// Start keypress
		window.onkeyup = function(evt){

			switch (evt.key){

				case 'F1':
					APP.about();
					break;

				case 'Alt':
					APP.graphics.toggleDragMapCanvas();
					break;

				case 'F7':
					APP.graphics.updatePlayerPos();
					break;

				case 'F8':
					APP.options.resetCanvasZoom();
					break;

				case 'F9':
					APP.options.resetMap();
					break;

				case 'F10':
					APP.options.loadLatestFile();
					break;

				case 'Delete':
					APP.options.delGameSaveFiles();
					break;

			}

		}

		// Create global shortcuts 
		const createGlobalShortcut = function(keys, action){
			if (disableGlobal !== !0){
				var newKey = new nw.Shortcut({
					key: keys,
					active: function(){
						action();
					},
					failed: function(err){
						console.error(err);
					}
				});
				nw.App.registerGlobalHotKey(newKey);
			}
		}

		// Init global shortcuts
		createGlobalShortcut('Ctrl+Shift+S', function(){
			APP.options.saveMap(!0);
		});
		createGlobalShortcut('Ctrl+F7', function(){
			APP.graphics.enableCanvasDrag = !0;
			APP.graphics.toggleDragMapCanvas();
			APP.graphics.updatePlayerPos();
		});
		createGlobalShortcut('Ctrl+F8', function(){
			APP.options.resetCanvasZoom();
		});
		createGlobalShortcut('Ctrl+F9', function(){
			APP.options.resetMap();
		});
		createGlobalShortcut('Ctrl+F10', function(){
			APP.options.loadLatestFile();
		});
		createGlobalShortcut('Ctrl+Delete', function(){
			APP.options.delGameSaveFiles();
		});
		createGlobalShortcut('Ctrl+Shift+R', function(){
			APP.runGame();
		});
		createGlobalShortcut('Ctrl+Shift+H', function(){
			APP.gameHook.seekGame();
		});

	},

	// About screen
	about: function(){
		
		// Close color picker
		this.tools.closeColorPicker();

		// Display about screen
		window.alert(`R3 Auto Map Gen. - Version: ${APP.version}\nCreated by TheMitoSan\nTwitter: @themitosan\n\nBuild Hash: ${this.hash}\n\nExternal plugins present on this project:\nmemoryjs by Rob--\nhttps://github.com/rob--/memoryjs`);

	},

	// Run game
	runGame: function(){

		// Get game path
		const settingsData = APP.options.settingsData,
			gPath = `${settingsData.gamePath}/${settingsData.exeName}`;

		// Check if game path exists
		if (APP.fs.existsSync(gPath) === !0){
			
			// Start game
			const doStartGamePlz = function(){

				try {

					// Update chdir
					process.chdir(settingsData.gamePath);

					// Run game
					APP.spawnProcess = APP.childProcess.spawn(gPath, [], {
						detached: !0
					});

					// Seek game process
					setTimeout(function(){
						APP.gameHook.seekGame(!0);
					}, 50);

				} catch (err) {
					console.error(err);
					window.alert(`ERROR - Unable to start game process!\n\n${err}`);
					throw new Error(err);
				}

			}

			// Check if game is running
			var exeName = settingsData.exeName,
				pList = Array.from(APP.memoryjs.getProcesses()),
				gProcess = pList.filter(function(cProcess){
					if (cProcess.szExeFile === exeName){
						return cProcess;
					}
				});
			if (gProcess.length === 0){
				doStartGamePlz();
			} else {
				APP.gameHook.seekGame(!0);
			}

		}

	},

	// Start app function
	init: function(){

		try {

			// Fix empty hash
			if (APP.hash === ''){
				APP.hash = 'DIRTY';
			}

			// Set vars
			var startKbDevMode = !1,
				appTitle = `R3 Auto Map Gen - Version: ${APP.version} [${APP.hash}]`; 

			// Update log and app title
			console.info(appTitle);
			document.title = appTitle;

			// Require modules
			APP.fs = require('fs');
			APP.path = require('path');
			APP.childProcess = require('child_process');

			// Check if app is on dev mode
			if (nw.App.argv.indexOf('-dev') !== -1){
				document.getElementById('BTN_DEV_KB_SH').disabled = '';
				APP.pathPrefix = 'App/';
				startKbDevMode = !0;
			} else {
				TMS.css('BTN_DEV_KB_SH', {'display': 'none'});
			}

			// Require memoryjs
			APP.memoryjs = require(`${APP.pathPrefix}node_modules/memoryjs`);

			// Reset chdir
			process.chdir(APP.tools.fixPath(APP.path.parse(process.execPath).dir));

			// Enable start
			document.getElementById('BTN_START').disabled = '';
			document.getElementById('BTN_START').focus();

			// Start keyboard shortcuts
			APP.startKbShortcuts(startKbDevMode);

			// Load settings
			APP.options.loadSettings();

			// Display menus
			setTimeout(function(){
				TMS.css('MENU_TOP', {'height': '30px', 'filter': 'blur(0px)'});
				TMS.css('MENU_RIGHT', {'width': '196px', 'filter': 'blur(0px)'});
			}, 50);

		} catch (err) {
			window.alert(`ERROR - Something happened on boot process!\n${err}`);
			console.error(err);
			throw new Error(err);
		}

	},

	// DEV - Start global shortcuts button
	devStartShortCuts: function(){
		document.getElementById('BTN_DEV_KB_SH').disabled = 'disabled';
		TMS.css('BTN_DEV_KB_SH', {'display': 'none'});
		APP.startKbShortcuts(!1);
	}

}

// Remove modules
delete temp_TOOLS;
delete temp_OPTIONS;
delete temp_GAMEHOOK;
delete temp_GRAPHICS;
delete temp_DATABASE;
delete temp_FILEMANAGER;

// Init
window.onload = APP.init;