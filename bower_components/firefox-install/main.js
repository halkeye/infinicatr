define(function(req){

  'use strict';

  var cssUrl = req.toUrl('./ribbon.css');

  var manifestUrl = location.href.substring(0, location.href.lastIndexOf('/')) + '/manifest.webapp';

  function importCSS(){
    var link = document.createElement('link');
    link.href = cssUrl;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    return link;
  }

  function createRibbon(){
    var installRibbon = document.createElement('span');
    installRibbon.classList.add('ff-install');
    installRibbon.classList.add('ff-show');
    return installRibbon;
  }

  function createLink(){
    var installLink = document.createElement('a');
    installLink.href = '#';
    installLink.textContent = 'Install w/ Firefox';
    installLink.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var install = navigator.mozApps.install(manifestUrl);
      console.log(install);
      var installRibbon = installLink.parentNode;
      install.addEventListener('success', function(){
        installRibbon.classList.remove('ff-show');
      });
      install.addEventListener('error', function(){
        console.error('Error Installing App: ', install.error.name);
        installRibbon.classList.add('ff-error');
        this.textContent = 'Install Failed';
      });
    });
    return installLink;
  }

  function createInstall(){
    var head = document.getElementsByTagName('head')[0];
    head.insertBefore(importCSS(), head.firstChild);
    var body = document.body;
    var installRibbon = createRibbon();
    var installLink = createLink();
    installRibbon.appendChild(installLink);
    body.insertBefore(installRibbon, body.firstChild);
    return installRibbon;
  }

  function checkInstalled(){
    var installed = navigator.mozApps.checkInstalled(manifestUrl);
    installed.addEventListener('success', function(){
      console.log(installed);
      if(!installed.result){
        createInstall();
      }
    });
  }

  function checkIsApp(){
    var isApp = navigator.mozApps.getSelf();
    isApp.addEventListener('success', function(){
      if(!isApp.result){
        checkInstalled();
      }
    });
    isApp.addEventListener('error', function(){
      console.error('Error Verifying App: ', isApp.error.name);
    });
  }

  if(navigator.mozApps){
    checkIsApp();
  }

});