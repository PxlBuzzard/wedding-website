var jQuery;
var MyRegistryEmbed = {
  currHostName: 'https://www.myregistry.com/',
  iframePath: 'https://www.myregistry.com/ExternalApps/EmbededVistorView/v2/Visitors/GiftList.aspx?registryId=1795393&pageSize=10000',
  version: '2',
  contentHeight: '626px',
  giftCount: 2,
  isEasyXDMLoaded: false,
  isJqueryLoaded: false,
  socket: null,
  iframeElem: null,
  iframeId: 'myregsitry_embeded_iframe',
  mainPanelContainer: '#myregsitry_embeded_container',
  scriptContainer: '#script_myregistry_giftlist_iframe',
  initialize: function () {
    MyRegistryEmbed.setEmbededElement();
  },
  createContainer: function () {
    var container = document.createElement('div');
    container.id = this.mainPanelContainer.replace('#', '').replace('.', '');
    jQuery(container).css('border', '0');
    return container;
  },
  setEmbededElement: function () {
    MyRegistryEmbed.loadJquery(function () {
      MyRegistryEmbed.createIframe();
    });
  },
  loadJquery: function (callback) {
    var styleTag = document.createElement('link');
    styleTag.id = 'MyRegistryInitializeStyle';
    styleTag.setAttribute('type', 'text/css');
    styleTag.setAttribute('rel', 'stylesheet');
    styleTag.setAttribute('href', 'css/myregistry.css');
    if (document.getElementsByTagName('head').length > 0) {
      document.getElementsByTagName('head') [0].appendChild(styleTag);
    } else if (document.getElementsByTagName('body').length > 0) {
      document.getElementsByTagName('head') [0].appendChild(styleTag);
    } else {
      alert('An error has occurred. Please try again later.');
    }
    if (jQuery) {
      MyRegistryEmbed.isJqueryLoaded = true;
      if (callback) {
        callback();
      }
      return;
    }
    var scriptSet = MyRegistryEmbed.currHostName + '/ScriptSet/MrJqueryScripts.js';
    var scriptLoaded = function () {
      MyRegistryEmbed.isJqueryLoaded = true;
      try {
        jQuery = jQuery.noConflict(true);
        jQuery(window).bind('resize', function () {
          var el = MyRegistryEmbed.iframeElem;
          el.contentWindow.postMessage(JSON.stringify({
            method: 'getCurrentDocumentSize',
            params: ''
          }), el.src);
        });
      } catch (e) {
      }
      if (callback) {
        callback();
      }
    };
    var scriptTag = document.createElement('script');
    scriptTag.id = 'MyRegistryInitializeScript';
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', scriptSet);
    if (scriptTag.readyState) {
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete' || this.readyState == 'loaded') {
          scriptLoaded();
        }
      };
    } else {
      scriptTag.onload = function () {
        scriptLoaded();
      };
    }
    if (document.getElementsByTagName('head').length > 0) {
      document.getElementsByTagName('head') [0].appendChild(scriptTag);
    } else if (document.getElementsByTagName('body').length > 0) {
      document.getElementsByTagName('body') [0].appendChild(scriptTag);
    } else {
      alert('An error has occurred. Please try again later.');
    }
  },
  getParentOffsetTop: function (obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj) {
      if (typeof obj.offsetParent != 'undefined' && obj.offsetParent) {
        do {
          if (typeof obj != 'undefined' && obj && typeof obj.offsetParent != 'undefined' && obj.offsetParent) {
            curtop += obj.offsetTop;
          } else {
            break;
          }
        } while (obj = obj.offsetParent);
      }
    }
    return {
      x: curleft,
      y: curtop
    };
  },
  setAttributes: function (el, attrs) {
    for (var key in attrs) {
      if ((key === 'styles' || key === 'style') && typeof attrs[key] === 'object') {
        for (var prop in attrs[key]) {
          el.style[prop] = attrs[key][prop];
        }
      } else if (key === 'html') {
        el.innerHTML = attrs[key];
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
  },
  createIframe: function () {
    MyRegistryEmbed.iframeElem = document.createElement('iframe');
    MyRegistryEmbed.setAttributes(MyRegistryEmbed.iframeElem, {
      id: MyRegistryEmbed.iframeId,
      src: MyRegistryEmbed.iframePath,
      frameBorder: '0',
      style: {
        width: '100%',
        height: MyRegistryEmbed.contentHeight,
        display: 'block'
      }
    });
    var onMessageReceived = function (event) {
      if (event) {
        try {
          var message = event.data;
          if (message) {
            message = jQuery.parseJSON(message);
          }
          if (typeof message.method != 'undefined') {
            switch (message.method) {
              case 'resize':
                MyRegistryEmbed.resize(message.params.width, message.params.height);
                break;
              case 'visitorviewimage':
                MyRegistryEmbed.showPopup(message.method, message.path, message.params, message.html, function () {
                  var topPos = MyRegistryEmbed.initVisitorPopupImage(this);
                  MyRegistryEmbed.centerPopup(topPos);
                });
                break;
              case 'onGiftListResize':
                MyRegistryEmbed.onGiftListResize(message.params.height);
                break;
              default:
                MyRegistryEmbed.showPopup(message.method, message.path, message.params, message.html, function () {
                  MyRegistryEmbed.centerPopup();
                });
                break;
            }
          }
        } catch (e) {
        }
      }
    };
    MyRegistryEmbed.iframeElem.onload = function () {
      MyRegistryEmbed.addWinEvent('message', onMessageReceived);
      var el = MyRegistryEmbed.iframeElem;
      el.contentWindow.postMessage(JSON.stringify({
        method: 'getCurrentDocumentSize',
        params: ''
      }), el.src);
    };
    var scriptElement = document.getElementById(MyRegistryEmbed.scriptContainer.replace('#', ''));
    if (scriptElement) {
      if (scriptElement.parentNode) {
        scriptElement.parentNode.appendChild(MyRegistryEmbed.iframeElem);
      }
    }
  },
  addWinEvent: function (event, listener) {
    if (window.addEventListener) {
      addEventListener(event, listener, false);
    } else {
      attachEvent('on' + event, listener);
    }
  },
  resize: function (width, height) {
    var iframe = jQuery(MyRegistryEmbed.scriptContainer).parent().find('iframe') [0];
    if (iframe) {
      document.body.dispatchEvent(new Event('resize'));
    }
  },
  onGiftListResize: function (height) {
    var iframe = jQuery(MyRegistryEmbed.scriptContainer).parent().find('iframe') [0];
    if (iframe) {
      jQuery(iframe).css('height', height + 'px');
    }
  },
  showPopup: function (id, page, params, html, openCallback, closeCallback, beforeCloseCallback, leftPosition, topPosition, isModalClose) {
    if (!openCallback) openCallback = function () {
    };
    if (!closeCallback) closeCallback = function () {
      jQuery(this).remove();
    };
    if (isModalClose == undefined) isModalClose = true;
    var container = '<div id=\'' + id + '\' style=\'width:560px;height:300px;\'>' + html + '</div>';
    jQuery(container).bPopup({
      modalColor: '#464646',
      modalClose: isModalClose,
      followSpeed: 0,
      follow: [
        true,
        true
      ],
      position: [
        (topPosition == null ? 'auto' : topPosition + 'px'),
        (leftPosition == null ? 'auto' : leftPosition + 'px')
      ],
      positionStyle: 'absolute',
      loadCallback: openCallback,
      onClose: closeCallback,
      beforeClose: beforeCloseCallback,
      closeClass: 'b-close',
      easing: 'easeOutBack',
      speed: 450,
      transition: (params && params.transition) ? params.transition : 'none',
      onOpen: function () {
        var popup = jQuery(this);
        function closePopup() {
          popup.bPopup().close();
          jQuery(document).off('mouseup', detectClickOut);
        }
        function detectClickOut(e) {
          if (!popup.is(e.target) && popup.has(e.target).length === 0) {
            closePopup();
          }
        }
        popup.find('.b-close').click(closePopup);
        jQuery(document).on('mouseup', detectClickOut);
        openCallback.call(this);
      }
    });
  },
  initVisitorPopupImage: function (container) {
    var dots = jQuery(container).find('.pdots li');
    function setTimer() {
      window.timer = setInterval(function () {
        var next = dots.filter('.active').next();
        next.length == 0 ? dots.eq(0).trigger('click')  : next.trigger('click');
      }, 10000);
    }
    dots.each(function (idx, item) {
      jQuery(item).click(function () {
        if (jQuery('.welcomeImg').length > 1) {
          if (window.timer != undefined) {
            clearInterval(window.timer);
          }
          jQuery('.welcomeImg').hide();
          jQuery('.welcomeImg:nth(' + idx + ')').show();
          jQuery('.pdots li').removeClass('active');
          jQuery('.pdots li:nth(' + idx + ')').addClass('active');
          var dialog = jQuery('.mrw_dialogpanel.small.v2');
          var leftPos = (window.innerWidth - dialog.width()) / 2;
          dialog.css('left', leftPos + 'px');
          setTimer();
        }
      });
    });
    setTimer();
    var images = jQuery(container).find('.welcomeImg');
    var maxHeight = 0;
    images.each(function (idx, elem) {
      var imgSrc = jQuery(elem).attr('src');
      var image = new Image();
      image.src = imgSrc;
      if (image.height > maxHeight) {
        maxHeight = image.height;
      }
    });
    var maxImgHeight = Math.min(maxHeight, window.innerHeight - 120);
    images.css('max-height', maxImgHeight + 'px');
    var maxImgWidth = Math.min(800, window.innerWidth - 120);
    images.css('max-width', maxImgWidth + 'px'); /*var topPos = Math.max((window.innerHeight - Math.min(maxImgHeight, window.innerHeight) - 120) / 2, 16);*/
    var frameTopPos = 0; /*jQuery(MyRegistryEmbed.iframeElem).offset().top;*/
    var topPos = Math.max((window.innerHeight - maxImgHeight - 120) / 2, 16) - frameTopPos;
    return topPos;
  },
  centerPopup: function (topPosition) {
    setTimeout(function () {
      var dialog = jQuery('.mrw_dialogpanel.v2');
      dialog.css('position', 'fixed');
      if (window.innerHeight - dialog.height() > 0) {
        var topPos = topPosition || (window.innerHeight - dialog.height()) / 2;
        dialog.css('top', topPos + 'px');
      }
      if (window.innerWidth - dialog.width() > 0) {
        var leftPos = (window.innerWidth - dialog.width()) / 2;
        dialog.css('left', leftPos + 'px');
      }
    }, 100);
  }
};
var VisitorClient = {
  printSelectedGifts: function () {
    var selectedGiftIds = new Array();
    var checkedGifts = jQuery('.mrw_dialogpanel input.giftCheck:checked');
    for (var i = 0; i < checkedGifts.length; i++) {
      var id = jQuery(checkedGifts[i]).attr('id').replace('giftCheck', '');
      selectedGiftIds.push(id);
    }
    var el = MyRegistryEmbed.iframeElem;
    el.contentWindow.postMessage(JSON.stringify({
      method: 'printSelectedGifts',
      params: {
        idList: selectedGiftIds
      }
    }), el.src);
  },
  PrintView: function () {
    var el = MyRegistryEmbed.iframeElem;
    el.contentWindow.postMessage(JSON.stringify({
      method: 'printAllGifts'
    }), el.src);
  },
  ShippingInfoPrint: function () {
    var el = MyRegistryEmbed.iframeElem;
    el.contentWindow.postMessage(JSON.stringify({
      method: 'ShippingInfoPrint',
      params: {
        str: document.getElementById('PanelsShippingInfoContainer').innerHTML
      }
    }), el.src);
  }
};
var GiftVisitorClient = {
  MarkAsAvailableSubmit: function (id) {
    var el = MyRegistryEmbed.iframeElem;
    el.contentWindow.postMessage(JSON.stringify({
      method: 'MarkAsAvailableSubmit',
      params: {
        id: id
      }
    }), el.src);
    var popup = jQuery('#pnlMarkAsAvailablePanel');
    if (popup.length > 0) {
      popup.bPopup().close();
      jQuery('body').removeClass('ShowPopupPanel');
    }
  }
};
MyRegistryEmbed.initialize();
