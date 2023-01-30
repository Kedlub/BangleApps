(function () {
  var DEFAULTS = {
    mode: 0,
    apps: [],
    smart: true,
  };
  var settings = require("Storage").readJSON("backswipe.json", 1) || DEFAULTS;
  // If settings are from older version, compare them to the defaults and update
  if (settings.smart === undefined) {
    settings.smart = DEFAULTS.smart;
  }

  // Overrride the default setUI method, so we can save the back button callback
  var setUI = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    var options = {};
    if ("object"==typeof mode) {
      options = mode;
    }

    var currentFile = global.__FILE__ || "";

    // If current app is a "keyboard", then disable backswipe
    var appName = currentFile.split(".")[0];
    var appInfo = require("Storage").readJSON(appName + ".info", 1);
    if (appInfo && appInfo.type === "keyboard") {
      if (global.BACK) delete global.BACK;
      setUI(mode, cb);
      return;
    }

    if(global.BACK) delete global.BACK;
    if (options && options.back && enabledForApp(currentFile)) {
      global.BACK = options.back;
    }
    setUI(mode, cb);
  };

  function goBack(lr, ud) {
    // if it is a left to right swipe
    if (lr === 1) {
      // if we're in an app that has a back button, run the callback for it
      if (global.BACK) {
        global.BACK();
      }
    }
  }

  // Check if the back button should be enabled for the current app
  // app is the src file of the app
  function enabledForApp(app) {
    if (!settings) return true;
    if (settings.smart && (Bangle["#onswipe"] instanceof Array)&&Bangle["#onswipe"].length>1)
      return false; // if we have other swipe handlers, don't do anything
    if (settings.mode === 0) {
      return !(settings.apps.filter((a) => a.src === app).length > 0);
    } else if (settings.mode === 1) {
      return settings.apps.filter((a) => a.src === app).length > 0;
    } else {
      return settings.mode === 2 ? true : false;
    }
  }

  // Listen to left to right swipe
  Bangle.on("swipe", goBack);
})();
