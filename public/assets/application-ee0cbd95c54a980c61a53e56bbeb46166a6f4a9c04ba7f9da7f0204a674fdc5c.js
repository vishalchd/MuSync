/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */


(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));
/* ========================================================================
 * Bootstrap: affix.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#affix
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    var target = this.options.target === Affix.DEFAULTS.target ? $(this.options.target) : $(document).find(this.options.target)

    this.$target = target
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.4.1'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: alert.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.4.1'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    selector    = selector === '#' ? [] : selector
    var $parent = $(document).find(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);
/* ========================================================================
 * Bootstrap: button.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.4.1'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d).prop(d, true)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d).prop(d, false)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target).closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
        e.preventDefault()
        // The target component still receive the focus
        if ($btn.is('input,button')) $btn.trigger('focus')
        else $btn.find('input:visible,button:visible').first().trigger('focus')
      }
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);
/* ========================================================================
 * Bootstrap: carousel.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.4.1'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      if (typeof $next === 'object' && $next.length) {
        $next[0].offsetWidth // force reflow
      }
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    if (href) {
      href = href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
    }

    var target  = $this.attr('data-target') || href
    var $target = $(document).find(target)

    if (!$target.hasClass('carousel')) return

    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: collapse.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.4.1'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(document).find(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(document).find(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: dropdown.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.4.1'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector !== '#' ? $(document).find(selector) : null

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);
/* ========================================================================
 * Bootstrap: modal.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#modals
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options = options
    this.$body = $(document.body)
    this.$element = $(element)
    this.$dialog = this.$element.find('.modal-dialog')
    this.$backdrop = null
    this.isShown = null
    this.originalBodyPad = null
    this.scrollbarWidth = 0
    this.ignoreBackdropClick = false
    this.fixedContent = '.navbar-fixed-top, .navbar-fixed-bottom'

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION = '3.4.1'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
          this.$element[0] !== e.target &&
          !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    var scrollbarWidth = this.scrollbarWidth
    if (this.bodyIsOverflowing) {
      this.$body.css('padding-right', bodyPad + scrollbarWidth)
      $(this.fixedContent).each(function (index, element) {
        var actualPadding = element.style.paddingRight
        var calculatedPadding = $(element).css('padding-right')
        $(element)
          .data('padding-right', actualPadding)
          .css('padding-right', parseFloat(calculatedPadding) + scrollbarWidth + 'px')
      })
    }
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
    $(this.fixedContent).each(function (index, element) {
      var padding = $(element).data('padding-right')
      $(element).removeData('padding-right')
      element.style.paddingRight = padding ? padding : ''
    })
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
    var href = $this.attr('href')
    var target = $this.attr('data-target') ||
      (href && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7

    var $target = $(document).find(target)
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: scrollspy.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.4.1'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: tab.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.4.1'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(document).find(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
          .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);
/* ========================================================================
 * Bootstrap: transition.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: https://modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // https://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: tooltip.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn']

  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href'
  ]

  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i

  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  }

  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi

  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i

  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase()

    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
      }

      return true
    }

    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp
    })

    // Check if a regular expression validates the attribute.
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true
      }
    }

    return false
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml)
    }

    // IE 8 and below don't support createHTMLDocument
    if (!document.implementation || !document.implementation.createHTMLDocument) {
      return unsafeHtml
    }

    var createdDocument = document.implementation.createHTMLDocument('sanitization')
    createdDocument.body.innerHTML = unsafeHtml

    var whitelistKeys = $.map(whiteList, function (el, i) { return i })
    var elements = $(createdDocument.body).find('*')

    for (var i = 0, len = elements.length; i < len; i++) {
      var el = elements[i]
      var elName = el.nodeName.toLowerCase()

      if ($.inArray(elName, whitelistKeys) === -1) {
        el.parentNode.removeChild(el)

        continue
      }

      var attributeList = $.map(el.attributes, function (el) { return el })
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || [])

      for (var j = 0, len2 = attributeList.length; j < len2; j++) {
        if (!allowedAttribute(attributeList[j], whitelistedAttributes)) {
          el.removeAttribute(attributeList[j].nodeName)
        }
      }
    }

    return createdDocument.body.innerHTML
  }

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.4.1'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    },
    sanitize : true,
    sanitizeFn : null,
    whiteList : DefaultWhitelist
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(document).find($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    var dataAttributes = this.$element.data()

    for (var dataAttr in dataAttributes) {
      if (dataAttributes.hasOwnProperty(dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
        delete dataAttributes[dataAttr]
      }
    }

    options = $.extend({}, this.getDefaults(), dataAttributes, options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    if (options.sanitize) {
      options.template = sanitizeHtml(options.template, options.whiteList, options.sanitizeFn)
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo($(document).find(this.options.container)) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    if (this.options.html) {
      if (this.options.sanitize) {
        title = sanitizeHtml(title, this.options.whiteList, this.options.sanitizeFn)
      }

      $tip.find('.tooltip-inner').html(title)
    } else {
      $tip.find('.tooltip-inner').text(title)
    }

    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }

  Tooltip.prototype.sanitizeHtml = function (unsafeHtml) {
    return sanitizeHtml(unsafeHtml, this.options.whiteList, this.options.sanitizeFn)
  }

  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);
/* ========================================================================
 * Bootstrap: popover.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.4.1'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    if (this.options.html) {
      var typeContent = typeof content

      if (this.options.sanitize) {
        title = this.sanitizeHtml(title)

        if (typeContent === 'string') {
          content = this.sanitizeHtml(content)
        }
      }

      $tip.find('.popover-title').html(title)
      $tip.find('.popover-content').children().detach().end()[
        typeContent === 'string' ? 'html' : 'append'
      ](content)
    } else {
      $tip.find('.popover-title').text(title)
      $tip.find('.popover-content').children().detach().end().text(content)
    }

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
        o.content.call($e[0]) :
        o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);












/* 
  @package NOTY - Dependency-free notification library 
  @version version: 3.2.0-beta 
  @contributors https://github.com/needim/noty/graphs/contributors 
  @documentation Examples and Documentation - https://ned.im/noty 
  @license Licensed under the MIT licenses: http://www.opensource.org/licenses/mit-license.php 
*/


(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Noty", [], factory);
	else if(typeof exports === 'object')
		exports["Noty"] = factory();
	else
		root["Noty"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.css = exports.deepExtend = exports.animationEndEvents = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.inArray = inArray;
exports.stopPropagation = stopPropagation;
exports.generateID = generateID;
exports.outerHeight = outerHeight;
exports.addListener = addListener;
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.remove = remove;
exports.classList = classList;
exports.visibilityChangeFlow = visibilityChangeFlow;
exports.createAudioElements = createAudioElements;

var _api = __webpack_require__(1);

var API = _interopRequireWildcard(_api);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var animationEndEvents = exports.animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

function inArray(needle, haystack, argStrict) {
  var key = void 0;
  var strict = !!argStrict;

  if (strict) {
    for (key in haystack) {
      if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
        return true;
      }
    }
  }
  return false;
}

function stopPropagation(evt) {
  evt = evt || window.event;

  if (typeof evt.stopPropagation !== 'undefined') {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true;
  }
}

var deepExtend = exports.deepExtend = function deepExtend(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj) continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          out[key] = obj[key];
        } else if (_typeof(obj[key]) === 'object' && obj[key] !== null) {
          out[key] = deepExtend(out[key], obj[key]);
        } else {
          out[key] = obj[key];
        }
      }
    }
  }

  return out;
};

function generateID() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var id = 'noty_' + prefix + '_';

  id += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });

  return id;
}

function outerHeight(el) {
  var height = el.offsetHeight;
  var style = window.getComputedStyle(el);

  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

var css = exports.css = function () {
  var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
  var cssProps = {};

  function camelCase(string) {
    return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
      return letter.toUpperCase();
    });
  }

  function getVendorProp(name) {
    var style = document.body.style;
    if (name in style) return name;

    var i = cssPrefixes.length;
    var capName = name.charAt(0).toUpperCase() + name.slice(1);
    var vendorName = void 0;

    while (i--) {
      vendorName = cssPrefixes[i] + capName;
      if (vendorName in style) return vendorName;
    }

    return name;
  }

  function getStyleProp(name) {
    name = camelCase(name);
    return cssProps[name] || (cssProps[name] = getVendorProp(name));
  }

  function applyCss(element, prop, value) {
    prop = getStyleProp(prop);
    element.style[prop] = value;
  }

  return function (element, properties) {
    var args = arguments;
    var prop = void 0;
    var value = void 0;

    if (args.length === 2) {
      for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          value = properties[prop];
          if (value !== undefined && properties.hasOwnProperty(prop)) {
            applyCss(element, prop, value);
          }
        }
      }
    } else {
      applyCss(element, args[1], args[2]);
    }
  };
}();

function addListener(el, events, cb) {
  var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  events = events.split(' ');
  for (var i = 0; i < events.length; i++) {
    if (document.addEventListener) {
      el.addEventListener(events[i], cb, useCapture);
    } else if (document.attachEvent) {
      el.attachEvent('on' + events[i], cb);
    }
  }
}

function hasClass(element, name) {
  var list = typeof element === 'string' ? element : classList(element);
  return list.indexOf(' ' + name + ' ') >= 0;
}

function addClass(element, name) {
  var oldList = classList(element);
  var newList = oldList + name;

  if (hasClass(oldList, name)) return;

  // Trim the opening space.
  element.className = newList.substring(1);
}

function removeClass(element, name) {
  var oldList = classList(element);
  var newList = void 0;

  if (!hasClass(element, name)) return;

  // Replace the class name.
  newList = oldList.replace(' ' + name + ' ', ' ');

  // Trim the opening and closing spaces.
  element.className = newList.substring(1, newList.length - 1);
}

function remove(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function classList(element) {
  return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
}

function visibilityChangeFlow() {
  var hidden = void 0;
  var visibilityChange = void 0;
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  function onVisibilityChange() {
    API.PageHidden = document[hidden];
    handleVisibilityChange();
  }

  function onBlur() {
    API.PageHidden = true;
    handleVisibilityChange();
  }

  function onFocus() {
    API.PageHidden = false;
    handleVisibilityChange();
  }

  function handleVisibilityChange() {
    if (API.PageHidden) stopAll();else resumeAll();
  }

  function stopAll() {
    setTimeout(function () {
      Object.keys(API.Store).forEach(function (id) {
        if (API.Store.hasOwnProperty(id)) {
          if (API.Store[id].options.visibilityControl) {
            API.Store[id].stop();
          }
        }
      });
    }, 100);
  }

  function resumeAll() {
    setTimeout(function () {
      Object.keys(API.Store).forEach(function (id) {
        if (API.Store.hasOwnProperty(id)) {
          if (API.Store[id].options.visibilityControl) {
            API.Store[id].resume();
          }
        }
      });
      API.queueRenderAll();
    }, 100);
  }

  if (visibilityChange) {
    addListener(document, visibilityChange, onVisibilityChange);
  }

  addListener(window, 'blur', onBlur);
  addListener(window, 'focus', onFocus);
}

function createAudioElements(ref) {
  if (ref.hasSound) {
    var audioElement = document.createElement('audio');

    ref.options.sounds.sources.forEach(function (s) {
      var source = document.createElement('source');
      source.src = s;
      source.type = 'audio/' + getExtension(s);
      audioElement.appendChild(source);
    });

    if (ref.barDom) {
      ref.barDom.appendChild(audioElement);
    } else {
      document.querySelector('body').appendChild(audioElement);
    }

    audioElement.volume = ref.options.sounds.volume;

    if (!ref.soundPlayed) {
      audioElement.play();
      ref.soundPlayed = true;
    }

    audioElement.onended = function () {
      remove(audioElement);
    };
  }
}

function getExtension(fileName) {
  return fileName.match(/\.([^.]+)$/)[1];
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Defaults = exports.Store = exports.Queues = exports.DefaultMaxVisible = exports.docTitle = exports.DocModalCount = exports.PageHidden = undefined;
exports.getQueueCounts = getQueueCounts;
exports.addToQueue = addToQueue;
exports.removeFromQueue = removeFromQueue;
exports.queueRender = queueRender;
exports.queueRenderAll = queueRenderAll;
exports.ghostFix = ghostFix;
exports.build = build;
exports.hasButtons = hasButtons;
exports.handleModal = handleModal;
exports.handleModalClose = handleModalClose;
exports.queueClose = queueClose;
exports.dequeueClose = dequeueClose;
exports.fire = fire;
exports.openFlow = openFlow;
exports.closeFlow = closeFlow;

var _utils = __webpack_require__(0);

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var PageHidden = exports.PageHidden = false;
var DocModalCount = exports.DocModalCount = 0;

var DocTitleProps = {
  originalTitle: null,
  count: 0,
  changed: false,
  timer: -1
};

var docTitle = exports.docTitle = {
  increment: function increment() {
    DocTitleProps.count++;

    docTitle._update();
  },

  decrement: function decrement() {
    DocTitleProps.count--;

    if (DocTitleProps.count <= 0) {
      docTitle._clear();
      return;
    }

    docTitle._update();
  },

  _update: function _update() {
    var title = document.title;

    if (!DocTitleProps.changed) {
      DocTitleProps.originalTitle = title;
      document.title = '(' + DocTitleProps.count + ') ' + title;
      DocTitleProps.changed = true;
    } else {
      document.title = '(' + DocTitleProps.count + ') ' + DocTitleProps.originalTitle;
    }
  },

  _clear: function _clear() {
    if (DocTitleProps.changed) {
      DocTitleProps.count = 0;
      document.title = DocTitleProps.originalTitle;
      DocTitleProps.changed = false;
    }
  }
};

var DefaultMaxVisible = exports.DefaultMaxVisible = 5;

var Queues = exports.Queues = {
  global: {
    maxVisible: DefaultMaxVisible,
    queue: []
  }
};

var Store = exports.Store = {};

var Defaults = exports.Defaults = {
  type: 'alert',
  layout: 'topRight',
  theme: 'mint',
  text: '',
  timeout: false,
  progressBar: true,
  closeWith: ['click'],
  animation: {
    open: 'noty_effects_open',
    close: 'noty_effects_close'
  },
  id: false,
  force: false,
  killer: false,
  queue: 'global',
  container: false,
  buttons: [],
  callbacks: {
    beforeShow: null,
    onShow: null,
    afterShow: null,
    onClose: null,
    afterClose: null,
    onClick: null,
    onHover: null,
    onTemplate: null
  },
  sounds: {
    sources: [],
    volume: 1,
    conditions: []
  },
  titleCount: {
    conditions: []
  },
  modal: false,
  visibilityControl: false

  /**
   * @param {string} queueName
   * @return {object}
   */
};function getQueueCounts() {
  var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

  var count = 0;
  var max = DefaultMaxVisible;

  if (Queues.hasOwnProperty(queueName)) {
    max = Queues[queueName].maxVisible;
    Object.keys(Store).forEach(function (i) {
      if (Store[i].options.queue === queueName && !Store[i].closed) count++;
    });
  }

  return {
    current: count,
    maxVisible: max
  };
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function addToQueue(ref) {
  if (!Queues.hasOwnProperty(ref.options.queue)) {
    Queues[ref.options.queue] = { maxVisible: DefaultMaxVisible, queue: [] };
  }

  Queues[ref.options.queue].queue.push(ref);
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function removeFromQueue(ref) {
  if (Queues.hasOwnProperty(ref.options.queue)) {
    var queue = [];
    Object.keys(Queues[ref.options.queue].queue).forEach(function (i) {
      if (Queues[ref.options.queue].queue[i].id !== ref.id) {
        queue.push(Queues[ref.options.queue].queue[i]);
      }
    });
    Queues[ref.options.queue].queue = queue;
  }
}

/**
 * @param {string} queueName
 * @return {void}
 */
function queueRender() {
  var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

  if (Queues.hasOwnProperty(queueName)) {
    var noty = Queues[queueName].queue.shift();

    if (noty) noty.show();
  }
}

/**
 * @return {void}
 */
function queueRenderAll() {
  Object.keys(Queues).forEach(function (queueName) {
    queueRender(queueName);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function ghostFix(ref) {
  var ghostID = Utils.generateID('ghost');
  var ghost = document.createElement('div');
  ghost.setAttribute('id', ghostID);
  Utils.css(ghost, {
    height: Utils.outerHeight(ref.barDom) + 'px'
  });

  ref.barDom.insertAdjacentHTML('afterend', ghost.outerHTML);

  Utils.remove(ref.barDom);
  ghost = document.getElementById(ghostID);
  Utils.addClass(ghost, 'noty_fix_effects_height');
  Utils.addListener(ghost, Utils.animationEndEvents, function () {
    Utils.remove(ghost);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function build(ref) {
  findOrCreateContainer(ref);

  var markup = '<div class="noty_body">' + ref.options.text + '</div>' + buildButtons(ref) + '<div class="noty_progressbar"></div>';

  ref.barDom = document.createElement('div');
  ref.barDom.setAttribute('id', ref.id);
  Utils.addClass(ref.barDom, 'noty_bar noty_type__' + ref.options.type + ' noty_theme__' + ref.options.theme);

  ref.barDom.innerHTML = markup;

  fire(ref, 'onTemplate');
}

/**
 * @param {Noty} ref
 * @return {boolean}
 */
function hasButtons(ref) {
  return !!(ref.options.buttons && Object.keys(ref.options.buttons).length);
}

/**
 * @param {Noty} ref
 * @return {string}
 */
function buildButtons(ref) {
  if (hasButtons(ref)) {
    var buttons = document.createElement('div');
    Utils.addClass(buttons, 'noty_buttons');

    Object.keys(ref.options.buttons).forEach(function (key) {
      buttons.appendChild(ref.options.buttons[key].dom);
    });

    ref.options.buttons.forEach(function (btn) {
      buttons.appendChild(btn.dom);
    });
    return buttons.outerHTML;
  }
  return '';
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function handleModal(ref) {
  if (ref.options.modal) {
    if (DocModalCount === 0) {
      createModal(ref);
    }

    exports.DocModalCount = DocModalCount += 1;
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function handleModalClose(ref) {
  if (ref.options.modal && DocModalCount > 0) {
    exports.DocModalCount = DocModalCount -= 1;

    if (DocModalCount <= 0) {
      var modal = document.querySelector('.noty_modal');

      if (modal) {
        Utils.removeClass(modal, 'noty_modal_open');
        Utils.addClass(modal, 'noty_modal_close');
        Utils.addListener(modal, Utils.animationEndEvents, function () {
          Utils.remove(modal);
        });
      }
    }
  }
}

/**
 * @return {void}
 */
function createModal() {
  var body = document.querySelector('body');
  var modal = document.createElement('div');
  Utils.addClass(modal, 'noty_modal');
  body.insertBefore(modal, body.firstChild);
  Utils.addClass(modal, 'noty_modal_open');

  Utils.addListener(modal, Utils.animationEndEvents, function () {
    Utils.removeClass(modal, 'noty_modal_open');
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function findOrCreateContainer(ref) {
  if (ref.options.container) {
    ref.layoutDom = document.querySelector(ref.options.container);
    return;
  }

  var layoutID = 'noty_layout__' + ref.options.layout;
  ref.layoutDom = document.querySelector('div#' + layoutID);

  if (!ref.layoutDom) {
    ref.layoutDom = document.createElement('div');
    ref.layoutDom.setAttribute('id', layoutID);
    ref.layoutDom.setAttribute('role', 'alert');
    ref.layoutDom.setAttribute('aria-live', 'polite');
    Utils.addClass(ref.layoutDom, 'noty_layout');
    document.querySelector('body').appendChild(ref.layoutDom);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function queueClose(ref) {
  if (ref.options.timeout) {
    if (ref.options.progressBar && ref.progressDom) {
      Utils.css(ref.progressDom, {
        transition: 'width ' + ref.options.timeout + 'ms linear',
        width: '0%'
      });
    }

    clearTimeout(ref.closeTimer);

    ref.closeTimer = setTimeout(function () {
      ref.close();
    }, ref.options.timeout);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function dequeueClose(ref) {
  if (ref.options.timeout && ref.closeTimer) {
    clearTimeout(ref.closeTimer);
    ref.closeTimer = -1;

    if (ref.options.progressBar && ref.progressDom) {
      Utils.css(ref.progressDom, {
        transition: 'width 0ms linear',
        width: '100%'
      });
    }
  }
}

/**
 * @param {Noty} ref
 * @param {string} eventName
 * @return {void}
 */
function fire(ref, eventName) {
  if (ref.listeners.hasOwnProperty(eventName)) {
    ref.listeners[eventName].forEach(function (cb) {
      if (typeof cb === 'function') {
        cb.apply(ref);
      }
    });
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function openFlow(ref) {
  fire(ref, 'afterShow');
  queueClose(ref);

  Utils.addListener(ref.barDom, 'mouseenter', function () {
    dequeueClose(ref);
  });

  Utils.addListener(ref.barDom, 'mouseleave', function () {
    queueClose(ref);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function closeFlow(ref) {
  delete Store[ref.id];
  ref.closing = false;
  fire(ref, 'afterClose');

  Utils.remove(ref.barDom);

  if (ref.layoutDom.querySelectorAll('.noty_bar').length === 0 && !ref.options.container) {
    Utils.remove(ref.layoutDom);
  }

  if (Utils.inArray('docVisible', ref.options.titleCount.conditions) || Utils.inArray('docHidden', ref.options.titleCount.conditions)) {
    docTitle.decrement();
  }

  queueRender(ref.options.queue);
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotyButton = undefined;

var _utils = __webpack_require__(0);

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotyButton = exports.NotyButton = function NotyButton(html, classes, cb) {
  var _this = this;

  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  _classCallCheck(this, NotyButton);

  this.dom = document.createElement('button');
  this.dom.innerHTML = html;
  this.id = attributes.id = attributes.id || Utils.generateID('button');
  this.cb = cb;
  Object.keys(attributes).forEach(function (propertyName) {
    _this.dom.setAttribute(propertyName, attributes[propertyName]);
  });
  Utils.addClass(this.dom, classes || 'noty_btn');

  return this;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Push = exports.Push = function () {
  function Push() {
    var workerPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/service-worker.js';

    _classCallCheck(this, Push);

    this.subData = {};
    this.workerPath = workerPath;
    this.listeners = {
      onPermissionGranted: [],
      onPermissionDenied: [],
      onSubscriptionSuccess: [],
      onSubscriptionCancel: [],
      onWorkerError: [],
      onWorkerSuccess: [],
      onWorkerNotSupported: []
    };
    return this;
  }

  /**
   * @param {string} eventName
   * @param {function} cb
   * @return {Push}
   */


  _createClass(Push, [{
    key: 'on',
    value: function on(eventName) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].push(cb);
      }

      return this;
    }
  }, {
    key: 'fire',
    value: function fire(eventName) {
      var _this = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].forEach(function (cb) {
          if (typeof cb === 'function') {
            cb.apply(_this, params);
          }
        });
      }
    }
  }, {
    key: 'create',
    value: function create() {
      console.log('NOT IMPLEMENTED YET');
    }

    /**
     * @return {boolean}
     */

  }, {
    key: 'isSupported',
    value: function isSupported() {
      var result = false;

      try {
        result = window.Notification || window.webkitNotifications || navigator.mozNotification || window.external && window.external.msIsSiteMode() !== undefined;
      } catch (e) {}

      return result;
    }

    /**
     * @return {string}
     */

  }, {
    key: 'getPermissionStatus',
    value: function getPermissionStatus() {
      var perm = 'default';

      if (window.Notification && window.Notification.permissionLevel) {
        perm = window.Notification.permissionLevel;
      } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
        switch (window.webkitNotifications.checkPermission()) {
          case 1:
            perm = 'default';
            break;
          case 0:
            perm = 'granted';
            break;
          default:
            perm = 'denied';
        }
      } else if (window.Notification && window.Notification.permission) {
        perm = window.Notification.permission;
      } else if (navigator.mozNotification) {
        perm = 'granted';
      } else if (window.external && window.external.msIsSiteMode() !== undefined) {
        perm = window.external.msIsSiteMode() ? 'granted' : 'default';
      }

      return perm.toString().toLowerCase();
    }

    /**
     * @return {string}
     */

  }, {
    key: 'getEndpoint',
    value: function getEndpoint(subscription) {
      var endpoint = subscription.endpoint;
      var subscriptionId = subscription.subscriptionId;

      // fix for Chrome < 45
      if (subscriptionId && endpoint.indexOf(subscriptionId) === -1) {
        endpoint += '/' + subscriptionId;
      }

      return endpoint;
    }

    /**
     * @return {boolean}
     */

  }, {
    key: 'isSWRegistered',
    value: function isSWRegistered() {
      try {
        return navigator.serviceWorker.controller.state === 'activated';
      } catch (e) {
        return false;
      }
    }

    /**
     * @return {void}
     */

  }, {
    key: 'unregisterWorker',
    value: function unregisterWorker() {
      var self = this;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = registrations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var registration = _step.value;

              registration.unregister();
              self.fire('onSubscriptionCancel');
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        });
      }
    }

    /**
     * @return {void}
     */

  }, {
    key: 'requestSubscription',
    value: function requestSubscription() {
      var _this2 = this;

      var userVisibleOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var self = this;
      var current = this.getPermissionStatus();
      var cb = function cb(result) {
        if (result === 'granted') {
          _this2.fire('onPermissionGranted');

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(_this2.workerPath).then(function () {
              navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                self.fire('onWorkerSuccess');
                serviceWorkerRegistration.pushManager.subscribe({
                  userVisibleOnly: userVisibleOnly
                }).then(function (subscription) {
                  var key = subscription.getKey('p256dh');
                  var token = subscription.getKey('auth');

                  self.subData = {
                    endpoint: self.getEndpoint(subscription),
                    p256dh: key ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                    auth: token ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                  };

                  self.fire('onSubscriptionSuccess', [self.subData]);
                }).catch(function (err) {
                  self.fire('onWorkerError', [err]);
                });
              });
            });
          } else {
            self.fire('onWorkerNotSupported');
          }
        } else if (result === 'denied') {
          _this2.fire('onPermissionDenied');
          _this2.unregisterWorker();
        }
      };

      if (current === 'default') {
        if (window.Notification && window.Notification.requestPermission) {
          window.Notification.requestPermission(cb);
        } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
          window.webkitNotifications.requestPermission(cb);
        }
      } else {
        cb(current);
      }
    }
  }]);

  return Push;
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.1
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = __webpack_require__(9);
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === GET_THEN_ERROR) {
      reject(promise, GET_THEN_ERROR.error);
      GET_THEN_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator$1(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate(input);
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

Enumerator$1.prototype._enumerate = function (input) {
  for (var i = 0; this._state === PENDING && i < input.length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator$1.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$1 = c.resolve;

  if (resolve$$1 === resolve$1) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise$2) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$1) {
        return resolve$$1(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$1(entry), i);
  }
};

Enumerator$1.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator$1.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all$1(entries) {
  return new Enumerator$1(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race$1(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise$2(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
  }
}

Promise$2.all = all$1;
Promise$2.race = race$1;
Promise$2.resolve = resolve$1;
Promise$2.reject = reject$1;
Promise$2._setScheduler = setScheduler;
Promise$2._setAsap = setAsap;
Promise$2._asap = asap;

Promise$2.prototype = {
  constructor: Promise$2,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

/*global self*/
function polyfill$1() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise$2;
}

// Strange compat..
Promise$2.polyfill = polyfill$1;
Promise$2.Promise = Promise$2;

return Promise$2;

})));

//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(8)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global VERSION */

__webpack_require__(5);

var _es6Promise = __webpack_require__(4);

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _utils = __webpack_require__(0);

var Utils = _interopRequireWildcard(_utils);

var _api = __webpack_require__(1);

var API = _interopRequireWildcard(_api);

var _button = __webpack_require__(2);

var _push = __webpack_require__(3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Noty = function () {
  /**
   * @param {object} options
   * @return {Noty}
   */
  function Noty() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Noty);

    this.options = Utils.deepExtend({}, API.Defaults, options);

    if (API.Store[this.options.id]) {
      return API.Store[this.options.id];
    }

    this.id = this.options.id || Utils.generateID('bar');
    this.closeTimer = -1;
    this.barDom = null;
    this.layoutDom = null;
    this.progressDom = null;
    this.showing = false;
    this.shown = false;
    this.closed = false;
    this.closing = false;
    this.killable = this.options.timeout || this.options.closeWith.length > 0;
    this.hasSound = this.options.sounds.sources.length > 0;
    this.soundPlayed = false;
    this.listeners = {
      beforeShow: [],
      onShow: [],
      afterShow: [],
      onClose: [],
      afterClose: [],
      onClick: [],
      onHover: [],
      onTemplate: []
    };
    this.promises = {
      show: null,
      close: null
    };
    this.on('beforeShow', this.options.callbacks.beforeShow);
    this.on('onShow', this.options.callbacks.onShow);
    this.on('afterShow', this.options.callbacks.afterShow);
    this.on('onClose', this.options.callbacks.onClose);
    this.on('afterClose', this.options.callbacks.afterClose);
    this.on('onClick', this.options.callbacks.onClick);
    this.on('onHover', this.options.callbacks.onHover);
    this.on('onTemplate', this.options.callbacks.onTemplate);

    return this;
  }

  /**
   * @param {string} eventName
   * @param {function} cb
   * @return {Noty}
   */


  _createClass(Noty, [{
    key: 'on',
    value: function on(eventName) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].push(cb);
      }

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'show',
    value: function show() {
      var _this = this;

      if (this.showing || this.shown) {
        return this; // preventing multiple show
      }

      if (this.options.killer === true) {
        Noty.closeAll();
      } else if (typeof this.options.killer === 'string') {
        Noty.closeAll(this.options.killer);
      }

      var queueCounts = API.getQueueCounts(this.options.queue);

      if (queueCounts.current >= queueCounts.maxVisible || API.PageHidden && this.options.visibilityControl) {
        API.addToQueue(this);

        if (API.PageHidden && this.hasSound && Utils.inArray('docHidden', this.options.sounds.conditions)) {
          Utils.createAudioElements(this);
        }

        if (API.PageHidden && Utils.inArray('docHidden', this.options.titleCount.conditions)) {
          API.docTitle.increment();
        }

        return this;
      }

      API.Store[this.id] = this;

      API.fire(this, 'beforeShow');

      this.showing = true;

      if (this.closing) {
        this.showing = false;
        return this;
      }

      API.build(this);
      API.handleModal(this);

      if (this.options.force) {
        this.layoutDom.insertBefore(this.barDom, this.layoutDom.firstChild);
      } else {
        this.layoutDom.appendChild(this.barDom);
      }

      if (this.hasSound && !this.soundPlayed && Utils.inArray('docVisible', this.options.sounds.conditions)) {
        Utils.createAudioElements(this);
      }

      if (Utils.inArray('docVisible', this.options.titleCount.conditions)) {
        API.docTitle.increment();
      }

      this.shown = true;
      this.closed = false;

      // bind button events if any
      if (API.hasButtons(this)) {
        Object.keys(this.options.buttons).forEach(function (key) {
          var btn = _this.barDom.querySelector('#' + _this.options.buttons[key].id);
          Utils.addListener(btn, 'click', function (e) {
            Utils.stopPropagation(e);
            _this.options.buttons[key].cb(_this);
          });
        });
      }

      this.progressDom = this.barDom.querySelector('.noty_progressbar');

      if (Utils.inArray('click', this.options.closeWith)) {
        Utils.addClass(this.barDom, 'noty_close_with_click');
        Utils.addListener(this.barDom, 'click', function (e) {
          Utils.stopPropagation(e);
          API.fire(_this, 'onClick');
          _this.close();
        }, false);
      }

      Utils.addListener(this.barDom, 'mouseenter', function () {
        API.fire(_this, 'onHover');
      }, false);

      if (this.options.timeout) Utils.addClass(this.barDom, 'noty_has_timeout');
      if (this.options.progressBar) {
        Utils.addClass(this.barDom, 'noty_has_progressbar');
      }

      if (Utils.inArray('button', this.options.closeWith)) {
        Utils.addClass(this.barDom, 'noty_close_with_button');

        var closeButton = document.createElement('div');
        Utils.addClass(closeButton, 'noty_close_button');
        closeButton.innerHTML = '×';
        this.barDom.appendChild(closeButton);

        Utils.addListener(closeButton, 'click', function (e) {
          Utils.stopPropagation(e);
          _this.close();
        }, false);
      }

      API.fire(this, 'onShow');

      if (this.options.animation.open === null) {
        this.promises.show = new _es6Promise2.default(function (resolve) {
          resolve();
        });
      } else if (typeof this.options.animation.open === 'function') {
        this.promises.show = new _es6Promise2.default(this.options.animation.open.bind(this));
      } else {
        Utils.addClass(this.barDom, this.options.animation.open);
        this.promises.show = new _es6Promise2.default(function (resolve) {
          Utils.addListener(_this.barDom, Utils.animationEndEvents, function () {
            Utils.removeClass(_this.barDom, _this.options.animation.open);
            resolve();
          });
        });
      }

      this.promises.show.then(function () {
        var _t = _this;
        setTimeout(function () {
          API.openFlow(_t);
        }, 100);
      });

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'stop',
    value: function stop() {
      API.dequeueClose(this);
      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'resume',
    value: function resume() {
      API.queueClose(this);
      return this;
    }

    /**
     * @param {int|boolean} ms
     * @return {Noty}
     */

  }, {
    key: 'setTimeout',
    value: function (_setTimeout) {
      function setTimeout(_x) {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    }(function (ms) {
      this.stop();
      this.options.timeout = ms;

      if (this.barDom) {
        if (this.options.timeout) {
          Utils.addClass(this.barDom, 'noty_has_timeout');
        } else {
          Utils.removeClass(this.barDom, 'noty_has_timeout');
        }

        var _t = this;
        setTimeout(function () {
          // ugly fix for progressbar display bug
          _t.resume();
        }, 100);
      }

      return this;
    })

    /**
     * @param {string} html
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setText',
    value: function setText(html) {
      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        this.barDom.querySelector('.noty_body').innerHTML = html;
      }

      if (optionsOverride) this.options.text = html;

      return this;
    }

    /**
     * @param {string} type
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setType',
    value: function setType(type) {
      var _this2 = this;

      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        var classList = Utils.classList(this.barDom).split(' ');

        classList.forEach(function (c) {
          if (c.substring(0, 11) === 'noty_type__') {
            Utils.removeClass(_this2.barDom, c);
          }
        });

        Utils.addClass(this.barDom, 'noty_type__' + type);
      }

      if (optionsOverride) this.options.type = type;

      return this;
    }

    /**
     * @param {string} theme
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setTheme',
    value: function setTheme(theme) {
      var _this3 = this;

      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        var classList = Utils.classList(this.barDom).split(' ');

        classList.forEach(function (c) {
          if (c.substring(0, 12) === 'noty_theme__') {
            Utils.removeClass(_this3.barDom, c);
          }
        });

        Utils.addClass(this.barDom, 'noty_theme__' + theme);
      }

      if (optionsOverride) this.options.theme = theme;

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'close',
    value: function close() {
      var _this4 = this;

      if (this.closed) return this;

      if (!this.shown) {
        // it's in the queue
        API.removeFromQueue(this);
        return this;
      }

      API.fire(this, 'onClose');

      this.closing = true;

      if (this.options.animation.close === null || this.options.animation.close === false) {
        this.promises.close = new _es6Promise2.default(function (resolve) {
          resolve();
        });
      } else if (typeof this.options.animation.close === 'function') {
        this.promises.close = new _es6Promise2.default(this.options.animation.close.bind(this));
      } else {
        Utils.addClass(this.barDom, this.options.animation.close);
        this.promises.close = new _es6Promise2.default(function (resolve) {
          Utils.addListener(_this4.barDom, Utils.animationEndEvents, function () {
            if (_this4.options.force) {
              Utils.remove(_this4.barDom);
            } else {
              API.ghostFix(_this4);
            }
            resolve();
          });
        });
      }

      this.promises.close.then(function () {
        API.closeFlow(_this4);
        API.handleModalClose(_this4);
      });

      this.closed = true;

      return this;
    }

    // API functions

    /**
     * @param {boolean|string} queueName
     * @return {Noty}
     */

  }], [{
    key: 'closeAll',
    value: function closeAll() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      Object.keys(API.Store).forEach(function (id) {
        if (queueName) {
          if (API.Store[id].options.queue === queueName && API.Store[id].killable) {
            API.Store[id].close();
          }
        } else if (API.Store[id].killable) {
          API.Store[id].close();
        }
      });
      return this;
    }

    /**
     * @param {string} queueName
     * @return {Noty}
     */

  }, {
    key: 'clearQueue',
    value: function clearQueue() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

      if (API.Queues.hasOwnProperty(queueName)) {
        API.Queues[queueName].queue = [];
      }
      return this;
    }

    /**
     * @return {API.Queues}
     */

  }, {
    key: 'overrideDefaults',


    /**
     * @param {Object} obj
     * @return {Noty}
     */
    value: function overrideDefaults(obj) {
      API.Defaults = Utils.deepExtend({}, API.Defaults, obj);
      return this;
    }

    /**
     * @param {int} amount
     * @param {string} queueName
     * @return {Noty}
     */

  }, {
    key: 'setMaxVisible',
    value: function setMaxVisible() {
      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API.DefaultMaxVisible;
      var queueName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'global';

      if (!API.Queues.hasOwnProperty(queueName)) {
        API.Queues[queueName] = { maxVisible: amount, queue: [] };
      }

      API.Queues[queueName].maxVisible = amount;
      return this;
    }

    /**
     * @param {string} innerHtml
     * @param {String} classes
     * @param {Function} cb
     * @param {Object} attributes
     * @return {NotyButton}
     */

  }, {
    key: 'button',
    value: function button(innerHtml) {
      var classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var cb = arguments[2];
      var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      return new _button.NotyButton(innerHtml, classes, cb, attributes);
    }

    /**
     * @return {string}
     */

  }, {
    key: 'version',
    value: function version() {
      return "3.2.0-beta";
    }

    /**
     * @param {String} workerPath
     * @return {Push}
     */

  }, {
    key: 'Push',
    value: function Push(workerPath) {
      return new _push.Push(workerPath);
    }
  }, {
    key: 'Queues',
    get: function get() {
      return API.Queues;
    }

    /**
     * @return {API.PageHidden}
     */

  }, {
    key: 'PageHidden',
    get: function get() {
      return API.PageHidden;
    }
  }]);

  return Noty;
}();

// Document visibility change controller


exports.default = Noty;
if (typeof window !== 'undefined') {
  Utils.visibilityChangeFlow();
}
module.exports = exports['default'];

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })
/******/ ]);
});
//# sourceMappingURL=noty.js.map
;
/*
    perfect-scrollbar v0.6.10
    http://noraesae.github.io/perfect-scrollbar/
 */


!function t(e,n,r){function o(l,s){if(!n[l]){if(!e[l]){var a="function"==typeof require&&require;if(!s&&a)return a(l,!0);if(i)return i(l,!0);var c=new Error("Cannot find module '"+l+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[l]={exports:{}};e[l][0].call(u.exports,function(t){var n=e[l][1][t];return o(n?n:t)},u,u.exports,t,e,n,r)}return n[l].exports}for(var i="function"==typeof require&&require,l=0;l<r.length;l++)o(r[l]);return o}({1:[function(t,e,n){"use strict";function r(t){t.fn.perfectScrollbar=function(e){return this.each(function(){if("object"==typeof e||"undefined"==typeof e){var n=e;i.get(this)||o.initialize(this,n)}else{var r=e;"update"===r?o.update(this):"destroy"===r&&o.destroy(this)}return t(this)})}}var o=t("../main"),i=t("../plugin/instances");if("function"==typeof define&&define.amd)define(["jquery"],r);else{var l=window.jQuery?window.jQuery:window.$;"undefined"!=typeof l&&r(l)}e.exports=r},{"../main":7,"../plugin/instances":18}],2:[function(t,e,n){"use strict";function r(t,e){var n=t.className.split(" ");n.indexOf(e)<0&&n.push(e),t.className=n.join(" ")}function o(t,e){var n=t.className.split(" "),r=n.indexOf(e);r>=0&&n.splice(r,1),t.className=n.join(" ")}n.add=function(t,e){t.classList?t.classList.add(e):r(t,e)},n.remove=function(t,e){t.classList?t.classList.remove(e):o(t,e)},n.list=function(t){return t.classList?Array.prototype.slice.apply(t.classList):t.className.split(" ")}},{}],3:[function(t,e,n){"use strict";function r(t,e){return window.getComputedStyle(t)[e]}function o(t,e,n){return"number"==typeof n&&(n=n.toString()+"px"),t.style[e]=n,t}function i(t,e){for(var n in e){var r=e[n];"number"==typeof r&&(r=r.toString()+"px"),t.style[n]=r}return t}var l={};l.e=function(t,e){var n=document.createElement(t);return n.className=e,n},l.appendTo=function(t,e){return e.appendChild(t),t},l.css=function(t,e,n){return"object"==typeof e?i(t,e):"undefined"==typeof n?r(t,e):o(t,e,n)},l.matches=function(t,e){return"undefined"!=typeof t.matches?t.matches(e):"undefined"!=typeof t.matchesSelector?t.matchesSelector(e):"undefined"!=typeof t.webkitMatchesSelector?t.webkitMatchesSelector(e):"undefined"!=typeof t.mozMatchesSelector?t.mozMatchesSelector(e):"undefined"!=typeof t.msMatchesSelector?t.msMatchesSelector(e):void 0},l.remove=function(t){"undefined"!=typeof t.remove?t.remove():t.parentNode&&t.parentNode.removeChild(t)},l.queryChildren=function(t,e){return Array.prototype.filter.call(t.childNodes,function(t){return l.matches(t,e)})},e.exports=l},{}],4:[function(t,e,n){"use strict";var r=function(t){this.element=t,this.events={}};r.prototype.bind=function(t,e){"undefined"==typeof this.events[t]&&(this.events[t]=[]),this.events[t].push(e),this.element.addEventListener(t,e,!1)},r.prototype.unbind=function(t,e){var n="undefined"!=typeof e;this.events[t]=this.events[t].filter(function(r){return n&&r!==e?!0:(this.element.removeEventListener(t,r,!1),!1)},this)},r.prototype.unbindAll=function(){for(var t in this.events)this.unbind(t)};var o=function(){this.eventElements=[]};o.prototype.eventElement=function(t){var e=this.eventElements.filter(function(e){return e.element===t})[0];return"undefined"==typeof e&&(e=new r(t),this.eventElements.push(e)),e},o.prototype.bind=function(t,e,n){this.eventElement(t).bind(e,n)},o.prototype.unbind=function(t,e,n){this.eventElement(t).unbind(e,n)},o.prototype.unbindAll=function(){for(var t=0;t<this.eventElements.length;t++)this.eventElements[t].unbindAll()},o.prototype.once=function(t,e,n){var r=this.eventElement(t),o=function(t){r.unbind(e,o),n(t)};r.bind(e,o)},e.exports=o},{}],5:[function(t,e,n){"use strict";e.exports=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return function(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}()},{}],6:[function(t,e,n){"use strict";var r=t("./class"),o=t("./dom");n.toInt=function(t){return parseInt(t,10)||0},n.clone=function(t){if(null===t)return null;if("object"==typeof t){var e={};for(var n in t)e[n]=this.clone(t[n]);return e}return t},n.extend=function(t,e){var n=this.clone(t);for(var r in e)n[r]=this.clone(e[r]);return n},n.isEditable=function(t){return o.matches(t,"input,[contenteditable]")||o.matches(t,"select,[contenteditable]")||o.matches(t,"textarea,[contenteditable]")||o.matches(t,"button,[contenteditable]")},n.removePsClasses=function(t){for(var e=r.list(t),n=0;n<e.length;n++){var o=e[n];0===o.indexOf("ps-")&&r.remove(t,o)}},n.outerWidth=function(t){return this.toInt(o.css(t,"width"))+this.toInt(o.css(t,"paddingLeft"))+this.toInt(o.css(t,"paddingRight"))+this.toInt(o.css(t,"borderLeftWidth"))+this.toInt(o.css(t,"borderRightWidth"))},n.startScrolling=function(t,e){r.add(t,"ps-in-scrolling"),"undefined"!=typeof e?r.add(t,"ps-"+e):(r.add(t,"ps-x"),r.add(t,"ps-y"))},n.stopScrolling=function(t,e){r.remove(t,"ps-in-scrolling"),"undefined"!=typeof e?r.remove(t,"ps-"+e):(r.remove(t,"ps-x"),r.remove(t,"ps-y"))},n.env={isWebKit:"WebkitAppearance"in document.documentElement.style,supportsTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,supportsIePointer:null!==window.navigator.msMaxTouchPoints}},{"./class":2,"./dom":3}],7:[function(t,e,n){"use strict";var r=t("./plugin/destroy"),o=t("./plugin/initialize"),i=t("./plugin/update");e.exports={initialize:o,update:i,destroy:r}},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(t,e,n){"use strict";e.exports={maxScrollbarLength:null,minScrollbarLength:null,scrollXMarginOffset:0,scrollYMarginOffset:0,stopPropagationOnClick:!0,suppressScrollX:!1,suppressScrollY:!1,swipePropagation:!0,useBothWheelAxes:!1,useKeyboard:!0,useSelectionScroll:!1,wheelPropagation:!1,wheelSpeed:1,theme:"default"}},{}],9:[function(t,e,n){"use strict";var r=t("../lib/dom"),o=t("../lib/helper"),i=t("./instances");e.exports=function(t){var e=i.get(t);e&&(e.event.unbindAll(),r.remove(e.scrollbarX),r.remove(e.scrollbarY),r.remove(e.scrollbarXRail),r.remove(e.scrollbarYRail),o.removePsClasses(t),i.remove(t))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(t,e,n){"use strict";function r(t,e){function n(t){return t.getBoundingClientRect()}var r=window.Event.prototype.stopPropagation.bind;e.settings.stopPropagationOnClick&&e.event.bind(e.scrollbarY,"click",r),e.event.bind(e.scrollbarYRail,"click",function(r){var i=o.toInt(e.scrollbarYHeight/2),a=e.railYRatio*(r.pageY-window.pageYOffset-n(e.scrollbarYRail).top-i),c=e.railYRatio*(e.railYHeight-e.scrollbarYHeight),u=a/c;0>u?u=0:u>1&&(u=1),s(t,"top",(e.contentHeight-e.containerHeight)*u),l(t),r.stopPropagation()}),e.settings.stopPropagationOnClick&&e.event.bind(e.scrollbarX,"click",r),e.event.bind(e.scrollbarXRail,"click",function(r){var i=o.toInt(e.scrollbarXWidth/2),a=e.railXRatio*(r.pageX-window.pageXOffset-n(e.scrollbarXRail).left-i),c=e.railXRatio*(e.railXWidth-e.scrollbarXWidth),u=a/c;0>u?u=0:u>1&&(u=1),s(t,"left",(e.contentWidth-e.containerWidth)*u-e.negativeScrollAdjustment),l(t),r.stopPropagation()})}var o=t("../../lib/helper"),i=t("../instances"),l=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(t,e,n){"use strict";function r(t,e){function n(n){var o=r+n*e.railXRatio,i=Math.max(0,e.scrollbarXRail.getBoundingClientRect().left)+e.railXRatio*(e.railXWidth-e.scrollbarXWidth);0>o?e.scrollbarXLeft=0:o>i?e.scrollbarXLeft=i:e.scrollbarXLeft=o;var s=l.toInt(e.scrollbarXLeft*(e.contentWidth-e.containerWidth)/(e.containerWidth-e.railXRatio*e.scrollbarXWidth))-e.negativeScrollAdjustment;c(t,"left",s)}var r=null,o=null,s=function(e){n(e.pageX-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"x"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarX,"mousedown",function(n){o=n.pageX,r=l.toInt(i.css(e.scrollbarX,"left"))*e.railXRatio,l.startScrolling(t,"x"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}function o(t,e){function n(n){var o=r+n*e.railYRatio,i=Math.max(0,e.scrollbarYRail.getBoundingClientRect().top)+e.railYRatio*(e.railYHeight-e.scrollbarYHeight);0>o?e.scrollbarYTop=0:o>i?e.scrollbarYTop=i:e.scrollbarYTop=o;var s=l.toInt(e.scrollbarYTop*(e.contentHeight-e.containerHeight)/(e.containerHeight-e.railYRatio*e.scrollbarYHeight));c(t,"top",s)}var r=null,o=null,s=function(e){n(e.pageY-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"y"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarY,"mousedown",function(n){o=n.pageY,r=l.toInt(i.css(e.scrollbarY,"top"))*e.railYRatio,l.startScrolling(t,"y"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}var i=t("../../lib/dom"),l=t("../../lib/helper"),s=t("../instances"),a=t("../update-geometry"),c=t("../update-scroll");e.exports=function(t){var e=s.get(t);r(t,e),o(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}var r=!1;e.event.bind(t,"mouseenter",function(){r=!0}),e.event.bind(t,"mouseleave",function(){r=!1});var l=!1;e.event.bind(e.ownerDocument,"keydown",function(c){if(!c.isDefaultPrevented||!c.isDefaultPrevented()){var u=i.matches(e.scrollbarX,":focus")||i.matches(e.scrollbarY,":focus");if(r||u){var d=document.activeElement?document.activeElement:e.ownerDocument.activeElement;if(d){for(;d.shadowRoot;)d=d.shadowRoot.activeElement;if(o.isEditable(d))return}var p=0,f=0;switch(c.which){case 37:p=-30;break;case 38:f=30;break;case 39:p=30;break;case 40:f=-30;break;case 33:f=90;break;case 32:f=c.shiftKey?90:-90;break;case 34:f=-90;break;case 35:f=c.ctrlKey?-e.contentHeight:-e.containerHeight;break;case 36:f=c.ctrlKey?t.scrollTop:e.containerHeight;break;default:return}a(t,"top",t.scrollTop-f),a(t,"left",t.scrollLeft+p),s(t),l=n(p,f),l&&c.preventDefault()}}})}var o=t("../../lib/helper"),i=t("../../lib/dom"),l=t("../instances"),s=t("../update-geometry"),a=t("../update-scroll");e.exports=function(t){var e=l.get(t);r(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}function r(t){var e=t.deltaX,n=-1*t.deltaY;return("undefined"==typeof e||"undefined"==typeof n)&&(e=-1*t.wheelDeltaX/6,n=t.wheelDeltaY/6),t.deltaMode&&1===t.deltaMode&&(e*=10,n*=10),e!==e&&n!==n&&(e=0,n=t.wheelDelta),[e,n]}function o(e,n){var r=t.querySelector("textarea:hover");if(r){var o=r.scrollHeight-r.clientHeight;if(o>0&&!(0===r.scrollTop&&n>0||r.scrollTop===o&&0>n))return!0;var i=r.scrollLeft-r.clientWidth;if(i>0&&!(0===r.scrollLeft&&0>e||r.scrollLeft===i&&e>0))return!0}return!1}function s(s){var c=r(s),u=c[0],d=c[1];o(u,d)||(a=!1,e.settings.useBothWheelAxes?e.scrollbarYActive&&!e.scrollbarXActive?(d?l(t,"top",t.scrollTop-d*e.settings.wheelSpeed):l(t,"top",t.scrollTop+u*e.settings.wheelSpeed),a=!0):e.scrollbarXActive&&!e.scrollbarYActive&&(u?l(t,"left",t.scrollLeft+u*e.settings.wheelSpeed):l(t,"left",t.scrollLeft-d*e.settings.wheelSpeed),a=!0):(l(t,"top",t.scrollTop-d*e.settings.wheelSpeed),l(t,"left",t.scrollLeft+u*e.settings.wheelSpeed)),i(t),a=a||n(u,d),a&&(s.stopPropagation(),s.preventDefault()))}var a=!1;"undefined"!=typeof window.onwheel?e.event.bind(t,"wheel",s):"undefined"!=typeof window.onmousewheel&&e.event.bind(t,"mousewheel",s)}var o=t("../instances"),i=t("../update-geometry"),l=t("../update-scroll");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(t,e,n){"use strict";function r(t,e){e.event.bind(t,"scroll",function(){i(t)})}var o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19}],15:[function(t,e,n){"use strict";function r(t,e){function n(){var t=window.getSelection?window.getSelection():document.getSelection?document.getSelection():"";return 0===t.toString().length?null:t.getRangeAt(0).commonAncestorContainer}function r(){c||(c=setInterval(function(){return i.get(t)?(s(t,"top",t.scrollTop+u.top),s(t,"left",t.scrollLeft+u.left),void l(t)):void clearInterval(c)},50))}function a(){c&&(clearInterval(c),c=null),o.stopScrolling(t)}var c=null,u={top:0,left:0},d=!1;e.event.bind(e.ownerDocument,"selectionchange",function(){t.contains(n())?d=!0:(d=!1,a())}),e.event.bind(window,"mouseup",function(){d&&(d=!1,a())}),e.event.bind(window,"mousemove",function(e){if(d){var n={x:e.pageX,y:e.pageY},i={left:t.offsetLeft,right:t.offsetLeft+t.offsetWidth,top:t.offsetTop,bottom:t.offsetTop+t.offsetHeight};n.x<i.left+3?(u.left=-5,o.startScrolling(t,"x")):n.x>i.right-3?(u.left=5,o.startScrolling(t,"x")):u.left=0,n.y<i.top+3?(i.top+3-n.y<5?u.top=-5:u.top=-20,o.startScrolling(t,"y")):n.y>i.bottom-3?(n.y-i.bottom+3<5?u.top=5:u.top=20,o.startScrolling(t,"y")):u.top=0,0===u.top&&0===u.left?a():r()}})}var o=t("../../lib/helper"),i=t("../instances"),l=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(t,e,n){"use strict";function r(t,e,n,r){function s(n,r){var o=t.scrollTop,i=t.scrollLeft,l=Math.abs(n),s=Math.abs(r);if(s>l){if(0>r&&o===e.contentHeight-e.containerHeight||r>0&&0===o)return!e.settings.swipePropagation}else if(l>s&&(0>n&&i===e.contentWidth-e.containerWidth||n>0&&0===i))return!e.settings.swipePropagation;return!0}function a(e,n){l(t,"top",t.scrollTop-n),l(t,"left",t.scrollLeft-e),i(t)}function c(){Y=!0}function u(){Y=!1}function d(t){return t.targetTouches?t.targetTouches[0]:t}function p(t){return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function f(t){if(p(t)){w=!0;var e=d(t);v.pageX=e.pageX,v.pageY=e.pageY,g=(new Date).getTime(),null!==y&&clearInterval(y),t.stopPropagation()}}function h(t){if(!Y&&w&&p(t)){var e=d(t),n={pageX:e.pageX,pageY:e.pageY},r=n.pageX-v.pageX,o=n.pageY-v.pageY;a(r,o),v=n;var i=(new Date).getTime(),l=i-g;l>0&&(m.x=r/l,m.y=o/l,g=i),s(r,o)&&(t.stopPropagation(),t.preventDefault())}}function b(){!Y&&w&&(w=!1,clearInterval(y),y=setInterval(function(){return o.get(t)?Math.abs(m.x)<.01&&Math.abs(m.y)<.01?void clearInterval(y):(a(30*m.x,30*m.y),m.x*=.8,void(m.y*=.8)):void clearInterval(y)},10))}var v={},g=0,m={},y=null,Y=!1,w=!1;n&&(e.event.bind(window,"touchstart",c),e.event.bind(window,"touchend",u),e.event.bind(t,"touchstart",f),e.event.bind(t,"touchmove",h),e.event.bind(t,"touchend",b)),r&&(window.PointerEvent?(e.event.bind(window,"pointerdown",c),e.event.bind(window,"pointerup",u),e.event.bind(t,"pointerdown",f),e.event.bind(t,"pointermove",h),e.event.bind(t,"pointerup",b)):window.MSPointerEvent&&(e.event.bind(window,"MSPointerDown",c),e.event.bind(window,"MSPointerUp",u),e.event.bind(t,"MSPointerDown",f),e.event.bind(t,"MSPointerMove",h),e.event.bind(t,"MSPointerUp",b)))}var o=t("../instances"),i=t("../update-geometry"),l=t("../update-scroll");e.exports=function(t,e,n){var i=o.get(t);r(t,i,e,n)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(t,e,n){"use strict";var r=t("../lib/class"),o=t("../lib/helper"),i=t("./instances"),l=t("./update-geometry"),s=t("./handler/click-rail"),a=t("./handler/drag-scrollbar"),c=t("./handler/keyboard"),u=t("./handler/mouse-wheel"),d=t("./handler/native-scroll"),p=t("./handler/selection"),f=t("./handler/touch");e.exports=function(t,e){e="object"==typeof e?e:{},r.add(t,"ps-container");var n=i.add(t);n.settings=o.extend(n.settings,e),r.add(t,"ps-theme-"+n.settings.theme),s(t),a(t),u(t),d(t),n.settings.useSelectionScroll&&p(t),(o.env.supportsTouch||o.env.supportsIePointer)&&f(t,o.env.supportsTouch,o.env.supportsIePointer),n.settings.useKeyboard&&c(t),l(t)}},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(t,e,n){"use strict";function r(t){function e(){s.add(t,"ps-focus")}function n(){s.remove(t,"ps-focus")}var r=this;r.settings=p.clone(c),r.containerWidth=null,r.containerHeight=null,r.contentWidth=null,r.contentHeight=null,r.isRtl="rtl"===a.css(t,"direction"),r.isNegativeScroll=function(){var e=t.scrollLeft,n=null;return t.scrollLeft=-1,n=t.scrollLeft<0,t.scrollLeft=e,n}(),r.negativeScrollAdjustment=r.isNegativeScroll?t.scrollWidth-t.clientWidth:0,r.event=new u,r.ownerDocument=t.ownerDocument||document,r.scrollbarXRail=a.appendTo(a.e("div","ps-scrollbar-x-rail"),t),r.scrollbarX=a.appendTo(a.e("div","ps-scrollbar-x"),r.scrollbarXRail),r.scrollbarX.setAttribute("tabindex",0),r.event.bind(r.scrollbarX,"focus",e),r.event.bind(r.scrollbarX,"blur",n),r.scrollbarXActive=null,r.scrollbarXWidth=null,r.scrollbarXLeft=null,r.scrollbarXBottom=p.toInt(a.css(r.scrollbarXRail,"bottom")),r.isScrollbarXUsingBottom=r.scrollbarXBottom===r.scrollbarXBottom,r.scrollbarXTop=r.isScrollbarXUsingBottom?null:p.toInt(a.css(r.scrollbarXRail,"top")),r.railBorderXWidth=p.toInt(a.css(r.scrollbarXRail,"borderLeftWidth"))+p.toInt(a.css(r.scrollbarXRail,"borderRightWidth")),a.css(r.scrollbarXRail,"display","block"),r.railXMarginWidth=p.toInt(a.css(r.scrollbarXRail,"marginLeft"))+p.toInt(a.css(r.scrollbarXRail,"marginRight")),a.css(r.scrollbarXRail,"display",""),r.railXWidth=null,r.railXRatio=null,r.scrollbarYRail=a.appendTo(a.e("div","ps-scrollbar-y-rail"),t),r.scrollbarY=a.appendTo(a.e("div","ps-scrollbar-y"),r.scrollbarYRail),r.scrollbarY.setAttribute("tabindex",0),r.event.bind(r.scrollbarY,"focus",e),r.event.bind(r.scrollbarY,"blur",n),r.scrollbarYActive=null,r.scrollbarYHeight=null,r.scrollbarYTop=null,r.scrollbarYRight=p.toInt(a.css(r.scrollbarYRail,"right")),r.isScrollbarYUsingRight=r.scrollbarYRight===r.scrollbarYRight,r.scrollbarYLeft=r.isScrollbarYUsingRight?null:p.toInt(a.css(r.scrollbarYRail,"left")),r.scrollbarYOuterWidth=r.isRtl?p.outerWidth(r.scrollbarY):null,r.railBorderYWidth=p.toInt(a.css(r.scrollbarYRail,"borderTopWidth"))+p.toInt(a.css(r.scrollbarYRail,"borderBottomWidth")),a.css(r.scrollbarYRail,"display","block"),r.railYMarginHeight=p.toInt(a.css(r.scrollbarYRail,"marginTop"))+p.toInt(a.css(r.scrollbarYRail,"marginBottom")),a.css(r.scrollbarYRail,"display",""),r.railYHeight=null,r.railYRatio=null}function o(t){return"undefined"==typeof t.dataset?t.getAttribute("data-ps-id"):t.dataset.psId}function i(t,e){"undefined"==typeof t.dataset?t.setAttribute("data-ps-id",e):t.dataset.psId=e}function l(t){"undefined"==typeof t.dataset?t.removeAttribute("data-ps-id"):delete t.dataset.psId}var s=t("../lib/class"),a=t("../lib/dom"),c=t("./default-setting"),u=t("../lib/event-manager"),d=t("../lib/guid"),p=t("../lib/helper"),f={};n.add=function(t){var e=d();return i(t,e),f[e]=new r(t),f[e]},n.remove=function(t){delete f[o(t)],l(t)},n.get=function(t){return f[o(t)]}},{"../lib/class":2,"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(t,e,n){"use strict";function r(t,e){return t.settings.minScrollbarLength&&(e=Math.max(e,t.settings.minScrollbarLength)),t.settings.maxScrollbarLength&&(e=Math.min(e,t.settings.maxScrollbarLength)),e}function o(t,e){var n={width:e.railXWidth};e.isRtl?n.left=e.negativeScrollAdjustment+t.scrollLeft+e.containerWidth-e.contentWidth:n.left=t.scrollLeft,e.isScrollbarXUsingBottom?n.bottom=e.scrollbarXBottom-t.scrollTop:n.top=e.scrollbarXTop+t.scrollTop,l.css(e.scrollbarXRail,n);var r={top:t.scrollTop,height:e.railYHeight};e.isScrollbarYUsingRight?e.isRtl?r.right=e.contentWidth-(e.negativeScrollAdjustment+t.scrollLeft)-e.scrollbarYRight-e.scrollbarYOuterWidth:r.right=e.scrollbarYRight-t.scrollLeft:e.isRtl?r.left=e.negativeScrollAdjustment+t.scrollLeft+2*e.containerWidth-e.contentWidth-e.scrollbarYLeft-e.scrollbarYOuterWidth:r.left=e.scrollbarYLeft+t.scrollLeft,l.css(e.scrollbarYRail,r),l.css(e.scrollbarX,{left:e.scrollbarXLeft,width:e.scrollbarXWidth-e.railBorderXWidth}),l.css(e.scrollbarY,{top:e.scrollbarYTop,height:e.scrollbarYHeight-e.railBorderYWidth})}var i=t("../lib/class"),l=t("../lib/dom"),s=t("../lib/helper"),a=t("./instances"),c=t("./update-scroll");e.exports=function(t){var e=a.get(t);e.containerWidth=t.clientWidth,e.containerHeight=t.clientHeight,e.contentWidth=t.scrollWidth,e.contentHeight=t.scrollHeight;var n;t.contains(e.scrollbarXRail)||(n=l.queryChildren(t,".ps-scrollbar-x-rail"),n.length>0&&n.forEach(function(t){l.remove(t)}),l.appendTo(e.scrollbarXRail,t)),t.contains(e.scrollbarYRail)||(n=l.queryChildren(t,".ps-scrollbar-y-rail"),n.length>0&&n.forEach(function(t){l.remove(t)}),l.appendTo(e.scrollbarYRail,t)),!e.settings.suppressScrollX&&e.containerWidth+e.settings.scrollXMarginOffset<e.contentWidth?(e.scrollbarXActive=!0,e.railXWidth=e.containerWidth-e.railXMarginWidth,e.railXRatio=e.containerWidth/e.railXWidth,e.scrollbarXWidth=r(e,s.toInt(e.railXWidth*e.containerWidth/e.contentWidth)),e.scrollbarXLeft=s.toInt((e.negativeScrollAdjustment+t.scrollLeft)*(e.railXWidth-e.scrollbarXWidth)/(e.contentWidth-e.containerWidth))):e.scrollbarXActive=!1,!e.settings.suppressScrollY&&e.containerHeight+e.settings.scrollYMarginOffset<e.contentHeight?(e.scrollbarYActive=!0,e.railYHeight=e.containerHeight-e.railYMarginHeight,e.railYRatio=e.containerHeight/e.railYHeight,e.scrollbarYHeight=r(e,s.toInt(e.railYHeight*e.containerHeight/e.contentHeight)),e.scrollbarYTop=s.toInt(t.scrollTop*(e.railYHeight-e.scrollbarYHeight)/(e.contentHeight-e.containerHeight))):e.scrollbarYActive=!1,e.scrollbarXLeft>=e.railXWidth-e.scrollbarXWidth&&(e.scrollbarXLeft=e.railXWidth-e.scrollbarXWidth),e.scrollbarYTop>=e.railYHeight-e.scrollbarYHeight&&(e.scrollbarYTop=e.railYHeight-e.scrollbarYHeight),o(t,e),e.scrollbarXActive?i.add(t,"ps-active-x"):(i.remove(t,"ps-active-x"),e.scrollbarXWidth=0,e.scrollbarXLeft=0,c(t,"left",0)),e.scrollbarYActive?i.add(t,"ps-active-y"):(i.remove(t,"ps-active-y"),e.scrollbarYHeight=0,e.scrollbarYTop=0,c(t,"top",0))}},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(t,e,n){"use strict";var r,o,i=t("./instances"),l=document.createEvent("Event"),s=document.createEvent("Event"),a=document.createEvent("Event"),c=document.createEvent("Event"),u=document.createEvent("Event"),d=document.createEvent("Event"),p=document.createEvent("Event"),f=document.createEvent("Event"),h=document.createEvent("Event"),b=document.createEvent("Event");l.initEvent("ps-scroll-up",!0,!0),s.initEvent("ps-scroll-down",!0,!0),a.initEvent("ps-scroll-left",!0,!0),c.initEvent("ps-scroll-right",!0,!0),u.initEvent("ps-scroll-y",!0,!0),d.initEvent("ps-scroll-x",!0,!0),p.initEvent("ps-x-reach-start",!0,!0),f.initEvent("ps-x-reach-end",!0,!0),h.initEvent("ps-y-reach-start",!0,!0),b.initEvent("ps-y-reach-end",!0,!0),e.exports=function(t,e,n){if("undefined"==typeof t)throw"You must provide an element to the update-scroll function";if("undefined"==typeof e)throw"You must provide an axis to the update-scroll function";if("undefined"==typeof n)throw"You must provide a value to the update-scroll function";"top"===e&&0>=n&&(t.scrollTop=n=0,t.dispatchEvent(h)),"left"===e&&0>=n&&(t.scrollLeft=n=0,t.dispatchEvent(p));var v=i.get(t);"top"===e&&n>=v.contentHeight-v.containerHeight&&(t.scrollTop=n=v.contentHeight-v.containerHeight,t.dispatchEvent(b)),"left"===e&&n>=v.contentWidth-v.containerWidth&&(t.scrollLeft=n=v.contentWidth-v.containerWidth,t.dispatchEvent(f)),r||(r=t.scrollTop),o||(o=t.scrollLeft),"top"===e&&r>n&&t.dispatchEvent(l),"top"===e&&n>r&&t.dispatchEvent(s),"left"===e&&o>n&&t.dispatchEvent(a),"left"===e&&n>o&&t.dispatchEvent(c),"top"===e&&(t.scrollTop=r=n,t.dispatchEvent(u)),"left"===e&&(t.scrollLeft=o=n,t.dispatchEvent(d))}},{"./instances":18}],21:[function(t,e,n){"use strict";var r=t("../lib/dom"),o=t("../lib/helper"),i=t("./instances"),l=t("./update-geometry"),s=t("./update-scroll");e.exports=function(t){var e=i.get(t);e&&(e.negativeScrollAdjustment=e.isNegativeScroll?t.scrollWidth-t.clientWidth:0,r.css(e.scrollbarXRail,"display","block"),r.css(e.scrollbarYRail,"display","block"),e.railXMarginWidth=o.toInt(r.css(e.scrollbarXRail,"marginLeft"))+o.toInt(r.css(e.scrollbarXRail,"marginRight")),e.railYMarginHeight=o.toInt(r.css(e.scrollbarYRail,"marginTop"))+o.toInt(r.css(e.scrollbarYRail,"marginBottom")),r.css(e.scrollbarXRail,"display","none"),r.css(e.scrollbarYRail,"display","none"),l(t),s(t,"top",t.scrollTop),s(t,"left",t.scrollLeft),r.css(e.scrollbarXRail,"display",""),r.css(e.scrollbarYRail,"display",""))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]);
/*!
 * Bootstrap-select v1.12.1 (http://silviomoreto.github.io/bootstrap-select)
 *
 * Copyright 2013-2016 bootstrap-select
 * Licensed under MIT (https://github.com/silviomoreto/bootstrap-select/blob/master/LICENSE)
 */


 /*

      Creative Tim Modifications

      Lines: 384, 384 we added Themify Icons 

 */


(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["jquery"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    factory(root["jQuery"]);
  }
}(this, function (jQuery) {

(function ($) {
  'use strict';

  //<editor-fold desc="Shims">
  if (!String.prototype.includes) {
    (function () {
      'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
      var toString = {}.toString;
      var defineProperty = (function () {
        // IE 8 only supports `Object.defineProperty` on DOM elements
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {
        }
        return result;
      }());
      var indexOf = ''.indexOf;
      var includes = function (search) {
        if (this == null) {
          throw new TypeError();
        }
        var string = String(this);
        if (search && toString.call(search) == '[object RegExp]') {
          throw new TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        // `ToInteger`
        var pos = position ? Number(position) : 0;
        if (pos != pos) { // better `isNaN`
          pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        // Avoid the `indexOf` call if no match is possible
        if (searchLength + start > stringLength) {
          return false;
        }
        return indexOf.call(string, searchString, pos) != -1;
      };
      if (defineProperty) {
        defineProperty(String.prototype, 'includes', {
          'value': includes,
          'configurable': true,
          'writable': true
        });
      } else {
        String.prototype.includes = includes;
      }
    }());
  }

  if (!String.prototype.startsWith) {
    (function () {
      'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
      var defineProperty = (function () {
        // IE 8 only supports `Object.defineProperty` on DOM elements
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {
        }
        return result;
      }());
      var toString = {}.toString;
      var startsWith = function (search) {
        if (this == null) {
          throw new TypeError();
        }
        var string = String(this);
        if (search && toString.call(search) == '[object RegExp]') {
          throw new TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        // `ToInteger`
        var pos = position ? Number(position) : 0;
        if (pos != pos) { // better `isNaN`
          pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        // Avoid the `indexOf` call if no match is possible
        if (searchLength + start > stringLength) {
          return false;
        }
        var index = -1;
        while (++index < searchLength) {
          if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
            return false;
          }
        }
        return true;
      };
      if (defineProperty) {
        defineProperty(String.prototype, 'startsWith', {
          'value': startsWith,
          'configurable': true,
          'writable': true
        });
      } else {
        String.prototype.startsWith = startsWith;
      }
    }());
  }

  if (!Object.keys) {
    Object.keys = function (
      o, // object
      k, // key
      r  // result array
      ){
      // initialize object and result
      r=[];
      // iterate over object keys
      for (k in o)
          // fill result array with non-prototypical keys
        r.hasOwnProperty.call(o, k) && r.push(k);
      // return result
      return r;
    };
  }

  // set data-selected on select element if the value has been programmatically selected
  // prior to initialization of bootstrap-select
  // * consider removing or replacing an alternative method *
  var valHooks = {
    useDefault: false,
    _set: $.valHooks.select.set
  };

  $.valHooks.select.set = function(elem, value) {
    if (value && !valHooks.useDefault) $(elem).data('selected', true);

    return valHooks._set.apply(this, arguments);
  };

  var changed_arguments = null;
  $.fn.triggerNative = function (eventName) {
    var el = this[0],
        event;

    if (el.dispatchEvent) { // for modern browsers & IE9+
      if (typeof Event === 'function') {
        // For modern browsers
        event = new Event(eventName, {
          bubbles: true
        });
      } else {
        // For IE since it doesn't support Event constructor
        event = document.createEvent('Event');
        event.initEvent(eventName, true, false);
      }

      el.dispatchEvent(event);
    } else if (el.fireEvent) { // for IE8
      event = document.createEventObject();
      event.eventType = eventName;
      el.fireEvent('on' + eventName, event);
    } else {
      // fall back to jQuery.trigger
      this.trigger(eventName);
    }
  };
  //</editor-fold>

  // Case insensitive contains search
  $.expr.pseudos.icontains = function (obj, index, meta) {
    var $obj = $(obj);
    var haystack = ($obj.data('tokens') || $obj.text()).toString().toUpperCase();
    return haystack.includes(meta[3].toUpperCase());
  };

  // Case insensitive begins search
  $.expr.pseudos.ibegins = function (obj, index, meta) {
    var $obj = $(obj);
    var haystack = ($obj.data('tokens') || $obj.text()).toString().toUpperCase();
    return haystack.startsWith(meta[3].toUpperCase());
  };

  // Case and accent insensitive contains search
  $.expr.pseudos.aicontains = function (obj, index, meta) {
    var $obj = $(obj);
    var haystack = ($obj.data('tokens') || $obj.data('normalizedText') || $obj.text()).toString().toUpperCase();
    return haystack.includes(meta[3].toUpperCase());
  };

  // Case and accent insensitive begins search
  $.expr.pseudos.aibegins = function (obj, index, meta) {
    var $obj = $(obj);
    var haystack = ($obj.data('tokens') || $obj.data('normalizedText') || $obj.text()).toString().toUpperCase();
    return haystack.startsWith(meta[3].toUpperCase());
  };

  /**
   * Remove all diatrics from the given text.
   * @access private
   * @param {String} text
   * @returns {String}
   */
  function normalizeToBase(text) {
    var rExps = [
      {re: /[\xC0-\xC6]/g, ch: "A"},
      {re: /[\xE0-\xE6]/g, ch: "a"},
      {re: /[\xC8-\xCB]/g, ch: "E"},
      {re: /[\xE8-\xEB]/g, ch: "e"},
      {re: /[\xCC-\xCF]/g, ch: "I"},
      {re: /[\xEC-\xEF]/g, ch: "i"},
      {re: /[\xD2-\xD6]/g, ch: "O"},
      {re: /[\xF2-\xF6]/g, ch: "o"},
      {re: /[\xD9-\xDC]/g, ch: "U"},
      {re: /[\xF9-\xFC]/g, ch: "u"},
      {re: /[\xC7-\xE7]/g, ch: "c"},
      {re: /[\xD1]/g, ch: "N"},
      {re: /[\xF1]/g, ch: "n"}
    ];
    $.each(rExps, function () {
      text = text ? text.replace(this.re, this.ch) : '';
    });
    return text;
  }


  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  var unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x60;': '`'
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + Object.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };

  var htmlEscape = createEscaper(escapeMap);
  var htmlUnescape = createEscaper(unescapeMap);

  var Selectpicker = function (element, options) {
    // bootstrap-select has been initialized - revert valHooks.select.set back to its original function
    if (!valHooks.useDefault) {
      $.valHooks.select.set = valHooks._set;
      valHooks.useDefault = true;
    }

    this.$element = $(element);
    this.$newElement = null;
    this.$button = null;
    this.$menu = null;
    this.$lis = null;
    this.options = options;

    // If we have no title yet, try to pull it from the html title attribute (jQuery doesnt' pick it up as it's not a
    // data-attribute)
    if (this.options.title === null) {
      this.options.title = this.$element.attr('title');
    }

    // Format window padding
    var winPad = this.options.windowPadding;
    if (typeof winPad === 'number') {
      this.options.windowPadding = [winPad, winPad, winPad, winPad];
    }

    //Expose public methods
    this.val = Selectpicker.prototype.val;
    this.render = Selectpicker.prototype.render;
    this.refresh = Selectpicker.prototype.refresh;
    this.setStyle = Selectpicker.prototype.setStyle;
    this.selectAll = Selectpicker.prototype.selectAll;
    this.deselectAll = Selectpicker.prototype.deselectAll;
    this.destroy = Selectpicker.prototype.destroy;
    this.remove = Selectpicker.prototype.remove;
    this.show = Selectpicker.prototype.show;
    this.hide = Selectpicker.prototype.hide;

    this.init();
  };

  Selectpicker.VERSION = '1.12.1';

  // part of this is duplicated in i18n/defaults-en_US.js. Make sure to update both.
  Selectpicker.DEFAULTS = {
    noneSelectedText: 'Nothing selected',
    noneResultsText: 'No results matched {0}',
    countSelectedText: function (numSelected, numTotal) {
      return (numSelected == 1) ? "{0} item selected" : "{0} items selected";
    },
    maxOptionsText: function (numAll, numGroup) {
      return [
        (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
        (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
      ];
    },
    selectAllText: 'Select All',
    deselectAllText: 'Deselect All',
    doneButton: false,
    doneButtonText: 'Close',
    multipleSeparator: ', ',
    styleBase: 'btn',
    style: 'btn-default',
    size: 'auto',
    title: null,
    selectedTextFormat: 'values',
    width: false,
    container: false,
    hideDisabled: false,
    showSubtext: false,
    showIcon: true,
    showContent: true,
    dropupAuto: true,
    header: false,
    liveSearch: false,
    liveSearchPlaceholder: null,
    liveSearchNormalize: false,
    liveSearchStyle: 'contains',
    actionsBox: false,
    iconBase: '',
    tickIcon: 'ti-check',
    showTick: false,
    template: {
      caret: '<span class="caret"></span>'
    },
    maxOptions: false,
    mobile: false,
    selectOnTab: false,
    dropdownAlignRight: false,
    windowPadding: 0
  };

  Selectpicker.prototype = {

    constructor: Selectpicker,

    init: function () {
      var that = this,
          id = this.$element.attr('id');

      this.$element.addClass('bs-select-hidden');

      // store originalIndex (key) and newIndex (value) in this.liObj for fast accessibility
      // allows us to do this.$lis.eq(that.liObj[index]) instead of this.$lis.filter('[data-original-index="' + index + '"]')
      this.liObj = {};
      this.multiple = this.$element.prop('multiple');
      this.autofocus = this.$element.prop('autofocus');
      this.$newElement = this.createView();
      this.$element
        .after(this.$newElement)
        .appendTo(this.$newElement);
      this.$button = this.$newElement.children('button');
      this.$menu = this.$newElement.children('.dropdown-menu');
      this.$menuInner = this.$menu.children('.inner');
      this.$searchbox = this.$menu.find('input');

      this.$element.removeClass('bs-select-hidden');

      if (this.options.dropdownAlignRight === true) this.$menu.addClass('dropdown-menu-right');

      if (typeof id !== 'undefined') {
        this.$button.attr('data-id', id);
        $('label[for="' + id + '"]').click(function (e) {
          e.preventDefault();
          that.$button.focus();
        });
      }

      this.checkDisabled();
      this.clickListener();
      if (this.options.liveSearch) this.liveSearchListener();
      this.render();
      this.setStyle();
      this.setWidth();
      if (this.options.container) this.selectPosition();
      this.$menu.data('this', this);
      this.$newElement.data('this', this);
      if (this.options.mobile) this.mobile();

      this.$newElement.on({
        'hide.bs.dropdown': function (e) {
          that.$menuInner.attr('aria-expanded', false);
          that.$element.trigger('hide.bs.select', e);
        },
        'hidden.bs.dropdown': function (e) {
          that.$element.trigger('hidden.bs.select', e);
        },
        'show.bs.dropdown': function (e) {
          that.$menuInner.attr('aria-expanded', true);
          that.$element.trigger('show.bs.select', e);
        },
        'shown.bs.dropdown': function (e) {
          that.$element.trigger('shown.bs.select', e);
        }
      });

      if (that.$element[0].hasAttribute('required')) {
        this.$element.on('invalid', function () {
          that.$button
            .addClass('bs-invalid')
            .focus();

          that.$element.on({
            'focus.bs.select': function () {
              that.$button.focus();
              that.$element.off('focus.bs.select');
            },
            'shown.bs.select': function () {
              that.$element
                .val(that.$element.val()) // set the value to hide the validation message in Chrome when menu is opened
                .off('shown.bs.select');
            },
            'rendered.bs.select': function () {
              // if select is no longer invalid, remove the bs-invalid class
              if (this.validity.valid) that.$button.removeClass('bs-invalid');
              that.$element.off('rendered.bs.select');
            }
          });
        });
      }

      setTimeout(function () {
        that.$element.trigger('loaded.bs.select');
      });
    },

    createDropdown: function () {
      // Options
      // If we are multiple or showTick option is set, then add the show-tick class
      var showTick = (this.multiple || this.options.showTick) ? ' show-tick' : '',
          inputGroup = this.$element.parent().hasClass('input-group') ? ' input-group-btn' : '',
          autofocus = this.autofocus ? ' autofocus' : '';
      // Elements
      var header = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + '</div>' : '';
      var searchbox = this.options.liveSearch ?
      '<div class="bs-searchbox">' +
      '<input type="text" class="form-control" autocomplete="off"' +
      (null === this.options.liveSearchPlaceholder ? '' : ' placeholder="' + htmlEscape(this.options.liveSearchPlaceholder) + '"') + ' role="textbox" aria-label="Search">' +
      '</div>'
          : '';
      var actionsbox = this.multiple && this.options.actionsBox ?
      '<div class="bs-actionsbox">' +
      '<div class="btn-group btn-group-sm btn-block">' +
      '<button type="button" class="actions-btn bs-select-all btn btn-default">' +
      this.options.selectAllText +
      '</button>' +
      '<button type="button" class="actions-btn bs-deselect-all btn btn-default">' +
      this.options.deselectAllText +
      '</button>' +
      '</div>' +
      '</div>'
          : '';
      var donebutton = this.multiple && this.options.doneButton ?
      '<div class="bs-donebutton">' +
      '<div class="btn-group btn-block">' +
      '<button type="button" class="btn btn-sm btn-default">' +
      this.options.doneButtonText +
      '</button>' +
      '</div>' +
      '</div>'
          : '';
      var drop =
          '<div class="btn-group bootstrap-select' + showTick + inputGroup + '">' +
          '<button type="button" class="' + this.options.styleBase + ' dropdown-toggle" data-toggle="dropdown"' + autofocus + ' role="button">' +
          '<span class="filter-option pull-left"></span>&nbsp;' +
          '<span class="bs-caret">' +
          this.options.template.caret +
          '</span>' +
          '</button>' +
          '<div class="dropdown-menu open" role="combobox">' +
          header +
          searchbox +
          actionsbox +
          '<ul class="dropdown-menu inner" role="listbox" aria-expanded="false">' +
          '</ul>' +
          donebutton +
          '</div>' +
          '</div>';

      return $(drop);
    },

    createView: function () {
      var $drop = this.createDropdown(),
          li = this.createLi();

      $drop.find('ul')[0].innerHTML = li;
      return $drop;
    },

    reloadLi: function () {
      // rebuild
      var li = this.createLi();
      this.$menuInner[0].innerHTML = li;
    },

    createLi: function () {
      var that = this,
          _li = [],
          optID = 0,
          titleOption = document.createElement('option'),
          liIndex = -1; // increment liIndex whenever a new <li> element is created to ensure liObj is correct

      // Helper functions
      /**
       * @param content
       * @param [index]
       * @param [classes]
       * @param [optgroup]
       * @returns {string}
       */
      var generateLI = function (content, index, classes, optgroup) {
        return '<li' +
            ((typeof classes !== 'undefined' & '' !== classes) ? ' class="' + classes + '"' : '') +
            ((typeof index !== 'undefined' & null !== index) ? ' data-original-index="' + index + '"' : '') +
            ((typeof optgroup !== 'undefined' & null !== optgroup) ? 'data-optgroup="' + optgroup + '"' : '') +
            '>' + content + '</li>';
      };

      /**
       * @param text
       * @param [classes]
       * @param [inline]
       * @param [tokens]
       * @returns {string}
       */
      var generateA = function (text, classes, inline, tokens) {
        return '<a tabindex="0"' +
            (typeof classes !== 'undefined' ? ' class="' + classes + '"' : '') +
            (inline ? ' style="' + inline + '"' : '') +
            (that.options.liveSearchNormalize ? ' data-normalized-text="' + normalizeToBase(htmlEscape($(text).html())) + '"' : '') +
            (typeof tokens !== 'undefined' || tokens !== null ? ' data-tokens="' + tokens + '"' : '') +
            ' role="option">' + text +
            '<span class="' + that.options.iconBase + ' ' + that.options.tickIcon + ' check-mark"></span>' +
            '</a>';
      };

      if (this.options.title && !this.multiple) {
        // this option doesn't create a new <li> element, but does add a new option, so liIndex is decreased
        // since liObj is recalculated on every refresh, liIndex needs to be decreased even if the titleOption is already appended
        liIndex--;

        if (!this.$element.find('.bs-title-option').length) {
          // Use native JS to prepend option (faster)
          var element = this.$element[0];
          titleOption.className = 'bs-title-option';
          titleOption.innerHTML = this.options.title;
          titleOption.value = '';
          element.insertBefore(titleOption, element.firstChild);
          // Check if selected or data-selected attribute is already set on an option. If not, select the titleOption option.
          // the selected item may have been changed by user or programmatically before the bootstrap select plugin runs,
          // if so, the select will have the data-selected attribute
          var $opt = $(element.options[element.selectedIndex]);
          if ($opt.attr('selected') === undefined && this.$element.data('selected') === undefined) {
            titleOption.selected = true;
          }
        }
      }

      this.$element.find('option').each(function (index) {
        var $this = $(this);

        liIndex++;

        if ($this.hasClass('bs-title-option')) return;

        // Get the class and text for the option
        var optionClass = this.className || '',
            inline = this.style.cssText,
            text = $this.data('content') ? $this.data('content') : $this.html(),
            tokens = $this.data('tokens') ? $this.data('tokens') : null,
            subtext = typeof $this.data('subtext') !== 'undefined' ? '<small class="text-muted">' + $this.data('subtext') + '</small>' : '',
            icon = typeof $this.data('icon') !== 'undefined' ? '<span class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></span> ' : '',
            $parent = $this.parent(),
            isOptgroup = $parent[0].tagName === 'OPTGROUP',
            isOptgroupDisabled = isOptgroup && $parent[0].disabled,
            isDisabled = this.disabled || isOptgroupDisabled;

        if (icon !== '' && isDisabled) {
          icon = '<span>' + icon + '</span>';
        }

        if (that.options.hideDisabled && (isDisabled && !isOptgroup || isOptgroupDisabled)) {
          liIndex--;
          return;
        }

        if (!$this.data('content')) {
          // Prepend any icon and append any subtext to the main text.
          text = icon + '<span class="text">' + text + subtext + '</span>';
        }

        if (isOptgroup && $this.data('divider') !== true) {
          if (that.options.hideDisabled && isDisabled) {
            if ($parent.data('allOptionsDisabled') === undefined) {
              var $options = $parent.children();
              $parent.data('allOptionsDisabled', $options.filter(':disabled').length === $options.length);
            }

            if ($parent.data('allOptionsDisabled')) {
              liIndex--;
              return;
            }
          }

          var optGroupClass = ' ' + $parent[0].className || '';

          if ($this.index() === 0) { // Is it the first option of the optgroup?
            optID += 1;

            // Get the opt group label
            var label = $parent[0].label,
                labelSubtext = typeof $parent.data('subtext') !== 'undefined' ? '<small class="text-muted">' + $parent.data('subtext') + '</small>' : '',
                labelIcon = $parent.data('icon') ? '<span class="' + that.options.iconBase + ' ' + $parent.data('icon') + '"></span> ' : '';

            label = labelIcon + '<span class="text">' + htmlEscape(label) + labelSubtext + '</span>';

            if (index !== 0 && _li.length > 0) { // Is it NOT the first option of the select && are there elements in the dropdown?
              liIndex++;
              _li.push(generateLI('', null, 'divider', optID + 'div'));
            }
            liIndex++;
            _li.push(generateLI(label, null, 'dropdown-header' + optGroupClass, optID));
          }

          if (that.options.hideDisabled && isDisabled) {
            liIndex--;
            return;
          }

          _li.push(generateLI(generateA(text, 'opt ' + optionClass + optGroupClass, inline, tokens), index, '', optID));
        } else if ($this.data('divider') === true) {
          _li.push(generateLI('', index, 'divider'));
        } else if ($this.data('hidden') === true) {
          _li.push(generateLI(generateA(text, optionClass, inline, tokens), index, 'hidden is-hidden'));
        } else {
          var showDivider = this.previousElementSibling && this.previousElementSibling.tagName === 'OPTGROUP';

          // if previous element is not an optgroup and hideDisabled is true
          if (!showDivider && that.options.hideDisabled) {
            // get previous elements
            var $prev = $(this).prevAll();

            for (var i = 0; i < $prev.length; i++) {
              // find the first element in the previous elements that is an optgroup
              if ($prev[i].tagName === 'OPTGROUP') {
                var optGroupDistance = 0;

                // loop through the options in between the current option and the optgroup
                // and check if they are hidden or disabled
                for (var d = 0; d < i; d++) {
                  var prevOption = $prev[d];
                  if (prevOption.disabled || $(prevOption).data('hidden') === true) optGroupDistance++;
                }

                // if all of the options between the current option and the optgroup are hidden or disabled, show the divider
                if (optGroupDistance === i) showDivider = true;

                break;
              }
            }
          }

          if (showDivider) {
            liIndex++;
            _li.push(generateLI('', null, 'divider', optID + 'div'));
          }
          _li.push(generateLI(generateA(text, optionClass, inline, tokens), index));
        }

        that.liObj[index] = liIndex;
      });

      //If we are not multiple, we don't have a selected item, and we don't have a title, select the first element so something is set in the button
      if (!this.multiple && this.$element.find('option:selected').length === 0 && !this.options.title) {
        this.$element.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
      }

      return _li.join('');
    },

    findLis: function () {
      if (this.$lis == null) this.$lis = this.$menu.find('li');
      return this.$lis;
    },

    /**
     * @param [updateLi] defaults to true
     */
    render: function (updateLi) {
      var that = this,
          notDisabled;

      //Update the LI to match the SELECT
      if (updateLi !== false) {
        this.$element.find('option').each(function (index) {
          var $lis = that.findLis().eq(that.liObj[index]);

          that.setDisabled(index, this.disabled || this.parentNode.tagName === 'OPTGROUP' && this.parentNode.disabled, $lis);
          that.setSelected(index, this.selected, $lis);
        });
      }

      this.togglePlaceholder();

      this.tabIndex();

      var selectedItems = this.$element.find('option').map(function () {
        if (this.selected) {
          if (that.options.hideDisabled && (this.disabled || this.parentNode.tagName === 'OPTGROUP' && this.parentNode.disabled)) return;

          var $this = $(this),
              icon = $this.data('icon') && that.options.showIcon ? '<i class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></i> ' : '',
              subtext;

          if (that.options.showSubtext && $this.data('subtext') && !that.multiple) {
            subtext = ' <small class="text-muted">' + $this.data('subtext') + '</small>';
          } else {
            subtext = '';
          }
          if (typeof $this.attr('title') !== 'undefined') {
            return $this.attr('title');
          } else if ($this.data('content') && that.options.showContent) {
            return $this.data('content').toString();
          } else {
            return icon + $this.html() + subtext;
          }
        }
      }).toArray();

      //Fixes issue in IE10 occurring when no default option is selected and at least one option is disabled
      //Convert all the values into a comma delimited string
      var title = !this.multiple ? selectedItems[0] : selectedItems.join(this.options.multipleSeparator);

      //If this is multi select, and the selectText type is count, the show 1 of 2 selected etc..
      if (this.multiple && this.options.selectedTextFormat.indexOf('count') > -1) {
        var max = this.options.selectedTextFormat.split('>');
        if ((max.length > 1 && selectedItems.length > max[1]) || (max.length == 1 && selectedItems.length >= 2)) {
          notDisabled = this.options.hideDisabled ? ', [disabled]' : '';
          var totalCount = this.$element.find('option').not('[data-divider="true"], [data-hidden="true"]' + notDisabled).length,
              tr8nText = (typeof this.options.countSelectedText === 'function') ? this.options.countSelectedText(selectedItems.length, totalCount) : this.options.countSelectedText;
          title = tr8nText.replace('{0}', selectedItems.length.toString()).replace('{1}', totalCount.toString());
        }
      }

      if (this.options.title == undefined) {
        this.options.title = this.$element.attr('title');
      }

      if (this.options.selectedTextFormat == 'static') {
        title = this.options.title;
      }

      //If we dont have a title, then use the default, or if nothing is set at all, use the not selected text
      if (!title) {
        title = typeof this.options.title !== 'undefined' ? this.options.title : this.options.noneSelectedText;
      }

      //strip all HTML tags and trim the result, then unescape any escaped tags
      this.$button.attr('title', htmlUnescape($.trim(title.replace(/<[^>]*>?/g, ''))));
      this.$button.children('.filter-option').html(title);

      this.$element.trigger('rendered.bs.select');
    },

    /**
     * @param [style]
     * @param [status]
     */
    setStyle: function (style, status) {
      if (this.$element.attr('class')) {
        this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi, ''));
      }

      var buttonClass = style ? style : this.options.style;

      if (status == 'add') {
        this.$button.addClass(buttonClass);
      } else if (status == 'remove') {
        this.$button.removeClass(buttonClass);
      } else {
        this.$button.removeClass(this.options.style);
        this.$button.addClass(buttonClass);
      }
    },

    liHeight: function (refresh) {
      if (!refresh && (this.options.size === false || this.sizeInfo)) return;

      var newElement = document.createElement('div'),
          menu = document.createElement('div'),
          menuInner = document.createElement('ul'),
          divider = document.createElement('li'),
          li = document.createElement('li'),
          a = document.createElement('a'),
          text = document.createElement('span'),
          header = this.options.header && this.$menu.find('.popover-title').length > 0 ? this.$menu.find('.popover-title')[0].cloneNode(true) : null,
          search = this.options.liveSearch ? document.createElement('div') : null,
          actions = this.options.actionsBox && this.multiple && this.$menu.find('.bs-actionsbox').length > 0 ? this.$menu.find('.bs-actionsbox')[0].cloneNode(true) : null,
          doneButton = this.options.doneButton && this.multiple && this.$menu.find('.bs-donebutton').length > 0 ? this.$menu.find('.bs-donebutton')[0].cloneNode(true) : null;

      text.className = 'text';
      newElement.className = this.$menu[0].parentNode.className + ' open';
      menu.className = 'dropdown-menu open';
      menuInner.className = 'dropdown-menu inner';
      divider.className = 'divider';

      text.appendChild(document.createTextNode('Inner text'));
      a.appendChild(text);
      li.appendChild(a);
      menuInner.appendChild(li);
      menuInner.appendChild(divider);
      if (header) menu.appendChild(header);
      if (search) {
        // create a span instead of input as creating an input element is slower
        var input = document.createElement('span');
        search.className = 'bs-searchbox';
        input.className = 'form-control';
        search.appendChild(input);
        menu.appendChild(search);
      }
      if (actions) menu.appendChild(actions);
      menu.appendChild(menuInner);
      if (doneButton) menu.appendChild(doneButton);
      newElement.appendChild(menu);

      document.body.appendChild(newElement);

      var liHeight = a.offsetHeight,
          headerHeight = header ? header.offsetHeight : 0,
          searchHeight = search ? search.offsetHeight : 0,
          actionsHeight = actions ? actions.offsetHeight : 0,
          doneButtonHeight = doneButton ? doneButton.offsetHeight : 0,
          dividerHeight = $(divider).outerHeight(true),
          // fall back to jQuery if getComputedStyle is not supported
          menuStyle = typeof getComputedStyle === 'function' ? getComputedStyle(menu) : false,
          $menu = menuStyle ? null : $(menu),
          menuPadding = {
            vert: parseInt(menuStyle ? menuStyle.paddingTop : $menu.css('paddingTop')) +
                  parseInt(menuStyle ? menuStyle.paddingBottom : $menu.css('paddingBottom')) +
                  parseInt(menuStyle ? menuStyle.borderTopWidth : $menu.css('borderTopWidth')) +
                  parseInt(menuStyle ? menuStyle.borderBottomWidth : $menu.css('borderBottomWidth')),
            horiz: parseInt(menuStyle ? menuStyle.paddingLeft : $menu.css('paddingLeft')) +
                  parseInt(menuStyle ? menuStyle.paddingRight : $menu.css('paddingRight')) +
                  parseInt(menuStyle ? menuStyle.borderLeftWidth : $menu.css('borderLeftWidth')) +
                  parseInt(menuStyle ? menuStyle.borderRightWidth : $menu.css('borderRightWidth'))
          },
          menuExtras =  {
            vert: menuPadding.vert +
                  parseInt(menuStyle ? menuStyle.marginTop : $menu.css('marginTop')) +
                  parseInt(menuStyle ? menuStyle.marginBottom : $menu.css('marginBottom')) + 2,
            horiz: menuPadding.horiz +
                  parseInt(menuStyle ? menuStyle.marginLeft : $menu.css('marginLeft')) +
                  parseInt(menuStyle ? menuStyle.marginRight : $menu.css('marginRight')) + 2
          }

      document.body.removeChild(newElement);

      this.sizeInfo = {
        liHeight: liHeight,
        headerHeight: headerHeight,
        searchHeight: searchHeight,
        actionsHeight: actionsHeight,
        doneButtonHeight: doneButtonHeight,
        dividerHeight: dividerHeight,
        menuPadding: menuPadding,
        menuExtras: menuExtras
      };
    },

    setSize: function () {
      this.findLis();
      this.liHeight();

      if (this.options.header) this.$menu.css('padding-top', 0);
      if (this.options.size === false) return;

      var that = this,
          $menu = this.$menu,
          $menuInner = this.$menuInner,
          $window = $(window),
          selectHeight = this.$newElement[0].offsetHeight,
          selectWidth = this.$newElement[0].offsetWidth,
          liHeight = this.sizeInfo['liHeight'],
          headerHeight = this.sizeInfo['headerHeight'],
          searchHeight = this.sizeInfo['searchHeight'],
          actionsHeight = this.sizeInfo['actionsHeight'],
          doneButtonHeight = this.sizeInfo['doneButtonHeight'],
          divHeight = this.sizeInfo['dividerHeight'],
          menuPadding = this.sizeInfo['menuPadding'],
          menuExtras = this.sizeInfo['menuExtras'],
          notDisabled = this.options.hideDisabled ? '.disabled' : '',
          menuHeight,
          menuWidth,
          getHeight,
          getWidth,
          selectOffsetTop,
          selectOffsetBot,
          selectOffsetLeft,
          selectOffsetRight,
          getPos = function() {
            var pos = that.$newElement.offset(),
                $container = $(that.options.container),
                containerPos;

            if (that.options.container && !$container.is('body')) {
              containerPos = $container.offset();
              containerPos.top += parseInt($container.css('borderTopWidth'));
              containerPos.left += parseInt($container.css('borderLeftWidth'));
            } else {
              containerPos = { top: 0, left: 0 };
            }

            var winPad = that.options.windowPadding;
            selectOffsetTop = pos.top - containerPos.top - $window.scrollTop();
            selectOffsetBot = $window.height() - selectOffsetTop - selectHeight - containerPos.top - winPad[2];
            selectOffsetLeft = pos.left - containerPos.left - $window.scrollLeft();
            selectOffsetRight = $window.width() - selectOffsetLeft - selectWidth - containerPos.left - winPad[1];
            selectOffsetTop -= winPad[0];
            selectOffsetLeft -= winPad[3];
          };

      getPos();

      if (this.options.size === 'auto') {
        var getSize = function () {
          var minHeight,
              hasClass = function (className, include) {
                return function (element) {
                    if (include) {
                        return (element.classList ? element.classList.contains(className) : $(element).hasClass(className));
                    } else {
                        return !(element.classList ? element.classList.contains(className) : $(element).hasClass(className));
                    }
                };
              },
              lis = that.$menuInner[0].getElementsByTagName('li'),
              lisVisible = Array.prototype.filter ? Array.prototype.filter.call(lis, hasClass('hidden', false)) : that.$lis.not('.hidden'),
              optGroup = Array.prototype.filter ? Array.prototype.filter.call(lisVisible, hasClass('dropdown-header', true)) : lisVisible.filter('.dropdown-header');

          getPos();
          menuHeight = selectOffsetBot - menuExtras.vert;
          menuWidth = selectOffsetRight - menuExtras.horiz;

          if (that.options.container) {
            if (!$menu.data('height')) $menu.data('height', $menu.height());
            getHeight = $menu.data('height');

            if (!$menu.data('width')) $menu.data('width', $menu.width());
            getWidth = $menu.data('width');
          } else {
            getHeight = $menu.height();
            getWidth = $menu.width();
          }

          if (that.options.dropupAuto) {
            that.$newElement.toggleClass('dropup', selectOffsetTop > selectOffsetBot && (menuHeight - menuExtras.vert) < getHeight);
          }

          if (that.$newElement.hasClass('dropup')) {
            menuHeight = selectOffsetTop - menuExtras.vert;
          }

          if (that.options.dropdownAlignRight === 'auto') {
            $menu.toggleClass('dropdown-menu-right', selectOffsetLeft > selectOffsetRight && (menuWidth - menuExtras.horiz) < (getWidth - selectWidth));
          }

          if ((lisVisible.length + optGroup.length) > 3) {
            minHeight = liHeight * 3 + menuExtras.vert - 2;
          } else {
            minHeight = 0;
          }

          $menu.css({
            'max-height': menuHeight + 'px',
            'overflow': 'hidden',
            'min-height': minHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight + 'px'
          });
          $menuInner.css({
            'max-height': menuHeight - headerHeight - searchHeight - actionsHeight - doneButtonHeight - menuPadding.vert + 'px',
            'overflow-y': 'auto',
            'min-height': Math.max(minHeight - menuPadding.vert, 0) + 'px'
          });
        };
        getSize();
        this.$searchbox.off('input.getSize propertychange.getSize').on('input.getSize propertychange.getSize', getSize);
        $window.off('resize.getSize scroll.getSize').on('resize.getSize scroll.getSize', getSize);
      } else if (this.options.size && this.options.size != 'auto' && this.$lis.not(notDisabled).length > this.options.size) {
        var optIndex = this.$lis.not('.divider').not(notDisabled).children().slice(0, this.options.size).last().parent().index(),
            divLength = this.$lis.slice(0, optIndex + 1).filter('.divider').length;
        menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding.vert;

        if (that.options.container) {
          if (!$menu.data('height')) $menu.data('height', $menu.height());
          getHeight = $menu.data('height');
        } else {
          getHeight = $menu.height();
        }

        if (that.options.dropupAuto) {
          //noinspection JSUnusedAssignment
          this.$newElement.toggleClass('dropup', selectOffsetTop > selectOffsetBot && (menuHeight - menuExtras.vert) < getHeight);
        }
        $menu.css({
          'max-height': menuHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight + 'px',
          'overflow': 'hidden',
          'min-height': ''
        });
        $menuInner.css({
          'max-height': menuHeight - menuPadding.vert + 'px',
          'overflow-y': 'auto',
          'min-height': ''
        });
      }
    },

    setWidth: function () {
      if (this.options.width === 'auto') {
        this.$menu.css('min-width', '0');

        // Get correct width if element is hidden
        var $selectClone = this.$menu.parent().clone().appendTo('body'),
            $selectClone2 = this.options.container ? this.$newElement.clone().appendTo('body') : $selectClone,
            ulWidth = $selectClone.children('.dropdown-menu').outerWidth(),
            btnWidth = $selectClone2.css('width', 'auto').children('button').outerWidth();

        $selectClone.remove();
        $selectClone2.remove();

        // Set width to whatever's larger, button title or longest option
        this.$newElement.css('width', Math.max(ulWidth, btnWidth) + 'px');
      } else if (this.options.width === 'fit') {
        // Remove inline min-width so width can be changed from 'auto'
        this.$menu.css('min-width', '');
        this.$newElement.css('width', '').addClass('fit-width');
      } else if (this.options.width) {
        // Remove inline min-width so width can be changed from 'auto'
        this.$menu.css('min-width', '');
        this.$newElement.css('width', this.options.width);
      } else {
        // Remove inline min-width/width so width can be changed
        this.$menu.css('min-width', '');
        this.$newElement.css('width', '');
      }
      // Remove fit-width class if width is changed programmatically
      if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
        this.$newElement.removeClass('fit-width');
      }
    },

    selectPosition: function () {
      this.$bsContainer = $('<div class="bs-container" />');

      var that = this,
          $container = $(this.options.container),
          pos,
          containerPos,
          actualHeight,
          getPlacement = function ($element) {
            that.$bsContainer.addClass($element.attr('class').replace(/form-control|fit-width/gi, '')).toggleClass('dropup', $element.hasClass('dropup'));
            pos = $element.offset();

            if (!$container.is('body')) {
              containerPos = $container.offset();
              containerPos.top += parseInt($container.css('borderTopWidth')) - $container.scrollTop();
              containerPos.left += parseInt($container.css('borderLeftWidth')) - $container.scrollLeft();
            } else {
              containerPos = { top: 0, left: 0 };
            }

            actualHeight = $element.hasClass('dropup') ? 0 : $element[0].offsetHeight;

            that.$bsContainer.css({
              'top': pos.top - containerPos.top + actualHeight,
              'left': pos.left - containerPos.left,
              'width': $element[0].offsetWidth
            });
          };

      this.$button.on('click', function () {
        var $this = $(this);

        if (that.isDisabled()) {
          return;
        }

        getPlacement(that.$newElement);

        that.$bsContainer
          .appendTo(that.options.container)
          .toggleClass('open', !$this.hasClass('open'))
          .append(that.$menu);
      });

      $(window).on('resize scroll', function () {
        getPlacement(that.$newElement);
      });

      this.$element.on('hide.bs.select', function () {
        that.$menu.data('height', that.$menu.height());
        that.$bsContainer.detach();
      });
    },

    /**
     * @param {number} index - the index of the option that is being changed
     * @param {boolean} selected - true if the option is being selected, false if being deselected
     * @param {JQuery} $lis - the 'li' element that is being modified
     */
    setSelected: function (index, selected, $lis) {
      if (!$lis) {
        this.togglePlaceholder(); // check if setSelected is being called by changing the value of the select
        $lis = this.findLis().eq(this.liObj[index]);
      }

      $lis.toggleClass('selected', selected).find('a').attr('aria-selected', selected);
    },

    /**
     * @param {number} index - the index of the option that is being disabled
     * @param {boolean} disabled - true if the option is being disabled, false if being enabled
     * @param {JQuery} $lis - the 'li' element that is being modified
     */
    setDisabled: function (index, disabled, $lis) {
      if (!$lis) {
        $lis = this.findLis().eq(this.liObj[index]);
      }

      if (disabled) {
        $lis.addClass('disabled').children('a').attr('href', '#').attr('tabindex', -1).attr('aria-disabled', true);
      } else {
        $lis.removeClass('disabled').children('a').removeAttr('href').attr('tabindex', 0).attr('aria-disabled', false);
      }
    },

    isDisabled: function () {
      return this.$element[0].disabled;
    },

    checkDisabled: function () {
      var that = this;

      if (this.isDisabled()) {
        this.$newElement.addClass('disabled');
        this.$button.addClass('disabled').attr('tabindex', -1).attr('aria-disabled', true);
      } else {
        if (this.$button.hasClass('disabled')) {
          this.$newElement.removeClass('disabled');
          this.$button.removeClass('disabled').attr('aria-disabled', false);
        }

        if (this.$button.attr('tabindex') == -1 && !this.$element.data('tabindex')) {
          this.$button.removeAttr('tabindex');
        }
      }

      this.$button.click(function () {
        return !that.isDisabled();
      });
    },

    togglePlaceholder: function () {
      var value = this.$element.val();
      this.$button.toggleClass('bs-placeholder', value === null || value === '' || (value.constructor === Array && value.length === 0));
    },

    tabIndex: function () {
      if (this.$element.data('tabindex') !== this.$element.attr('tabindex') &&
        (this.$element.attr('tabindex') !== -98 && this.$element.attr('tabindex') !== '-98')) {
        this.$element.data('tabindex', this.$element.attr('tabindex'));
        this.$button.attr('tabindex', this.$element.data('tabindex'));
      }

      this.$element.attr('tabindex', -98);
    },

    clickListener: function () {
      var that = this,
          $document = $(document);

      $document.data('spaceSelect', false);

      this.$button.on('keyup', function (e) {
        if (/(32)/.test(e.keyCode.toString(10)) && $document.data('spaceSelect')) {
            e.preventDefault();
            $document.data('spaceSelect', false);
        }
      });

      this.$button.on('click', function () {
        that.setSize();
      });

      this.$element.on('shown.bs.select', function () {
        if (!that.options.liveSearch && !that.multiple) {
          that.$menuInner.find('.selected a').focus();
        } else if (!that.multiple) {
          var selectedIndex = that.liObj[that.$element[0].selectedIndex];

          if (typeof selectedIndex !== 'number' || that.options.size === false) return;

          // scroll to selected option
          var offset = that.$lis.eq(selectedIndex)[0].offsetTop - that.$menuInner[0].offsetTop;
          offset = offset - that.$menuInner[0].offsetHeight/2 + that.sizeInfo.liHeight/2;
          that.$menuInner[0].scrollTop = offset;
        }
      });

      this.$menuInner.on('click', 'li a', function (e) {
        var $this = $(this),
            clickedIndex = $this.parent().data('originalIndex'),
            prevValue = that.$element.val(),
            prevIndex = that.$element.prop('selectedIndex'),
            triggerChange = true;

        // Don't close on multi choice menu
        if (that.multiple && that.options.maxOptions !== 1) {
          e.stopPropagation();
        }

        e.preventDefault();

        //Don't run if we have been disabled
        if (!that.isDisabled() && !$this.parent().hasClass('disabled')) {
          var $options = that.$element.find('option'),
              $option = $options.eq(clickedIndex),
              state = $option.prop('selected'),
              $optgroup = $option.parent('optgroup'),
              maxOptions = that.options.maxOptions,
              maxOptionsGrp = $optgroup.data('maxOptions') || false;

          if (!that.multiple) { // Deselect all others if not multi select box
            $options.prop('selected', false);
            $option.prop('selected', true);
            that.$menuInner.find('.selected').removeClass('selected').find('a').attr('aria-selected', false);
            that.setSelected(clickedIndex, true);
          } else { // Toggle the one we have chosen if we are multi select.
            $option.prop('selected', !state);
            that.setSelected(clickedIndex, !state);
            $this.blur();

            if (maxOptions !== false || maxOptionsGrp !== false) {
              var maxReached = maxOptions < $options.filter(':selected').length,
                  maxReachedGrp = maxOptionsGrp < $optgroup.find('option:selected').length;

              if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                if (maxOptions && maxOptions == 1) {
                  $options.prop('selected', false);
                  $option.prop('selected', true);
                  that.$menuInner.find('.selected').removeClass('selected');
                  that.setSelected(clickedIndex, true);
                } else if (maxOptionsGrp && maxOptionsGrp == 1) {
                  $optgroup.find('option:selected').prop('selected', false);
                  $option.prop('selected', true);
                  var optgroupID = $this.parent().data('optgroup');
                  that.$menuInner.find('[data-optgroup="' + optgroupID + '"]').removeClass('selected');
                  that.setSelected(clickedIndex, true);
                } else {
                  var maxOptionsText = typeof that.options.maxOptionsText === 'string' ? [that.options.maxOptionsText, that.options.maxOptionsText] : that.options.maxOptionsText,
                      maxOptionsArr = typeof maxOptionsText === 'function' ? maxOptionsText(maxOptions, maxOptionsGrp) : maxOptionsText,
                      maxTxt = maxOptionsArr[0].replace('{n}', maxOptions),
                      maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp),
                      $notify = $('<div class="notify"></div>');
                  // If {var} is set in array, replace it
                  /** @deprecated */
                  if (maxOptionsArr[2]) {
                    maxTxt = maxTxt.replace('{var}', maxOptionsArr[2][maxOptions > 1 ? 0 : 1]);
                    maxTxtGrp = maxTxtGrp.replace('{var}', maxOptionsArr[2][maxOptionsGrp > 1 ? 0 : 1]);
                  }

                  $option.prop('selected', false);

                  that.$menu.append($notify);

                  if (maxOptions && maxReached) {
                    $notify.append($('<div>' + maxTxt + '</div>'));
                    triggerChange = false;
                    that.$element.trigger('maxReached.bs.select');
                  }

                  if (maxOptionsGrp && maxReachedGrp) {
                    $notify.append($('<div>' + maxTxtGrp + '</div>'));
                    triggerChange = false;
                    that.$element.trigger('maxReachedGrp.bs.select');
                  }

                  setTimeout(function () {
                    that.setSelected(clickedIndex, false);
                  }, 10);

                  $notify.delay(750).fadeOut(300, function () {
                    $(this).remove();
                  });
                }
              }
            }
          }

          if (!that.multiple || (that.multiple && that.options.maxOptions === 1)) {
            that.$button.focus();
          } else if (that.options.liveSearch) {
            that.$searchbox.focus();
          }

          // Trigger select 'change'
          if (triggerChange) {
            if ((prevValue != that.$element.val() && that.multiple) || (prevIndex != that.$element.prop('selectedIndex') && !that.multiple)) {
              // $option.prop('selected') is current option state (selected/unselected). state is previous option state.
              changed_arguments = [clickedIndex, $option.prop('selected'), state];
              that.$element
                .triggerNative('change');
            }
          }
        }
      });

      this.$menu.on('click', 'li.disabled a, .popover-title, .popover-title :not(.close)', function (e) {
        if (e.currentTarget == this) {
          e.preventDefault();
          e.stopPropagation();
          if (that.options.liveSearch && !$(e.target).hasClass('close')) {
            that.$searchbox.focus();
          } else {
            that.$button.focus();
          }
        }
      });

      this.$menuInner.on('click', '.divider, .dropdown-header', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (that.options.liveSearch) {
          that.$searchbox.focus();
        } else {
          that.$button.focus();
        }
      });

      this.$menu.on('click', '.popover-title .close', function () {
        that.$button.click();
      });

      this.$searchbox.on('click', function (e) {
        e.stopPropagation();
      });

      this.$menu.on('click', '.actions-btn', function (e) {
        if (that.options.liveSearch) {
          that.$searchbox.focus();
        } else {
          that.$button.focus();
        }

        e.preventDefault();
        e.stopPropagation();

        if ($(this).hasClass('bs-select-all')) {
          that.selectAll();
        } else {
          that.deselectAll();
        }
      });

      this.$element.change(function () {
        that.render(false);
        that.$element.trigger('changed.bs.select', changed_arguments);
        changed_arguments = null;
      });
    },

    liveSearchListener: function () {
      var that = this,
          $no_results = $('<li class="no-results"></li>');

      this.$button.on('click.dropdown.data-api', function () {
        that.$menuInner.find('.active').removeClass('active');
        if (!!that.$searchbox.val()) {
          that.$searchbox.val('');
          that.$lis.not('.is-hidden').removeClass('hidden');
          if (!!$no_results.parent().length) $no_results.remove();
        }
        if (!that.multiple) that.$menuInner.find('.selected').addClass('active');
        setTimeout(function () {
          that.$searchbox.focus();
        }, 10);
      });

      this.$searchbox.on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
        e.stopPropagation();
      });

      this.$searchbox.on('input propertychange', function () {
        that.$lis.not('.is-hidden').removeClass('hidden');
        that.$lis.filter('.active').removeClass('active');
        $no_results.remove();

        if (that.$searchbox.val()) {
          var $searchBase = that.$lis.not('.is-hidden, .divider, .dropdown-header'),
              $hideItems;
          if (that.options.liveSearchNormalize) {
            $hideItems = $searchBase.not(':a' + that._searchStyle() + '("' + normalizeToBase(that.$searchbox.val()) + '")');
          } else {
            $hideItems = $searchBase.not(':' + that._searchStyle() + '("' + that.$searchbox.val() + '")');
          }

          if ($hideItems.length === $searchBase.length) {
            $no_results.html(that.options.noneResultsText.replace('{0}', '"' + htmlEscape(that.$searchbox.val()) + '"'));
            that.$menuInner.append($no_results);
            that.$lis.addClass('hidden');
          } else {
            $hideItems.addClass('hidden');

            var $lisVisible = that.$lis.not('.hidden'),
                $foundDiv;

            // hide divider if first or last visible, or if followed by another divider
            $lisVisible.each(function (index) {
              var $this = $(this);

              if ($this.hasClass('divider')) {
                if ($foundDiv === undefined) {
                  $this.addClass('hidden');
                } else {
                  if ($foundDiv) $foundDiv.addClass('hidden');
                  $foundDiv = $this;
                }
              } else if ($this.hasClass('dropdown-header') && $lisVisible.eq(index + 1).data('optgroup') !== $this.data('optgroup')) {
                $this.addClass('hidden');
              } else {
                $foundDiv = null;
              }
            });
            if ($foundDiv) $foundDiv.addClass('hidden');

            $searchBase.not('.hidden').first().addClass('active');
          }
        }
      });
    },

    _searchStyle: function () {
      var styles = {
        begins: 'ibegins',
        startsWith: 'ibegins'
      };

      return styles[this.options.liveSearchStyle] || 'icontains';
    },

    val: function (value) {
      if (typeof value !== 'undefined') {
        this.$element.val(value);
        this.render();

        return this.$element;
      } else {
        return this.$element.val();
      }
    },

    changeAll: function (status) {
      if (!this.multiple) return;
      if (typeof status === 'undefined') status = true;

      this.findLis();

      var $options = this.$element.find('option'),
          $lisVisible = this.$lis.not('.divider, .dropdown-header, .disabled, .hidden'),
          lisVisLen = $lisVisible.length,
          selectedOptions = [];

      if (status) {
        if ($lisVisible.filter('.selected').length === $lisVisible.length) return;
      } else {
        if ($lisVisible.filter('.selected').length === 0) return;
      }

      $lisVisible.toggleClass('selected', status);

      for (var i = 0; i < lisVisLen; i++) {
        var origIndex = $lisVisible[i].getAttribute('data-original-index');
        selectedOptions[selectedOptions.length] = $options.eq(origIndex)[0];
      }

      $(selectedOptions).prop('selected', status);

      this.render(false);

      this.togglePlaceholder();

      this.$element
        .triggerNative('change');
    },

    selectAll: function () {
      return this.changeAll(true);
    },

    deselectAll: function () {
      return this.changeAll(false);
    },

    toggle: function (e) {
      e = e || window.event;

      if (e) e.stopPropagation();

      this.$button.trigger('click');
    },

    keydown: function (e) {
      var $this = $(this),
          $parent = $this.is('input') ? $this.parent().parent() : $this.parent(),
          $items,
          that = $parent.data('this'),
          index,
          next,
          first,
          last,
          prev,
          nextPrev,
          prevIndex,
          isActive,
          selector = ':not(.disabled, .hidden, .dropdown-header, .divider)',
          keyCodeMap = {
            32: ' ',
            48: '0',
            49: '1',
            50: '2',
            51: '3',
            52: '4',
            53: '5',
            54: '6',
            55: '7',
            56: '8',
            57: '9',
            59: ';',
            65: 'a',
            66: 'b',
            67: 'c',
            68: 'd',
            69: 'e',
            70: 'f',
            71: 'g',
            72: 'h',
            73: 'i',
            74: 'j',
            75: 'k',
            76: 'l',
            77: 'm',
            78: 'n',
            79: 'o',
            80: 'p',
            81: 'q',
            82: 'r',
            83: 's',
            84: 't',
            85: 'u',
            86: 'v',
            87: 'w',
            88: 'x',
            89: 'y',
            90: 'z',
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9'
          };

      if (that.options.liveSearch) $parent = $this.parent().parent();

      if (that.options.container) $parent = that.$menu;

      $items = $('[role="listbox"] li', $parent);

      isActive = that.$newElement.hasClass('open');

      if (!isActive && (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 65 && e.keyCode <= 90)) {
        if (!that.options.container) {
          that.setSize();
          that.$menu.parent().addClass('open');
          isActive = true;
        } else {
          that.$button.trigger('click');
        }
        that.$searchbox.focus();
        return;
      }

      if (that.options.liveSearch) {
        if (/(^9$|27)/.test(e.keyCode.toString(10)) && isActive) {
          e.preventDefault();
          e.stopPropagation();
          that.$menuInner.click();
          that.$button.focus();
        }
        // $items contains li elements when liveSearch is enabled
        $items = $('[role="listbox"] li' + selector, $parent);
        if (!$this.val() && !/(38|40)/.test(e.keyCode.toString(10))) {
          if ($items.filter('.active').length === 0) {
            $items = that.$menuInner.find('li');
            if (that.options.liveSearchNormalize) {
              $items = $items.filter(':a' + that._searchStyle() + '(' + normalizeToBase(keyCodeMap[e.keyCode]) + ')');
            } else {
              $items = $items.filter(':' + that._searchStyle() + '(' + keyCodeMap[e.keyCode] + ')');
            }
          }
        }
      }

      if (!$items.length) return;

      if (/(38|40)/.test(e.keyCode.toString(10))) {
        index = $items.index($items.find('a').filter(':focus').parent());
        first = $items.filter(selector).first().index();
        last = $items.filter(selector).last().index();
        next = $items.eq(index).nextAll(selector).eq(0).index();
        prev = $items.eq(index).prevAll(selector).eq(0).index();
        nextPrev = $items.eq(next).prevAll(selector).eq(0).index();

        if (that.options.liveSearch) {
          $items.each(function (i) {
            if (!$(this).hasClass('disabled')) {
              $(this).data('index', i);
            }
          });
          index = $items.index($items.filter('.active'));
          first = $items.first().data('index');
          last = $items.last().data('index');
          next = $items.eq(index).nextAll().eq(0).data('index');
          prev = $items.eq(index).prevAll().eq(0).data('index');
          nextPrev = $items.eq(next).prevAll().eq(0).data('index');
        }

        prevIndex = $this.data('prevIndex');

        if (e.keyCode == 38) {
          if (that.options.liveSearch) index--;
          if (index != nextPrev && index > prev) index = prev;
          if (index < first) index = first;
          if (index == prevIndex) index = last;
        } else if (e.keyCode == 40) {
          if (that.options.liveSearch) index++;
          if (index == -1) index = 0;
          if (index != nextPrev && index < next) index = next;
          if (index > last) index = last;
          if (index == prevIndex) index = first;
        }

        $this.data('prevIndex', index);

        if (!that.options.liveSearch) {
          $items.eq(index).children('a').focus();
        } else {
          e.preventDefault();
          if (!$this.hasClass('dropdown-toggle')) {
            $items.removeClass('active').eq(index).addClass('active').children('a').focus();
            $this.focus();
          }
        }

      } else if (!$this.is('input')) {
        var keyIndex = [],
            count,
            prevKey;

        $items.each(function () {
          if (!$(this).hasClass('disabled')) {
            if ($.trim($(this).children('a').text().toLowerCase()).substring(0, 1) == keyCodeMap[e.keyCode]) {
              keyIndex.push($(this).index());
            }
          }
        });

        count = $(document).data('keycount');
        count++;
        $(document).data('keycount', count);

        prevKey = $.trim($(':focus').text().toLowerCase()).substring(0, 1);

        if (prevKey != keyCodeMap[e.keyCode]) {
          count = 1;
          $(document).data('keycount', count);
        } else if (count >= keyIndex.length) {
          $(document).data('keycount', 0);
          if (count > keyIndex.length) count = 1;
        }

        $items.eq(keyIndex[count - 1]).children('a').focus();
      }

      // Select focused option if "Enter", "Spacebar" or "Tab" (when selectOnTab is true) are pressed inside the menu.
      if ((/(13|32)/.test(e.keyCode.toString(10)) || (/(^9$)/.test(e.keyCode.toString(10)) && that.options.selectOnTab)) && isActive) {
        if (!/(32)/.test(e.keyCode.toString(10))) e.preventDefault();
        if (!that.options.liveSearch) {
          var elem = $(':focus');
          elem.click();
          // Bring back focus for multiselects
          elem.focus();
          // Prevent screen from scrolling if the user hit the spacebar
          e.preventDefault();
          // Fixes spacebar selection of dropdown items in FF & IE
          $(document).data('spaceSelect', true);
        } else if (!/(32)/.test(e.keyCode.toString(10))) {
          that.$menuInner.find('.active a').click();
          $this.focus();
        }
        $(document).data('keycount', 0);
      }

      if ((/(^9$|27)/.test(e.keyCode.toString(10)) && isActive && (that.multiple || that.options.liveSearch)) || (/(27)/.test(e.keyCode.toString(10)) && !isActive)) {
        that.$menu.parent().removeClass('open');
        if (that.options.container) that.$newElement.removeClass('open');
        that.$button.focus();
      }
    },

    mobile: function () {
      this.$element.addClass('mobile-device');
    },

    refresh: function () {
      this.$lis = null;
      this.liObj = {};
      this.reloadLi();
      this.render();
      this.checkDisabled();
      this.liHeight(true);
      this.setStyle();
      this.setWidth();
      if (this.$lis) this.$searchbox.trigger('propertychange');

      this.$element.trigger('refreshed.bs.select');
    },

    hide: function () {
      this.$newElement.hide();
    },

    show: function () {
      this.$newElement.show();
    },

    remove: function () {
      this.$newElement.remove();
      this.$element.remove();
    },

    destroy: function () {
      this.$newElement.before(this.$element).remove();

      if (this.$bsContainer) {
        this.$bsContainer.remove();
      } else {
        this.$menu.remove();
      }

      this.$element
        .off('.bs.select')
        .removeData('selectpicker')
        .removeClass('bs-select-hidden selectpicker');
    }
  };

  // SELECTPICKER PLUGIN DEFINITION
  // ==============================
  function Plugin(option) {
    // get the args of the outer function..
    var args = arguments;
    // The arguments of the function are explicitly re-defined from the argument list, because the shift causes them
    // to get lost/corrupted in android 2.3 and IE9 #715 #775
    var _option = option;

    [].shift.apply(args);

    var value;
    var chain = this.each(function () {
      var $this = $(this);
      if ($this.is('select')) {
        var data = $this.data('selectpicker'),
            options = typeof _option == 'object' && _option;

        if (!data) {
          var config = $.extend({}, Selectpicker.DEFAULTS, $.fn.selectpicker.defaults || {}, $this.data(), options);
          config.template = $.extend({}, Selectpicker.DEFAULTS.template, ($.fn.selectpicker.defaults ? $.fn.selectpicker.defaults.template : {}), $this.data().template, options.template);
          $this.data('selectpicker', (data = new Selectpicker(this, config)));
        } else if (options) {
          for (var i in options) {
            if (options.hasOwnProperty(i)) {
              data.options[i] = options[i];
            }
          }
        }

        if (typeof _option == 'string') {
          if (data[_option] instanceof Function) {
            value = data[_option].apply(data, args);
          } else {
            value = data.options[_option];
          }
        }
      }
    });

    if (typeof value !== 'undefined') {
      //noinspection JSUnusedAssignment
      return value;
    } else {
      return chain;
    }
  }

  var old = $.fn.selectpicker;
  $.fn.selectpicker = Plugin;
  $.fn.selectpicker.Constructor = Selectpicker;

  // SELECTPICKER NO CONFLICT
  // ========================
  $.fn.selectpicker.noConflict = function () {
    $.fn.selectpicker = old;
    return this;
  };

  $(document)
      .data('keycount', 0)
      .on('keydown.bs.select', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="listbox"], .bs-searchbox input', Selectpicker.prototype.keydown)
      .on('focusin.modal', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="listbox"], .bs-searchbox input', function (e) {
        e.stopPropagation();
      });

  // SELECTPICKER DATA-API
  // =====================
  $(window).on('load.bs.select.data-api', function () {
    $('.selectpicker').each(function () {
      var $selectpicker = $(this);
      Plugin.call($selectpicker, $selectpicker.data());
    })
  });
})(jQuery);


}));
/* ========================================================================
 * bootstrap-switch - v3.3.2
 * http://www.bootstrap-switch.org
 * ========================================================================
 * Copyright 2012-2013 Mattia Larentis
 *
 * ========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================================
 */


(function() {
  var slice = [].slice;

  (function($, window) {
    "use strict";
    var BootstrapSwitch;
    BootstrapSwitch = (function() {
      function BootstrapSwitch(element, options) {
        if (options == null) {
          options = {};
        }
        this.$element = $(element);
        this.options = $.extend({}, $.fn.bootstrapSwitch.defaults, {
          state: this.$element.is(":checked"),
          size: this.$element.data("size"),
          animate: this.$element.data("animate"),
          disabled: this.$element.is(":disabled"),
          readonly: this.$element.is("[readonly]"),
          indeterminate: this.$element.data("indeterminate"),
          inverse: this.$element.data("inverse"),
          radioAllOff: this.$element.data("radio-all-off"),
          onColor: this.$element.data("on-color"),
          offColor: this.$element.data("off-color"),
          onText: this.$element.data("on-text"),
          offText: this.$element.data("off-text"),
          labelText: this.$element.data("label-text"),
          handleWidth: this.$element.data("handle-width"),
          labelWidth: this.$element.data("label-width"),
          baseClass: this.$element.data("base-class"),
          wrapperClass: this.$element.data("wrapper-class")
        }, options);
        this.prevOptions = {};
        this.$wrapper = $("<div>", {
          "class": (function(_this) {
            return function() {
              var classes;
              classes = ["" + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass));
              classes.push(_this.options.state ? _this.options.baseClass + "-on" : _this.options.baseClass + "-off");
              if (_this.options.size != null) {
                classes.push(_this.options.baseClass + "-" + _this.options.size);
              }
              if (_this.options.disabled) {
                classes.push(_this.options.baseClass + "-disabled");
              }
              if (_this.options.readonly) {
                classes.push(_this.options.baseClass + "-readonly");
              }
              if (_this.options.indeterminate) {
                classes.push(_this.options.baseClass + "-indeterminate");
              }
              if (_this.options.inverse) {
                classes.push(_this.options.baseClass + "-inverse");
              }
              if (_this.$element.attr("id")) {
                classes.push(_this.options.baseClass + "-id-" + (_this.$element.attr("id")));
              }
              return classes.join(" ");
            };
          })(this)()
        });
        this.$container = $("<div>", {
          "class": this.options.baseClass + "-container"
        });
        this.$on = $("<span>", {
          html: this.options.onText,
          "class": this.options.baseClass + "-handle-on " + this.options.baseClass + "-" + this.options.onColor
        });
        this.$off = $("<span>", {
          html: this.options.offText,
          "class": this.options.baseClass + "-handle-off " + this.options.baseClass + "-" + this.options.offColor
        });
        this.$label = $("<span>", {
          html: this.options.labelText,
          "class": this.options.baseClass + "-label"
        });
        this.$element.on("init.bootstrapSwitch", (function(_this) {
          return function() {
            return _this.options.onInit.apply(element, arguments);
          };
        })(this));
        this.$element.on("switchChange.bootstrapSwitch", (function(_this) {
          return function(e) {
            if (false === _this.options.onSwitchChange.apply(element, arguments)) {
              if (_this.$element.is(":radio")) {
                return $("[name='" + (_this.$element.attr('name')) + "']").trigger("previousState.bootstrapSwitch", true);
              } else {
                return _this.$element.trigger("previousState.bootstrapSwitch", true);
              }
            }
          };
        })(this));
        this.$container = this.$element.wrap(this.$container).parent();
        this.$wrapper = this.$container.wrap(this.$wrapper).parent();
        this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off);
        if (this.options.indeterminate) {
          this.$element.prop("indeterminate", true);
        }
        this._init();
        this._elementHandlers();
        this._handleHandlers();
        this._labelHandlers();
        this._formHandler();
        this._externalLabelHandler();
        this.$element.trigger("init.bootstrapSwitch", this.options.state);
      }

      BootstrapSwitch.prototype._constructor = BootstrapSwitch;

      BootstrapSwitch.prototype.setPrevOptions = function() {
        return this.prevOptions = $.extend(true, {}, this.options);
      };

      BootstrapSwitch.prototype.state = function(value, skip) {
        if (typeof value === "undefined") {
          return this.options.state;
        }
        if (this.options.disabled || this.options.readonly) {
          return this.$element;
        }
        if (this.options.state && !this.options.radioAllOff && this.$element.is(":radio")) {
          return this.$element;
        }
        if (this.$element.is(":radio")) {
          $("[name='" + (this.$element.attr('name')) + "']").trigger("setPreviousOptions.bootstrapSwitch");
        } else {
          this.$element.trigger("setPreviousOptions.bootstrapSwitch");
        }
        if (this.options.indeterminate) {
          this.indeterminate(false);
        }
        value = !!value;
        this.$element.prop("checked", value).trigger("change.bootstrapSwitch", skip);
        return this.$element;
      };

      BootstrapSwitch.prototype.toggleState = function(skip) {
        if (this.options.disabled || this.options.readonly) {
          return this.$element;
        }
        if (this.options.indeterminate) {
          this.indeterminate(false);
          return this.state(true);
        } else {
          return this.$element.prop("checked", !this.options.state).trigger("change.bootstrapSwitch", skip);
        }
      };

      BootstrapSwitch.prototype.size = function(value) {
        if (typeof value === "undefined") {
          return this.options.size;
        }
        if (this.options.size != null) {
          this.$wrapper.removeClass(this.options.baseClass + "-" + this.options.size);
        }
        if (value) {
          this.$wrapper.addClass(this.options.baseClass + "-" + value);
        }
        this._width();
        this._containerPosition();
        this.options.size = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.animate = function(value) {
        if (typeof value === "undefined") {
          return this.options.animate;
        }
        value = !!value;
        if (value === this.options.animate) {
          return this.$element;
        }
        return this.toggleAnimate();
      };

      BootstrapSwitch.prototype.toggleAnimate = function() {
        this.options.animate = !this.options.animate;
        this.$wrapper.toggleClass(this.options.baseClass + "-animate");
        return this.$element;
      };

      BootstrapSwitch.prototype.disabled = function(value) {
        if (typeof value === "undefined") {
          return this.options.disabled;
        }
        value = !!value;
        if (value === this.options.disabled) {
          return this.$element;
        }
        return this.toggleDisabled();
      };

      BootstrapSwitch.prototype.toggleDisabled = function() {
        this.options.disabled = !this.options.disabled;
        this.$element.prop("disabled", this.options.disabled);
        this.$wrapper.toggleClass(this.options.baseClass + "-disabled");
        return this.$element;
      };

      BootstrapSwitch.prototype.readonly = function(value) {
        if (typeof value === "undefined") {
          return this.options.readonly;
        }
        value = !!value;
        if (value === this.options.readonly) {
          return this.$element;
        }
        return this.toggleReadonly();
      };

      BootstrapSwitch.prototype.toggleReadonly = function() {
        this.options.readonly = !this.options.readonly;
        this.$element.prop("readonly", this.options.readonly);
        this.$wrapper.toggleClass(this.options.baseClass + "-readonly");
        return this.$element;
      };

      BootstrapSwitch.prototype.indeterminate = function(value) {
        if (typeof value === "undefined") {
          return this.options.indeterminate;
        }
        value = !!value;
        if (value === this.options.indeterminate) {
          return this.$element;
        }
        return this.toggleIndeterminate();
      };

      BootstrapSwitch.prototype.toggleIndeterminate = function() {
        this.options.indeterminate = !this.options.indeterminate;
        this.$element.prop("indeterminate", this.options.indeterminate);
        this.$wrapper.toggleClass(this.options.baseClass + "-indeterminate");
        this._containerPosition();
        return this.$element;
      };

      BootstrapSwitch.prototype.inverse = function(value) {
        if (typeof value === "undefined") {
          return this.options.inverse;
        }
        value = !!value;
        if (value === this.options.inverse) {
          return this.$element;
        }
        return this.toggleInverse();
      };

      BootstrapSwitch.prototype.toggleInverse = function() {
        var $off, $on;
        this.$wrapper.toggleClass(this.options.baseClass + "-inverse");
        $on = this.$on.clone(true);
        $off = this.$off.clone(true);
        this.$on.replaceWith($off);
        this.$off.replaceWith($on);
        this.$on = $off;
        this.$off = $on;
        this.options.inverse = !this.options.inverse;
        return this.$element;
      };

      BootstrapSwitch.prototype.onColor = function(value) {
        var color;
        color = this.options.onColor;
        if (typeof value === "undefined") {
          return color;
        }
        if (color != null) {
          this.$on.removeClass(this.options.baseClass + "-" + color);
        }
        this.$on.addClass(this.options.baseClass + "-" + value);
        this.options.onColor = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.offColor = function(value) {
        var color;
        color = this.options.offColor;
        if (typeof value === "undefined") {
          return color;
        }
        if (color != null) {
          this.$off.removeClass(this.options.baseClass + "-" + color);
        }
        this.$off.addClass(this.options.baseClass + "-" + value);
        this.options.offColor = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.onText = function(value) {
        if (typeof value === "undefined") {
          return this.options.onText;
        }
        this.$on.html(value);
        this._width();
        this._containerPosition();
        this.options.onText = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.offText = function(value) {
        if (typeof value === "undefined") {
          return this.options.offText;
        }
        this.$off.html(value);
        this._width();
        this._containerPosition();
        this.options.offText = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.labelText = function(value) {
        if (typeof value === "undefined") {
          return this.options.labelText;
        }
        this.$label.html(value);
        this._width();
        this.options.labelText = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.handleWidth = function(value) {
        if (typeof value === "undefined") {
          return this.options.handleWidth;
        }
        this.options.handleWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
      };

      BootstrapSwitch.prototype.labelWidth = function(value) {
        if (typeof value === "undefined") {
          return this.options.labelWidth;
        }
        this.options.labelWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
      };

      BootstrapSwitch.prototype.baseClass = function(value) {
        return this.options.baseClass;
      };

      BootstrapSwitch.prototype.wrapperClass = function(value) {
        if (typeof value === "undefined") {
          return this.options.wrapperClass;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.wrapperClass;
        }
        this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" "));
        this.$wrapper.addClass(this._getClasses(value).join(" "));
        this.options.wrapperClass = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.radioAllOff = function(value) {
        if (typeof value === "undefined") {
          return this.options.radioAllOff;
        }
        value = !!value;
        if (value === this.options.radioAllOff) {
          return this.$element;
        }
        this.options.radioAllOff = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.onInit = function(value) {
        if (typeof value === "undefined") {
          return this.options.onInit;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onInit;
        }
        this.options.onInit = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.onSwitchChange = function(value) {
        if (typeof value === "undefined") {
          return this.options.onSwitchChange;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onSwitchChange;
        }
        this.options.onSwitchChange = value;
        return this.$element;
      };

      BootstrapSwitch.prototype.destroy = function() {
        var $form;
        $form = this.$element.closest("form");
        if ($form.length) {
          $form.off("reset.bootstrapSwitch").removeData("bootstrap-switch");
        }
        this.$container.children().not(this.$element).remove();
        this.$element.unwrap().unwrap().off(".bootstrapSwitch").removeData("bootstrap-switch");
        return this.$element;
      };

      BootstrapSwitch.prototype._width = function() {
        var $handles, handleWidth;
        $handles = this.$on.add(this.$off);
        $handles.add(this.$label).css("width", "");
        handleWidth = this.options.handleWidth === "auto" ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth;
        $handles.width(handleWidth);
        this.$label.width((function(_this) {
          return function(index, width) {
            if (_this.options.labelWidth !== "auto") {
              return _this.options.labelWidth;
            }
            if (width < handleWidth) {
              return handleWidth;
            } else {
              return width;
            }
          };
        })(this));
        this._handleWidth = this.$on.outerWidth();
        this._labelWidth = this.$label.outerWidth();
        this.$container.width((this._handleWidth * 2) + this._labelWidth);
        return this.$wrapper.width(this._handleWidth + this._labelWidth);
      };

      BootstrapSwitch.prototype._containerPosition = function(state, callback) {
        if (state == null) {
          state = this.options.state;
        }
        this.$container.css("margin-left", (function(_this) {
          return function() {
            var values;
            values = [0, "-" + _this._handleWidth + "px"];
            if (_this.options.indeterminate) {
              return "-" + (_this._handleWidth / 2) + "px";
            }
            if (state) {
              if (_this.options.inverse) {
                return values[1];
              } else {
                return values[0];
              }
            } else {
              if (_this.options.inverse) {
                return values[0];
              } else {
                return values[1];
              }
            }
          };
        })(this));
        if (!callback) {
          return;
        }
        return setTimeout(function() {
          return callback();
        }, 50);
      };

      BootstrapSwitch.prototype._init = function() {
        var init, initInterval;
        init = (function(_this) {
          return function() {
            _this.setPrevOptions();
            _this._width();
            return _this._containerPosition(null, function() {
              if (_this.options.animate) {
                return _this.$wrapper.addClass(_this.options.baseClass + "-animate");
              }
            });
          };
        })(this);
        if (this.$wrapper.is(":visible")) {
          return init();
        }
        return initInterval = window.setInterval((function(_this) {
          return function() {
            if (_this.$wrapper.is(":visible")) {
              init();
              return window.clearInterval(initInterval);
            }
          };
        })(this), 50);
      };

      BootstrapSwitch.prototype._elementHandlers = function() {
        return this.$element.on({
          "setPreviousOptions.bootstrapSwitch": (function(_this) {
            return function(e) {
              return _this.setPrevOptions();
            };
          })(this),
          "previousState.bootstrapSwitch": (function(_this) {
            return function(e) {
              _this.options = _this.prevOptions;
              if (_this.options.indeterminate) {
                _this.$wrapper.addClass(_this.options.baseClass + "-indeterminate");
              }
              return _this.$element.prop("checked", _this.options.state).trigger("change.bootstrapSwitch", true);
            };
          })(this),
          "change.bootstrapSwitch": (function(_this) {
            return function(e, skip) {
              var state;
              e.preventDefault();
              e.stopImmediatePropagation();
              state = _this.$element.is(":checked");
              _this._containerPosition(state);
              if (state === _this.options.state) {
                return;
              }
              _this.options.state = state;
              _this.$wrapper.toggleClass(_this.options.baseClass + "-off").toggleClass(_this.options.baseClass + "-on");
              if (!skip) {
                if (_this.$element.is(":radio")) {
                  $("[name='" + (_this.$element.attr('name')) + "']").not(_this.$element).prop("checked", false).trigger("change.bootstrapSwitch", true);
                }
                return _this.$element.trigger("switchChange.bootstrapSwitch", [state]);
              }
            };
          })(this),
          "focus.bootstrapSwitch": (function(_this) {
            return function(e) {
              e.preventDefault();
              return _this.$wrapper.addClass(_this.options.baseClass + "-focused");
            };
          })(this),
          "blur.bootstrapSwitch": (function(_this) {
            return function(e) {
              e.preventDefault();
              return _this.$wrapper.removeClass(_this.options.baseClass + "-focused");
            };
          })(this),
          "keydown.bootstrapSwitch": (function(_this) {
            return function(e) {
              if (!e.which || _this.options.disabled || _this.options.readonly) {
                return;
              }
              switch (e.which) {
                case 37:
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return _this.state(false);
                case 39:
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return _this.state(true);
              }
            };
          })(this)
        });
      };

      BootstrapSwitch.prototype._handleHandlers = function() {
        this.$on.on("click.bootstrapSwitch", (function(_this) {
          return function(event) {
            event.preventDefault();
            event.stopPropagation();
            _this.state(false);
            return _this.$element.trigger("focus.bootstrapSwitch");
          };
        })(this));
        return this.$off.on("click.bootstrapSwitch", (function(_this) {
          return function(event) {
            event.preventDefault();
            event.stopPropagation();
            _this.state(true);
            return _this.$element.trigger("focus.bootstrapSwitch");
          };
        })(this));
      };

      BootstrapSwitch.prototype._labelHandlers = function() {
        return this.$label.on({
          "click": function(e) {
            return e.stopPropagation();
          },
          "mousedown.bootstrapSwitch touchstart.bootstrapSwitch": (function(_this) {
            return function(e) {
              if (_this._dragStart || _this.options.disabled || _this.options.readonly) {
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              _this._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(_this.$container.css("margin-left"), 10);
              if (_this.options.animate) {
                _this.$wrapper.removeClass(_this.options.baseClass + "-animate");
              }
              return _this.$element.trigger("focus.bootstrapSwitch");
            };
          })(this),
          "mousemove.bootstrapSwitch touchmove.bootstrapSwitch": (function(_this) {
            return function(e) {
              var difference;
              if (_this._dragStart == null) {
                return;
              }
              e.preventDefault();
              difference = (e.pageX || e.originalEvent.touches[0].pageX) - _this._dragStart;
              if (difference < -_this._handleWidth || difference > 0) {
                return;
              }
              _this._dragEnd = difference;
              return _this.$container.css("margin-left", _this._dragEnd + "px");
            };
          })(this),
          "mouseup.bootstrapSwitch touchend.bootstrapSwitch": (function(_this) {
            return function(e) {
              var state;
              if (!_this._dragStart) {
                return;
              }
              e.preventDefault();
              if (_this.options.animate) {
                _this.$wrapper.addClass(_this.options.baseClass + "-animate");
              }
              if (_this._dragEnd) {
                state = _this._dragEnd > -(_this._handleWidth / 2);
                _this._dragEnd = false;
                _this.state(_this.options.inverse ? !state : state);
              } else {
                _this.state(!_this.options.state);
              }
              return _this._dragStart = false;
            };
          })(this),
          "mouseleave.bootstrapSwitch": (function(_this) {
            return function(e) {
              return _this.$label.trigger("mouseup.bootstrapSwitch");
            };
          })(this)
        });
      };

      BootstrapSwitch.prototype._externalLabelHandler = function() {
        var $externalLabel;
        $externalLabel = this.$element.closest("label");
        return $externalLabel.on("click", (function(_this) {
          return function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (event.target === $externalLabel[0]) {
              return _this.toggleState();
            }
          };
        })(this));
      };

      BootstrapSwitch.prototype._formHandler = function() {
        var $form;
        $form = this.$element.closest("form");
        if ($form.data("bootstrap-switch")) {
          return;
        }
        return $form.on("reset.bootstrapSwitch", function() {
          return window.setTimeout(function() {
            return $form.find("input").filter(function() {
              return $(this).data("bootstrap-switch");
            }).each(function() {
              return $(this).bootstrapSwitch("state", this.checked);
            });
          }, 1);
        }).data("bootstrap-switch", true);
      };

      BootstrapSwitch.prototype._getClasses = function(classes) {
        var c, cls, i, len;
        if (!$.isArray(classes)) {
          return [this.options.baseClass + "-" + classes];
        }
        cls = [];
        for (i = 0, len = classes.length; i < len; i++) {
          c = classes[i];
          cls.push(this.options.baseClass + "-" + c);
        }
        return cls;
      };

      return BootstrapSwitch;

    })();
    $.fn.bootstrapSwitch = function() {
      var args, option, ret;
      option = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ret = this;
      this.each(function() {
        var $this, data;
        $this = $(this);
        data = $this.data("bootstrap-switch");
        if (!data) {
          $this.data("bootstrap-switch", data = new BootstrapSwitch(this, option));
        }
        if (typeof option === "string") {
          return ret = data[option].apply(data, args);
        }
      });
      return ret;
    };
    $.fn.bootstrapSwitch.Constructor = BootstrapSwitch;
    return $.fn.bootstrapSwitch.defaults = {
      state: true,
      size: null,
      animate: true,
      disabled: false,
      readonly: false,
      indeterminate: false,
      inverse: false,
      radioAllOff: false,
      onColor: "primary",
      offColor: "default",
      onText: "ON",
      offText: "OFF",
      labelText: "&nbsp;",
      handleWidth: "auto",
      labelWidth: "auto",
      baseClass: "bootstrap-switch",
      wrapperClass: "wrapper",
      onInit: function() {},
      onSwitchChange: function() {}
    };
  })(window.jQuery, window);

}).call(this);




//
/*
 * bootstrap-tagsinput v0.8.0
 *
 */

(function ($) {
  "use strict";

  var defaultOptions = {
    tagClass: function(item) {
      return 'label label-info';
    },
    focusClass: 'focus',
    itemValue: function(item) {
      return item ? item.toString() : item;
    },
    itemText: function(item) {
      return this.itemValue(item);
    },
    itemTitle: function(item) {
      return null;
    },
    freeInput: true,
    addOnBlur: true,
    maxTags: undefined,
    maxChars: undefined,
    confirmKeys: [13, 44],
    delimiter: ',',
    delimiterRegex: null,
    cancelConfirmKeysOnEmpty: false,
    onTagExists: function(item, $tag) {
      $tag.hide().fadeIn();
    },
    trimValue: false,
    allowDuplicates: false,
    triggerChange: true
  };

  /**
   * Constructor function
   */
  function TagsInput(element, options) {
    this.isInit = true;
    this.itemsArray = [];

    this.$element = $(element);
    this.$element.hide();

    this.isSelect = (element.tagName === 'SELECT');
    this.multiple = (this.isSelect && element.hasAttribute('multiple'));
    this.objectItems = options && options.itemValue;
    this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
    this.inputSize = Math.max(1, this.placeholderText.length);

    this.$container = $('<div class="bootstrap-tagsinput"></div>');
    this.$input = $('<input type="text" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);

    this.$element.before(this.$container);

    this.build(options);
    this.isInit = false;
  }

  TagsInput.prototype = {
    constructor: TagsInput,

    /**
     * Adds the given item as a new tag. Pass true to dontPushVal to prevent
     * updating the elements val()
     */
    add: function(item, dontPushVal, options) {
      var self = this;

      if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags)
        return;

      // Ignore falsey values, except false
      if (item !== false && !item)
        return;

      // Trim value
      if (typeof item === "string" && self.options.trimValue) {
        item = $.trim(item);
      }

      // Throw an error when trying to add an object while the itemValue option was not set
      if (typeof item === "object" && !self.objectItems)
        throw("Can't add objects when itemValue option is not set");

      // Ignore strings only containg whitespace
      if (item.toString().match(/^\s*$/))
        return;

      // If SELECT but not multiple, remove current tag
      if (self.isSelect && !self.multiple && self.itemsArray.length > 0)
        self.remove(self.itemsArray[0]);

      if (typeof item === "string" && this.$element[0].tagName === 'INPUT') {
        var delimiter = (self.options.delimiterRegex) ? self.options.delimiterRegex : self.options.delimiter;
        var items = item.split(delimiter);
        if (items.length > 1) {
          for (var i = 0; i < items.length; i++) {
            this.add(items[i], true);
          }

          if (!dontPushVal)
            self.pushVal(self.options.triggerChange);
          return;
        }
      }

      var itemValue = self.options.itemValue(item),
          itemText = self.options.itemText(item),
          tagClass = self.options.tagClass(item),
          itemTitle = self.options.itemTitle(item);

      // Ignore items allready added
      var existing = $.grep(self.itemsArray, function(item) { return self.options.itemValue(item) === itemValue; } )[0];
      if (existing && !self.options.allowDuplicates) {
        // Invoke onTagExists
        if (self.options.onTagExists) {
          var $existingTag = $(".tag", self.$container).filter(function() { return $(this).data("item") === existing; });
          self.options.onTagExists(item, $existingTag);
        }
        return;
      }

      // if length greater than limit
      if (self.items().toString().length + item.length + 1 > self.options.maxInputLength)
        return;

      // raise beforeItemAdd arg
      var beforeItemAddEvent = $.Event('beforeItemAdd', { item: item, cancel: false, options: options});
      self.$element.trigger(beforeItemAddEvent);
      if (beforeItemAddEvent.cancel)
        return;

      // register item in internal array and map
      self.itemsArray.push(item);

      // add a tag element

      var $tag = $('<span class="tag ' + htmlEncode(tagClass) + (itemTitle !== null ? ('" title="' + itemTitle) : '') + '">' + htmlEncode(itemText) + '<span data-role="remove"></span></span>');
      $tag.data('item', item);
      self.findInputWrapper().before($tag);
      $tag.after(' ');

      // Check to see if the tag exists in its raw or uri-encoded form
      var optionExists = (
        $('option[value="' + encodeURIComponent(itemValue) + '"]', self.$element).length ||
        $('option[value="' + htmlEncode(itemValue) + '"]', self.$element).length
      );

      // add <option /> if item represents a value not present in one of the <select />'s options
      if (self.isSelect && !optionExists) {
        var $option = $('<option selected>' + htmlEncode(itemText) + '</option>');
        $option.data('item', item);
        $option.attr('value', itemValue);
        self.$element.append($option);
      }

      if (!dontPushVal)
        self.pushVal(self.options.triggerChange);

      // Add class when reached maxTags
      if (self.options.maxTags === self.itemsArray.length || self.items().toString().length === self.options.maxInputLength)
        self.$container.addClass('bootstrap-tagsinput-max');

      // If using typeahead, once the tag has been added, clear the typeahead value so it does not stick around in the input.
      if ($('.typeahead, .twitter-typeahead', self.$container).length) {
        self.$input.typeahead('val', '');
      }

      if (this.isInit) {
        self.$element.trigger($.Event('itemAddedOnInit', { item: item, options: options }));
      } else {
        self.$element.trigger($.Event('itemAdded', { item: item, options: options }));
      }
    },

    /**
     * Removes the given item. Pass true to dontPushVal to prevent updating the
     * elements val()
     */
    remove: function(item, dontPushVal, options) {
      var self = this;

      if (self.objectItems) {
        if (typeof item === "object")
          item = $.grep(self.itemsArray, function(other) { return self.options.itemValue(other) ==  self.options.itemValue(item); } );
        else
          item = $.grep(self.itemsArray, function(other) { return self.options.itemValue(other) ==  item; } );

        item = item[item.length-1];
      }

      if (item) {
        var beforeItemRemoveEvent = $.Event('beforeItemRemove', { item: item, cancel: false, options: options });
        self.$element.trigger(beforeItemRemoveEvent);
        if (beforeItemRemoveEvent.cancel)
          return;

        $('.tag', self.$container).filter(function() { return $(this).data('item') === item; }).remove();
        $('option', self.$element).filter(function() { return $(this).data('item') === item; }).remove();
        if($.inArray(item, self.itemsArray) !== -1)
          self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
      }

      if (!dontPushVal)
        self.pushVal(self.options.triggerChange);

      // Remove class when reached maxTags
      if (self.options.maxTags > self.itemsArray.length)
        self.$container.removeClass('bootstrap-tagsinput-max');

      self.$element.trigger($.Event('itemRemoved',  { item: item, options: options }));
    },

    /**
     * Removes all items
     */
    removeAll: function() {
      var self = this;

      $('.tag', self.$container).remove();
      $('option', self.$element).remove();

      while(self.itemsArray.length > 0)
        self.itemsArray.pop();

      self.pushVal(self.options.triggerChange);
    },

    /**
     * Refreshes the tags so they match the text/value of their corresponding
     * item.
     */
    refresh: function() {
      var self = this;
      $('.tag', self.$container).each(function() {
        var $tag = $(this),
            item = $tag.data('item'),
            itemValue = self.options.itemValue(item),
            itemText = self.options.itemText(item),
            tagClass = self.options.tagClass(item);

          // Update tag's class and inner text
          $tag.attr('class', null);
          $tag.addClass('tag ' + htmlEncode(tagClass));
          $tag.contents().filter(function() {
            return this.nodeType == 3;
          })[0].nodeValue = htmlEncode(itemText);

          if (self.isSelect) {
            var option = $('option', self.$element).filter(function() { return $(this).data('item') === item; });
            option.attr('value', itemValue);
          }
      });
    },

    /**
     * Returns the items added as tags
     */
    items: function() {
      return this.itemsArray;
    },

    /**
     * Assembly value by retrieving the value of each item, and set it on the
     * element.
     */
    pushVal: function() {
      var self = this,
          val = $.map(self.items(), function(item) {
            return self.options.itemValue(item).toString();
          });

      self.$element.val(val, true);

      if (self.options.triggerChange)
        self.$element.trigger('change');
    },

    /**
     * Initializes the tags input behaviour on the element
     */
    build: function(options) {
      var self = this;

      self.options = $.extend({}, defaultOptions, options);
      // When itemValue is set, freeInput should always be false
      if (self.objectItems)
        self.options.freeInput = false;

      makeOptionItemFunction(self.options, 'itemValue');
      makeOptionItemFunction(self.options, 'itemText');
      makeOptionFunction(self.options, 'tagClass');

      // Typeahead Bootstrap version 2.3.2
      if (self.options.typeahead) {
        var typeahead = self.options.typeahead || {};

        makeOptionFunction(typeahead, 'source');

        self.$input.typeahead($.extend({}, typeahead, {
          source: function (query, process) {
            function processItems(items) {
              var texts = [];

              for (var i = 0; i < items.length; i++) {
                var text = self.options.itemText(items[i]);
                map[text] = items[i];
                texts.push(text);
              }
              process(texts);
            }

            this.map = {};
            var map = this.map,
                data = typeahead.source(query);

            if ($.isFunction(data.success)) {
              // support for Angular callbacks
              data.success(processItems);
            } else if ($.isFunction(data.then)) {
              // support for Angular promises
              data.then(processItems);
            } else {
              // support for functions and jquery promises
              $.when(data)
               .then(processItems);
            }
          },
          updater: function (text) {
            self.add(this.map[text]);
            return this.map[text];
          },
          matcher: function (text) {
            return (text.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1);
          },
          sorter: function (texts) {
            return texts.sort();
          },
          highlighter: function (text) {
            var regex = new RegExp( '(' + this.query + ')', 'gi' );
            return text.replace( regex, "<strong>$1</strong>" );
          }
        }));
      }

      // typeahead.js
      if (self.options.typeaheadjs) {

          // Determine if main configurations were passed or simply a dataset
          var typeaheadjs = self.options.typeaheadjs;
          if (!$.isArray(typeaheadjs)) {
              typeaheadjs = [null, typeaheadjs];
          }
          var valueKey = typeaheadjs[1].valueKey; // We should test typeaheadjs.size >= 1
          var f_datum = valueKey ? function (datum) { return datum[valueKey];  }
                                 : function (datum) {  return datum;  }
          $.fn.typeahead.apply(self.$input,typeaheadjs).on('typeahead:selected', $.proxy(function (obj, datum) {
              self.add( f_datum(datum) );
              self.$input.typeahead('val', '');
            }, self));

      }

      self.$container.on('click', $.proxy(function(event) {
        if (! self.$element.attr('disabled')) {
          self.$input.removeAttr('disabled');
        }
        self.$input.focus();
      }, self));

        if (self.options.addOnBlur && self.options.freeInput) {
          self.$input.on('focusout', $.proxy(function(event) {
              // HACK: only process on focusout when no typeahead opened, to
              //       avoid adding the typeahead text as tag
              if ($('.typeahead, .twitter-typeahead', self.$container).length === 0) {
                self.add(self.$input.val());
                self.$input.val('');
              }
          }, self));
        }

      // Toggle the 'focus' css class on the container when it has focus
      self.$container.on({
        focusin: function() {
          self.$container.addClass(self.options.focusClass);
        },
        focusout: function() {
          self.$container.removeClass(self.options.focusClass);
        },
      });

      self.$container.on('keydown', 'input', $.proxy(function(event) {
        var $input = $(event.target),
            $inputWrapper = self.findInputWrapper();

        if (self.$element.attr('disabled')) {
          self.$input.attr('disabled', 'disabled');
          return;
        }

        switch (event.which) {
          // BACKSPACE
          case 8:
            if (doGetCaretPosition($input[0]) === 0) {
              var prev = $inputWrapper.prev();
              if (prev.length) {
                self.remove(prev.data('item'));
              }
            }
            break;

          // DELETE
          case 46:
            if (doGetCaretPosition($input[0]) === 0) {
              var next = $inputWrapper.next();
              if (next.length) {
                self.remove(next.data('item'));
              }
            }
            break;

          // LEFT ARROW
          case 37:
            // Try to move the input before the previous tag
            var $prevTag = $inputWrapper.prev();
            if ($input.val().length === 0 && $prevTag[0]) {
              $prevTag.before($inputWrapper);
              $input.focus();
            }
            break;
          // RIGHT ARROW
          case 39:
            // Try to move the input after the next tag
            var $nextTag = $inputWrapper.next();
            if ($input.val().length === 0 && $nextTag[0]) {
              $nextTag.after($inputWrapper);
              $input.focus();
            }
            break;
         default:
             // ignore
         }

        // Reset internal input's size
        var textLength = $input.val().length,
            wordSpace = Math.ceil(textLength / 5),
            size = textLength + wordSpace + 1;
        $input.attr('size', Math.max(this.inputSize, $input.val().length));
      }, self));

      self.$container.on('keypress', 'input', $.proxy(function(event) {
         var $input = $(event.target);

         if (self.$element.attr('disabled')) {
            self.$input.attr('disabled', 'disabled');
            return;
         }

         var text = $input.val(),
         maxLengthReached = self.options.maxChars && text.length >= self.options.maxChars;
         if (self.options.freeInput && (keyCombinationInList(event, self.options.confirmKeys) || maxLengthReached)) {
            // Only attempt to add a tag if there is data in the field
            if (text.length !== 0) {
               self.add(maxLengthReached ? text.substr(0, self.options.maxChars) : text);
               $input.val('');
            }

            // If the field is empty, let the event triggered fire as usual
            if (self.options.cancelConfirmKeysOnEmpty === false) {
                event.preventDefault();
            }
         }

         // Reset internal input's size
         var textLength = $input.val().length,
            wordSpace = Math.ceil(textLength / 5),
            size = textLength + wordSpace + 1;
         $input.attr('size', Math.max(this.inputSize, $input.val().length));
      }, self));

      // Remove icon clicked
      self.$container.on('click', '[data-role=remove]', $.proxy(function(event) {
        if (self.$element.attr('disabled')) {
          return;
        }
        self.remove($(event.target).closest('.tag').data('item'));
      }, self));

      // Only add existing value as tags when using strings as tags
      if (self.options.itemValue === defaultOptions.itemValue) {
        if (self.$element[0].tagName === 'INPUT') {
            self.add(self.$element.val());
        } else {
          $('option', self.$element).each(function() {
            self.add($(this).attr('value'), true);
          });
        }
      }
    },

    /**
     * Removes all tagsinput behaviour and unregsiter all event handlers
     */
    destroy: function() {
      var self = this;

      // Unbind events
      self.$container.off('keypress', 'input');
      self.$container.off('click', '[role=remove]');

      self.$container.remove();
      self.$element.removeData('tagsinput');
      self.$element.show();
    },

    /**
     * Sets focus on the tagsinput
     */
    focus: function() {
      this.$input.focus();
    },

    /**
     * Returns the internal input element
     */
    input: function() {
      return this.$input;
    },

    /**
     * Returns the element which is wrapped around the internal input. This
     * is normally the $container, but typeahead.js moves the $input element.
     */
    findInputWrapper: function() {
      var elt = this.$input[0],
          container = this.$container[0];
      while(elt && elt.parentNode !== container)
        elt = elt.parentNode;

      return $(elt);
    }
  };

  /**
   * Register JQuery plugin
   */
  $.fn.tagsinput = function(arg1, arg2, arg3) {
    var results = [];

    this.each(function() {
      var tagsinput = $(this).data('tagsinput');
      // Initialize a new tags input
      if (!tagsinput) {
          tagsinput = new TagsInput(this, arg1);
          $(this).data('tagsinput', tagsinput);
          results.push(tagsinput);

          if (this.tagName === 'SELECT') {
              $('option', $(this)).attr('selected', 'selected');
          }

          // Init tags from $(this).val()
          $(this).val($(this).val());
      } else if (!arg1 && !arg2) {
          // tagsinput already exists
          // no function, trying to init
          results.push(tagsinput);
      } else if(tagsinput[arg1] !== undefined) {
          // Invoke function on existing tags input
            if(tagsinput[arg1].length === 3 && arg3 !== undefined){
               var retVal = tagsinput[arg1](arg2, null, arg3);
            }else{
               var retVal = tagsinput[arg1](arg2);
            }
          if (retVal !== undefined)
              results.push(retVal);
      }
    });

    if ( typeof arg1 == 'string') {
      // Return the results from the invoked function calls
      return results.length > 1 ? results : results[0];
    } else {
      return results;
    }
  };

  $.fn.tagsinput.Constructor = TagsInput;

  /**
   * Most options support both a string or number as well as a function as
   * option value. This function makes sure that the option with the given
   * key in the given options is wrapped in a function
   */
  function makeOptionItemFunction(options, key) {
    if (typeof options[key] !== 'function') {
      var propertyName = options[key];
      options[key] = function(item) { return item[propertyName]; };
    }
  }
  function makeOptionFunction(options, key) {
    if (typeof options[key] !== 'function') {
      var value = options[key];
      options[key] = function() { return value; };
    }
  }
  /**
   * HtmlEncodes the given value
   */
  var htmlEncodeContainer = $('<div />');
  function htmlEncode(value) {
    if (value) {
      return htmlEncodeContainer.text(value).html();
    } else {
      return '';
    }
  }

  /**
   * Returns the position of the caret in the given input field
   * http://flightschool.acylt.com/devnotes/caret-position-woes/
   */
  function doGetCaretPosition(oField) {
    var iCaretPos = 0;
    if (document.selection) {
      oField.focus ();
      var oSel = document.selection.createRange();
      oSel.moveStart ('character', -oField.value.length);
      iCaretPos = oSel.text.length;
    } else if (oField.selectionStart || oField.selectionStart == '0') {
      iCaretPos = oField.selectionStart;
    }
    return (iCaretPos);
  }

  /**
    * Returns boolean indicates whether user has pressed an expected key combination.
    * @param object keyPressEvent: JavaScript event object, refer
    *     http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    * @param object lookupList: expected key combinations, as in:
    *     [13, {which: 188, shiftKey: true}]
    */
  function keyCombinationInList(keyPressEvent, lookupList) {
      var found = false;
      $.each(lookupList, function (index, keyCombination) {
          if (typeof (keyCombination) === 'number' && keyPressEvent.which === keyCombination) {
              found = true;
              return false;
          }

          if (keyPressEvent.which === keyCombination.which) {
              var alt = !keyCombination.hasOwnProperty('altKey') || keyPressEvent.altKey === keyCombination.altKey,
                  shift = !keyCombination.hasOwnProperty('shiftKey') || keyPressEvent.shiftKey === keyCombination.shiftKey,
                  ctrl = !keyCombination.hasOwnProperty('ctrlKey') || keyPressEvent.ctrlKey === keyCombination.ctrlKey;
              if (alt && shift && ctrl) {
                  found = true;
                  return false;
              }
          }
      });

      return found;
  }

  /**
   * Initialize tagsinput behaviour on inputs and selects which have
   * data-role=tagsinput
   */
  $(function() {
    $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
  });
})(window.jQuery);
/* flatpickr v4.5.2, @license MIT */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.flatpickr = factory());
}(this, (function () { 'use strict';

    var pad = function pad(number) {
      return ("0" + number).slice(-2);
    };
    var int = function int(bool) {
      return bool === true ? 1 : 0;
    };
    function debounce(func, wait, immediate) {
      if (immediate === void 0) {
        immediate = false;
      }

      var timeout;
      return function () {
        var context = this,
            args = arguments;
        timeout !== null && clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
      };
    }
    var arrayify = function arrayify(obj) {
      return obj instanceof Array ? obj : [obj];
    };

    var do_nothing = function do_nothing() {
      return undefined;
    };

    var monthToStr = function monthToStr(monthNumber, shorthand, locale) {
      return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
    };
    var revFormat = {
      D: do_nothing,
      F: function F(dateObj, monthName, locale) {
        dateObj.setMonth(locale.months.longhand.indexOf(monthName));
      },
      G: function G(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      H: function H(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      J: function J(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      K: function K(dateObj, amPM, locale) {
        dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
      },
      M: function M(dateObj, shortMonth, locale) {
        dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
      },
      S: function S(dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
      },
      U: function U(_, unixSeconds) {
        return new Date(parseFloat(unixSeconds) * 1000);
      },
      W: function W(dateObj, weekNum) {
        var weekNumber = parseInt(weekNum);
        return new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
      },
      Y: function Y(dateObj, year) {
        dateObj.setFullYear(parseFloat(year));
      },
      Z: function Z(_, ISODate) {
        return new Date(ISODate);
      },
      d: function d(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      h: function h(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      i: function i(dateObj, minutes) {
        dateObj.setMinutes(parseFloat(minutes));
      },
      j: function j(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      l: do_nothing,
      m: function m(dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      n: function n(dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      s: function s(dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
      },
      w: do_nothing,
      y: function y(dateObj, year) {
        dateObj.setFullYear(2000 + parseFloat(year));
      }
    };
    var tokenRegex = {
      D: "(\\w+)",
      F: "(\\w+)",
      G: "(\\d\\d|\\d)",
      H: "(\\d\\d|\\d)",
      J: "(\\d\\d|\\d)\\w+",
      K: "",
      M: "(\\w+)",
      S: "(\\d\\d|\\d)",
      U: "(.+)",
      W: "(\\d\\d|\\d)",
      Y: "(\\d{4})",
      Z: "(.+)",
      d: "(\\d\\d|\\d)",
      h: "(\\d\\d|\\d)",
      i: "(\\d\\d|\\d)",
      j: "(\\d\\d|\\d)",
      l: "(\\w+)",
      m: "(\\d\\d|\\d)",
      n: "(\\d\\d|\\d)",
      s: "(\\d\\d|\\d)",
      w: "(\\d\\d|\\d)",
      y: "(\\d{2})"
    };
    var formats = {
      Z: function Z(date) {
        return date.toISOString();
      },
      D: function D(date, locale, options) {
        return locale.weekdays.shorthand[formats.w(date, locale, options)];
      },
      F: function F(date, locale, options) {
        return monthToStr(formats.n(date, locale, options) - 1, false, locale);
      },
      G: function G(date, locale, options) {
        return pad(formats.h(date, locale, options));
      },
      H: function H(date) {
        return pad(date.getHours());
      },
      J: function J(date, locale) {
        return locale.ordinal !== undefined ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
      },
      K: function K(date, locale) {
        return locale.amPM[int(date.getHours() > 11)];
      },
      M: function M(date, locale) {
        return monthToStr(date.getMonth(), true, locale);
      },
      S: function S(date) {
        return pad(date.getSeconds());
      },
      U: function U(date) {
        return date.getTime() / 1000;
      },
      W: function W(date, _, options) {
        return options.getWeek(date);
      },
      Y: function Y(date) {
        return date.getFullYear();
      },
      d: function d(date) {
        return pad(date.getDate());
      },
      h: function h(date) {
        return date.getHours() % 12 ? date.getHours() % 12 : 12;
      },
      i: function i(date) {
        return pad(date.getMinutes());
      },
      j: function j(date) {
        return date.getDate();
      },
      l: function l(date, locale) {
        return locale.weekdays.longhand[date.getDay()];
      },
      m: function m(date) {
        return pad(date.getMonth() + 1);
      },
      n: function n(date) {
        return date.getMonth() + 1;
      },
      s: function s(date) {
        return date.getSeconds();
      },
      w: function w(date) {
        return date.getDay();
      },
      y: function y(date) {
        return String(date.getFullYear()).substring(2);
      }
    };

    var english = {
      weekdays: {
        shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      },
      months: {
        shorthand: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        longhand: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      },
      daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      firstDayOfWeek: 0,
      ordinal: function ordinal(nth) {
        var s = nth % 100;
        if (s > 3 && s < 21) return "th";

        switch (s % 10) {
          case 1:
            return "st";

          case 2:
            return "nd";

          case 3:
            return "rd";

          default:
            return "th";
        }
      },
      rangeSeparator: " to ",
      weekAbbreviation: "Wk",
      scrollTitle: "Scroll to increment",
      toggleTitle: "Click to toggle",
      amPM: ["AM", "PM"],
      yearAriaLabel: "Year"
    };

    var createDateFormatter = function createDateFormatter(_ref) {
      var _ref$config = _ref.config,
          config = _ref$config === void 0 ? defaults : _ref$config,
          _ref$l10n = _ref.l10n,
          l10n = _ref$l10n === void 0 ? english : _ref$l10n;
      return function (dateObj, frmt, overrideLocale) {
        var locale = overrideLocale || l10n;

        if (config.formatDate !== undefined) {
          return config.formatDate(dateObj, frmt, locale);
        }

        return frmt.split("").map(function (c, i, arr) {
          return formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "";
        }).join("");
      };
    };
    var createDateParser = function createDateParser(_ref2) {
      var _ref2$config = _ref2.config,
          config = _ref2$config === void 0 ? defaults : _ref2$config,
          _ref2$l10n = _ref2.l10n,
          l10n = _ref2$l10n === void 0 ? english : _ref2$l10n;
      return function (date, givenFormat, timeless, customLocale) {
        if (date !== 0 && !date) return undefined;
        var locale = customLocale || l10n;
        var parsedDate;
        var date_orig = date;
        if (date instanceof Date) parsedDate = new Date(date.getTime());else if (typeof date !== "string" && date.toFixed !== undefined) parsedDate = new Date(date);else if (typeof date === "string") {
          var format = givenFormat || (config || defaults).dateFormat;
          var datestr = String(date).trim();

          if (datestr === "today") {
            parsedDate = new Date();
            timeless = true;
          } else if (/Z$/.test(datestr) || /GMT$/.test(datestr)) parsedDate = new Date(date);else if (config && config.parseDate) parsedDate = config.parseDate(date, format);else {
            parsedDate = !config || !config.noCalendar ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0) : new Date(new Date().setHours(0, 0, 0, 0));
            var matched,
                ops = [];

            for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
              var token = format[i];
              var isBackSlash = token === "\\";
              var escaped = format[i - 1] === "\\" || isBackSlash;

              if (tokenRegex[token] && !escaped) {
                regexStr += tokenRegex[token];
                var match = new RegExp(regexStr).exec(date);

                if (match && (matched = true)) {
                  ops[token !== "Y" ? "push" : "unshift"]({
                    fn: revFormat[token],
                    val: match[++matchIndex]
                  });
                }
              } else if (!isBackSlash) regexStr += ".";

              ops.forEach(function (_ref3) {
                var fn = _ref3.fn,
                    val = _ref3.val;
                return parsedDate = fn(parsedDate, val, locale) || parsedDate;
              });
            }

            parsedDate = matched ? parsedDate : undefined;
          }
        }

        if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
          config.errorHandler(new Error("Invalid date provided: " + date_orig));
          return undefined;
        }

        if (timeless === true) parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
      };
    };
    function compareDates(date1, date2, timeless) {
      if (timeless === void 0) {
        timeless = true;
      }

      if (timeless !== false) {
        return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
      }

      return date1.getTime() - date2.getTime();
    }
    var getWeek = function getWeek(givenDate) {
      var date = new Date(givenDate.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      var week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };
    var isBetween = function isBetween(ts, ts1, ts2) {
      return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
    };
    var duration = {
      DAY: 86400000
    };

    var HOOKS = ["onChange", "onClose", "onDayCreate", "onDestroy", "onKeyDown", "onMonthChange", "onOpen", "onParseConfig", "onReady", "onValueUpdate", "onYearChange", "onPreCalendarPosition"];
    var defaults = {
      _disable: [],
      _enable: [],
      allowInput: false,
      altFormat: "F j, Y",
      altInput: false,
      altInputClass: "form-control input",
      animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
      ariaDateFormat: "F j, Y",
      clickOpens: true,
      closeOnSelect: true,
      conjunction: ", ",
      dateFormat: "Y-m-d",
      defaultHour: 12,
      defaultMinute: 0,
      defaultSeconds: 0,
      disable: [],
      disableMobile: false,
      enable: [],
      enableSeconds: false,
      enableTime: false,
      errorHandler: function errorHandler(err) {
        return typeof console !== "undefined" && console.warn(err);
      },
      getWeek: getWeek,
      hourIncrement: 1,
      ignoredFocusElements: [],
      inline: false,
      locale: "default",
      minuteIncrement: 5,
      mode: "single",
      nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
      noCalendar: false,
      now: new Date(),
      onChange: [],
      onClose: [],
      onDayCreate: [],
      onDestroy: [],
      onKeyDown: [],
      onMonthChange: [],
      onOpen: [],
      onParseConfig: [],
      onReady: [],
      onValueUpdate: [],
      onYearChange: [],
      onPreCalendarPosition: [],
      plugins: [],
      position: "auto",
      positionElement: undefined,
      prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
      shorthandCurrentMonth: false,
      showMonths: 1,
      static: false,
      time_24hr: false,
      weekNumbers: false,
      wrap: false
    };

    function toggleClass(elem, className, bool) {
      if (bool === true) return elem.classList.add(className);
      elem.classList.remove(className);
    }
    function createElement(tag, className, content) {
      var e = window.document.createElement(tag);
      className = className || "";
      content = content || "";
      e.className = className;
      if (content !== undefined) e.textContent = content;
      return e;
    }
    function clearNode(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    function findParent(node, condition) {
      if (condition(node)) return node;else if (node.parentNode) return findParent(node.parentNode, condition);
      return undefined;
    }
    function createNumberInput(inputClassName, opts) {
      var wrapper = createElement("div", "numInputWrapper"),
          numInput = createElement("input", "numInput " + inputClassName),
          arrowUp = createElement("span", "arrowUp"),
          arrowDown = createElement("span", "arrowDown");
      numInput.type = "text";
      numInput.pattern = "\\d*";
      if (opts !== undefined) for (var key in opts) {
        numInput.setAttribute(key, opts[key]);
      }
      wrapper.appendChild(numInput);
      wrapper.appendChild(arrowUp);
      wrapper.appendChild(arrowDown);
      return wrapper;
    }

    if (typeof Object.assign !== "function") {
      Object.assign = function (target) {
        if (!target) {
          throw TypeError("Cannot convert undefined or null to object");
        }

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var _loop = function _loop() {
          var source = args[_i];

          if (source) {
            Object.keys(source).forEach(function (key) {
              return target[key] = source[key];
            });
          }
        };

        for (var _i = 0; _i < args.length; _i++) {
          _loop();
        }

        return target;
      };
    }

    var DEBOUNCED_CHANGE_MS = 300;

    function FlatpickrInstance(element, instanceConfig) {
      var self = {
        config: Object.assign({}, flatpickr.defaultConfig),
        l10n: english
      };
      self.parseDate = createDateParser({
        config: self.config,
        l10n: self.l10n
      });
      self._handlers = [];
      self._bind = bind;
      self._setHoursFromDate = setHoursFromDate;
      self._positionCalendar = positionCalendar;
      self.changeMonth = changeMonth;
      self.changeYear = changeYear;
      self.clear = clear;
      self.close = close;
      self._createElement = createElement;
      self.destroy = destroy;
      self.isEnabled = isEnabled;
      self.jumpToDate = jumpToDate;
      self.open = open;
      self.redraw = redraw;
      self.set = set;
      self.setDate = setDate;
      self.toggle = toggle;

      function setupHelperFunctions() {
        self.utils = {
          getDaysInMonth: function getDaysInMonth(month, yr) {
            if (month === void 0) {
              month = self.currentMonth;
            }

            if (yr === void 0) {
              yr = self.currentYear;
            }

            if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0)) return 29;
            return self.l10n.daysInMonth[month];
          }
        };
      }

      function init() {
        self.element = self.input = element;
        self.isOpen = false;
        parseConfig();
        setupLocale();
        setupInputs();
        setupDates();
        setupHelperFunctions();
        if (!self.isMobile) build();
        bindEvents();

        if (self.selectedDates.length || self.config.noCalendar) {
          if (self.config.enableTime) {
            setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj || self.config.minDate : undefined);
          }

          updateValue(false);
        }

        setCalendarWidth();
        self.showTimeInput = self.selectedDates.length > 0 || self.config.noCalendar;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (!self.isMobile && isSafari) {
          positionCalendar();
        }

        triggerEvent("onReady");
      }

      function bindToInstance(fn) {
        return fn.bind(self);
      }

      function setCalendarWidth() {
        var config = self.config;
        if (config.weekNumbers === false && config.showMonths === 1) return;else if (config.noCalendar !== true) {
          window.requestAnimationFrame(function () {
            self.calendarContainer.style.visibility = "hidden";
            self.calendarContainer.style.display = "block";

            if (self.daysContainer !== undefined) {
              var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
              self.daysContainer.style.width = daysWidth + "px";
              self.calendarContainer.style.width = daysWidth + (self.weekWrapper !== undefined ? self.weekWrapper.offsetWidth : 0) + "px";
              self.calendarContainer.style.removeProperty("visibility");
              self.calendarContainer.style.removeProperty("display");
            }
          });
        }
      }

      function updateTime(e) {
        if (self.selectedDates.length === 0) return;

        if (e !== undefined && e.type !== "blur") {
          timeWrapper(e);
        }

        var prevValue = self._input.value;
        setHoursFromInputs();
        updateValue();

        if (self._input.value !== prevValue) {
          self._debouncedChange();
        }
      }

      function ampm2military(hour, amPM) {
        return hour % 12 + 12 * int(amPM === self.l10n.amPM[1]);
      }

      function military2ampm(hour) {
        switch (hour % 24) {
          case 0:
          case 12:
            return 12;

          default:
            return hour % 12;
        }
      }

      function setHoursFromInputs() {
        if (self.hourElement === undefined || self.minuteElement === undefined) return;
        var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24,
            minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60,
            seconds = self.secondElement !== undefined ? (parseInt(self.secondElement.value, 10) || 0) % 60 : 0;

        if (self.amPM !== undefined) {
          hours = ampm2military(hours, self.amPM.textContent);
        }

        var limitMinHours = self.config.minTime !== undefined || self.config.minDate && self.minDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.minDate, true) === 0;
        var limitMaxHours = self.config.maxTime !== undefined || self.config.maxDate && self.maxDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.maxDate, true) === 0;

        if (limitMaxHours) {
          var maxTime = self.config.maxTime !== undefined ? self.config.maxTime : self.config.maxDate;
          hours = Math.min(hours, maxTime.getHours());
          if (hours === maxTime.getHours()) minutes = Math.min(minutes, maxTime.getMinutes());
          if (minutes === maxTime.getMinutes()) seconds = Math.min(seconds, maxTime.getSeconds());
        }

        if (limitMinHours) {
          var minTime = self.config.minTime !== undefined ? self.config.minTime : self.config.minDate;
          hours = Math.max(hours, minTime.getHours());
          if (hours === minTime.getHours()) minutes = Math.max(minutes, minTime.getMinutes());
          if (minutes === minTime.getMinutes()) seconds = Math.max(seconds, minTime.getSeconds());
        }

        setHours(hours, minutes, seconds);
      }

      function setHoursFromDate(dateObj) {
        var date = dateObj || self.latestSelectedDateObj;
        if (date) setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      }

      function setDefaultHours() {
        var hours = self.config.defaultHour;
        var minutes = self.config.defaultMinute;
        var seconds = self.config.defaultSeconds;

        if (self.config.minDate !== undefined) {
          var min_hr = self.config.minDate.getHours();
          var min_minutes = self.config.minDate.getMinutes();
          hours = Math.max(hours, min_hr);
          if (hours === min_hr) minutes = Math.max(min_minutes, minutes);
          if (hours === min_hr && minutes === min_minutes) seconds = self.config.minDate.getSeconds();
        }

        if (self.config.maxDate !== undefined) {
          var max_hr = self.config.maxDate.getHours();
          var max_minutes = self.config.maxDate.getMinutes();
          hours = Math.min(hours, max_hr);
          if (hours === max_hr) minutes = Math.min(max_minutes, minutes);
          if (hours === max_hr && minutes === max_minutes) seconds = self.config.maxDate.getSeconds();
        }

        setHours(hours, minutes, seconds);
      }

      function setHours(hours, minutes, seconds) {
        if (self.latestSelectedDateObj !== undefined) {
          self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
        }

        if (!self.hourElement || !self.minuteElement || self.isMobile) return;
        self.hourElement.value = pad(!self.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
        self.minuteElement.value = pad(minutes);
        if (self.amPM !== undefined) self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
        if (self.secondElement !== undefined) self.secondElement.value = pad(seconds);
      }

      function onYearInput(event) {
        var year = parseInt(event.target.value) + (event.delta || 0);

        if (year / 1000 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
          changeYear(year);
        }
      }

      function bind(element, event, handler, options) {
        if (event instanceof Array) return event.forEach(function (ev) {
          return bind(element, ev, handler, options);
        });
        if (element instanceof Array) return element.forEach(function (el) {
          return bind(el, event, handler, options);
        });
        element.addEventListener(event, handler, options);

        self._handlers.push({
          element: element,
          event: event,
          handler: handler,
          options: options
        });
      }

      function onClick(handler) {
        return function (evt) {
          evt.which === 1 && handler(evt);
        };
      }

      function triggerChange() {
        triggerEvent("onChange");
      }

      function bindEvents() {
        if (self.config.wrap) {
          ["open", "close", "toggle", "clear"].forEach(function (evt) {
            Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function (el) {
              return bind(el, "click", self[evt]);
            });
          });
        }

        if (self.isMobile) {
          setupMobile();
          return;
        }

        var debouncedResize = debounce(onResize, 50);
        self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
        if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) bind(self.daysContainer, "mouseover", function (e) {
          if (self.config.mode === "range") onMouseOver(e.target);
        });
        bind(window.document.body, "keydown", onKeyDown);
        if (!self.config.static) bind(self._input, "keydown", onKeyDown);
        if (!self.config.inline && !self.config.static) bind(window, "resize", debouncedResize);
        if (window.ontouchstart !== undefined) bind(window.document, "click", documentClick);else bind(window.document, "mousedown", onClick(documentClick));
        bind(window.document, "focus", documentClick, {
          capture: true
        });

        if (self.config.clickOpens === true) {
          bind(self._input, "focus", self.open);
          bind(self._input, "mousedown", onClick(self.open));
        }

        if (self.daysContainer !== undefined) {
          bind(self.monthNav, "mousedown", onClick(onMonthNavClick));
          bind(self.monthNav, ["keyup", "increment"], onYearInput);
          bind(self.daysContainer, "mousedown", onClick(selectDate));
        }

        if (self.timeContainer !== undefined && self.minuteElement !== undefined && self.hourElement !== undefined) {
          var selText = function selText(e) {
            return e.target.select();
          };

          bind(self.timeContainer, ["increment"], updateTime);
          bind(self.timeContainer, "blur", updateTime, {
            capture: true
          });
          bind(self.timeContainer, "mousedown", onClick(timeIncrement));
          bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
          if (self.secondElement !== undefined) bind(self.secondElement, "focus", function () {
            return self.secondElement && self.secondElement.select();
          });

          if (self.amPM !== undefined) {
            bind(self.amPM, "mousedown", onClick(function (e) {
              updateTime(e);
              triggerChange();
            }));
          }
        }
      }

      function jumpToDate(jumpDate) {
        var jumpTo = jumpDate !== undefined ? self.parseDate(jumpDate) : self.latestSelectedDateObj || (self.config.minDate && self.config.minDate > self.now ? self.config.minDate : self.config.maxDate && self.config.maxDate < self.now ? self.config.maxDate : self.now);

        try {
          if (jumpTo !== undefined) {
            self.currentYear = jumpTo.getFullYear();
            self.currentMonth = jumpTo.getMonth();
          }
        } catch (e) {
          e.message = "Invalid date supplied: " + jumpTo;
          self.config.errorHandler(e);
        }

        self.redraw();
      }

      function timeIncrement(e) {
        if (~e.target.className.indexOf("arrow")) incrementNumInput(e, e.target.classList.contains("arrowUp") ? 1 : -1);
      }

      function incrementNumInput(e, delta, inputElem) {
        var target = e && e.target;
        var input = inputElem || target && target.parentNode && target.parentNode.firstChild;
        var event = createEvent("increment");
        event.delta = delta;
        input && input.dispatchEvent(event);
      }

      function build() {
        var fragment = window.document.createDocumentFragment();
        self.calendarContainer = createElement("div", "flatpickr-calendar");
        self.calendarContainer.tabIndex = -1;

        if (!self.config.noCalendar) {
          fragment.appendChild(buildMonthNav());
          self.innerContainer = createElement("div", "flatpickr-innerContainer");

          if (self.config.weekNumbers) {
            var _buildWeeks = buildWeeks(),
                weekWrapper = _buildWeeks.weekWrapper,
                weekNumbers = _buildWeeks.weekNumbers;

            self.innerContainer.appendChild(weekWrapper);
            self.weekNumbers = weekNumbers;
            self.weekWrapper = weekWrapper;
          }

          self.rContainer = createElement("div", "flatpickr-rContainer");
          self.rContainer.appendChild(buildWeekdays());

          if (!self.daysContainer) {
            self.daysContainer = createElement("div", "flatpickr-days");
            self.daysContainer.tabIndex = -1;
          }

          buildDays();
          self.rContainer.appendChild(self.daysContainer);
          self.innerContainer.appendChild(self.rContainer);
          fragment.appendChild(self.innerContainer);
        }

        if (self.config.enableTime) {
          fragment.appendChild(buildTime());
        }

        toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
        toggleClass(self.calendarContainer, "animate", self.config.animate === true);
        toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
        self.calendarContainer.appendChild(fragment);
        var customAppend = self.config.appendTo !== undefined && self.config.appendTo.nodeType !== undefined;

        if (self.config.inline || self.config.static) {
          self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");

          if (self.config.inline) {
            if (!customAppend && self.element.parentNode) self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);else if (self.config.appendTo !== undefined) self.config.appendTo.appendChild(self.calendarContainer);
          }

          if (self.config.static) {
            var wrapper = createElement("div", "flatpickr-wrapper");
            if (self.element.parentNode) self.element.parentNode.insertBefore(wrapper, self.element);
            wrapper.appendChild(self.element);
            if (self.altInput) wrapper.appendChild(self.altInput);
            wrapper.appendChild(self.calendarContainer);
          }
        }

        if (!self.config.static && !self.config.inline) (self.config.appendTo !== undefined ? self.config.appendTo : window.document.body).appendChild(self.calendarContainer);
      }

      function createDay(className, date, dayNumber, i) {
        var dateIsEnabled = isEnabled(date, true),
            dayElement = createElement("span", "flatpickr-day " + className, date.getDate().toString());
        dayElement.dateObj = date;
        dayElement.$i = i;
        dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));

        if (className.indexOf("hidden") === -1 && compareDates(date, self.now) === 0) {
          self.todayDateElem = dayElement;
          dayElement.classList.add("today");
          dayElement.setAttribute("aria-current", "date");
        }

        if (dateIsEnabled) {
          dayElement.tabIndex = -1;

          if (isDateSelected(date)) {
            dayElement.classList.add("selected");
            self.selectedDateElem = dayElement;

            if (self.config.mode === "range") {
              toggleClass(dayElement, "startRange", self.selectedDates[0] && compareDates(date, self.selectedDates[0], true) === 0);
              toggleClass(dayElement, "endRange", self.selectedDates[1] && compareDates(date, self.selectedDates[1], true) === 0);
              if (className === "nextMonthDay") dayElement.classList.add("inRange");
            }
          }
        } else {
          dayElement.classList.add("disabled");
        }

        if (self.config.mode === "range") {
          if (isDateInRange(date) && !isDateSelected(date)) dayElement.classList.add("inRange");
        }

        if (self.weekNumbers && self.config.showMonths === 1 && className !== "prevMonthDay" && dayNumber % 7 === 1) {
          self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
        }

        triggerEvent("onDayCreate", dayElement);
        return dayElement;
      }

      function focusOnDayElem(targetNode) {
        targetNode.focus();
        if (self.config.mode === "range") onMouseOver(targetNode);
      }

      function getFirstAvailableDay(delta) {
        var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
        var endMonth = delta > 0 ? self.config.showMonths : -1;

        for (var m = startMonth; m != endMonth; m += delta) {
          var month = self.daysContainer.children[m];
          var startIndex = delta > 0 ? 0 : month.children.length - 1;
          var endIndex = delta > 0 ? month.children.length : -1;

          for (var i = startIndex; i != endIndex; i += delta) {
            var c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj)) return c;
          }
        }

        return undefined;
      }

      function getNextAvailableDay(current, delta) {
        var givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self.currentMonth;
        var endMonth = delta > 0 ? self.config.showMonths : -1;
        var loopDelta = delta > 0 ? 1 : -1;

        for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
          var month = self.daysContainer.children[m];
          var startIndex = givenMonth - self.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
          var numMonthDays = month.children.length;

          for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
            var c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta)) return focusOnDayElem(c);
          }
        }

        self.changeMonth(loopDelta);
        focusOnDay(getFirstAvailableDay(loopDelta), 0);
        return undefined;
      }

      function focusOnDay(current, offset) {
        var dayFocused = isInView(document.activeElement || document.body);
        var startElem = current !== undefined ? current : dayFocused ? document.activeElement : self.selectedDateElem !== undefined && isInView(self.selectedDateElem) ? self.selectedDateElem : self.todayDateElem !== undefined && isInView(self.todayDateElem) ? self.todayDateElem : getFirstAvailableDay(offset > 0 ? 1 : -1);
        if (startElem === undefined) return self._input.focus();
        if (!dayFocused) return focusOnDayElem(startElem);
        getNextAvailableDay(startElem, offset);
      }

      function buildMonthDays(year, month) {
        var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
        var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12);
        var daysInMonth = self.utils.getDaysInMonth(month),
            days = window.document.createDocumentFragment(),
            isMultiMonth = self.config.showMonths > 1,
            prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay",
            nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
        var dayNumber = prevMonthDays + 1 - firstOfMonth,
            dayIndex = 0;

        for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
          days.appendChild(createDay(prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
        }

        for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
          days.appendChild(createDay("", new Date(year, month, dayNumber), dayNumber, dayIndex));
        }

        for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
          days.appendChild(createDay(nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
        }

        var dayContainer = createElement("div", "dayContainer");
        dayContainer.appendChild(days);
        return dayContainer;
      }

      function buildDays() {
        if (self.daysContainer === undefined) {
          return;
        }

        clearNode(self.daysContainer);
        if (self.weekNumbers) clearNode(self.weekNumbers);
        var frag = document.createDocumentFragment();

        for (var i = 0; i < self.config.showMonths; i++) {
          var d = new Date(self.currentYear, self.currentMonth, 1);
          d.setMonth(self.currentMonth + i);
          frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
        }

        self.daysContainer.appendChild(frag);
        self.days = self.daysContainer.firstChild;

        if (self.config.mode === "range" && self.selectedDates.length === 1) {
          onMouseOver();
        }
      }

      function buildMonth() {
        var container = createElement("div", "flatpickr-month");
        var monthNavFragment = window.document.createDocumentFragment();
        var monthElement = createElement("span", "cur-month");
        var yearInput = createNumberInput("cur-year", {
          tabindex: "-1"
        });
        var yearElement = yearInput.getElementsByTagName("input")[0];
        yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
        if (self.config.minDate) yearElement.setAttribute("data-min", self.config.minDate.getFullYear().toString());

        if (self.config.maxDate) {
          yearElement.setAttribute("data-max", self.config.maxDate.getFullYear().toString());
          yearElement.disabled = !!self.config.minDate && self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
        }

        var currentMonth = createElement("div", "flatpickr-current-month");
        currentMonth.appendChild(monthElement);
        currentMonth.appendChild(yearInput);
        monthNavFragment.appendChild(currentMonth);
        container.appendChild(monthNavFragment);
        return {
          container: container,
          yearElement: yearElement,
          monthElement: monthElement
        };
      }

      function buildMonths() {
        clearNode(self.monthNav);
        self.monthNav.appendChild(self.prevMonthNav);

        for (var m = self.config.showMonths; m--;) {
          var month = buildMonth();
          self.yearElements.push(month.yearElement);
          self.monthElements.push(month.monthElement);
          self.monthNav.appendChild(month.container);
        }

        self.monthNav.appendChild(self.nextMonthNav);
      }

      function buildMonthNav() {
        self.monthNav = createElement("div", "flatpickr-months");
        self.yearElements = [];
        self.monthElements = [];
        self.prevMonthNav = createElement("span", "flatpickr-prev-month");
        self.prevMonthNav.innerHTML = self.config.prevArrow;
        self.nextMonthNav = createElement("span", "flatpickr-next-month");
        self.nextMonthNav.innerHTML = self.config.nextArrow;
        buildMonths();
        Object.defineProperty(self, "_hidePrevMonthArrow", {
          get: function get() {
            return self.__hidePrevMonthArrow;
          },
          set: function set(bool) {
            if (self.__hidePrevMonthArrow !== bool) {
              toggleClass(self.prevMonthNav, "disabled", bool);
              self.__hidePrevMonthArrow = bool;
            }
          }
        });
        Object.defineProperty(self, "_hideNextMonthArrow", {
          get: function get() {
            return self.__hideNextMonthArrow;
          },
          set: function set(bool) {
            if (self.__hideNextMonthArrow !== bool) {
              toggleClass(self.nextMonthNav, "disabled", bool);
              self.__hideNextMonthArrow = bool;
            }
          }
        });
        self.currentYearElement = self.yearElements[0];
        updateNavigationCurrentMonth();
        return self.monthNav;
      }

      function buildTime() {
        self.calendarContainer.classList.add("hasTime");
        if (self.config.noCalendar) self.calendarContainer.classList.add("noCalendar");
        self.timeContainer = createElement("div", "flatpickr-time");
        self.timeContainer.tabIndex = -1;
        var separator = createElement("span", "flatpickr-time-separator", ":");
        var hourInput = createNumberInput("flatpickr-hour");
        self.hourElement = hourInput.getElementsByTagName("input")[0];
        var minuteInput = createNumberInput("flatpickr-minute");
        self.minuteElement = minuteInput.getElementsByTagName("input")[0];
        self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
        self.hourElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getHours() : self.config.time_24hr ? self.config.defaultHour : military2ampm(self.config.defaultHour));
        self.minuteElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getMinutes() : self.config.defaultMinute);
        self.hourElement.setAttribute("data-step", self.config.hourIncrement.toString());
        self.minuteElement.setAttribute("data-step", self.config.minuteIncrement.toString());
        self.hourElement.setAttribute("data-min", self.config.time_24hr ? "0" : "1");
        self.hourElement.setAttribute("data-max", self.config.time_24hr ? "23" : "12");
        self.minuteElement.setAttribute("data-min", "0");
        self.minuteElement.setAttribute("data-max", "59");
        self.timeContainer.appendChild(hourInput);
        self.timeContainer.appendChild(separator);
        self.timeContainer.appendChild(minuteInput);
        if (self.config.time_24hr) self.timeContainer.classList.add("time24hr");

        if (self.config.enableSeconds) {
          self.timeContainer.classList.add("hasSeconds");
          var secondInput = createNumberInput("flatpickr-second");
          self.secondElement = secondInput.getElementsByTagName("input")[0];
          self.secondElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getSeconds() : self.config.defaultSeconds);
          self.secondElement.setAttribute("data-step", self.minuteElement.getAttribute("data-step"));
          self.secondElement.setAttribute("data-min", self.minuteElement.getAttribute("data-min"));
          self.secondElement.setAttribute("data-max", self.minuteElement.getAttribute("data-max"));
          self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
          self.timeContainer.appendChild(secondInput);
        }

        if (!self.config.time_24hr) {
          self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj ? self.hourElement.value : self.config.defaultHour) > 11)]);
          self.amPM.title = self.l10n.toggleTitle;
          self.amPM.tabIndex = -1;
          self.timeContainer.appendChild(self.amPM);
        }

        return self.timeContainer;
      }

      function buildWeekdays() {
        if (!self.weekdayContainer) self.weekdayContainer = createElement("div", "flatpickr-weekdays");else clearNode(self.weekdayContainer);

        for (var i = self.config.showMonths; i--;) {
          var container = createElement("div", "flatpickr-weekdaycontainer");
          self.weekdayContainer.appendChild(container);
        }

        updateWeekdays();
        return self.weekdayContainer;
      }

      function updateWeekdays() {
        var firstDayOfWeek = self.l10n.firstDayOfWeek;
        var weekdays = self.l10n.weekdays.shorthand.concat();

        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
          weekdays = weekdays.splice(firstDayOfWeek, weekdays.length).concat(weekdays.splice(0, firstDayOfWeek));
        }

        for (var i = self.config.showMonths; i--;) {
          self.weekdayContainer.children[i].innerHTML = "\n      <span class=flatpickr-weekday>\n        " + weekdays.join("</span><span class=flatpickr-weekday>") + "\n      </span>\n      ";
        }
      }

      function buildWeeks() {
        self.calendarContainer.classList.add("hasWeeks");
        var weekWrapper = createElement("div", "flatpickr-weekwrapper");
        weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
        var weekNumbers = createElement("div", "flatpickr-weeks");
        weekWrapper.appendChild(weekNumbers);
        return {
          weekWrapper: weekWrapper,
          weekNumbers: weekNumbers
        };
      }

      function changeMonth(value, is_offset) {
        if (is_offset === void 0) {
          is_offset = true;
        }

        var delta = is_offset ? value : value - self.currentMonth;
        if (delta < 0 && self._hidePrevMonthArrow === true || delta > 0 && self._hideNextMonthArrow === true) return;
        self.currentMonth += delta;

        if (self.currentMonth < 0 || self.currentMonth > 11) {
          self.currentYear += self.currentMonth > 11 ? 1 : -1;
          self.currentMonth = (self.currentMonth + 12) % 12;
          triggerEvent("onYearChange");
        }

        buildDays();
        triggerEvent("onMonthChange");
        updateNavigationCurrentMonth();
      }

      function clear(triggerChangeEvent) {
        if (triggerChangeEvent === void 0) {
          triggerChangeEvent = true;
        }

        self.input.value = "";
        if (self.altInput !== undefined) self.altInput.value = "";
        if (self.mobileInput !== undefined) self.mobileInput.value = "";
        self.selectedDates = [];
        self.latestSelectedDateObj = undefined;
        self.showTimeInput = false;

        if (self.config.enableTime === true) {
          setDefaultHours();
        }

        self.redraw();
        if (triggerChangeEvent) triggerEvent("onChange");
      }

      function close() {
        self.isOpen = false;

        if (!self.isMobile) {
          self.calendarContainer.classList.remove("open");

          self._input.classList.remove("active");
        }

        triggerEvent("onClose");
      }

      function destroy() {
        if (self.config !== undefined) triggerEvent("onDestroy");

        for (var i = self._handlers.length; i--;) {
          var h = self._handlers[i];
          h.element.removeEventListener(h.event, h.handler, h.options);
        }

        self._handlers = [];

        if (self.mobileInput) {
          if (self.mobileInput.parentNode) self.mobileInput.parentNode.removeChild(self.mobileInput);
          self.mobileInput = undefined;
        } else if (self.calendarContainer && self.calendarContainer.parentNode) {
          if (self.config.static && self.calendarContainer.parentNode) {
            var wrapper = self.calendarContainer.parentNode;
            wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);

            if (wrapper.parentNode) {
              while (wrapper.firstChild) {
                wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
              }

              wrapper.parentNode.removeChild(wrapper);
            }
          } else self.calendarContainer.parentNode.removeChild(self.calendarContainer);
        }

        if (self.altInput) {
          self.input.type = "text";
          if (self.altInput.parentNode) self.altInput.parentNode.removeChild(self.altInput);
          delete self.altInput;
        }

        if (self.input) {
          self.input.type = self.input._type;
          self.input.classList.remove("flatpickr-input");
          self.input.removeAttribute("readonly");
          self.input.value = "";
        }

        ["_showTimeInput", "latestSelectedDateObj", "_hideNextMonthArrow", "_hidePrevMonthArrow", "__hideNextMonthArrow", "__hidePrevMonthArrow", "isMobile", "isOpen", "selectedDateElem", "minDateHasTime", "maxDateHasTime", "days", "daysContainer", "_input", "_positionElement", "innerContainer", "rContainer", "monthNav", "todayDateElem", "calendarContainer", "weekdayContainer", "prevMonthNav", "nextMonthNav", "currentMonthElement", "currentYearElement", "navigationCurrentMonth", "selectedDateElem", "config"].forEach(function (k) {
          try {
            delete self[k];
          } catch (_) {}
        });
      }

      function isCalendarElem(elem) {
        if (self.config.appendTo && self.config.appendTo.contains(elem)) return true;
        return self.calendarContainer.contains(elem);
      }

      function documentClick(e) {
        if (self.isOpen && !self.config.inline) {
          var isCalendarElement = isCalendarElem(e.target);
          var isInput = e.target === self.input || e.target === self.altInput || self.element.contains(e.target) || e.path && e.path.indexOf && (~e.path.indexOf(self.input) || ~e.path.indexOf(self.altInput));
          var lostFocus = e.type === "blur" ? isInput && e.relatedTarget && !isCalendarElem(e.relatedTarget) : !isInput && !isCalendarElement;
          var isIgnored = !self.config.ignoredFocusElements.some(function (elem) {
            return elem.contains(e.target);
          });

          if (lostFocus && isIgnored) {
            self.close();

            if (self.config.mode === "range" && self.selectedDates.length === 1) {
              self.clear(false);
              self.redraw();
            }
          }
        }
      }

      function changeYear(newYear) {
        if (!newYear || self.config.minDate && newYear < self.config.minDate.getFullYear() || self.config.maxDate && newYear > self.config.maxDate.getFullYear()) return;
        var newYearNum = newYear,
            isNewYear = self.currentYear !== newYearNum;
        self.currentYear = newYearNum || self.currentYear;

        if (self.config.maxDate && self.currentYear === self.config.maxDate.getFullYear()) {
          self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
        } else if (self.config.minDate && self.currentYear === self.config.minDate.getFullYear()) {
          self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
        }

        if (isNewYear) {
          self.redraw();
          triggerEvent("onYearChange");
        }
      }

      function isEnabled(date, timeless) {
        if (timeless === void 0) {
          timeless = true;
        }

        var dateToCheck = self.parseDate(date, undefined, timeless);
        if (self.config.minDate && dateToCheck && compareDates(dateToCheck, self.config.minDate, timeless !== undefined ? timeless : !self.minDateHasTime) < 0 || self.config.maxDate && dateToCheck && compareDates(dateToCheck, self.config.maxDate, timeless !== undefined ? timeless : !self.maxDateHasTime) > 0) return false;
        if (self.config.enable.length === 0 && self.config.disable.length === 0) return true;
        if (dateToCheck === undefined) return false;
        var bool = self.config.enable.length > 0,
            array = bool ? self.config.enable : self.config.disable;

        for (var i = 0, d; i < array.length; i++) {
          d = array[i];
          if (typeof d === "function" && d(dateToCheck)) return bool;else if (d instanceof Date && dateToCheck !== undefined && d.getTime() === dateToCheck.getTime()) return bool;else if (typeof d === "string" && dateToCheck !== undefined) {
            var parsed = self.parseDate(d, undefined, true);
            return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
          } else if (typeof d === "object" && dateToCheck !== undefined && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime()) return bool;
        }

        return !bool;
      }

      function isInView(elem) {
        if (self.daysContainer !== undefined) return elem.className.indexOf("hidden") === -1 && self.daysContainer.contains(elem);
        return false;
      }

      function onKeyDown(e) {
        var isInput = e.target === self._input;
        var allowInput = self.config.allowInput;
        var allowKeydown = self.isOpen && (!allowInput || !isInput);
        var allowInlineKeydown = self.config.inline && isInput && !allowInput;

        if (e.keyCode === 13 && isInput) {
          if (allowInput) {
            self.setDate(self._input.value, true, e.target === self.altInput ? self.config.altFormat : self.config.dateFormat);
            return e.target.blur();
          } else self.open();
        } else if (isCalendarElem(e.target) || allowKeydown || allowInlineKeydown) {
          var isTimeObj = !!self.timeContainer && self.timeContainer.contains(e.target);

          switch (e.keyCode) {
            case 13:
              if (isTimeObj) updateTime();else selectDate(e);
              break;

            case 27:
              e.preventDefault();
              focusAndClose();
              break;

            case 8:
            case 46:
              if (isInput && !self.config.allowInput) {
                e.preventDefault();
                self.clear();
              }

              break;

            case 37:
            case 39:
              if (!isTimeObj) {
                e.preventDefault();

                if (self.daysContainer !== undefined && (allowInput === false || isInView(document.activeElement))) {
                  var _delta = e.keyCode === 39 ? 1 : -1;

                  if (!e.ctrlKey) focusOnDay(undefined, _delta);else {
                    changeMonth(_delta);
                    focusOnDay(getFirstAvailableDay(1), 0);
                  }
                }
              } else if (self.hourElement) self.hourElement.focus();

              break;

            case 38:
            case 40:
              e.preventDefault();
              var delta = e.keyCode === 40 ? 1 : -1;

              if (self.daysContainer && e.target.$i !== undefined) {
                if (e.ctrlKey) {
                  changeYear(self.currentYear - delta);
                  focusOnDay(getFirstAvailableDay(1), 0);
                } else if (!isTimeObj) focusOnDay(undefined, delta * 7);
              } else if (self.config.enableTime) {
                if (!isTimeObj && self.hourElement) self.hourElement.focus();
                updateTime(e);

                self._debouncedChange();
              }

              break;

            case 9:
              if (!isTimeObj) {
                self.element.focus();
                break;
              }

              var elems = [self.hourElement, self.minuteElement, self.secondElement, self.amPM].filter(function (x) {
                return x;
              });
              var i = elems.indexOf(e.target);

              if (i !== -1) {
                var target = elems[i + (e.shiftKey ? -1 : 1)];

                if (target !== undefined) {
                  e.preventDefault();
                  target.focus();
                } else {
                  self.element.focus();
                }
              }

              break;

            default:
              break;
          }
        }

        if (self.amPM !== undefined && e.target === self.amPM) {
          switch (e.key) {
            case self.l10n.amPM[0].charAt(0):
            case self.l10n.amPM[0].charAt(0).toLowerCase():
              self.amPM.textContent = self.l10n.amPM[0];
              setHoursFromInputs();
              updateValue();
              break;

            case self.l10n.amPM[1].charAt(0):
            case self.l10n.amPM[1].charAt(0).toLowerCase():
              self.amPM.textContent = self.l10n.amPM[1];
              setHoursFromInputs();
              updateValue();
              break;
          }
        }

        triggerEvent("onKeyDown", e);
      }

      function onMouseOver(elem) {
        if (self.selectedDates.length !== 1 || elem && (!elem.classList.contains("flatpickr-day") || elem.classList.contains("disabled"))) return;
        var hoverDate = elem ? elem.dateObj.getTime() : self.days.firstElementChild.dateObj.getTime(),
            initialDate = self.parseDate(self.selectedDates[0], undefined, true).getTime(),
            rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()),
            rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime()),
            lastDate = self.daysContainer.lastChild.lastChild.dateObj.getTime();
        var containsDisabled = false;
        var minRange = 0,
            maxRange = 0;

        for (var t = rangeStartDate; t < lastDate; t += duration.DAY) {
          if (!isEnabled(new Date(t), true)) {
            containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
            if (t < initialDate && (!minRange || t > minRange)) minRange = t;else if (t > initialDate && (!maxRange || t < maxRange)) maxRange = t;
          }
        }

        for (var m = 0; m < self.config.showMonths; m++) {
          var month = self.daysContainer.children[m];
          var prevMonth = self.daysContainer.children[m - 1];

          var _loop = function _loop(i, l) {
            var dayElem = month.children[i],
                date = dayElem.dateObj;
            var timestamp = date.getTime();
            var outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;

            if (outOfRange) {
              dayElem.classList.add("notAllowed");
              ["inRange", "startRange", "endRange"].forEach(function (c) {
                dayElem.classList.remove(c);
              });
              return "continue";
            } else if (containsDisabled && !outOfRange) return "continue";

            ["startRange", "inRange", "endRange", "notAllowed"].forEach(function (c) {
              dayElem.classList.remove(c);
            });

            if (elem !== undefined) {
              elem.classList.add(hoverDate < self.selectedDates[0].getTime() ? "startRange" : "endRange");

              if (month.contains(elem) || !(m > 0 && prevMonth && prevMonth.lastChild.dateObj.getTime() >= timestamp)) {
                if (initialDate < hoverDate && timestamp === initialDate) dayElem.classList.add("startRange");else if (initialDate > hoverDate && timestamp === initialDate) dayElem.classList.add("endRange");
                if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate)) dayElem.classList.add("inRange");
              }
            }
          };

          for (var i = 0, l = month.children.length; i < l; i++) {
            var _ret = _loop(i, l);

            if (_ret === "continue") continue;
          }
        }
      }

      function onResize() {
        if (self.isOpen && !self.config.static && !self.config.inline) positionCalendar();
      }

      function open(e, positionElement) {
        if (positionElement === void 0) {
          positionElement = self._positionElement;
        }

        if (self.isMobile === true) {
          if (e) {
            e.preventDefault();
            e.target && e.target.blur();
          }

          if (self.mobileInput !== undefined) {
            self.mobileInput.focus();
            self.mobileInput.click();
          }

          triggerEvent("onOpen");
          return;
        }

        if (self._input.disabled || self.config.inline) return;
        var wasOpen = self.isOpen;
        self.isOpen = true;

        if (!wasOpen) {
          self.calendarContainer.classList.add("open");

          self._input.classList.add("active");

          triggerEvent("onOpen");
          positionCalendar(positionElement);
        }

        if (self.config.enableTime === true && self.config.noCalendar === true) {
          if (self.selectedDates.length === 0) {
            self.setDate(self.config.minDate !== undefined ? new Date(self.config.minDate.getTime()) : new Date(), false);
            setDefaultHours();
            updateValue();
          }

          if (self.config.allowInput === false && (e === undefined || !self.timeContainer.contains(e.relatedTarget))) {
            setTimeout(function () {
              return self.hourElement.select();
            }, 50);
          }
        }
      }

      function minMaxDateSetter(type) {
        return function (date) {
          var dateObj = self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat);
          var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];

          if (dateObj !== undefined) {
            self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
          }

          if (self.selectedDates) {
            self.selectedDates = self.selectedDates.filter(function (d) {
              return isEnabled(d);
            });
            if (!self.selectedDates.length && type === "min") setHoursFromDate(dateObj);
            updateValue();
          }

          if (self.daysContainer) {
            redraw();
            if (dateObj !== undefined) self.currentYearElement[type] = dateObj.getFullYear().toString();else self.currentYearElement.removeAttribute(type);
            self.currentYearElement.disabled = !!inverseDateObj && dateObj !== undefined && inverseDateObj.getFullYear() === dateObj.getFullYear();
          }
        };
      }

      function parseConfig() {
        var boolOpts = ["wrap", "weekNumbers", "allowInput", "clickOpens", "time_24hr", "enableTime", "noCalendar", "altInput", "shorthandCurrentMonth", "inline", "static", "enableSeconds", "disableMobile"];
        var userConfig = Object.assign({}, instanceConfig, JSON.parse(JSON.stringify(element.dataset || {})));
        var formats$$1 = {};
        self.config.parseDate = userConfig.parseDate;
        self.config.formatDate = userConfig.formatDate;
        Object.defineProperty(self.config, "enable", {
          get: function get() {
            return self.config._enable;
          },
          set: function set(dates) {
            self.config._enable = parseDateRules(dates);
          }
        });
        Object.defineProperty(self.config, "disable", {
          get: function get() {
            return self.config._disable;
          },
          set: function set(dates) {
            self.config._disable = parseDateRules(dates);
          }
        });
        var timeMode = userConfig.mode === "time";

        if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
          formats$$1.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : flatpickr.defaultConfig.dateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
        }

        if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
          formats$$1.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : flatpickr.defaultConfig.altFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
        }

        Object.defineProperty(self.config, "minDate", {
          get: function get() {
            return self.config._minDate;
          },
          set: minMaxDateSetter("min")
        });
        Object.defineProperty(self.config, "maxDate", {
          get: function get() {
            return self.config._maxDate;
          },
          set: minMaxDateSetter("max")
        });

        var minMaxTimeSetter = function minMaxTimeSetter(type) {
          return function (val) {
            self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i");
          };
        };

        Object.defineProperty(self.config, "minTime", {
          get: function get() {
            return self.config._minTime;
          },
          set: minMaxTimeSetter("min")
        });
        Object.defineProperty(self.config, "maxTime", {
          get: function get() {
            return self.config._maxTime;
          },
          set: minMaxTimeSetter("max")
        });

        if (userConfig.mode === "time") {
          self.config.noCalendar = true;
          self.config.enableTime = true;
        }

        Object.assign(self.config, formats$$1, userConfig);

        for (var i = 0; i < boolOpts.length; i++) {
          self.config[boolOpts[i]] = self.config[boolOpts[i]] === true || self.config[boolOpts[i]] === "true";
        }

        HOOKS.filter(function (hook) {
          return self.config[hook] !== undefined;
        }).forEach(function (hook) {
          self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
        });
        self.isMobile = !self.config.disableMobile && !self.config.inline && self.config.mode === "single" && !self.config.disable.length && !self.config.enable.length && !self.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        for (var _i = 0; _i < self.config.plugins.length; _i++) {
          var pluginConf = self.config.plugins[_i](self) || {};

          for (var key in pluginConf) {
            if (HOOKS.indexOf(key) > -1) {
              self.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self.config[key]);
            } else if (typeof userConfig[key] === "undefined") self.config[key] = pluginConf[key];
          }
        }

        triggerEvent("onParseConfig");
      }

      function setupLocale() {
        if (typeof self.config.locale !== "object" && typeof flatpickr.l10ns[self.config.locale] === "undefined") self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
        self.l10n = Object.assign({}, flatpickr.l10ns.default, typeof self.config.locale === "object" ? self.config.locale : self.config.locale !== "default" ? flatpickr.l10ns[self.config.locale] : undefined);
        tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
        self.formatDate = createDateFormatter(self);
        self.parseDate = createDateParser({
          config: self.config,
          l10n: self.l10n
        });
      }

      function positionCalendar(customPositionElement) {
        if (self.calendarContainer === undefined) return;
        triggerEvent("onPreCalendarPosition");
        var positionElement = customPositionElement || self._positionElement;
        var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, function (acc, child) {
          return acc + child.offsetHeight;
        }, 0),
            calendarWidth = self.calendarContainer.offsetWidth,
            configPos = self.config.position.split(" "),
            configPosVertical = configPos[0],
            configPosHorizontal = configPos.length > 1 ? configPos[1] : null,
            inputBounds = positionElement.getBoundingClientRect(),
            distanceFromBottom = window.innerHeight - inputBounds.bottom,
            showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
        var top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
        toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
        toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
        if (self.config.inline) return;
        var left = window.pageXOffset + inputBounds.left - (configPosHorizontal != null && configPosHorizontal === "center" ? (calendarWidth - inputBounds.width) / 2 : 0);
        var right = window.document.body.offsetWidth - inputBounds.right;
        var rightMost = left + calendarWidth > window.document.body.offsetWidth;
        toggleClass(self.calendarContainer, "rightMost", rightMost);
        if (self.config.static) return;
        self.calendarContainer.style.top = top + "px";

        if (!rightMost) {
          self.calendarContainer.style.left = left + "px";
          self.calendarContainer.style.right = "auto";
        } else {
          self.calendarContainer.style.left = "auto";
          self.calendarContainer.style.right = right + "px";
        }
      }

      function redraw() {
        if (self.config.noCalendar || self.isMobile) return;
        updateNavigationCurrentMonth();
        buildDays();
      }

      function focusAndClose() {
        self._input.focus();

        if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== undefined) {
          setTimeout(self.close, 0);
        } else {
          self.close();
        }
      }

      function selectDate(e) {
        e.preventDefault();
        e.stopPropagation();

        var isSelectable = function isSelectable(day) {
          return day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("disabled") && !day.classList.contains("notAllowed");
        };

        var t = findParent(e.target, isSelectable);
        if (t === undefined) return;
        var target = t;
        var selectedDate = self.latestSelectedDateObj = new Date(target.dateObj.getTime());
        var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth || selectedDate.getMonth() > self.currentMonth + self.config.showMonths - 1) && self.config.mode !== "range";
        self.selectedDateElem = target;
        if (self.config.mode === "single") self.selectedDates = [selectedDate];else if (self.config.mode === "multiple") {
          var selectedIndex = isDateSelected(selectedDate);
          if (selectedIndex) self.selectedDates.splice(parseInt(selectedIndex), 1);else self.selectedDates.push(selectedDate);
        } else if (self.config.mode === "range") {
          if (self.selectedDates.length === 2) self.clear(false);
          self.selectedDates.push(selectedDate);
          if (compareDates(selectedDate, self.selectedDates[0], true) !== 0) self.selectedDates.sort(function (a, b) {
            return a.getTime() - b.getTime();
          });
        }
        setHoursFromInputs();

        if (shouldChangeMonth) {
          var isNewYear = self.currentYear !== selectedDate.getFullYear();
          self.currentYear = selectedDate.getFullYear();
          self.currentMonth = selectedDate.getMonth();
          if (isNewYear) triggerEvent("onYearChange");
          triggerEvent("onMonthChange");
        }

        updateNavigationCurrentMonth();
        buildDays();
        updateValue();
        if (self.config.enableTime) setTimeout(function () {
          return self.showTimeInput = true;
        }, 50);
        if (!shouldChangeMonth && self.config.mode !== "range" && self.config.showMonths === 1) focusOnDayElem(target);else self.selectedDateElem && self.selectedDateElem.focus();
        if (self.hourElement !== undefined) setTimeout(function () {
          return self.hourElement !== undefined && self.hourElement.select();
        }, 451);

        if (self.config.closeOnSelect) {
          var single = self.config.mode === "single" && !self.config.enableTime;
          var range = self.config.mode === "range" && self.selectedDates.length === 2 && !self.config.enableTime;

          if (single || range) {
            focusAndClose();
          }
        }

        triggerChange();
      }

      var CALLBACKS = {
        locale: [setupLocale, updateWeekdays],
        showMonths: [buildMonths, setCalendarWidth, buildWeekdays]
      };

      function set(option, value) {
        if (option !== null && typeof option === "object") Object.assign(self.config, option);else {
          self.config[option] = value;
          if (CALLBACKS[option] !== undefined) CALLBACKS[option].forEach(function (x) {
            return x();
          });else if (HOOKS.indexOf(option) > -1) self.config[option] = arrayify(value);
        }
        self.redraw();
        jumpToDate();
        updateValue(false);
      }

      function setSelectedDate(inputDate, format) {
        var dates = [];
        if (inputDate instanceof Array) dates = inputDate.map(function (d) {
          return self.parseDate(d, format);
        });else if (inputDate instanceof Date || typeof inputDate === "number") dates = [self.parseDate(inputDate, format)];else if (typeof inputDate === "string") {
          switch (self.config.mode) {
            case "single":
            case "time":
              dates = [self.parseDate(inputDate, format)];
              break;

            case "multiple":
              dates = inputDate.split(self.config.conjunction).map(function (date) {
                return self.parseDate(date, format);
              });
              break;

            case "range":
              dates = inputDate.split(self.l10n.rangeSeparator).map(function (date) {
                return self.parseDate(date, format);
              });
              break;

            default:
              break;
          }
        } else self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
        self.selectedDates = dates.filter(function (d) {
          return d instanceof Date && isEnabled(d, false);
        });
        if (self.config.mode === "range") self.selectedDates.sort(function (a, b) {
          return a.getTime() - b.getTime();
        });
      }

      function setDate(date, triggerChange, format) {
        if (triggerChange === void 0) {
          triggerChange = false;
        }

        if (format === void 0) {
          format = self.config.dateFormat;
        }

        if (date !== 0 && !date || date instanceof Array && date.length === 0) return self.clear(triggerChange);
        setSelectedDate(date, format);
        self.showTimeInput = self.selectedDates.length > 0;
        self.latestSelectedDateObj = self.selectedDates[0];
        self.redraw();
        jumpToDate();
        setHoursFromDate();
        updateValue(triggerChange);
        if (triggerChange) triggerEvent("onChange");
      }

      function parseDateRules(arr) {
        return arr.slice().map(function (rule) {
          if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
            return self.parseDate(rule, undefined, true);
          } else if (rule && typeof rule === "object" && rule.from && rule.to) return {
            from: self.parseDate(rule.from, undefined),
            to: self.parseDate(rule.to, undefined)
          };

          return rule;
        }).filter(function (x) {
          return x;
        });
      }

      function setupDates() {
        self.selectedDates = [];
        self.now = self.parseDate(self.config.now) || new Date();
        var preloadedDate = self.config.defaultDate || ((self.input.nodeName === "INPUT" || self.input.nodeName === "TEXTAREA") && self.input.placeholder && self.input.value === self.input.placeholder ? null : self.input.value);
        if (preloadedDate) setSelectedDate(preloadedDate, self.config.dateFormat);
        var initialDate = self.selectedDates.length > 0 ? self.selectedDates[0] : self.config.minDate && self.config.minDate.getTime() > self.now.getTime() ? self.config.minDate : self.config.maxDate && self.config.maxDate.getTime() < self.now.getTime() ? self.config.maxDate : self.now;
        self.currentYear = initialDate.getFullYear();
        self.currentMonth = initialDate.getMonth();
        if (self.selectedDates.length > 0) self.latestSelectedDateObj = self.selectedDates[0];
        if (self.config.minTime !== undefined) self.config.minTime = self.parseDate(self.config.minTime, "H:i");
        if (self.config.maxTime !== undefined) self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
        self.minDateHasTime = !!self.config.minDate && (self.config.minDate.getHours() > 0 || self.config.minDate.getMinutes() > 0 || self.config.minDate.getSeconds() > 0);
        self.maxDateHasTime = !!self.config.maxDate && (self.config.maxDate.getHours() > 0 || self.config.maxDate.getMinutes() > 0 || self.config.maxDate.getSeconds() > 0);
        Object.defineProperty(self, "showTimeInput", {
          get: function get() {
            return self._showTimeInput;
          },
          set: function set(bool) {
            self._showTimeInput = bool;
            if (self.calendarContainer) toggleClass(self.calendarContainer, "showTimeInput", bool);
            self.isOpen && positionCalendar();
          }
        });
      }

      function setupInputs() {
        self.input = self.config.wrap ? element.querySelector("[data-input]") : element;

        if (!self.input) {
          self.config.errorHandler(new Error("Invalid input element specified"));
          return;
        }

        self.input._type = self.input.type;
        self.input.type = "text";
        self.input.classList.add("flatpickr-input");
        self._input = self.input;

        if (self.config.altInput) {
          self.altInput = createElement(self.input.nodeName, self.input.className + " " + self.config.altInputClass);
          self._input = self.altInput;
          self.altInput.placeholder = self.input.placeholder;
          self.altInput.disabled = self.input.disabled;
          self.altInput.required = self.input.required;
          self.altInput.tabIndex = self.input.tabIndex;
          self.altInput.type = "text";
          self.input.setAttribute("type", "hidden");
          if (!self.config.static && self.input.parentNode) self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
        }

        if (!self.config.allowInput) self._input.setAttribute("readonly", "readonly");
        self._positionElement = self.config.positionElement || self._input;
      }

      function setupMobile() {
        var inputType = self.config.enableTime ? self.config.noCalendar ? "time" : "datetime-local" : "date";
        self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
        self.mobileInput.step = self.input.getAttribute("step") || "any";
        self.mobileInput.tabIndex = 1;
        self.mobileInput.type = inputType;
        self.mobileInput.disabled = self.input.disabled;
        self.mobileInput.required = self.input.required;
        self.mobileInput.placeholder = self.input.placeholder;
        self.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";

        if (self.selectedDates.length > 0) {
          self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
        }

        if (self.config.minDate) self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
        if (self.config.maxDate) self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
        self.input.type = "hidden";
        if (self.altInput !== undefined) self.altInput.type = "hidden";

        try {
          if (self.input.parentNode) self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
        } catch (_a) {}

        bind(self.mobileInput, "change", function (e) {
          self.setDate(e.target.value, false, self.mobileFormatStr);
          triggerEvent("onChange");
          triggerEvent("onClose");
        });
      }

      function toggle(e) {
        if (self.isOpen === true) return self.close();
        self.open(e);
      }

      function triggerEvent(event, data) {
        if (self.config === undefined) return;
        var hooks = self.config[event];

        if (hooks !== undefined && hooks.length > 0) {
          for (var i = 0; hooks[i] && i < hooks.length; i++) {
            hooks[i](self.selectedDates, self.input.value, self, data);
          }
        }

        if (event === "onChange") {
          self.input.dispatchEvent(createEvent("change"));
          self.input.dispatchEvent(createEvent("input"));
        }
      }

      function createEvent(name) {
        var e = document.createEvent("Event");
        e.initEvent(name, true, true);
        return e;
      }

      function isDateSelected(date) {
        for (var i = 0; i < self.selectedDates.length; i++) {
          if (compareDates(self.selectedDates[i], date) === 0) return "" + i;
        }

        return false;
      }

      function isDateInRange(date) {
        if (self.config.mode !== "range" || self.selectedDates.length < 2) return false;
        return compareDates(date, self.selectedDates[0]) >= 0 && compareDates(date, self.selectedDates[1]) <= 0;
      }

      function updateNavigationCurrentMonth() {
        if (self.config.noCalendar || self.isMobile || !self.monthNav) return;
        self.yearElements.forEach(function (yearElement, i) {
          var d = new Date(self.currentYear, self.currentMonth, 1);
          d.setMonth(self.currentMonth + i);
          self.monthElements[i].textContent = monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
          yearElement.value = d.getFullYear().toString();
        });
        self._hidePrevMonthArrow = self.config.minDate !== undefined && (self.currentYear === self.config.minDate.getFullYear() ? self.currentMonth <= self.config.minDate.getMonth() : self.currentYear < self.config.minDate.getFullYear());
        self._hideNextMonthArrow = self.config.maxDate !== undefined && (self.currentYear === self.config.maxDate.getFullYear() ? self.currentMonth + 1 > self.config.maxDate.getMonth() : self.currentYear > self.config.maxDate.getFullYear());
      }

      function getDateStr(format) {
        return self.selectedDates.map(function (dObj) {
          return self.formatDate(dObj, format);
        }).filter(function (d, i, arr) {
          return self.config.mode !== "range" || self.config.enableTime || arr.indexOf(d) === i;
        }).join(self.config.mode !== "range" ? self.config.conjunction : self.l10n.rangeSeparator);
      }

      function updateValue(triggerChange) {
        if (triggerChange === void 0) {
          triggerChange = true;
        }

        if (self.selectedDates.length === 0) return self.clear(triggerChange);

        if (self.mobileInput !== undefined && self.mobileFormatStr) {
          self.mobileInput.value = self.latestSelectedDateObj !== undefined ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr) : "";
        }

        self.input.value = getDateStr(self.config.dateFormat);

        if (self.altInput !== undefined) {
          self.altInput.value = getDateStr(self.config.altFormat);
        }

        if (triggerChange !== false) triggerEvent("onValueUpdate");
      }

      function onMonthNavClick(e) {
        e.preventDefault();
        var isPrevMonth = self.prevMonthNav.contains(e.target);
        var isNextMonth = self.nextMonthNav.contains(e.target);

        if (isPrevMonth || isNextMonth) {
          changeMonth(isPrevMonth ? -1 : 1);
        } else if (self.yearElements.indexOf(e.target) >= 0) {
          e.target.select();
        } else if (e.target.classList.contains("arrowUp")) {
          self.changeYear(self.currentYear + 1);
        } else if (e.target.classList.contains("arrowDown")) {
          self.changeYear(self.currentYear - 1);
        }
      }

      function timeWrapper(e) {
        e.preventDefault();
        var isKeyDown = e.type === "keydown",
            input = e.target;

        if (self.amPM !== undefined && e.target === self.amPM) {
          self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
        }

        var min = parseFloat(input.getAttribute("data-min")),
            max = parseFloat(input.getAttribute("data-max")),
            step = parseFloat(input.getAttribute("data-step")),
            curValue = parseInt(input.value, 10),
            delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
        var newValue = curValue + step * delta;

        if (typeof input.value !== "undefined" && input.value.length === 2) {
          var isHourElem = input === self.hourElement,
              isMinuteElem = input === self.minuteElement;

          if (newValue < min) {
            newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self.amPM));
            if (isMinuteElem) incrementNumInput(undefined, -1, self.hourElement);
          } else if (newValue > max) {
            newValue = input === self.hourElement ? newValue - max - int(!self.amPM) : min;
            if (isMinuteElem) incrementNumInput(undefined, 1, self.hourElement);
          }

          if (self.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
            self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
          }

          input.value = pad(newValue);
        }
      }

      init();
      return self;
    }

    function _flatpickr(nodeList, config) {
      var nodes = Array.prototype.slice.call(nodeList);
      var instances = [];

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        try {
          if (node.getAttribute("data-fp-omit") !== null) continue;

          if (node._flatpickr !== undefined) {
            node._flatpickr.destroy();

            node._flatpickr = undefined;
          }

          node._flatpickr = FlatpickrInstance(node, config || {});
          instances.push(node._flatpickr);
        } catch (e) {
          console.error(e);
        }
      }

      return instances.length === 1 ? instances[0] : instances;
    }

    if (typeof HTMLElement !== "undefined") {
      HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
        return _flatpickr(this, config);
      };

      HTMLElement.prototype.flatpickr = function (config) {
        return _flatpickr([this], config);
      };
    }

    var flatpickr = function flatpickr(selector, config) {
      if (selector instanceof NodeList) return _flatpickr(selector, config);else if (typeof selector === "string") return _flatpickr(window.document.querySelectorAll(selector), config);
      return _flatpickr([selector], config);
    };

    flatpickr.defaultConfig = defaults;
    flatpickr.l10ns = {
      en: Object.assign({}, english),
      default: Object.assign({}, english)
    };

    flatpickr.localize = function (l10n) {
      flatpickr.l10ns.default = Object.assign({}, flatpickr.l10ns.default, l10n);
    };

    flatpickr.setDefaults = function (config) {
      flatpickr.defaultConfig = Object.assign({}, flatpickr.defaultConfig, config);
    };

    flatpickr.parseDate = createDateParser({});
    flatpickr.formatDate = createDateFormatter({});
    flatpickr.compareDates = compareDates;

    if (typeof jQuery !== "undefined") {
      jQuery.fn.flatpickr = function (config) {
        return _flatpickr(this, config);
      };
    }

    Date.prototype.fp_incr = function (days) {
      return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
    };

    if (typeof window !== "undefined") {
      window.flatpickr = flatpickr;
    }

    return flatpickr;

})));
(function($) {

  var cocoon_element_counter = 0;

  var create_new_id = function() {
    return (new Date().getTime() + cocoon_element_counter++);
  }

  var newcontent_braced = function(id) {
    return '[' + id + ']$1';
  }

  var newcontent_underscord = function(id) {
    return '_' + id + '_$1';
  }

  var getInsertionNodeElem = function(insertionNode, insertionTraversal, $this){

    if (!insertionNode){
      return $this.parent();
    }

    if (typeof insertionNode == 'function'){
      if(insertionTraversal){
        console.warn('association-insertion-traversal is ignored, because association-insertion-node is given as a function.')
      }
      return insertionNode($this);
    }

    if(typeof insertionNode == 'string'){
      if (insertionTraversal){
        return $this[insertionTraversal](insertionNode);
      }else{
        return insertionNode == "this" ? $this : $(insertionNode);
      }
    }

  }

  $(document).on('click', '.add_fields', function(e) {
    e.preventDefault();
    var $this                 = $(this),
        assoc                 = $this.data('association'),
        assocs                = $this.data('associations'),
        content               = $this.data('association-insertion-template'),
        insertionMethod       = $this.data('association-insertion-method') || $this.data('association-insertion-position') || 'before',
        insertionNode         = $this.data('association-insertion-node'),
        insertionTraversal    = $this.data('association-insertion-traversal'),
        count                 = parseInt($this.data('count'), 10),
        regexp_braced         = new RegExp('\\[new_' + assoc + '\\](.*?\\s)', 'g'),
        regexp_underscord     = new RegExp('_new_' + assoc + '_(\\w*)', 'g'),
        new_id                = create_new_id(),
        new_content           = content.replace(regexp_braced, newcontent_braced(new_id)),
        new_contents          = [],
        originalEvent         = e;


    if (new_content == content) {
      regexp_braced     = new RegExp('\\[new_' + assocs + '\\](.*?\\s)', 'g');
      regexp_underscord = new RegExp('_new_' + assocs + '_(\\w*)', 'g');
      new_content       = content.replace(regexp_braced, newcontent_braced(new_id));
    }

    new_content = new_content.replace(regexp_underscord, newcontent_underscord(new_id));
    new_contents = [new_content];

    count = (isNaN(count) ? 1 : Math.max(count, 1));
    count -= 1;

    while (count) {
      new_id      = create_new_id();
      new_content = content.replace(regexp_braced, newcontent_braced(new_id));
      new_content = new_content.replace(regexp_underscord, newcontent_underscord(new_id));
      new_contents.push(new_content);

      count -= 1;
    }

    var insertionNodeElem = getInsertionNodeElem(insertionNode, insertionTraversal, $this)

    if( !insertionNodeElem || (insertionNodeElem.length == 0) ){
      console.warn("Couldn't find the element to insert the template. Make sure your `data-association-insertion-*` on `link_to_add_association` is correct.")
    }

    $.each(new_contents, function(i, node) {
      var contentNode = $(node);

      var before_insert = jQuery.Event('cocoon:before-insert');
      insertionNodeElem.trigger(before_insert, [contentNode, originalEvent]);

      if (!before_insert.isDefaultPrevented()) {
        // allow any of the jquery dom manipulation methods (after, before, append, prepend, etc)
        // to be called on the node.  allows the insertion node to be the parent of the inserted
        // code and doesn't force it to be a sibling like after/before does. default: 'before'
        var addedContent = insertionNodeElem[insertionMethod](contentNode);

        insertionNodeElem.trigger('cocoon:after-insert', [contentNode,
          originalEvent]);
      }
    });
  });

  $(document).on('click', '.remove_fields.dynamic, .remove_fields.existing', function(e) {
    var $this = $(this),
        wrapper_class = $this.data('wrapper-class') || 'nested-fields',
        node_to_delete = $this.closest('.' + wrapper_class),
        trigger_node = node_to_delete.parent(),
        originalEvent = e;

    e.preventDefault();
    e.stopPropagation();

    var before_remove = jQuery.Event('cocoon:before-remove');
    trigger_node.trigger(before_remove, [node_to_delete, originalEvent]);

    if (!before_remove.isDefaultPrevented()) {
      var timeout = trigger_node.data('remove-timeout') || 0;

      setTimeout(function() {
        if ($this.hasClass('dynamic')) {
            node_to_delete.detach();
        } else {
            $this.prev("input[type=hidden]").val("1");
            node_to_delete.hide();
        }
        trigger_node.trigger('cocoon:after-remove', [node_to_delete,
          originalEvent]);
      }, timeout);
    }
  });


  $(document).on("ready page:load turbolinks:load", function() {
    $('.remove_fields.existing.destroyed').each(function(i, obj) {
      var $this = $(this),
          wrapper_class = $this.data('wrapper-class') || 'nested-fields';

      $this.closest('.' + wrapper_class).hide();
    });
  });

})(jQuery);



function showNotifications(messages){
  for(var i = 0; i < messages.length; i++){
    showNotification(messages[0][1], messages[0][0])
  }

  $('#notifications').remove();
}

function showNotification(message, type){
	var types = { 'alert': 'error', 'success': 'success', 'error': 'success', 'warning': 'warning', 'info': 'info' };

	type = types[type];

	if(!types[type]){
		type = 'info';
	}

	var n = new Noty({
		type: type,
		layout: 'topCenter',
		theme: 'bootstrap-v3',
		text: message,
		timeout: 5000,
		progressBar: true,
		closeWith: ['click', 'button'],
		animation: {
			open: 'noty_effects_open',
			close: 'noty_effects_close'
		},
		id: false,
		force: false,
		killer : false,
		queue: 'global',
		container: false,
		buttons: [],
		sounds: {
			sources: [],
			volume: 1,
			conditions: []
		},
		titleCount: {
			conditions: []
		},
		modal: false
	}).show()

}
;
//! moment.js
//! version : 2.14.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return md.apply(null,arguments)}
// This is done to register the method called with moment()
// without creating circular dependencies.
function b(a){md=a}function c(a){return a instanceof Array||"[object Array]"===Object.prototype.toString.call(a)}function d(a){return"[object Object]"===Object.prototype.toString.call(a)}function e(a){var b;for(b in a)
// even if its not own property I'd still call it non-empty
return!1;return!0}function f(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function g(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function h(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function i(a,b){for(var c in b)h(b,c)&&(a[c]=b[c]);return h(b,"toString")&&(a.toString=b.toString),h(b,"valueOf")&&(a.valueOf=b.valueOf),a}function j(a,b,c,d){return qb(a,b,c,d,!0).utc()}function k(){
// We need to deep clone this object.
return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null}}function l(a){return null==a._pf&&(a._pf=k()),a._pf}function m(a){if(null==a._isValid){var b=l(a),c=nd.call(b.parsedDateParts,function(a){return null!=a});a._isValid=!isNaN(a._d.getTime())&&b.overflow<0&&!b.empty&&!b.invalidMonth&&!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated&&(!b.meridiem||b.meridiem&&c),a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function n(a){var b=j(NaN);return null!=a?i(l(b),a):l(b).userInvalidated=!0,b}function o(a){return void 0===a}function p(a,b){var c,d,e;if(o(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),o(b._i)||(a._i=b._i),o(b._f)||(a._f=b._f),o(b._l)||(a._l=b._l),o(b._strict)||(a._strict=b._strict),o(b._tzm)||(a._tzm=b._tzm),o(b._isUTC)||(a._isUTC=b._isUTC),o(b._offset)||(a._offset=b._offset),o(b._pf)||(a._pf=l(b)),o(b._locale)||(a._locale=b._locale),od.length>0)for(c in od)d=od[c],e=b[d],o(e)||(a[d]=e);return a}
// Moment prototype object
function q(b){p(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),pd===!1&&(pd=!0,a.updateOffset(this),pd=!1)}function r(a){return a instanceof q||null!=a&&null!=a._isAMomentObject}function s(a){return 0>a?Math.ceil(a)||0:Math.floor(a)}function t(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=s(b)),c}
// compare two arrays, return the number of differences
function u(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&t(a[d])!==t(b[d]))&&g++;return g+f}function v(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function w(b,c){var d=!0;return i(function(){return null!=a.deprecationHandler&&a.deprecationHandler(null,b),d&&(v(b+"\nArguments: "+Array.prototype.slice.call(arguments).join(", ")+"\n"+(new Error).stack),d=!1),c.apply(this,arguments)},c)}function x(b,c){null!=a.deprecationHandler&&a.deprecationHandler(b,c),qd[b]||(v(c),qd[b]=!0)}function y(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function z(a){var b,c;for(c in a)b=a[c],y(b)?this[c]=b:this["_"+c]=b;this._config=a,
// Lenient ordinal parsing accepts just a number in addition to
// number + (possibly) stuff coming from _ordinalParseLenient.
this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function A(a,b){var c,e=i({},a);for(c in b)h(b,c)&&(d(a[c])&&d(b[c])?(e[c]={},i(e[c],a[c]),i(e[c],b[c])):null!=b[c]?e[c]=b[c]:delete e[c]);for(c in a)h(a,c)&&!h(b,c)&&d(a[c])&&(
// make sure changes to properties don't modify parent config
e[c]=i({},e[c]));return e}function B(a){null!=a&&this.set(a)}function C(a,b,c){var d=this._calendar[a]||this._calendar.sameElse;return y(d)?d.call(b,c):d}function D(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function E(){return this._invalidDate}function F(a){return this._ordinal.replace("%d",a)}function G(a,b,c,d){var e=this._relativeTime[c];return y(e)?e(a,b,c,d):e.replace(/%d/i,a)}function H(a,b){var c=this._relativeTime[a>0?"future":"past"];return y(c)?c(b):c.replace(/%s/i,b)}function I(a,b){var c=a.toLowerCase();zd[c]=zd[c+"s"]=zd[b]=a}function J(a){return"string"==typeof a?zd[a]||zd[a.toLowerCase()]:void 0}function K(a){var b,c,d={};for(c in a)h(a,c)&&(b=J(c),b&&(d[b]=a[c]));return d}function L(a,b){Ad[a]=b}function M(a){var b=[];for(var c in a)b.push({unit:c,priority:Ad[c]});return b.sort(function(a,b){return a.priority-b.priority}),b}function N(b,c){return function(d){return null!=d?(P(this,b,d),a.updateOffset(this,c),this):O(this,b)}}function O(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function P(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}
// MOMENTS
function Q(a){return a=J(a),y(this[a])?this[a]():this}function R(a,b){if("object"==typeof a){a=K(a);for(var c=M(a),d=0;d<c.length;d++)this[c[d].unit](a[c[d].unit])}else if(a=J(a),y(this[a]))return this[a](b);return this}function S(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}
// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function T(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Ed[a]=e),b&&(Ed[b[0]]=function(){return S(e.apply(this,arguments),b[1],b[2])}),c&&(Ed[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function U(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function V(a){var b,c,d=a.match(Bd);for(b=0,c=d.length;c>b;b++)Ed[d[b]]?d[b]=Ed[d[b]]:d[b]=U(d[b]);return function(b){var e,f="";for(e=0;c>e;e++)f+=d[e]instanceof Function?d[e].call(b,a):d[e];return f}}
// format date using native date object
function W(a,b){return a.isValid()?(b=X(b,a.localeData()),Dd[b]=Dd[b]||V(b),Dd[b](a)):a.localeData().invalidDate()}function X(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Cd.lastIndex=0;d>=0&&Cd.test(a);)a=a.replace(Cd,c),Cd.lastIndex=0,d-=1;return a}function Y(a,b,c){Wd[a]=y(b)?b:function(a,d){return a&&c?c:b}}function Z(a,b){return h(Wd,a)?Wd[a](b._strict,b._locale):new RegExp($(a))}
// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function $(a){return _(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function _(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function aa(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),"number"==typeof b&&(d=function(a,c){c[b]=t(a)}),c=0;c<a.length;c++)Xd[a[c]]=d}function ba(a,b){aa(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function ca(a,b,c){null!=b&&h(Xd,a)&&Xd[a](b,c._a,c,a)}function da(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function ea(a,b){return c(this._months)?this._months[a.month()]:this._months[(this._months.isFormat||fe).test(b)?"format":"standalone"][a.month()]}function fa(a,b){return c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[fe.test(b)?"format":"standalone"][a.month()]}function ga(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._monthsParse)for(
// this is not used
this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],d=0;12>d;++d)f=j([2e3,d]),this._shortMonthsParse[d]=this.monthsShort(f,"").toLocaleLowerCase(),this._longMonthsParse[d]=this.months(f,"").toLocaleLowerCase();return c?"MMM"===b?(e=sd.call(this._shortMonthsParse,g),-1!==e?e:null):(e=sd.call(this._longMonthsParse,g),-1!==e?e:null):"MMM"===b?(e=sd.call(this._shortMonthsParse,g),-1!==e?e:(e=sd.call(this._longMonthsParse,g),-1!==e?e:null)):(e=sd.call(this._longMonthsParse,g),-1!==e?e:(e=sd.call(this._shortMonthsParse,g),-1!==e?e:null))}function ha(a,b,c){var d,e,f;if(this._monthsParseExact)return ga.call(this,a,b,c);
// TODO: add sorting
// Sorting makes sure if one month (or abbr) is a prefix of another
// see sorting in computeMonthsParse
for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){
// test the regex
if(e=j([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}
// MOMENTS
function ia(a,b){var c;if(!a.isValid())
// No op
return a;if("string"==typeof b)if(/^\d+$/.test(b))b=t(b);else
// TODO: Another silent failure?
if(b=a.localeData().monthsParse(b),"number"!=typeof b)return a;return c=Math.min(a.date(),da(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a}function ja(b){return null!=b?(ia(this,b),a.updateOffset(this,!0),this):O(this,"Month")}function ka(){return da(this.year(),this.month())}function la(a){return this._monthsParseExact?(h(this,"_monthsRegex")||na.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):(h(this,"_monthsShortRegex")||(this._monthsShortRegex=ie),this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex)}function ma(a){return this._monthsParseExact?(h(this,"_monthsRegex")||na.call(this),a?this._monthsStrictRegex:this._monthsRegex):(h(this,"_monthsRegex")||(this._monthsRegex=je),this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex)}function na(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;12>b;b++)c=j([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(
// Sorting makes sure if one month (or abbr) is a prefix of another it
// will match the longer piece.
d.sort(a),e.sort(a),f.sort(a),b=0;12>b;b++)d[b]=_(d[b]),e[b]=_(e[b]);for(b=0;24>b;b++)f[b]=_(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")","i")}
// HELPERS
function oa(a){return pa(a)?366:365}function pa(a){return a%4===0&&a%100!==0||a%400===0}function qa(){return pa(this.year())}function ra(a,b,c,d,e,f,g){
//can't just apply() to create a date:
//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
var h=new Date(a,b,c,d,e,f,g);
//the date constructor remaps years 0-99 to 1900-1999
return 100>a&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function sa(a){var b=new Date(Date.UTC.apply(null,arguments));
//the Date.UTC function remaps years 0-99 to 1900-1999
return 100>a&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}
// start-of-first-week - start-of-year
function ta(a,b,c){var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
d=7+b-c,
// first-week day local weekday -- which local weekday is fwd
e=(7+sa(a,0,d).getUTCDay()-b)%7;return-e+d-1}
//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function ua(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=ta(a,d,e),j=1+7*(b-1)+h+i;return 0>=j?(f=a-1,g=oa(f)+j):j>oa(a)?(f=a+1,g=j-oa(a)):(f=a,g=j),{year:f,dayOfYear:g}}function va(a,b,c){var d,e,f=ta(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return 1>g?(e=a.year()-1,d=g+wa(e,b,c)):g>wa(a.year(),b,c)?(d=g-wa(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function wa(a,b,c){var d=ta(a,b,c),e=ta(a+1,b,c);return(oa(a)-d+e)/7}
// HELPERS
// LOCALES
function xa(a){return va(a,this._week.dow,this._week.doy).week}function ya(){return this._week.dow}function za(){return this._week.doy}
// MOMENTS
function Aa(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ba(a){var b=va(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}
// HELPERS
function Ca(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Da(a,b){return"string"==typeof a?b.weekdaysParse(a)%7||7:isNaN(a)?null:a}function Ea(a,b){return c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]}function Fa(a){return this._weekdaysShort[a.day()]}function Ga(a){return this._weekdaysMin[a.day()]}function Ha(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],d=0;7>d;++d)f=j([2e3,1]).day(d),this._minWeekdaysParse[d]=this.weekdaysMin(f,"").toLocaleLowerCase(),this._shortWeekdaysParse[d]=this.weekdaysShort(f,"").toLocaleLowerCase(),this._weekdaysParse[d]=this.weekdays(f,"").toLocaleLowerCase();return c?"dddd"===b?(e=sd.call(this._weekdaysParse,g),-1!==e?e:null):"ddd"===b?(e=sd.call(this._shortWeekdaysParse,g),-1!==e?e:null):(e=sd.call(this._minWeekdaysParse,g),-1!==e?e:null):"dddd"===b?(e=sd.call(this._weekdaysParse,g),-1!==e?e:(e=sd.call(this._shortWeekdaysParse,g),-1!==e?e:(e=sd.call(this._minWeekdaysParse,g),-1!==e?e:null))):"ddd"===b?(e=sd.call(this._shortWeekdaysParse,g),-1!==e?e:(e=sd.call(this._weekdaysParse,g),-1!==e?e:(e=sd.call(this._minWeekdaysParse,g),-1!==e?e:null))):(e=sd.call(this._minWeekdaysParse,g),-1!==e?e:(e=sd.call(this._weekdaysParse,g),-1!==e?e:(e=sd.call(this._shortWeekdaysParse,g),-1!==e?e:null)))}function Ia(a,b,c){var d,e,f;if(this._weekdaysParseExact)return Ha.call(this,a,b,c);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;7>d;d++){
// test the regex
if(e=j([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}
// MOMENTS
function Ja(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Ca(a,this.localeData()),this.add(a-b,"d")):b}function Ka(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function La(a){if(!this.isValid())return null!=a?this:NaN;
// behaves the same as moment#day except
// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
// as a setter, sunday should belong to the previous week.
if(null!=a){var b=Da(a,this.localeData());return this.day(this.day()%7?b:b-7)}return this.day()||7}function Ma(a){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||Pa.call(this),a?this._weekdaysStrictRegex:this._weekdaysRegex):(h(this,"_weekdaysRegex")||(this._weekdaysRegex=pe),this._weekdaysStrictRegex&&a?this._weekdaysStrictRegex:this._weekdaysRegex)}function Na(a){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||Pa.call(this),a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(h(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=qe),this._weekdaysShortStrictRegex&&a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Oa(a){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||Pa.call(this),a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(h(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=re),this._weekdaysMinStrictRegex&&a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Pa(){function a(a,b){return b.length-a.length}var b,c,d,e,f,g=[],h=[],i=[],k=[];for(b=0;7>b;b++)c=j([2e3,1]).day(b),d=this.weekdaysMin(c,""),e=this.weekdaysShort(c,""),f=this.weekdays(c,""),g.push(d),h.push(e),i.push(f),k.push(d),k.push(e),k.push(f);for(
// Sorting makes sure if one weekday (or abbr) is a prefix of another it
// will match the longer piece.
g.sort(a),h.sort(a),i.sort(a),k.sort(a),b=0;7>b;b++)h[b]=_(h[b]),i[b]=_(i[b]),k[b]=_(k[b]);this._weekdaysRegex=new RegExp("^("+k.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+g.join("|")+")","i")}
// FORMATTING
function Qa(){return this.hours()%12||12}function Ra(){return this.hours()||24}function Sa(a,b){T(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}
// PARSING
function Ta(a,b){return b._meridiemParse}
// LOCALES
function Ua(a){
// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
// Using charAt should be more compatible.
return"p"===(a+"").toLowerCase().charAt(0)}function Va(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Wa(a){return a?a.toLowerCase().replace("_","-"):a}
// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function Xa(a){for(var b,c,d,e,f=0;f<a.length;){for(e=Wa(a[f]).split("-"),b=e.length,c=Wa(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=Ya(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&u(e,c,!0)>=b-1)
//the next array item is better than a shallower substring of this one
break;b--}f++}return null}function Ya(a){var b=null;
// TODO: Find a better way to register and load all the locales in Node
if(!we[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=se._abbr,require("./locale/"+a),
// because defineLocale currently also sets the global locale, we
// want to undo that for lazy loaded locales
Za(b)}catch(c){}return we[a]}
// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function Za(a,b){var c;
// moment.duration._locale = moment._locale = data;
return a&&(c=o(b)?ab(a):$a(a,b),c&&(se=c)),se._abbr}function $a(a,b){if(null!==b){var c=ve;
// treat as if there is no base config
// backwards compat for now: also set the locale
return b.abbr=a,null!=we[a]?(x("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),c=we[a]._config):null!=b.parentLocale&&(null!=we[b.parentLocale]?c=we[b.parentLocale]._config:x("parentLocaleUndefined","specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/")),we[a]=new B(A(c,b)),Za(a),we[a]}
// useful for testing
return delete we[a],null}function _a(a,b){if(null!=b){var c,d=ve;
// MERGE
null!=we[a]&&(d=we[a]._config),b=A(d,b),c=new B(b),c.parentLocale=we[a],we[a]=c,
// backwards compat for now: also set the locale
Za(a)}else
// pass null for config to unupdate, useful for tests
null!=we[a]&&(null!=we[a].parentLocale?we[a]=we[a].parentLocale:null!=we[a]&&delete we[a]);return we[a]}
// returns locale data
function ab(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return se;if(!c(a)){if(b=Ya(a))return b;a=[a]}return Xa(a)}function bb(){return rd(we)}function cb(a){var b,c=a._a;return c&&-2===l(a).overflow&&(b=c[Zd]<0||c[Zd]>11?Zd:c[$d]<1||c[$d]>da(c[Yd],c[Zd])?$d:c[_d]<0||c[_d]>24||24===c[_d]&&(0!==c[ae]||0!==c[be]||0!==c[ce])?_d:c[ae]<0||c[ae]>59?ae:c[be]<0||c[be]>59?be:c[ce]<0||c[ce]>999?ce:-1,l(a)._overflowDayOfYear&&(Yd>b||b>$d)&&(b=$d),l(a)._overflowWeeks&&-1===b&&(b=de),l(a)._overflowWeekday&&-1===b&&(b=ee),l(a).overflow=b),a}
// date from iso format
function db(a){var b,c,d,e,f,g,h=a._i,i=xe.exec(h)||ye.exec(h);if(i){for(l(a).iso=!0,b=0,c=Ae.length;c>b;b++)if(Ae[b][1].exec(i[1])){e=Ae[b][0],d=Ae[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=Be.length;c>b;b++)if(Be[b][1].exec(i[3])){
// match[2] should be 'T' or space
f=(i[2]||" ")+Be[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!ze.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),jb(a)}else a._isValid=!1}
// date from iso format or fallback
function eb(b){var c=Ce.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(db(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}
// Pick the first defined of two or three arguments.
function fb(a,b,c){return null!=a?a:null!=b?b:c}function gb(b){
// hooks is actually the exported moment object
var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}
// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function hb(a){var b,c,d,e,f=[];if(!a._d){
// Default to current date.
// * if no year, month, day of month are given, default to today
// * if day of month is given, default month and year
// * if month is given, default only year
// * if year is given, don't default anything
for(d=gb(a),a._w&&null==a._a[$d]&&null==a._a[Zd]&&ib(a),a._dayOfYear&&(e=fb(a._a[Yd],d[Yd]),a._dayOfYear>oa(e)&&(l(a)._overflowDayOfYear=!0),c=sa(e,0,a._dayOfYear),a._a[Zd]=c.getUTCMonth(),a._a[$d]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=f[b]=d[b];
// Zero out whatever was not defaulted, including time
for(;7>b;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];
// Check for 24:00:00.000
24===a._a[_d]&&0===a._a[ae]&&0===a._a[be]&&0===a._a[ce]&&(a._nextDay=!0,a._a[_d]=0),a._d=(a._useUTC?sa:ra).apply(null,f),
// Apply timezone offset from input. The actual utcOffset can be changed
// with parseZone.
null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[_d]=24)}}function ib(a){var b,c,d,e,f,g,h,i;b=a._w,null!=b.GG||null!=b.W||null!=b.E?(f=1,g=4,c=fb(b.GG,a._a[Yd],va(rb(),1,4).year),d=fb(b.W,1),e=fb(b.E,1),(1>e||e>7)&&(i=!0)):(f=a._locale._week.dow,g=a._locale._week.doy,c=fb(b.gg,a._a[Yd],va(rb(),f,g).year),d=fb(b.w,1),null!=b.d?(e=b.d,(0>e||e>6)&&(i=!0)):null!=b.e?(e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):e=f),1>d||d>wa(c,f,g)?l(a)._overflowWeeks=!0:null!=i?l(a)._overflowWeekday=!0:(h=ua(c,d,e,f,g),a._a[Yd]=h.year,a._dayOfYear=h.dayOfYear)}
// date from string and format string
function jb(b){
// TODO: Move this to another part of the creation flow to prevent circular deps
if(b._f===a.ISO_8601)return void db(b);b._a=[],l(b).empty=!0;
// This array is used to make a Date, either with `new Date` or `Date.UTC`
var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=X(b._f,b._locale).match(Bd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(Z(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&l(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),Ed[f]?(d?l(b).empty=!1:l(b).unusedTokens.push(f),ca(f,d,b)):b._strict&&!d&&l(b).unusedTokens.push(f);
// add remaining unparsed input length to the string
l(b).charsLeftOver=i-j,h.length>0&&l(b).unusedInput.push(h),
// clear _12h flag if hour is <= 12
b._a[_d]<=12&&l(b).bigHour===!0&&b._a[_d]>0&&(l(b).bigHour=void 0),l(b).parsedDateParts=b._a.slice(0),l(b).meridiem=b._meridiem,
// handle meridiem
b._a[_d]=kb(b._locale,b._a[_d],b._meridiem),hb(b),cb(b)}function kb(a,b,c){var d;
// Fallback
return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}
// date from string and array of format strings
function lb(a){var b,c,d,e,f;if(0===a._f.length)return l(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=p({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],jb(b),m(b)&&(f+=l(b).charsLeftOver,f+=10*l(b).unusedTokens.length,l(b).score=f,(null==d||d>f)&&(d=f,c=b));i(a,c||b)}function mb(a){if(!a._d){var b=K(a._i);a._a=g([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),hb(a)}}function nb(a){var b=new q(cb(ob(a)));
// Adding is smart enough around DST
return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function ob(a){var b=a._i,d=a._f;return a._locale=a._locale||ab(a._l),null===b||void 0===d&&""===b?n({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),r(b)?new q(cb(b)):(c(d)?lb(a):f(b)?a._d=b:d?jb(a):pb(a),m(a)||(a._d=null),a))}function pb(b){var d=b._i;void 0===d?b._d=new Date(a.now()):f(d)?b._d=new Date(d.valueOf()):"string"==typeof d?eb(b):c(d)?(b._a=g(d.slice(0),function(a){return parseInt(a,10)}),hb(b)):"object"==typeof d?mb(b):"number"==typeof d?
// from milliseconds
b._d=new Date(d):a.createFromInputFallback(b)}function qb(a,b,f,g,h){var i={};
// object construction must be done this way.
// https://github.com/moment/moment/issues/1423
return"boolean"==typeof f&&(g=f,f=void 0),(d(a)&&e(a)||c(a)&&0===a.length)&&(a=void 0),i._isAMomentObject=!0,i._useUTC=i._isUTC=h,i._l=f,i._i=a,i._f=b,i._strict=g,nb(i)}function rb(a,b,c,d){return qb(a,b,c,d,!1)}
// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function sb(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return rb();for(d=b[0],e=1;e<b.length;++e)b[e].isValid()&&!b[e][a](d)||(d=b[e]);return d}
// TODO: Use [].sort instead?
function tb(){var a=[].slice.call(arguments,0);return sb("isBefore",a)}function ub(){var a=[].slice.call(arguments,0);return sb("isAfter",a)}function vb(a){var b=K(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;
// representation for dateAddRemove
this._milliseconds=+k+1e3*j+// 1000
6e4*i+// 1000 * 60
1e3*h*60*60,//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
// Because of dateAddRemove treats 24 hours as different from a
// day when working around DST, we need to store them separately
this._days=+g+7*f,
// It is impossible translate months into days without knowing
// which months you are are talking about, so we have to store
// it separately.
this._months=+e+3*d+12*c,this._data={},this._locale=ab(),this._bubble()}function wb(a){return a instanceof vb}
// FORMATTING
function xb(a,b){T(a,0,0,function(){var a=this.utcOffset(),c="+";return 0>a&&(a=-a,c="-"),c+S(~~(a/60),2)+b+S(~~a%60,2)})}function yb(a,b){var c=(b||"").match(a)||[],d=c[c.length-1]||[],e=(d+"").match(Ge)||["-",0,0],f=+(60*e[1])+t(e[2]);return"+"===e[0]?f:-f}
// Return a moment from input, that is local/utc/zone equivalent to model.
function zb(b,c){var d,e;
// Use low-level api, because this fn is low-level api.
return c._isUTC?(d=c.clone(),e=(r(b)||f(b)?b.valueOf():rb(b).valueOf())-d.valueOf(),d._d.setTime(d._d.valueOf()+e),a.updateOffset(d,!1),d):rb(b).local()}function Ab(a){
// On Firefox.24 Date#getTimezoneOffset returns a floating point.
// https://github.com/moment/moment/pull/1871
return 15*-Math.round(a._d.getTimezoneOffset()/15)}
// MOMENTS
// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function Bb(b,c){var d,e=this._offset||0;return this.isValid()?null!=b?("string"==typeof b?b=yb(Td,b):Math.abs(b)<16&&(b=60*b),!this._isUTC&&c&&(d=Ab(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?Sb(this,Mb(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?e:Ab(this):null!=b?this:NaN}function Cb(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Db(a){return this.utcOffset(0,a)}function Eb(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Ab(this),"m")),this}function Fb(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(yb(Sd,this._i)),this}function Gb(a){return this.isValid()?(a=a?rb(a).utcOffset():0,(this.utcOffset()-a)%60===0):!1}function Hb(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ib(){if(!o(this._isDSTShifted))return this._isDSTShifted;var a={};if(p(a,this),a=ob(a),a._a){var b=a._isUTC?j(a._a):rb(a._a);this._isDSTShifted=this.isValid()&&u(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Jb(){return this.isValid()?!this._isUTC:!1}function Kb(){return this.isValid()?this._isUTC:!1}function Lb(){return this.isValid()?this._isUTC&&0===this._offset:!1}function Mb(a,b){var c,d,e,f=a,
// matching against regexp is expensive, do it on demand
g=null;// checks for null or undefined
return wb(a)?f={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(f={},b?f[b]=a:f.milliseconds=a):(g=He.exec(a))?(c="-"===g[1]?-1:1,f={y:0,d:t(g[$d])*c,h:t(g[_d])*c,m:t(g[ae])*c,s:t(g[be])*c,ms:t(g[ce])*c}):(g=Ie.exec(a))?(c="-"===g[1]?-1:1,f={y:Nb(g[2],c),M:Nb(g[3],c),w:Nb(g[4],c),d:Nb(g[5],c),h:Nb(g[6],c),m:Nb(g[7],c),s:Nb(g[8],c)}):null==f?f={}:"object"==typeof f&&("from"in f||"to"in f)&&(e=Pb(rb(f.from),rb(f.to)),f={},f.ms=e.milliseconds,f.M=e.months),d=new vb(f),wb(a)&&h(a,"_locale")&&(d._locale=a._locale),d}function Nb(a,b){
// We'd normally use ~~inp for this, but unfortunately it also
// converts floats to ints.
// inp may be undefined, so careful calling replace on it.
var c=a&&parseFloat(a.replace(",","."));
// apply sign while we're at it
return(isNaN(c)?0:c)*b}function Ob(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function Pb(a,b){var c;return a.isValid()&&b.isValid()?(b=zb(b,a),a.isBefore(b)?c=Ob(a,b):(c=Ob(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}function Qb(a){return 0>a?-1*Math.round(-1*a):Math.round(a)}
// TODO: remove 'name' arg after deprecation is removed
function Rb(a,b){return function(c,d){var e,f;
//invert the arguments, but complain about it
return null===d||isNaN(+d)||(x(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Mb(c,d),Sb(this,e,a),this}}function Sb(b,c,d,e){var f=c._milliseconds,g=Qb(c._days),h=Qb(c._months);b.isValid()&&(e=null==e?!0:e,f&&b._d.setTime(b._d.valueOf()+f*d),g&&P(b,"Date",O(b,"Date")+g*d),h&&ia(b,O(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function Tb(a,b){var c=a.diff(b,"days",!0);return-6>c?"sameElse":-1>c?"lastWeek":0>c?"lastDay":1>c?"sameDay":2>c?"nextDay":7>c?"nextWeek":"sameElse"}function Ub(b,c){
// We want to compare the start of today, vs this.
// Getting start-of-today depends on whether we're local/utc/offset or not.
var d=b||rb(),e=zb(d,this).startOf("day"),f=a.calendarFormat(this,e)||"sameElse",g=c&&(y(c[f])?c[f].call(this,d):c[f]);return this.format(g||this.localeData().calendar(f,this,rb(d)))}function Vb(){return new q(this)}function Wb(a,b){var c=r(a)?a:rb(a);return this.isValid()&&c.isValid()?(b=J(o(b)?"millisecond":b),"millisecond"===b?this.valueOf()>c.valueOf():c.valueOf()<this.clone().startOf(b).valueOf()):!1}function Xb(a,b){var c=r(a)?a:rb(a);return this.isValid()&&c.isValid()?(b=J(o(b)?"millisecond":b),"millisecond"===b?this.valueOf()<c.valueOf():this.clone().endOf(b).valueOf()<c.valueOf()):!1}function Yb(a,b,c,d){return d=d||"()",("("===d[0]?this.isAfter(a,c):!this.isBefore(a,c))&&(")"===d[1]?this.isBefore(b,c):!this.isAfter(b,c))}function Zb(a,b){var c,d=r(a)?a:rb(a);return this.isValid()&&d.isValid()?(b=J(b||"millisecond"),"millisecond"===b?this.valueOf()===d.valueOf():(c=d.valueOf(),this.clone().startOf(b).valueOf()<=c&&c<=this.clone().endOf(b).valueOf())):!1}function $b(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function _b(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function ac(a,b,c){var d,e,f,g;// 1000
// 1000 * 60
// 1000 * 60 * 60
// 1000 * 60 * 60 * 24, negate dst
// 1000 * 60 * 60 * 24 * 7, negate dst
return this.isValid()?(d=zb(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=J(b),"year"===b||"month"===b||"quarter"===b?(g=bc(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:s(g)):NaN):NaN}function bc(a,b){
// difference in months
var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),
// b is in (anchor - 1 month, anchor + 1 month)
f=a.clone().add(e,"months");
//check for negative zero, return zero if negative zero
// linear across the month
// linear across the month
return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)||0}function cc(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function dc(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?y(Date.prototype.toISOString)?this.toDate().toISOString():W(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):W(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function ec(b){b||(b=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var c=W(this,b);return this.localeData().postformat(c)}function fc(a,b){return this.isValid()&&(r(a)&&a.isValid()||rb(a).isValid())?Mb({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function gc(a){return this.from(rb(),a)}function hc(a,b){return this.isValid()&&(r(a)&&a.isValid()||rb(a).isValid())?Mb({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ic(a){return this.to(rb(),a)}
// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function jc(a){var b;return void 0===a?this._locale._abbr:(b=ab(a),null!=b&&(this._locale=b),this)}function kc(){return this._locale}function lc(a){
// the following switch intentionally omits break keywords
// to utilize falling through the cases.
switch(a=J(a)){case"year":this.month(0);/* falls through */
case"quarter":case"month":this.date(1);/* falls through */
case"week":case"isoWeek":case"day":case"date":this.hours(0);/* falls through */
case"hour":this.minutes(0);/* falls through */
case"minute":this.seconds(0);/* falls through */
case"second":this.milliseconds(0)}
// weeks are a special case
// quarters are also special
return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function mc(a){
// 'date' is an alias for 'day', so it should be considered as such.
return a=J(a),void 0===a||"millisecond"===a?this:("date"===a&&(a="day"),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms"))}function nc(){return this._d.valueOf()-6e4*(this._offset||0)}function oc(){return Math.floor(this.valueOf()/1e3)}function pc(){return new Date(this.valueOf())}function qc(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function rc(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function sc(){
// new Date(NaN).toJSON() === null
return this.isValid()?this.toISOString():null}function tc(){return m(this)}function uc(){return i({},l(this))}function vc(){return l(this).overflow}function wc(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function xc(a,b){T(0,[a,a.length],0,b)}
// MOMENTS
function yc(a){return Cc.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function zc(a){return Cc.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Ac(){return wa(this.year(),1,4)}function Bc(){var a=this.localeData()._week;return wa(this.year(),a.dow,a.doy)}function Cc(a,b,c,d,e){var f;return null==a?va(this,d,e).year:(f=wa(a,d,e),b>f&&(b=f),Dc.call(this,a,b,c,d,e))}function Dc(a,b,c,d,e){var f=ua(a,b,c,d,e),g=sa(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}
// MOMENTS
function Ec(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}
// HELPERS
// MOMENTS
function Fc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function Gc(a,b){b[ce]=t(1e3*("0."+a))}
// MOMENTS
function Hc(){return this._isUTC?"UTC":""}function Ic(){return this._isUTC?"Coordinated Universal Time":""}function Jc(a){return rb(1e3*a)}function Kc(){return rb.apply(null,arguments).parseZone()}function Lc(a){return a}function Mc(a,b,c,d){var e=ab(),f=j().set(d,b);return e[c](f,a)}function Nc(a,b,c){if("number"==typeof a&&(b=a,a=void 0),a=a||"",null!=b)return Mc(a,b,c,"month");var d,e=[];for(d=0;12>d;d++)e[d]=Mc(a,d,c,"month");return e}
// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function Oc(a,b,c,d){"boolean"==typeof a?("number"==typeof b&&(c=b,b=void 0),b=b||""):(b=a,c=b,a=!1,"number"==typeof b&&(c=b,b=void 0),b=b||"");var e=ab(),f=a?e._week.dow:0;if(null!=c)return Mc(b,(c+f)%7,d,"day");var g,h=[];for(g=0;7>g;g++)h[g]=Mc(b,(g+f)%7,d,"day");return h}function Pc(a,b){return Nc(a,b,"months")}function Qc(a,b){return Nc(a,b,"monthsShort")}function Rc(a,b,c){return Oc(a,b,c,"weekdays")}function Sc(a,b,c){return Oc(a,b,c,"weekdaysShort")}function Tc(a,b,c){return Oc(a,b,c,"weekdaysMin")}function Uc(){var a=this._data;return this._milliseconds=Ue(this._milliseconds),this._days=Ue(this._days),this._months=Ue(this._months),a.milliseconds=Ue(a.milliseconds),a.seconds=Ue(a.seconds),a.minutes=Ue(a.minutes),a.hours=Ue(a.hours),a.months=Ue(a.months),a.years=Ue(a.years),this}function Vc(a,b,c,d){var e=Mb(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}
// supports only 2.0-style add(1, 's') or add(duration)
function Wc(a,b){return Vc(this,a,b,1)}
// supports only 2.0-style subtract(1, 's') or subtract(duration)
function Xc(a,b){return Vc(this,a,b,-1)}function Yc(a){return 0>a?Math.floor(a):Math.ceil(a)}function Zc(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;
// if we have a mix of positive and negative values, bubble down first
// check: https://github.com/moment/moment/issues/2166
// The following code bubbles up values, see the tests for
// examples of what that means.
// convert days to months
// 12 months -> 1 year
return f>=0&&g>=0&&h>=0||0>=f&&0>=g&&0>=h||(f+=864e5*Yc(_c(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=s(f/1e3),i.seconds=a%60,b=s(a/60),i.minutes=b%60,c=s(b/60),i.hours=c%24,g+=s(c/24),e=s($c(g)),h+=e,g-=Yc(_c(e)),d=s(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function $c(a){
// 400 years have 146097 days (taking into account leap year rules)
// 400 years have 12 months === 4800
return 4800*a/146097}function _c(a){
// the reverse of daysToMonths
return 146097*a/4800}function ad(a){var b,c,d=this._milliseconds;if(a=J(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+$c(b),"month"===a?c:c/12;switch(b=this._days+Math.round(_c(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;
// Math.floor prevents floating point math errors here
case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}
// TODO: Use this.as('ms')?
function bd(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*t(this._months/12)}function cd(a){return function(){return this.as(a)}}function dd(a){return a=J(a),this[a+"s"]()}function ed(a){return function(){return this._data[a]}}function fd(){return s(this.days()/7)}
// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function gd(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function hd(a,b,c){var d=Mb(a).abs(),e=jf(d.as("s")),f=jf(d.as("m")),g=jf(d.as("h")),h=jf(d.as("d")),i=jf(d.as("M")),j=jf(d.as("y")),k=e<kf.s&&["s",e]||1>=f&&["m"]||f<kf.m&&["mm",f]||1>=g&&["h"]||g<kf.h&&["hh",g]||1>=h&&["d"]||h<kf.d&&["dd",h]||1>=i&&["M"]||i<kf.M&&["MM",i]||1>=j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,gd.apply(null,k)}
// This function allows you to set the rounding function for relative time strings
function id(a){return void 0===a?jf:"function"==typeof a?(jf=a,!0):!1}
// This function allows you to set a threshold for relative time strings
function jd(a,b){return void 0===kf[a]?!1:void 0===b?kf[a]:(kf[a]=b,!0)}function kd(a){var b=this.localeData(),c=hd(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function ld(){
// for ISO strings we do not use the normal bubbling rules:
//  * milliseconds bubble up until they become hours
//  * days do not bubble at all
//  * months bubble up until they become years
// This is because there is no context-free conversion between hours and days
// (think of clock changes)
// and also not between days and months (28-31 days per month)
var a,b,c,d=lf(this._milliseconds)/1e3,e=lf(this._days),f=lf(this._months);a=s(d/60),b=s(a/60),d%=60,a%=60,c=s(f/12),f%=12;
// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(0>m?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var md,nd;nd=Array.prototype.some?Array.prototype.some:function(a){for(var b=Object(this),c=b.length>>>0,d=0;c>d;d++)if(d in b&&a.call(this,b[d],d,b))return!0;return!1};
// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var od=a.momentProperties=[],pd=!1,qd={};a.suppressDeprecationWarnings=!1,a.deprecationHandler=null;var rd;rd=Object.keys?Object.keys:function(a){var b,c=[];for(b in a)h(a,b)&&c.push(b);return c};var sd,td={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},ud={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},vd="Invalid date",wd="%d",xd=/\d{1,2}/,yd={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},zd={},Ad={},Bd=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Cd=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Dd={},Ed={},Fd=/\d/,Gd=/\d\d/,Hd=/\d{3}/,Id=/\d{4}/,Jd=/[+-]?\d{6}/,Kd=/\d\d?/,Ld=/\d\d\d\d?/,Md=/\d\d\d\d\d\d?/,Nd=/\d{1,3}/,Od=/\d{1,4}/,Pd=/[+-]?\d{1,6}/,Qd=/\d+/,Rd=/[+-]?\d+/,Sd=/Z|[+-]\d\d:?\d\d/gi,Td=/Z|[+-]\d\d(?::?\d\d)?/gi,Ud=/[+-]?\d+(\.\d{1,3})?/,Vd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Wd={},Xd={},Yd=0,Zd=1,$d=2,_d=3,ae=4,be=5,ce=6,de=7,ee=8;sd=Array.prototype.indexOf?Array.prototype.indexOf:function(a){
// I know
var b;for(b=0;b<this.length;++b)if(this[b]===a)return b;return-1},T("M",["MM",2],"Mo",function(){return this.month()+1}),T("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),T("MMMM",0,0,function(a){return this.localeData().months(this,a)}),I("month","M"),L("month",8),Y("M",Kd),Y("MM",Kd,Gd),Y("MMM",function(a,b){return b.monthsShortRegex(a)}),Y("MMMM",function(a,b){return b.monthsRegex(a)}),aa(["M","MM"],function(a,b){b[Zd]=t(a)-1}),aa(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[Zd]=e:l(c).invalidMonth=a});
// LOCALES
var fe=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/,ge="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),he="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),ie=Vd,je=Vd;
// FORMATTING
T("Y",0,0,function(){var a=this.year();return 9999>=a?""+a:"+"+a}),T(0,["YY",2],0,function(){return this.year()%100}),T(0,["YYYY",4],0,"year"),T(0,["YYYYY",5],0,"year"),T(0,["YYYYYY",6,!0],0,"year"),
// ALIASES
I("year","y"),
// PRIORITIES
L("year",1),
// PARSING
Y("Y",Rd),Y("YY",Kd,Gd),Y("YYYY",Od,Id),Y("YYYYY",Pd,Jd),Y("YYYYYY",Pd,Jd),aa(["YYYYY","YYYYYY"],Yd),aa("YYYY",function(b,c){c[Yd]=2===b.length?a.parseTwoDigitYear(b):t(b)}),aa("YY",function(b,c){c[Yd]=a.parseTwoDigitYear(b)}),aa("Y",function(a,b){b[Yd]=parseInt(a,10)}),
// HOOKS
a.parseTwoDigitYear=function(a){return t(a)+(t(a)>68?1900:2e3)};
// MOMENTS
var ke=N("FullYear",!0);
// FORMATTING
T("w",["ww",2],"wo","week"),T("W",["WW",2],"Wo","isoWeek"),
// ALIASES
I("week","w"),I("isoWeek","W"),
// PRIORITIES
L("week",5),L("isoWeek",5),
// PARSING
Y("w",Kd),Y("ww",Kd,Gd),Y("W",Kd),Y("WW",Kd,Gd),ba(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=t(a)});var le={dow:0,// Sunday is the first day of the week.
doy:6};
// FORMATTING
T("d",0,"do","day"),T("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),T("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),T("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),T("e",0,0,"weekday"),T("E",0,0,"isoWeekday"),
// ALIASES
I("day","d"),I("weekday","e"),I("isoWeekday","E"),
// PRIORITY
L("day",11),L("weekday",11),L("isoWeekday",11),
// PARSING
Y("d",Kd),Y("e",Kd),Y("E",Kd),Y("dd",function(a,b){return b.weekdaysMinRegex(a)}),Y("ddd",function(a,b){return b.weekdaysShortRegex(a)}),Y("dddd",function(a,b){return b.weekdaysRegex(a)}),ba(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);
// if we didn't get a weekday name, mark the date as invalid
null!=e?b.d=e:l(c).invalidWeekday=a}),ba(["d","e","E"],function(a,b,c,d){b[d]=t(a)});
// LOCALES
var me="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),ne="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),oe="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),pe=Vd,qe=Vd,re=Vd;T("H",["HH",2],0,"hour"),T("h",["hh",2],0,Qa),T("k",["kk",2],0,Ra),T("hmm",0,0,function(){return""+Qa.apply(this)+S(this.minutes(),2)}),T("hmmss",0,0,function(){return""+Qa.apply(this)+S(this.minutes(),2)+S(this.seconds(),2)}),T("Hmm",0,0,function(){return""+this.hours()+S(this.minutes(),2)}),T("Hmmss",0,0,function(){return""+this.hours()+S(this.minutes(),2)+S(this.seconds(),2)}),Sa("a",!0),Sa("A",!1),
// ALIASES
I("hour","h"),
// PRIORITY
L("hour",13),Y("a",Ta),Y("A",Ta),Y("H",Kd),Y("h",Kd),Y("HH",Kd,Gd),Y("hh",Kd,Gd),Y("hmm",Ld),Y("hmmss",Md),Y("Hmm",Ld),Y("Hmmss",Md),aa(["H","HH"],_d),aa(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),aa(["h","hh"],function(a,b,c){b[_d]=t(a),l(c).bigHour=!0}),aa("hmm",function(a,b,c){var d=a.length-2;b[_d]=t(a.substr(0,d)),b[ae]=t(a.substr(d)),l(c).bigHour=!0}),aa("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[_d]=t(a.substr(0,d)),b[ae]=t(a.substr(d,2)),b[be]=t(a.substr(e)),l(c).bigHour=!0}),aa("Hmm",function(a,b,c){var d=a.length-2;b[_d]=t(a.substr(0,d)),b[ae]=t(a.substr(d))}),aa("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[_d]=t(a.substr(0,d)),b[ae]=t(a.substr(d,2)),b[be]=t(a.substr(e))});var se,te=/[ap]\.?m?\.?/i,ue=N("Hours",!0),ve={calendar:td,longDateFormat:ud,invalidDate:vd,ordinal:wd,ordinalParse:xd,relativeTime:yd,months:ge,monthsShort:he,week:le,weekdays:me,weekdaysMin:oe,weekdaysShort:ne,meridiemParse:te},we={},xe=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,ye=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,ze=/Z|[+-]\d\d(?::?\d\d)?/,Ae=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],
// YYYYMM is NOT allowed by the standard
["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],Be=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Ce=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=w("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),
// constant that refers to the ISO standard
a.ISO_8601=function(){};var De=w("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=rb.apply(null,arguments);return this.isValid()&&a.isValid()?this>a?this:a:n()}),Ee=w("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=rb.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:n()}),Fe=function(){return Date.now?Date.now():+new Date};xb("Z",":"),xb("ZZ",""),
// PARSING
Y("Z",Td),Y("ZZ",Td),aa(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=yb(Td,a)});
// HELPERS
// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var Ge=/([\+\-]|\d\d)/gi;
// HOOKS
// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
a.updateOffset=function(){};
// ASP.NET json date format regex
var He=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/,Ie=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;Mb.fn=vb.prototype;var Je=Rb(1,"add"),Ke=Rb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Le=w("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});
// FORMATTING
T(0,["gg",2],0,function(){return this.weekYear()%100}),T(0,["GG",2],0,function(){return this.isoWeekYear()%100}),xc("gggg","weekYear"),xc("ggggg","weekYear"),xc("GGGG","isoWeekYear"),xc("GGGGG","isoWeekYear"),
// ALIASES
I("weekYear","gg"),I("isoWeekYear","GG"),
// PRIORITY
L("weekYear",1),L("isoWeekYear",1),
// PARSING
Y("G",Rd),Y("g",Rd),Y("GG",Kd,Gd),Y("gg",Kd,Gd),Y("GGGG",Od,Id),Y("gggg",Od,Id),Y("GGGGG",Pd,Jd),Y("ggggg",Pd,Jd),ba(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=t(a)}),ba(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),
// FORMATTING
T("Q",0,"Qo","quarter"),
// ALIASES
I("quarter","Q"),
// PRIORITY
L("quarter",7),
// PARSING
Y("Q",Fd),aa("Q",function(a,b){b[Zd]=3*(t(a)-1)}),
// FORMATTING
T("D",["DD",2],"Do","date"),
// ALIASES
I("date","D"),
// PRIOROITY
L("date",9),
// PARSING
Y("D",Kd),Y("DD",Kd,Gd),Y("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),aa(["D","DD"],$d),aa("Do",function(a,b){b[$d]=t(a.match(Kd)[0],10)});
// MOMENTS
var Me=N("Date",!0);
// FORMATTING
T("DDD",["DDDD",3],"DDDo","dayOfYear"),
// ALIASES
I("dayOfYear","DDD"),
// PRIORITY
L("dayOfYear",4),
// PARSING
Y("DDD",Nd),Y("DDDD",Hd),aa(["DDD","DDDD"],function(a,b,c){c._dayOfYear=t(a)}),
// FORMATTING
T("m",["mm",2],0,"minute"),
// ALIASES
I("minute","m"),
// PRIORITY
L("minute",14),
// PARSING
Y("m",Kd),Y("mm",Kd,Gd),aa(["m","mm"],ae);
// MOMENTS
var Ne=N("Minutes",!1);
// FORMATTING
T("s",["ss",2],0,"second"),
// ALIASES
I("second","s"),
// PRIORITY
L("second",15),
// PARSING
Y("s",Kd),Y("ss",Kd,Gd),aa(["s","ss"],be);
// MOMENTS
var Oe=N("Seconds",!1);
// FORMATTING
T("S",0,0,function(){return~~(this.millisecond()/100)}),T(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),T(0,["SSS",3],0,"millisecond"),T(0,["SSSS",4],0,function(){return 10*this.millisecond()}),T(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),T(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),T(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),T(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),T(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),
// ALIASES
I("millisecond","ms"),
// PRIORITY
L("millisecond",16),
// PARSING
Y("S",Nd,Fd),Y("SS",Nd,Gd),Y("SSS",Nd,Hd);var Pe;for(Pe="SSSS";Pe.length<=9;Pe+="S")Y(Pe,Qd);for(Pe="S";Pe.length<=9;Pe+="S")aa(Pe,Gc);
// MOMENTS
var Qe=N("Milliseconds",!1);
// FORMATTING
T("z",0,0,"zoneAbbr"),T("zz",0,0,"zoneName");var Re=q.prototype;Re.add=Je,Re.calendar=Ub,Re.clone=Vb,Re.diff=ac,Re.endOf=mc,Re.format=ec,Re.from=fc,Re.fromNow=gc,Re.to=hc,Re.toNow=ic,Re.get=Q,Re.invalidAt=vc,Re.isAfter=Wb,Re.isBefore=Xb,Re.isBetween=Yb,Re.isSame=Zb,Re.isSameOrAfter=$b,Re.isSameOrBefore=_b,Re.isValid=tc,Re.lang=Le,Re.locale=jc,Re.localeData=kc,Re.max=Ee,Re.min=De,Re.parsingFlags=uc,Re.set=R,Re.startOf=lc,Re.subtract=Ke,Re.toArray=qc,Re.toObject=rc,Re.toDate=pc,Re.toISOString=dc,Re.toJSON=sc,Re.toString=cc,Re.unix=oc,Re.valueOf=nc,Re.creationData=wc,
// Year
Re.year=ke,Re.isLeapYear=qa,
// Week Year
Re.weekYear=yc,Re.isoWeekYear=zc,
// Quarter
Re.quarter=Re.quarters=Ec,
// Month
Re.month=ja,Re.daysInMonth=ka,
// Week
Re.week=Re.weeks=Aa,Re.isoWeek=Re.isoWeeks=Ba,Re.weeksInYear=Bc,Re.isoWeeksInYear=Ac,
// Day
Re.date=Me,Re.day=Re.days=Ja,Re.weekday=Ka,Re.isoWeekday=La,Re.dayOfYear=Fc,
// Hour
Re.hour=Re.hours=ue,
// Minute
Re.minute=Re.minutes=Ne,
// Second
Re.second=Re.seconds=Oe,
// Millisecond
Re.millisecond=Re.milliseconds=Qe,
// Offset
Re.utcOffset=Bb,Re.utc=Db,Re.local=Eb,Re.parseZone=Fb,Re.hasAlignedHourOffset=Gb,Re.isDST=Hb,Re.isLocal=Jb,Re.isUtcOffset=Kb,Re.isUtc=Lb,Re.isUTC=Lb,
// Timezone
Re.zoneAbbr=Hc,Re.zoneName=Ic,
// Deprecations
Re.dates=w("dates accessor is deprecated. Use date instead.",Me),Re.months=w("months accessor is deprecated. Use month instead",ja),Re.years=w("years accessor is deprecated. Use year instead",ke),Re.zone=w("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",Cb),Re.isDSTShifted=w("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Ib);var Se=Re,Te=B.prototype;Te.calendar=C,Te.longDateFormat=D,Te.invalidDate=E,Te.ordinal=F,Te.preparse=Lc,Te.postformat=Lc,Te.relativeTime=G,Te.pastFuture=H,Te.set=z,
// Month
Te.months=ea,Te.monthsShort=fa,Te.monthsParse=ha,Te.monthsRegex=ma,Te.monthsShortRegex=la,
// Week
Te.week=xa,Te.firstDayOfYear=za,Te.firstDayOfWeek=ya,
// Day of Week
Te.weekdays=Ea,Te.weekdaysMin=Ga,Te.weekdaysShort=Fa,Te.weekdaysParse=Ia,Te.weekdaysRegex=Ma,Te.weekdaysShortRegex=Na,Te.weekdaysMinRegex=Oa,
// Hours
Te.isPM=Ua,Te.meridiem=Va,Za("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===t(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),
// Side effect imports
a.lang=w("moment.lang is deprecated. Use moment.locale instead.",Za),a.langData=w("moment.langData is deprecated. Use moment.localeData instead.",ab);var Ue=Math.abs,Ve=cd("ms"),We=cd("s"),Xe=cd("m"),Ye=cd("h"),Ze=cd("d"),$e=cd("w"),_e=cd("M"),af=cd("y"),bf=ed("milliseconds"),cf=ed("seconds"),df=ed("minutes"),ef=ed("hours"),ff=ed("days"),gf=ed("months"),hf=ed("years"),jf=Math.round,kf={s:45,// seconds to minute
m:45,// minutes to hour
h:22,// hours to day
d:26,// days to month
M:11},lf=Math.abs,mf=vb.prototype;mf.abs=Uc,mf.add=Wc,mf.subtract=Xc,mf.as=ad,mf.asMilliseconds=Ve,mf.asSeconds=We,mf.asMinutes=Xe,mf.asHours=Ye,mf.asDays=Ze,mf.asWeeks=$e,mf.asMonths=_e,mf.asYears=af,mf.valueOf=bd,mf._bubble=Zc,mf.get=dd,mf.milliseconds=bf,mf.seconds=cf,mf.minutes=df,mf.hours=ef,mf.days=ff,mf.weeks=fd,mf.months=gf,mf.years=hf,mf.humanize=kd,mf.toISOString=ld,mf.toString=ld,mf.toJSON=ld,mf.locale=jc,mf.localeData=kc,
// Deprecations
mf.toIsoString=w("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",ld),mf.lang=Le,
// Side effect imports
// FORMATTING
T("X",0,0,"unix"),T("x",0,0,"valueOf"),
// PARSING
Y("x",Rd),Y("X",Ud),aa("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),aa("x",function(a,b,c){c._d=new Date(t(a))}),
// Side effect imports
a.version="2.14.1",b(rb),a.fn=Se,a.min=tb,a.max=ub,a.now=Fe,a.utc=j,a.unix=Jc,a.months=Pc,a.isDate=f,a.locale=Za,a.invalid=n,a.duration=Mb,a.isMoment=r,a.weekdays=Rc,a.parseZone=Kc,a.localeData=ab,a.isDuration=wb,a.monthsShort=Qc,a.weekdaysMin=Tc,a.defineLocale=$a,a.updateLocale=_a,a.locales=bb,a.weekdaysShort=Sc,a.normalizeUnits=J,a.relativeTimeRounding=id,a.relativeTimeThreshold=jd,a.calendarFormat=Tb,a.prototype=Se;var nf=a;return nf});
/*! version : 4.17.45
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
/*
 The MIT License (MIT)

 Copyright (c) 2015 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/*global define:false */
/*global exports:false */
/*global require:false */
/*global jQuery:false */
/*global moment:false */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), require('moment'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function ($, moment) {
    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }

    var dateTimePicker = function (element, options) {
        var picker = {},
            date,
            viewDate,
            unset = true,
            input,
            component = false,
            widget = false,
            use24Hours,
            minViewModeNumber = 0,
            actualFormat,
            parseFormats,
            currentViewMode,
            datePickerModes = [
                {
                    clsName: 'days',
                    navFnc: 'M',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 10
                },
                {
                    clsName: 'decades',
                    navFnc: 'y',
                    navStep: 100
                }
            ],
            viewModes = ['days', 'months', 'years', 'decades'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},

            /********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/

            hasTimeZone = function () {
                return moment.tz !== undefined && options.timeZone !== undefined && options.timeZone !== null && options.timeZone !== '';
            },

            getMoment = function (d) {
                var returnMoment;

                if (d === undefined || d === null) {
                    returnMoment = moment(); //TODO should this use format? and locale?
                } else if (moment.isDate(d) || moment.isMoment(d)) {
                    // If the date that is passed in is already a Date() or moment() object,
                    // pass it directly to moment.
                    returnMoment = moment(d);
                } else if (hasTimeZone()) { // There is a string to parse and a default time zone
                    // parse with the tz function which takes a default time zone if it is not in the format string
                    returnMoment = moment.tz(d, parseFormats, options.useStrict, options.timeZone);
                } else {
                    returnMoment = moment(d, parseFormats, options.useStrict);
                }

                if (hasTimeZone()) {
                    returnMoment.tz(options.timeZone);
                }

                return returnMoment;
            },

            isEnabled = function (granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().indexOf('d') !== -1;
                    case 'h':
                    case 'H':
                        return actualFormat.toLowerCase().indexOf('h') !== -1;
                    case 'm':
                        return actualFormat.indexOf('m') !== -1;
                    case 's':
                        return actualFormat.indexOf('s') !== -1;
                    default:
                        return false;
                }
            },

            hasTime = function () {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },

            hasDate = function () {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },

            getDatePickerTemplate = function () {
                var headTemplate = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                                )
                            .append($('<th>').addClass('picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', (options.calendarWeeks ? '6' : '5')))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                                )
                            ),
                    contTemplate = $('<tbody>')
                        .append($('<tr>')
                            .append($('<td>').attr('colspan', (options.calendarWeeks ? '8' : '7')))
                            );

                return [
                    $('<div>').addClass('datepicker-days')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate)
                            .append($('<tbody>'))
                            ),
                    $('<div>').addClass('datepicker-months')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            ),
                    $('<div>').addClass('datepicker-years')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            ),
                    $('<div>').addClass('datepicker-decades')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                            )
                ];
            },

            getTimePickerMainTemplate = function () {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');

                if (isEnabled('h')) {
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementHour }).addClass('btn').attr('data-action', 'incrementHours').append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-hour').attr({ 'data-time-component': 'hours', 'title': options.tooltips.pickHour }).attr('data-action', 'showHours')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementHour }).addClass('btn').attr('data-action', 'decrementHours').append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementMinute }).addClass('btn').attr('data-action', 'incrementMinutes')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-minute').attr({ 'data-time-component': 'minutes', 'title': options.tooltips.pickMinute }).attr('data-action', 'showMinutes')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementMinute }).addClass('btn').attr('data-action', 'decrementMinutes')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementSecond }).addClass('btn').attr('data-action', 'incrementSeconds')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-second').attr({ 'data-time-component': 'seconds', 'title': options.tooltips.pickSecond }).attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementSecond }).addClass('btn').attr('data-action', 'decrementSeconds')
                            .append($('<span>').addClass(options.icons.down))));
                }

                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>')
                        .append($('<button>').addClass('btn btn-primary').attr({ 'data-action': 'togglePeriod', tabindex: '-1', 'title': options.tooltips.togglePeriod })));
                    bottomRow.append($('<td>').addClass('separator'));
                }

                return $('<div>').addClass('timepicker-picker')
                    .append($('<table>').addClass('table-condensed')
                        .append([topRow, middleRow, bottomRow]));
            },

            getTimePickerTemplate = function () {
                var hoursView = $('<div>').addClass('timepicker-hours')
                        .append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes')
                        .append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds')
                        .append($('<table>').addClass('table-condensed')),
                    ret = [getTimePickerMainTemplate()];

                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView);
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }

                return ret;
            },

            getToolbar = function () {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'today', 'title': options.tooltips.today }).append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'togglePicker', 'title': options.tooltips.selectTime }).append($('<span>').addClass(options.icons.time))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'clear', 'title': options.tooltips.clear }).append($('<span>').addClass(options.icons.clear))));
                }
                if (options.showClose) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'close', 'title': options.tooltips.close }).append($('<span>').addClass(options.icons.close))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },

            getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());

                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }

                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }

                if (isEnabled('s') && !use24Hours) {
                    template.addClass('wider');
                }

                if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    if (options.toolbarPlacement === 'top') {
                        template.append(toolbar);
                    }
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-md-6'))
                            .append(timeView.addClass('col-md-6'))
                    );
                    if (options.toolbarPlacement === 'bottom') {
                        template.append(toolbar);
                    }
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },

            dataToOptions = function () {
                var eData,
                    dataOptions = {};

                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },

            place = function () {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal = options.widgetPositioning.horizontal,
                    parent;

                if (options.widgetParent) {
                    parent = options.widgetParent.append(widget);
                } else if (element.is('input')) {
                    parent = element.after(widget).parent();
                } else if (options.inline) {
                    parent = element.append(widget);
                    return;
                } else {
                    parent = element;
                    element.children().first().after(widget);
                }

                // Top and bottom logic
                if (vertical === 'auto') {
                    if (offset.top + widget.height() * 1.5 >= $(window).height() + $(window).scrollTop() &&
                        widget.height() + element.outerHeight() < offset.top) {
                        vertical = 'top';
                    } else {
                        vertical = 'bottom';
                    }
                }

                // Left and right logic
                if (horizontal === 'auto') {
                    if (parent.width() < offset.left + widget.outerWidth() / 2 &&
                        offset.left + widget.outerWidth() > $(window).width()) {
                        horizontal = 'right';
                    } else {
                        horizontal = 'left';
                    }
                }

                if (vertical === 'top') {
                    widget.addClass('top').removeClass('bottom');
                } else {
                    widget.addClass('bottom').removeClass('top');
                }

                if (horizontal === 'right') {
                    widget.addClass('pull-right');
                } else {
                    widget.removeClass('pull-right');
                }

                // find the first parent element that has a non-static css positioning
                if (parent.css('position') === 'static') {
                    parent = parent.parents().filter(function () {
                        return $(this).css('position') !== 'static';
                    }).first();
                }

                if (parent.length === 0) {
                    throw new Error('datetimepicker component should be placed within a non-static positioned container');
                }

                widget.css({
                    top: vertical === 'top' ? 'auto' : position.top + element.outerHeight(),
                    bottom: vertical === 'top' ? parent.outerHeight() - (parent === element ? 0 : position.top) : 'auto',
                    left: horizontal === 'left' ? (parent === element ? 0 : position.left) : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.outerWidth() - element.outerWidth() - (parent === element ? 0 : position.left)
                });

                // Creative Tim Changes - we add after 180 ms the ".open" class, in this way the animations will be the same with the other dropdowns from the
                setTimeout(function(){
                    widget.addClass('open');
                }, 180);

            },

            notifyEvent = function (e) {
                if (e.type === 'dp.change' && ((e.date && e.date.isSame(e.oldDate)) || (!e.date && !e.oldDate))) {
                    return;
                }
                element.trigger(e);
            },

            viewUpdate = function (e) {
                if (e === 'y') {
                    e = 'YYYY';
                }
                notifyEvent({
                    type: 'dp.update',
                    change: e,
                    viewDate: viewDate.clone()
                });
            },

            showMode = function (dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(3, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
            },

            fillDow = function () {
                var row = $('<tr>'),
                    currentDate = viewDate.clone().startOf('w').startOf('d');

                if (options.calendarWeeks === true) {
                    row.append($('<th>').addClass('cw').text('#'));
                }

                while (currentDate.isBefore(viewDate.clone().endOf('w'))) {
                    row.append($('<th>').addClass('dow').text(currentDate.format('dd')));
                    currentDate.add(1, 'd');
                }
                widget.find('.datepicker-days thead').append(row);
            },

            isInDisabledDates = function (testDate) {
                return options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInEnabledDates = function (testDate) {
                return options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInDisabledHours = function (testDate) {
                return options.disabledHours[testDate.format('H')] === true;
            },

            isInEnabledHours = function (testDate) {
                return options.enabledHours[testDate.format('H')] === true;
            },

            isValid = function (targetMoment, granularity) {
                if (!targetMoment.isValid()) {
                    return false;
                }
                if (options.disabledDates && granularity === 'd' && isInDisabledDates(targetMoment)) {
                    return false;
                }
                if (options.enabledDates && granularity === 'd' && !isInEnabledDates(targetMoment)) {
                    return false;
                }
                if (options.minDate && targetMoment.isBefore(options.minDate, granularity)) {
                    return false;
                }
                if (options.maxDate && targetMoment.isAfter(options.maxDate, granularity)) {
                    return false;
                }
                if (options.daysOfWeekDisabled && granularity === 'd' && options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) {
                    return false;
                }
                if (options.disabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && isInDisabledHours(targetMoment)) {
                    return false;
                }
                if (options.enabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && !isInEnabledHours(targetMoment)) {
                    return false;
                }
                if (options.disabledTimeIntervals && (granularity === 'h' || granularity === 'm' || granularity === 's')) {
                    var found = false;
                    $.each(options.disabledTimeIntervals, function () {
                        if (targetMoment.isBetween(this[0], this[1])) {
                            found = true;
                            return false;
                        }
                    });
                    if (found) {
                        return false;
                    }
                }
                return true;
            },

            fillMonths = function () {
                var spans = [],
                    monthsShort = viewDate.clone().startOf('y').startOf('d');
                while (monthsShort.isSame(viewDate, 'y')) {
                    spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort.format('MMM')));
                    monthsShort.add(1, 'M');
                }
                widget.find('.datepicker-months td').empty().append(spans);
            },

            updateMonths = function () {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');

                monthsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevYear);
                monthsViewHeader.eq(1).attr('title', options.tooltips.selectYear);
                monthsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextYear);

                monthsView.find('.disabled').removeClass('disabled');

                if (!isValid(viewDate.clone().subtract(1, 'y'), 'y')) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }

                monthsViewHeader.eq(1).text(viewDate.year());

                if (!isValid(viewDate.clone().add(1, 'y'), 'y')) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }

                months.removeClass('active');
                if (date.isSame(viewDate, 'y') && !unset) {
                    months.eq(date.month()).addClass('active');
                }

                months.each(function (index) {
                    if (!isValid(viewDate.clone().month(index), 'M')) {
                        $(this).addClass('disabled');
                    }
                });
            },

            updateYears = function () {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    startYear = viewDate.clone().subtract(5, 'y'),
                    endYear = viewDate.clone().add(6, 'y'),
                    html = '';

                yearsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevDecade);
                yearsViewHeader.eq(1).attr('title', options.tooltips.selectDecade);
                yearsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextDecade);

                yearsView.find('.disabled').removeClass('disabled');

                if (options.minDate && options.minDate.isAfter(startYear, 'y')) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }

                yearsViewHeader.eq(1).text(startYear.year() + '-' + endYear.year());

                if (options.maxDate && options.maxDate.isBefore(endYear, 'y')) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }

                while (!startYear.isAfter(endYear, 'y')) {
                    html += '<span data-action="selectYear" class="year' + (startYear.isSame(date, 'y') && !unset ? ' active' : '') + (!isValid(startYear, 'y') ? ' disabled' : '') + '">' + startYear.year() + '</span>';
                    startYear.add(1, 'y');
                }

                yearsView.find('td').html(html);
            },

            updateDecades = function () {
                var decadesView = widget.find('.datepicker-decades'),
                    decadesViewHeader = decadesView.find('th'),
                    startDecade = moment({ y: viewDate.year() - (viewDate.year() % 100) - 1 }),
                    endDecade = startDecade.clone().add(100, 'y'),
                    startedAt = startDecade.clone(),
                    minDateDecade = false,
                    maxDateDecade = false,
                    endDecadeYear,
                    html = '';

                decadesViewHeader.eq(0).find('span').attr('title', options.tooltips.prevCentury);
                decadesViewHeader.eq(2).find('span').attr('title', options.tooltips.nextCentury);

                decadesView.find('.disabled').removeClass('disabled');

                if (startDecade.isSame(moment({ y: 1900 })) || (options.minDate && options.minDate.isAfter(startDecade, 'y'))) {
                    decadesViewHeader.eq(0).addClass('disabled');
                }

                decadesViewHeader.eq(1).text(startDecade.year() + '-' + endDecade.year());

                if (startDecade.isSame(moment({ y: 2000 })) || (options.maxDate && options.maxDate.isBefore(endDecade, 'y'))) {
                    decadesViewHeader.eq(2).addClass('disabled');
                }

                while (!startDecade.isAfter(endDecade, 'y')) {
                    endDecadeYear = startDecade.year() + 12;
                    minDateDecade = options.minDate && options.minDate.isAfter(startDecade, 'y') && options.minDate.year() <= endDecadeYear;
                    maxDateDecade = options.maxDate && options.maxDate.isAfter(startDecade, 'y') && options.maxDate.year() <= endDecadeYear;
                    html += '<span data-action="selectDecade" class="decade' + (date.isAfter(startDecade) && date.year() <= endDecadeYear ? ' active' : '') +
                        (!isValid(startDecade, 'y') && !minDateDecade && !maxDateDecade ? ' disabled' : '') + '" data-selection="' + (startDecade.year() + 6) + '">' + (startDecade.year() + 1) + ' - ' + (startDecade.year() + 12) + '</span>';
                    startDecade.add(12, 'y');
                }
                html += '<span></span><span></span><span></span>'; //push the dangling block over, at least this way it's even

                decadesView.find('td').html(html);
                decadesViewHeader.eq(1).text((startedAt.year() + 1) + '-' + (startDecade.year()));
            },

            fillDate = function () {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
                    currentDate,
                    html = [],
                    row,
                    clsNames = [],
                    i;

                if (!hasDate()) {
                    return;
                }

                daysViewHeader.eq(0).find('span').attr('title', options.tooltips.prevMonth);
                daysViewHeader.eq(1).attr('title', options.tooltips.selectMonth);
                daysViewHeader.eq(2).find('span').attr('title', options.tooltips.nextMonth);

                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(viewDate.format(options.dayViewHeaderFormat));

                if (!isValid(viewDate.clone().subtract(1, 'M'), 'M')) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (!isValid(viewDate.clone().add(1, 'M'), 'M')) {
                    daysViewHeader.eq(2).addClass('disabled');
                }

                currentDate = viewDate.clone().startOf('M').startOf('w').startOf('d');

                for (i = 0; i < 42; i++) { //always display 42 days (should show 6 weeks)
                    if (currentDate.weekday() === 0) {
                        row = $('<tr>');
                        if (options.calendarWeeks) {
                            row.append('<td class="cw">' + currentDate.week() + '</td>');
                        }
                        html.push(row);
                    }
                    clsNames = ['day'];
                    if (currentDate.isBefore(viewDate, 'M')) {
                        clsNames.push('old');
                    }
                    if (currentDate.isAfter(viewDate, 'M')) {
                        clsNames.push('new');
                    }
                    if (currentDate.isSame(date, 'd') && !unset) {
                        clsNames.push('active');
                    }
                    if (!isValid(currentDate, 'd')) {
                        clsNames.push('disabled');
                    }
                    if (currentDate.isSame(getMoment(), 'd')) {
                        clsNames.push('today');
                    }
                    if (currentDate.day() === 0 || currentDate.day() === 6) {
                        clsNames.push('weekend');
                    }
                    notifyEvent({
                        type: 'dp.classify',
                        date: currentDate,
                        classNames: clsNames
                    });

                    // Creative Tim - we added a div inside each td for design purposes
                    row.append('<td data-action="selectDay" data-day="' + currentDate.format('L') + '" class="' + clsNames.join(' ') + '"><div>' + currentDate.date() + '</div></td>');
                    currentDate.add(1, 'd');
                }

                daysView.find('tbody').empty().append(html);

                updateMonths();

                updateYears();

                updateDecades();
            },

            fillHours = function () {
                var table = widget.find('.timepicker-hours table'),
                    currentHour = viewDate.clone().startOf('d'),
                    html = [],
                    row = $('<tr>');

                if (viewDate.hour() > 11 && !use24Hours) {
                    currentHour.hour(12);
                }
                while (currentHour.isSame(viewDate, 'd') && (use24Hours || (viewDate.hour() < 12 && currentHour.hour() < 12) || viewDate.hour() > 11)) {
                    if (currentHour.hour() % 4 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    // Creative Tim - we added a div inside each class hour for design purposes
                    row.append('<td data-action="selectHour" class="hour' + (!isValid(currentHour, 'h') ? ' disabled' : '') + '"><div>' + currentHour.format(use24Hours ? 'HH' : 'hh') + '</div></td>');
                    currentHour.add(1, 'h');
                }
                table.empty().append(html);
            },

            fillMinutes = function () {
                var table = widget.find('.timepicker-minutes table'),
                    currentMinute = viewDate.clone().startOf('h'),
                    html = [],
                    row = $('<tr>'),
                    step = options.stepping === 1 ? 5 : options.stepping;

                while (viewDate.isSame(currentMinute, 'h')) {
                    if (currentMinute.minute() % (step * 4) === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    // Creative Tim - we added a div inside each class minute for design purposes
                    row.append('<td data-action="selectMinute" class="minute' + (!isValid(currentMinute, 'm') ? ' disabled' : '') + '"><div>' + currentMinute.format('mm') + '</div></td>');
                    currentMinute.add(step, 'm');
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');

                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    // Creative Tim - we added a div inside each class seconds for design purposes
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '"><div>' + currentSecond.format('ss') + '</div></td>');
                    currentSecond.add(5, 's');
                }

                table.empty().append(html);
            },

            fillTime = function () {
                var toggle, newDate, timeComponents = widget.find('.timepicker span[data-time-component]');

                if (!use24Hours) {
                    toggle = widget.find('.timepicker [data-action=togglePeriod]');
                    newDate = date.clone().add((date.hours() >= 12) ? -12 : 12, 'h');

                    toggle.text(date.format('A'));

                    if (isValid(newDate, 'h')) {
                        toggle.removeClass('disabled');
                    } else {
                        toggle.addClass('disabled');
                    }
                }
                timeComponents.filter('[data-time-component=hours]').text(date.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(date.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(date.format('ss'));

                fillHours();
                fillMinutes();
                fillSeconds();
            },

            update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },

            setValue = function (targetMoment) {
                var oldDate = unset ? null : date;

                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: false,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }

                targetMoment = targetMoment.clone().locale(options.locale);

                if (hasTimeZone()) {
                    targetMoment.tz(options.timeZone);
                }

                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping)).seconds(0);

                    while (options.minDate && targetMoment.isBefore(options.minDate)) {
                        targetMoment.add(options.stepping, 'minutes');
                    }
                }

                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    input.val(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    unset = false;
                    update();
                    notifyEvent({
                        type: 'dp.change',
                        date: date.clone(),
                        oldDate: oldDate
                    });
                } else {
                    if (!options.keepInvalid) {
                        input.val(unset ? '' : date.format(actualFormat));
                    } else {
                        notifyEvent({
                            type: 'dp.change',
                            date: targetMoment,
                            oldDate: oldDate
                        });
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment,
                        oldDate: oldDate
                    });
                }
            },

            /**
             * Hides the widget. Possibly will emit dp.hide
             */
            hide = function () {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                // Creative Tim Changes - we remove the ".open" class, then, fter 400 ms call the .hide() method, in this way the animations will be the same with the other dropdowns from the dashboard

                widget.removeClass('open');

                setTimeout(function(){
                    widget.remove();
                    widget.hide();

                    widget = false;

                    notifyEvent({
                        type: 'dp.hide',
                        date: date.clone()
                    });

                    input.blur();

                    currentViewMode = 0;
                    viewDate = date.clone();

                    return picker;
                },400);
            },

            clear = function () {
                setValue(null);
            },

            parseInputDate = function (inputDate) {
                if (options.parseInputDate === undefined) {
                    if (!moment.isMoment(inputDate) || inputDate instanceof Date) {
                        inputDate = getMoment(inputDate);
                    }
                } else {
                    inputDate = options.parseInputDate(inputDate);
                }
                //inputDate.locale(options.locale);
                return inputDate;
            },

            /********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
                next: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                previous: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                pickerSwitch: function () {
                    showMode(1);
                },

                selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('M');
                },

                selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },

                selectDecade: function (e) {
                    var year = parseInt($(e.target).data('selection'), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },

                selectDay: function (e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    setValue(day.date(parseInt($(e.target).text(), 10)));
                    if (!hasTime() && !options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                incrementHours: function () {
                    var newDate = date.clone().add(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                incrementMinutes: function () {
                    var newDate = date.clone().add(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                incrementSeconds: function () {
                    var newDate = date.clone().add(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                decrementHours: function () {
                    var newDate = date.clone().subtract(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                decrementMinutes: function () {
                    var newDate = date.clone().subtract(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                decrementSeconds: function () {
                    var newDate = date.clone().subtract(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                togglePeriod: function () {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },

                togglePicker: function (e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;

                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        if (expanded.collapse) { // if collapse plugin is available through bootstrap.js then use it
                            expanded.collapse('hide');
                            closed.collapse('show');
                        } else { // otherwise just toggle in class on the two views
                            expanded.removeClass('in');
                            closed.addClass('in');
                        }
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }

                        // NOTE: uncomment if toggled state will be restored in show()
                        //if (component) {
                        //    component.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        //}
                    }
                },

                showPicker: function () {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },

                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },

                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },

                selectHour: function (e) {
                    var hour = parseInt($(e.target).text(), 10);

                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }
                    setValue(date.clone().hours(hour));
                    actions.showPicker.call(picker);
                },

                selectMinute: function (e) {
                    setValue(date.clone().minutes(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                selectSecond: function (e) {
                    setValue(date.clone().seconds(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                clear: clear,

                today: function () {
                    var todaysDate = getMoment();
                    if (isValid(todaysDate, 'd')) {
                        setValue(todaysDate);
                    }
                },

                close: hide
            },

            doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },

            /**
             * Shows the widget. Possibly will emit dp.show and dp.change
             */
            show = function () {
                var currentMoment,
                    useCurrentGranularity = {
                        'year': function (m) {
                            return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                        },
                        'month': function (m) {
                            return m.date(1).hours(0).seconds(0).minutes(0);
                        },
                        'day': function (m) {
                            return m.hours(0).seconds(0).minutes(0);
                        },
                        'hour': function (m) {
                            return m.seconds(0).minutes(0);
                        },
                        'minute': function (m) {
                            return m.seconds(0);
                        }
                    };

                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (input.val() !== undefined && input.val().trim().length !== 0) {
                    setValue(parseInputDate(input.val().trim()));
                } else if (unset && options.useCurrent && (options.inline || (input.is('input') && input.val().trim().length === 0))) {
                    currentMoment = getMoment();
                    if (typeof options.useCurrent === 'string') {
                        currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    }
                    setValue(currentMoment);
                }
                widget = getTemplate();

                fillDow();
                fillMonths();

                widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();

                update();
                showMode();

                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
                widget.on('mousedown', false);

                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                place();
                widget.show();
                if (options.focusOnShow && !input.is(':focus')) {
                    input.focus();
                }

                notifyEvent({
                    type: 'dp.show'
                });
                return picker;
            },

            /**
             * Shows or hides the widget
             */
            toggle = function () {
                return (widget ? hide() : show());
            },

            keydown = function (e) {
                var handler = null,
                    index,
                    index2,
                    pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys,
                    allModifiersPressed,
                    pressed = 'p';

                keyState[currentKey] = pressed;

                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }

                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof (options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }

                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },

            keyup = function (e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },

            change = function (e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },

            attachDatePickerElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? show : ''
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },

            detachDatePickerElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': blur,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? hide : ''
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },

            indexGivenDates = function (givenDatesArray) {
                // Store given enabledDates and disabledDates as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledDates['2014-02-27'] === true)
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function () {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },

            indexGivenHours = function (givenHoursArray) {
                // Store given enabledHours and disabledHours as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledHours['2014-02-27'] === true)
                var givenHoursIndexed = {};
                $.each(givenHoursArray, function () {
                    givenHoursIndexed[this] = true;
                });
                return (Object.keys(givenHoursIndexed).length) ? givenHoursIndexed : false;
            },

            initFormatting = function () {
                var format = options.format || 'L LT';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput2) { //temp fix for #740
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });


                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.replace(/\[.*?\]/g, '').indexOf('h') < 1);

                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(date);
                }
            };

        /********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
        picker.destroy = function () {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };

        picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;

        picker.disable = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };

        picker.enable = function () {
            ///<summary>Enables the input element, the component is attached to, by removing disabled attribute from it.</summary>
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };

        picker.ignoreReadonly = function (ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };

        picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };

        picker.date = function (newDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.date">
            ///<summary>Returns the component's model current date, a moment object or null if not set.</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Sets the components model current moment to it. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.</summary>
            ///<param name="newDate" locid="$.fn.datetimepicker.date_p:newDate">Takes string, Date, moment, null parameter.</param>
            ///</signature>
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        };

        picker.format = function (newFormat) {
            ///<summary>test su</summary>
            ///<param name="newFormat">info about para</param>
            ///<returns type="string|boolean">returns foo</returns>
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a string or boolean:false parameter ' + newFormat);
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.timeZone = function (newZone) {
            if (arguments.length === 0) {
                return options.timeZone;
            }

            if (typeof newZone !== 'string') {
                throw new TypeError('newZone() expects a string parameter');
            }

            options.timeZone = newZone;

            return picker;
        };

        picker.dayViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }

            options.dayViewHeaderFormat = newFormat;
            return picker;
        };

        picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.disabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledDates">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };

        picker.enabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledDates">
            ///<summary>Returns an array with the currently set enabled dates on the component.</summary>
            ///<returns type="array">options.enabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.enabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };

        picker.daysOfWeekDisabled = function (daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }

            if ((typeof daysOfWeekDisabled === 'boolean') && !daysOfWeekDisabled) {
                options.daysOfWeekDisabled = false;
                update();
                return picker;
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'd')) {
                    date.add(1, 'd');
                    if (tries === 31) {
                        throw 'Tried 31 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.maxDate = function (maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isAfter(maxDate)) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone().subtract(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.minDate = function (minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isBefore(minDate)) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone().add(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.defaultDate = function (defaultDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.defaultDate">
            ///<summary>Returns a moment with the options.defaultDate option configuration or false if not set</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Will set the picker's inital date. If a boolean:false value is passed the options.defaultDate parameter is cleared.</summary>
            ///<param name="defaultDate" locid="$.fn.datetimepicker.defaultDate_p:defaultDate">Takes a string, Date, moment, boolean:false</param>
            ///</signature>
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = getMoment();
                } else {
                    defaultDate = getMoment(defaultDate);
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            options.defaultDate = parsedDate;

            if ((options.defaultDate && options.inline) || input.val().trim() === '') {
                setValue(options.defaultDate);
            }
            return picker;
        };

        picker.locale = function (locale) {
            if (arguments.length === 0) {
                return options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }

            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);

            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.stepping = function (stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        };

        picker.useCurrent = function (useCurrent) {
            var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return options.useCurrent;
            }

            if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
            }
            options.useCurrent = useCurrent;
            return picker;
        };

        picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.tooltips = function (tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, options.tooltips);
            }

            if (!(tooltips instanceof Object)) {
                throw new TypeError('tooltips() expects parameter to be an Object');
            }
            $.extend(options.tooltips, tooltips);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.useStrict = function (useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };

        picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.viewMode = function (viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);

            showMode();
            return picker;
        };

        picker.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };

        picker.calendarWeeks = function (calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        };

        picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function (showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };

        picker.focusOnShow = function (focusOnShow) {
            if (arguments.length === 0) {
                return options.focusOnShow;
            }

            if (typeof focusOnShow !== 'boolean') {
                throw new TypeError('focusOnShow() expects a boolean parameter');
            }

            options.focusOnShow = focusOnShow;
            return picker;
        };

        picker.inline = function (inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            options.inline = inline;
            return picker;
        };

        picker.clear = function () {
            clear();
            return picker;
        };

        picker.keyBinds = function (keyBinds) {
            if (arguments.length === 0) {
                return options.keyBinds;
            }

            options.keyBinds = keyBinds;
            return picker;
        };

        picker.getMoment = function (d) {
            return getMoment(d);
        };

        picker.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            options.debug = debug;
            return picker;
        };

        picker.allowInputToggle = function (allowInputToggle) {
            if (arguments.length === 0) {
                return options.allowInputToggle;
            }

            if (typeof allowInputToggle !== 'boolean') {
                throw new TypeError('allowInputToggle() expects a boolean parameter');
            }

            options.allowInputToggle = allowInputToggle;
            return picker;
        };

        picker.showClose = function (showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }

            if (typeof showClose !== 'boolean') {
                throw new TypeError('showClose() expects a boolean parameter');
            }

            options.showClose = showClose;
            return picker;
        };

        picker.keepInvalid = function (keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };

        picker.datepickerInput = function (datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            options.datepickerInput = datepickerInput;
            return picker;
        };

        picker.parseInputDate = function (parseInputDate) {
            if (arguments.length === 0) {
                return options.parseInputDate;
            }

            if (typeof parseInputDate !== 'function') {
                throw new TypeError('parseInputDate() sholud be as function');
            }

            options.parseInputDate = parseInputDate;

            return picker;
        };

        picker.disabledTimeIntervals = function (disabledTimeIntervals) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledTimeIntervals">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledTimeIntervals</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledTimeIntervals_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledTimeIntervals ? $.extend({}, options.disabledTimeIntervals) : options.disabledTimeIntervals);
            }

            if (!disabledTimeIntervals) {
                options.disabledTimeIntervals = false;
                update();
                return picker;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError('disabledTimeIntervals() expects an array parameter');
            }
            options.disabledTimeIntervals = disabledTimeIntervals;
            update();
            return picker;
        };

        picker.disabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledHours">
            ///<summary>Returns an array with the currently set disabled hours on the component.</summary>
            ///<returns type="array">options.disabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.disabledHours_p:hours">Takes an [ int ] of values and disallows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledHours ? $.extend({}, options.disabledHours) : options.disabledHours);
            }

            if (!hours) {
                options.disabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('disabledHours() expects an array parameter');
            }
            options.disabledHours = indexGivenHours(hours);
            options.enabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.enabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledHours">
            ///<summary>Returns an array with the currently set enabled hours on the component.</summary>
            ///<returns type="array">options.enabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.enabledHours_p:hours">Takes an [ int ] of values and allows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledHours ? $.extend({}, options.enabledHours) : options.enabledHours);
            }

            if (!hours) {
                options.enabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('enabledHours() expects an array parameter');
            }
            options.enabledHours = indexGivenHours(hours);
            options.disabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        /**
         * Returns the component's model current viewDate, a moment object or null if not set. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.
         * @param {Takes string, viewDate, moment, null parameter.} newDate
         * @returns {viewDate.clone()}
         */
        picker.viewDate = function (newDate) {
            if (arguments.length === 0) {
                return viewDate.clone();
            }

            if (!newDate) {
                viewDate = date.clone();
                return picker;
            }

            if (typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('viewDate() parameter must be one of [string, moment or Date]');
            }

            viewDate = parseInputDate(newDate);
            viewUpdate();
            return picker;
        };

        // initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find(options.datepickerInput);
            if (input.length === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').length === 0) {
                component = element.find('.input-group-addon');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }

        // Set defaults for date here now instead of in var declaration
        date = getMoment();
        viewDate = date.clone();

        $.extend(true, options, dataToOptions());

        picker.options(options);

        initFormatting();

        attachDatePickerElementEvents();

        if (input.prop('disabled')) {
            picker.disable();
        }
        if (input.is('input') && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        }
        else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };

    /********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    /**
    * See (http://jquery.com/).
    * @name jQuery
    * @class
    * See the jQuery Library  (http://jquery.com/) for full details.  This just
    * documents the function and classes that are added to jQuery by this plug-in.
    */
    /**
     * See (http://jquery.com/)
     * @name fn
     * @class
     * See the jQuery Library  (http://jquery.com/) for full details.  This just
     * documents the function and classes that are added to jQuery by this plug-in.
     * @memberOf jQuery
     */
    /**
     * Show comments
     * @class datetimepicker
     * @memberOf jQuery.fn
     */
    $.fn.datetimepicker = function (options) {
        options = options || {};

        var args = Array.prototype.slice.call(arguments, 1),
            isInstance = true,
            thisMethods = ['destroy', 'hide', 'show', 'toggle'],
            returnValue;

        if (typeof options === 'object') {
            return this.each(function () {
                var $this = $(this),
                    _options;
                if (!$this.data('DateTimePicker')) {
                    // create a private copy of the defaults object
                    _options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                    $this.data('DateTimePicker', dateTimePicker($this, _options));
                }
            });
        } else if (typeof options === 'string') {
            this.each(function () {
                var $this = $(this),
                    instance = $this.data('DateTimePicker');
                if (!instance) {
                    throw new Error('bootstrap-datetimepicker("' + options + '") method was called on an element that is not using DateTimePicker');
                }

                returnValue = instance[options].apply(instance, args);
                isInstance = returnValue === instance;
            });

            if (isInstance || $.inArray(options, thisMethods) > -1) {
                return this;
            }

            return returnValue;
        }

        throw new TypeError('Invalid arguments for DateTimePicker: ' + options);
    };

    $.fn.datetimepicker.defaults = {
        timeZone: '',
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            clear: 'glyphicon glyphicon-trash',
            close: 'glyphicon glyphicon-remove'
        },
        tooltips: {
            today: 'Go to today',
            clear: 'Clear selection',
            close: 'Close the picker',
            selectMonth: 'Select Month',
            prevMonth: 'Previous Month',
            nextMonth: 'Next Month',
            selectYear: 'Select Year',
            prevYear: 'Previous Year',
            nextYear: 'Next Year',
            selectDecade: 'Select Decade',
            prevDecade: 'Previous Decade',
            nextDecade: 'Next Decade',
            prevCentury: 'Previous Century',
            nextCentury: 'Next Century',
            pickHour: 'Pick Hour',
            incrementHour: 'Increment Hour',
            decrementHour: 'Decrement Hour',
            pickMinute: 'Pick Minute',
            incrementMinute: 'Increment Minute',
            decrementMinute: 'Decrement Minute',
            pickSecond: 'Pick Second',
            incrementSecond: 'Increment Second',
            decrementSecond: 'Decrement Second',
            togglePeriod: 'Toggle Period',
            selectTime: 'Select Time'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: false,
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: false,
        keepOpen: false,
        focusOnShow: true,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(this.stepping(), 'm'));
                }
            },
            down: function (widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(this.stepping(), 'm'));
                }
            },
            'control up': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function () {
                this.hide();
            },
            escape: function () {
                this.hide();
            },
            //tab: function (widget) { //this break the flow of the form. disabling for now
            //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
            //    if(toggle.length > 0) toggle.click();
            //},
            'control space': function (widget) {
                if (!widget) {
                    return;
                }
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function () {
                this.date(this.getMoment());
            },
            'delete': function () {
                this.clear();
            }
        },
        debug: false,
        allowInputToggle: false,
        disabledTimeIntervals: false,
        disabledHours: false,
        enabledHours: false,
        viewDate: false
    };

    return $.fn.datetimepicker;
}));
function admin_businesses(){
  $('#business_joining_date').flatpickr({
    dateFormat: 'd-m-Y'
  })

  $('#contact_nos').on('cocoon:before-insert', function(e, nu_to_be_added) {
    // nu_to_be_added.find('select').dropdown();
  })

  $('#addresses').on('cocoon:before-insert', function(e, addr_to_be_added) {
    // addr_to_be_added.find('select').dropdown();
  })

  $('#addresses').on('change', 'select', function(e){
    var ele = $(this), container, f_select;

    if(!ele.val()){
      return;
    }

    container = ele.parents('.state-city');
    f_select = ele.parents();


    if(f_select.hasClass('business_addresses_state_id')){
      updateSelectBox('/admin/states/'+ ele.val() +'/cities', 'city_id', container, 'Select City');

      var l_select = container.find('.business_addresses_locality_id select');
      l_select.html( "<option>Select Locality</option>");
      //l_select.val('');
      //l_select.dropdown('refresh');
      //l_select.dropdown('set placeholderText', 'Select Locality');

    } else if(f_select.hasClass('business_addresses_city_id')){
      updateSelectBox('/admin/cities/'+ ele.val() +'/localities', 'locality_id', container, 'Select Locality');
    }
  })

  function updateSelectBox(url, type, container, placeholderText){
    $.getJSON(url, function(data){
      var select = container.find('.business_addresses_'+ type + ' select');
      var menu = container.find('.business_addresses_'+ type +' .menu');

      menu.html('');
      var options = "<option>"+ placeholderText + "</option>";

      $.each(data, function(d){
        options = options + '<option value="'+ this.id+'">'+ this.name +'</option>';
      })

      select.html(options);
      // select.dropdown('refresh');
      // select.dropdown('set placeholderText', placeholderText);
    })
  }
}

;
(function() {


}).call(this);
/*!

  =========================================================
  * Paper Dashboard PRO - V1.2.1
  =========================================================

  * Product Page: https://www.creative-tim.com/product/paper-dashboard-pro
  * Available with purchase of license from https://www.creative-tim.com/product/paper-dashboard-pro
  * Copyright 2017 Creative Tim (https://www.creative-tim.com)
  * License Creative Tim (https://www.creative-tim.com/license)

  =========================================================

*/


var fixedTop = false;

var mobile_menu_visible = 0,
    mobile_menu_initialized = false,
    toggle_initialized = false,
    bootstrap_nav_initialized = false,
    $sidebar,
    isWindows;

function initPefectScroll(){
    isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

    if (isWindows){
       // if we are on windows OS we activate the perfectScrollbar function
       $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();

       $('html').addClass('perfect-scrollbar-on');
   } else {
       $('html').addClass('perfect-scrollbar-off');
   }
};

//$(document).ready(function(){
//  initPaperTheme();
//})

function initPaperTheme(){
    fixedTop = false;
    mobile_menu_visible = 0;
    mobile_menu_initialized = false;
    toggle_initialized = false;
    bootstrap_nav_initialized = false;

    initPefectScroll();
    window_width = $(window).width();
    $sidebar = $('.sidebar');

    // We put modals out of wrapper to working properly
    $('.modal').appendTo("body");

    if($('body').hasClass('sidebar-mini')){
        pdp.misc.sidebar_mini_active = true;
    }

    pdp.initSidebarsCheck();
    pdp.initMinimizeSidebar();

    $('.form-control').on("focus", function(){
        $(this).parent('.input-group').addClass("input-group-focus");
    }).on("blur", function(){
        $(this).parent(".input-group").removeClass("input-group-focus");
    });

    //  Activate the tooltips
    $('[rel="tooltip"]').tooltip();


    $('.switch').bootstrapSwitch({
        onColor:'primary'
    });

    $('.switch-plain').bootstrapSwitch({
        onColor:'',
        onText: '',
        offText: ''
    });

    $('.switch-icon').bootstrapSwitch({
        onColor:'',
        onText: '<i class="fa fa-check"></i>',
        offText: '<i class="fa fa-times"></i>'
    });


    //Activate tags
    //removed class label and label-color from tag span and replaced with data-color
    if($(".tagsinput").length != 0){
        var tagClass = $('.tagsinput').data('color');

        $('.tagsinput').tagsinput({
            tagClass: ' tag-'+ tagClass +' '
        });
    }

    //  Init Bootstrap Select Picker
    if($(".selectpicker").length != 0){
        $(".selectpicker").selectpicker();
    }

};



// activate collapse right menu when the windows is resized
$(window).resize(function(){
    pdp.initSidebarsCheck();

});

pdp = {
    misc:{
        navbar_menu_visible: 0,
        active_collapse: true,
        disabled_collapse_init: 0

    },
    initSidebarsCheck: function(){
        // Init navigation toggle for small screens
        if($(window).width() <= 991){
            if($sidebar.length != 0){
                pdp.initSidebarMenu();
            } else {
                pdp.initBootstrapNavbarMenu();
            }
        } else if(mobile_menu_initialized == true){
            // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
            $sidebar_wrapper.find('.navbar-form').remove();
            $sidebar_wrapper.find('.nav-mobile-menu').remove();

            mobile_menu_initialized = false;
        }
    },

    initMinimizeSidebar: function(){
        $('#minimizeSidebar').click(function(){
            var $btn = $(this);

            if(pdp.misc.sidebar_mini_active == true){
                $('body').removeClass('sidebar-mini');
                $btn.html('<i class="ti-more-alt"></i>');
                pdp.misc.sidebar_mini_active = false;

            }else{
                $('body').addClass('sidebar-mini');
                $btn.html('<i class="ti-menu-alt"></i>');
                pdp.misc.sidebar_mini_active = true;
            }

            // we simulate the window Resize so the charts will get updated in realtime.
            var simulateWindowResize = setInterval(function(){
                window.dispatchEvent(new Event('resize'));
            },180);

            // we stop the simulation of Window Resize after the animations are completed
            setTimeout(function(){
                clearInterval(simulateWindowResize);
            },1000);
        });
    },

    initSidebarMenu: function(){
        $sidebar_wrapper = $('.sidebar-wrapper');

        if(!mobile_menu_initialized){

            $navbar = $('nav').find('.navbar-collapse').first().clone(true);

            nav_content = '';
            mobile_menu_content = '';

            $navbar.children('ul').each(function(){

                content_buff = $(this).html();
                nav_content = nav_content + content_buff;
            });

            nav_content = '<ul class="nav nav-mobile-menu">' + nav_content + '</ul>';

            $navbar_form = $('nav').find('.navbar-form').clone(true);

            $sidebar_nav = $sidebar_wrapper.find(' > .nav');

            // insert the navbar form before the sidebar list
            $nav_content = $(nav_content);
            $nav_content.insertBefore($sidebar_nav);
            $navbar_form.insertBefore($nav_content);

            $(".sidebar-wrapper .dropdown .dropdown-menu > li > a").click(function(event) {
                event.stopPropagation();

            });

            mobile_menu_initialized = true;
        } else {
            if($(window).width() > 991){
                // reset all the additions that we made for the sidebar wrapper only if the screen is bigger than 991px
                $sidebar_wrapper.find('.navbar-form').remove();
                $sidebar_wrapper.find('.nav-mobile-menu').remove();

                mobile_menu_initialized = false;
            }
        }

        if(!toggle_initialized){
            $toggle = $('.navbar-toggle');

            $toggle.click(function (){

                if(mobile_menu_visible == 1) {
                    $('html').removeClass('nav-open');

                    $('.close-layer').remove();
                    setTimeout(function(){
                        $toggle.removeClass('toggled');
                    }, 400);

                    mobile_menu_visible = 0;
                } else {
                    setTimeout(function(){
                        $toggle.addClass('toggled');
                    }, 430);

                    main_panel_height = $('.main-panel')[0].scrollHeight;
                    $layer = $('<div class="close-layer"></div>');
                    $layer.css('height',main_panel_height + 'px');
                    $layer.appendTo(".main-panel");


                    setTimeout(function(){
                        $layer.addClass('visible');
                    }, 100);

                    $layer.click(function() {
                        $('html').removeClass('nav-open');
                        mobile_menu_visible = 0;

                        $layer.removeClass('visible');

                         setTimeout(function(){
                            $layer.remove();
                            $toggle.removeClass('toggled');

                         }, 400);
                    });

                    $('html').addClass('nav-open');
                    mobile_menu_visible = 1;

                }
            });

            toggle_initialized = true;
        }

    },

      initBootstrapNavbarMenu: debounce(function(){

        if(!bootstrap_nav_initialized){
            $navbar = $('nav').find('.navbar-collapse').first().clone(true);

            nav_content = '';
            mobile_menu_content = '';

            //add the content from the regular header to the mobile menu
            $navbar.children('ul').each(function(){
                content_buff = $(this).html();
                nav_content = nav_content + content_buff;
            });

            nav_content = '<ul class="nav nav-mobile-menu">' + nav_content + '</ul>';

            $navbar.html(nav_content);
            $navbar.addClass('off-canvas-sidebar');

            // append it to the body, so it will come from the right side of the screen
            $('body').append($navbar);

            $toggle = $('.navbar-toggle');

            $navbar.find('a').removeClass('btn btn-round btn-default');
            $navbar.find('button').removeClass('btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral');
            $navbar.find('button').addClass('btn-simple btn-block');

            $toggle.click(function (){
                if(mobile_menu_visible == 1) {
                    $('html').removeClass('nav-open');

                    $('.close-layer').remove();
                    setTimeout(function(){
                        $toggle.removeClass('toggled');
                    }, 400);

                    mobile_menu_visible = 0;
                } else {
                    setTimeout(function(){
                        $toggle.addClass('toggled');
                    }, 430);

                    $layer = $('<div class="close-layer"></div>');
                    $layer.appendTo(".wrapper-full-page");

                    setTimeout(function(){
                        $layer.addClass('visible');
                    }, 100);


                    $layer.click(function() {
                        $('html').removeClass('nav-open');
                        mobile_menu_visible = 0;

                        $layer.removeClass('visible');

                         setTimeout(function(){
                            $layer.remove();
                            $toggle.removeClass('toggled');

                         }, 400);
                    });

                    $('html').addClass('nav-open');
                    mobile_menu_visible = 1;

                }

            });
            bootstrap_nav_initialized = true;
        }
    }, 500),
}


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (immediate && !timeout) func.apply(context, args);
	};
};
/*



     Creative Tim Modifications

     Lines: 239, 240 was changed from top: 5px to top: 50% and we added margin-top: -13px. In this way the close button will be aligned vertically
     Line:242 - modified when the icon is set, we add the class "alert-with-icon", so there will be enough space for the icon.




*/


/*
* Project: Bootstrap Notify = v3.1.5
* Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
* Author: Mouse0270 aka Robert McIntosh
* License: MIT License
* Website: https://github.com/mouse0270/bootstrap-growl
*/

/* global define:false, require: false, jQuery:false */


(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	// Create the defaults once
	var defaults = {
		element: 'body',
		position: null,
		type: "info",
		allow_dismiss: true,
		allow_duplicates: true,
		newest_on_top: false,
		showProgressbar: false,
		placement: {
			from: "top",
			align: "right"
		},
		offset: 20,
		spacing: 10,
		z_index: 1031,
		delay: 5000,
		timer: 1000,
		url_target: '_blank',
		mouse_over: null,
		animate: {
			enter: 'animated fadeInDown',
			exit: 'animated fadeOutUp'
		},
		onShow: null,
		onShown: null,
		onClose: null,
		onClosed: null,
		icon_type: 'class',
		template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
	};

	String.format = function () {
		var str = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(RegExp("\\{" + (i - 1) + "\\}", "gm"), arguments[i]);
		}
		return str;
	};

	function isDuplicateNotification(notification) {
		var isDupe = false;

		$('[data-notify="container"]').each(function (i, el) {
			var $el = $(el);
			var title = $el.find('[data-notify="title"]').text().trim();
			var message = $el.find('[data-notify="message"]').html().trim();

			// The input string might be different than the actual parsed HTML string!
			// (<br> vs <br /> for example)
			// So we have to force-parse this as HTML here!
			var isSameTitle = title === $("<div>" + notification.settings.content.title + "</div>").html().trim();
			var isSameMsg = message === $("<div>" + notification.settings.content.message + "</div>").html().trim();
			var isSameType = $el.hasClass('alert-' + notification.settings.type);

			if (isSameTitle && isSameMsg && isSameType) {
				//we found the dupe. Set the var and stop checking.
				isDupe = true;
			}
			return !isDupe;
		});

		return isDupe;
	}

	function Notify(element, content, options) {
		// Setup Content of Notify
		var contentObj = {
			content: {
				message: typeof content === 'object' ? content.message : content,
				title: content.title ? content.title : '',
				icon: content.icon ? content.icon : '',
				url: content.url ? content.url : '#',
				target: content.target ? content.target : '-'
			}
		};

		options = $.extend(true, {}, contentObj, options);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		if (this.settings.content.target === "-") {
			this.settings.content.target = this.settings.url_target;
		}
		this.animations = {
			start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
			end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
		};

		if (typeof this.settings.offset === 'number') {
			this.settings.offset = {
				x: this.settings.offset,
				y: this.settings.offset
			};
		}

		//if duplicate messages are not allowed, then only continue if this new message is not a duplicate of one that it already showing
		if (this.settings.allow_duplicates || (!this.settings.allow_duplicates && !isDuplicateNotification(this))) {
			this.init();
		}
	}

	$.extend(Notify.prototype, {
		init: function () {
			var self = this;

			this.buildNotify();
			if (this.settings.content.icon) {
				this.setIcon();
			}
			if (this.settings.content.url != "#") {
				this.styleURL();
			}
			this.styleDismiss();
			this.placement();
			this.bind();

			this.notify = {
				$ele: this.$ele,
				update: function (command, update) {
					var commands = {};
					if (typeof command === "string") {
						commands[command] = update;
					} else {
						commands = command;
					}
					for (var cmd in commands) {
						switch (cmd) {
							case "type":
								this.$ele.removeClass('alert-' + self.settings.type);
								this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
								self.settings.type = commands[cmd];
								this.$ele.addClass('alert-' + commands[cmd]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[cmd]);
								break;
							case "icon":
								var $icon = this.$ele.find('[data-notify="icon"]');
								if (self.settings.icon_type.toLowerCase() === 'class') {
									$icon.removeClass(self.settings.content.icon).addClass(commands[cmd]);
								} else {
									if (!$icon.is('img')) {
										$icon.find('img');
									}
									$icon.attr('src', commands[cmd]);
								}
								break;
							case "progress":
								var newDelay = self.settings.delay - (self.settings.delay * (commands[cmd] / 100));
								this.$ele.data('notify-delay', newDelay);
								this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[cmd]).css('width', commands[cmd] + '%');
								break;
							case "url":
								this.$ele.find('[data-notify="url"]').attr('href', commands[cmd]);
								break;
							case "target":
								this.$ele.find('[data-notify="url"]').attr('target', commands[cmd]);
								break;
							default:
								this.$ele.find('[data-notify="' + cmd + '"]').html(commands[cmd]);
						}
					}
					var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
					self.reposition(posX);
				},
				close: function () {
					self.close();
				}
			};

		},
		buildNotify: function () {
			var content = this.settings.content;
			this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
			this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
			if (!this.settings.allow_dismiss) {
				this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
			}
			if ((this.settings.delay <= 0 && !this.settings.showProgressbar) || !this.settings.showProgressbar) {
				this.$ele.find('[data-notify="progressbar"]').remove();
			}
		},
		setIcon: function () {

    		this.$ele.addClass('alert-with-icon');

			if (this.settings.icon_type.toLowerCase() === 'class') {
				this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon);
			} else {
				if (this.$ele.find('[data-notify="icon"]').is('img')) {
					this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
				} else {
					this.$ele.find('[data-notify="icon"]').append('<img src="' + this.settings.content.icon + '" alt="Notify Icon" />');
				}
			}
		},
		styleDismiss: function () {
			this.$ele.find('[data-notify="dismiss"]').css({
				position: 'absolute',
				right: '10px',
				top: '20px',
				marginTop: '-6px',
				zIndex: this.settings.z_index + 2
			});
		},
		styleURL: function () {
			this.$ele.find('[data-notify="url"]').css({
				backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
				height: '100%',
				left: 0,
				position: 'absolute',
				top: 0,
				width: '100%',
				zIndex: this.settings.z_index + 1
			});
		},
		placement: function () {
			var self = this,
				offsetAmt = this.settings.offset.y,
				css = {
					display: 'inline-block',
					margin: '0px auto',
					position: this.settings.position ? this.settings.position : (this.settings.element === 'body' ? 'fixed' : 'absolute'),
					transition: 'all .5s ease-in-out',
					zIndex: this.settings.z_index
				},
				hasAnimation = false,
				settings = this.settings;

			$('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function () {
				offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) + parseInt($(this).outerHeight()) + parseInt(settings.spacing));
			});
			if (this.settings.newest_on_top === true) {
				offsetAmt = this.settings.offset.y;
			}
			css[this.settings.placement.from] = offsetAmt + 'px';

			switch (this.settings.placement.align) {
				case "left":
				case "right":
					css[this.settings.placement.align] = this.settings.offset.x + 'px';
					break;
				case "center":
					css.left = 0;
					css.right = 0;
					break;
			}
			this.$ele.css(css).addClass(this.settings.animate.enter);
			$.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function (index, prefix) {
				self.$ele[0].style[prefix + 'AnimationIterationCount'] = 1;
			});

			$(this.settings.element).append(this.$ele);

			if (this.settings.newest_on_top === true) {
				offsetAmt = (parseInt(offsetAmt) + parseInt(this.settings.spacing)) + this.$ele.outerHeight();
				this.reposition(offsetAmt);
			}

			if ($.isFunction(self.settings.onShow)) {
				self.settings.onShow.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function () {
				hasAnimation = true;
			}).one(this.animations.end, function () {
				if ($.isFunction(self.settings.onShown)) {
					self.settings.onShown.call(this);
				}
			});

			setTimeout(function () {
				if (!hasAnimation) {
					if ($.isFunction(self.settings.onShown)) {
						self.settings.onShown.call(this);
					}
				}
			}, 600);
		},
		bind: function () {
			var self = this;

			this.$ele.find('[data-notify="dismiss"]').on('click', function () {
				self.close();
			});

			this.$ele.mouseover(function () {
				$(this).data('data-hover', "true");
			}).mouseout(function () {
				$(this).data('data-hover', "false");
			});
			this.$ele.data('data-hover', "false");

			if (this.settings.delay > 0) {
				self.$ele.data('notify-delay', self.settings.delay);
				var timer = setInterval(function () {
					var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
					if ((self.$ele.data('data-hover') === 'false' && self.settings.mouse_over === "pause") || self.settings.mouse_over != "pause") {
						var percent = ((self.settings.delay - delay) / self.settings.delay) * 100;
						self.$ele.data('notify-delay', delay);
						self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
					}
					if (delay <= -(self.settings.timer)) {
						clearInterval(timer);
						self.close();
					}
				}, self.settings.timer);
			}
		},
		close: function () {
			var self = this,
				posX = parseInt(this.$ele.css(this.settings.placement.from)),
				hasAnimation = false;

			this.$ele.data('closing', 'true').addClass(this.settings.animate.exit);
			self.reposition(posX);

			if ($.isFunction(self.settings.onClose)) {
				self.settings.onClose.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function () {
				hasAnimation = true;
			}).one(this.animations.end, function () {
				$(this).remove();
				if ($.isFunction(self.settings.onClosed)) {
					self.settings.onClosed.call(this);
				}
			});

			setTimeout(function () {
				if (!hasAnimation) {
					self.$ele.remove();
					if (self.settings.onClosed) {
						self.settings.onClosed(self.$ele);
					}
				}
			}, 600);
		},
		reposition: function (posX) {
			var self = this,
				notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
				$elements = this.$ele.nextAll(notifies);
			if (this.settings.newest_on_top === true) {
				$elements = this.$ele.prevAll(notifies);
			}
			$elements.each(function () {
				$(this).css(self.settings.placement.from, posX);
				posX = (parseInt(posX) + parseInt(self.settings.spacing)) + $(this).outerHeight();
			});
		}
	});

	$.notify = function (content, options) {
		var plugin = new Notify(this, content, options);
		return plugin.notify;
	};
	$.notifyDefaults = function (options) {
		defaults = $.extend(true, {}, defaults, options);
		return defaults;
	};
	$.notifyClose = function (command) {
		if (typeof command === "undefined" || command === "all") {
			$('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
		} else {
			$('[data-notify-position="' + command + '"]').find('[data-notify="dismiss"]').trigger('click');
		}
	};

}));
type = ['','info','success','warning','danger'];


demo = {

    initCirclePercentage: function(){

            $('#chartDashboard, #chartOrders, #chartNewVisitors, #chartSubscriptions, #chartDashboardDoc, #chartOrdersDoc').easyPieChart({
        		lineWidth: 6,
        		size: 160,
        		scaleColor: false,
        		trackColor: 'rgba(255,255,255,.25)',
        		barColor: '#FFFFFF',
        		animate: ({duration: 5000, enabled: true})

            });


    },

    initGoogleMaps: function(){

    // Satellite Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 3,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            center: myLatlng,
             mapTypeId: google.maps.MapTypeId.SATELLITE
        }

        var map = new google.maps.Map(document.getElementById("satelliteMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Satellite Map!"
        });

        marker.setMap(map);


    },

    initSmallGoogleMaps: function(){

        // Regular Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 8,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        }

        var map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Regular Map!"
        });

        marker.setMap(map);


        // Custom Skin & Settings Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 13,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            disableDefaultUI: true, // a way to quickly hide all controls
            zoomControl: true,
            styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]

        }

        var map = new google.maps.Map(document.getElementById("customSkinMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Custom Skin & Settings Map!"
        });

        marker.setMap(map);

    },


    initVectorMap: function(){
         var mapData = {
                "AU": 760,
                "BR": 550,
                "CA": 120,
                "DE": 1300,
                "FR": 540,
                "GB": 690,
                "GE": 200,
                "IN": 200,
                "RO": 600,
                "RU": 300,
                "US": 2920,
            };

            $('#worldMap').vectorMap({
                map: 'world_mill_en',
                backgroundColor: "transparent",
                zoomOnScroll: false,
                regionStyle: {
                    initial: {
                        fill: '#e4e4e4',
                        "fill-opacity": 0.9,
                        stroke: 'none',
                        "stroke-width": 0,
                        "stroke-opacity": 0
                    }
                },

                series: {
                    regions: [{
                        values: mapData,
                        scale: ["#AAAAAA","#444444"],
                        normalizeFunction: 'polynomial'
                    }]
                },
            });
	},

    initFullScreenGoogleMap: function(){
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
          zoom: 13,
          center: myLatlng,
          scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
          styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]

        }
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Hello World!"
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);
    },

    initOverviewDashboardDoc: function(){
        /*  **************** Chart Total Earnings - single line ******************** */

        var dataPrice = {
          labels: ['Jan','Feb','Mar', 'April', 'May', 'June'],
          series: [
            [230, 340, 400, 300, 570, 500, 800]
          ]
        };

        var optionsPrice = {
          showPoint: false,
          lineSmooth: true,
          height: "210px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
            showGrid: false
          },
          low: 0,
          high: 'auto',
              classNames: {
                line: 'ct-line ct-green'
            }
        };

        Chartist.Line('#chartTotalEarningsDoc', dataPrice, optionsPrice);

        /*  **************** Chart Subscriptions - single line ******************** */

        var dataDays = {
          labels: ['M','T','W', 'T', 'F', 'S','S'],
          series: [
            [60, 50, 30, 50, 70, 60, 90, 100]
          ]
        };

        var optionsDays = {
          showPoint: false,
          lineSmooth: true,
          height: "210px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
            showGrid: false
          },
          low: 0,
          high: 'auto',
              classNames: {
                line: 'ct-line ct-red'
            }
        };

        Chartist.Line('#chartTotalSubscriptionsDoc', dataDays, optionsDays);
    },

    initOverviewDashboard: function(){

        /*  **************** Chart Total Earnings - single line ******************** */

        var dataPrice = {
          labels: ['Jan','Feb','Mar', 'April', 'May', 'June'],
          series: [
            [230, 340, 400, 300, 570, 500, 800]
          ]
        };

        var optionsPrice = {
          showPoint: false,
          lineSmooth: true,
          height: "210px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
            showGrid: false
          },
          low: 0,
          high: 'auto',
              classNames: {
                line: 'ct-line ct-green'
            }
        };

        Chartist.Line('#chartTotalEarnings', dataPrice, optionsPrice);

        /*  **************** Chart Subscriptions - single line ******************** */

        var dataDays = {
          labels: ['M','T','W', 'T', 'F', 'S','S'],
          series: [
            [60, 50, 30, 50, 70, 60, 90, 100]
          ]
        };

        var optionsDays = {
          showPoint: false,
          lineSmooth: true,
          height: "210px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
            showGrid: false
          },
          low: 0,
          high: 'auto',
              classNames: {
                line: 'ct-line ct-red'
            }
        };

        Chartist.Line('#chartTotalSubscriptions', dataDays, optionsDays);

        /*  **************** Chart Total Downloads - single line ******************** */

        var dataDownloads = {
          labels: ['2009','2010','2011', '2012', '2013', '2014'],
          series: [
            [1200, 1000, 3490, 8345, 3256, 2566]
          ]
        };

        var optionsDownloads = {
          showPoint: false,
          lineSmooth: true,
          height: "210px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
            showGrid: false
          },
          low: 0,
          high: 'auto',
              classNames: {
                line: 'ct-line ct-orange'
            }
        };

        Chartist.Line('#chartTotalDownloads', dataDownloads, optionsDownloads);
    },

    initStatsDashboard: function(){

        var dataSales = {
          labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
          series: [
             [287, 385, 490, 562, 594, 626, 698, 895, 952],
            [67, 152, 193, 240, 387, 435, 535, 642, 744],
            [23, 113, 67, 108, 190, 239, 307, 410, 410]
          ]
        };

        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 1000,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: true,
          showPoint: false,
        };

        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);


        var data = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [542, 543, 520, 680, 653, 753, 326, 434, 568, 610, 756, 895],
            [230, 293, 380, 480, 503, 553, 600, 664, 698, 710, 736, 795]
          ]
        };

        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "245px"
        };

        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Line('#chartActivity', data, options, responsiveOptions);

        Chartist.Pie('#chartPreferences', {
          labels: ['62%','32%','6%'],
          series: [62, 32, 6]
        });
    },

    initChartsPage: function(){
        /*  **************** 24 Hours Performance - single line ******************** */

        var dataPerformance = {
          labels: ['6pm','9pm','11pm', '2am', '4am', '8am', '2pm', '5pm', '8pm', '11pm', '4am'],
          series: [
            [1, 6, 8, 7, 4, 7, 8, 12, 16, 17, 14, 13]
          ]
        };

        var optionsPerformance = {
          showPoint: false,
          lineSmooth: true,
          height: "200px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,

          },
          low: 0,
          high: 16,
          height: "250px"
        };


        Chartist.Line('#chartPerformance', dataPerformance, optionsPerformance);

        /*   **************** 2014 Sales - Bar Chart ********************    */

        var data = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
            [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
          ]
        };

        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "250px"
        };

        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Bar('#chartActivity', data, options, responsiveOptions);


        /*  **************** NASDAQ: AAPL - single line with points ******************** */

        var dataStock = {
          labels: ['\'07','\'08','\'09', '\'10', '\'11', '\'12', '\'13', '\'14', '\'15'],
          series: [
            [22.20, 34.90, 42.28, 51.93, 62.21, 80.23, 62.21, 82.12, 102.50, 107.23]
          ]
        };

        var optionsStock = {
          lineSmooth: false,
          height: "200px",
          axisY: {
            offset: 40,
            labelInterpolationFnc: function(value) {
                return '$' + value;
              }

          },
          low: 10,
          height: "250px",
          high: 110,
            classNames: {
              point: 'ct-point ct-green',
              line: 'ct-line ct-green'
          }
        };

        Chartist.Line('#chartStock', dataStock, optionsStock);

    /*  **************** Views  - barchart ******************** */

        var dataViews = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]
          ]
        };

        var optionsViews = {
          seriesBarDistance: 10,
          classNames: {
            bar: 'ct-bar'
          },
          axisX: {
            showGrid: false,

          },
          height: "250px"

        };

        var responsiveOptionsViews = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Bar('#chartViews', dataViews, optionsViews, responsiveOptionsViews);


    },

    showSwal: function(type){
        if(type == 'basic'){
        	swal({
                title: "Here's a message!",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-success btn-fill"
            });

    	}else if(type == 'title-and-text'){
        	swal({
                title: "Here's a message!",
                text: "It's pretty, isn't it?",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-info btn-fill"
            });

    	}else if(type == 'success-message'){
        	swal({
                title: "Good job!",
                text: "You clicked the button!",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-success btn-fill",
                type: "success"
            });

    	}else if(type == 'warning-message-and-confirmation'){
            swal({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonClass: 'btn btn-success btn-fill',
                    cancelButtonClass: 'btn btn-danger btn-fill',
                    confirmButtonText: 'Yes, delete it!',
                    buttonsStyling: false
                }).then(function() {
                  swal({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    type: 'success',
                    confirmButtonClass: "btn btn-success btn-fill",
                    buttonsStyling: false
                    })
                });
    	}else if(type == 'warning-message-and-cancel'){
            swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this imaginary file!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'No, keep it',
                    confirmButtonClass: "btn btn-success btn-fill",
                    cancelButtonClass: "btn btn-danger btn-fill",
                    buttonsStyling: false
                }).then(function() {
                  swal({
                    title: 'Deleted!',
                    text: 'Your imaginary file has been deleted.',
                    type: 'success',
                    confirmButtonClass: "btn btn-success btn-fill",
                    buttonsStyling: false
                    })
                }, function(dismiss) {
                  // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
                  if (dismiss === 'cancel') {
                    swal({
                      title: 'Cancelled',
                      text: 'Your imaginary file is safe :)',
                      type: 'error',
                      confirmButtonClass: "btn btn-info btn-fill",
                      buttonsStyling: false
                    })
                  }
                })

    	}else if(type == 'custom-html'){
        	swal({
                title: 'HTML example',
                buttonsStyling: false,
                confirmButtonClass: "btn btn-success btn-fill",
                html:
                        'You can use <b>bold text</b>, ' +
                        '<a href="http://github.com">links</a> ' +
                        'and other HTML tags'
                });

    	}else if(type == 'auto-close'){
        	swal({ title: "Auto close alert!",
            	   text: "I will close in 2 seconds.",
            	   timer: 2000,
            	   showConfirmButton: false
                });
    	} else if(type == 'input-field'){
            swal({
                    title: 'Input something',
                    html: '<div class="form-group">' +
                              '<input id="input-field" type="text" class="form-control" />' +
                          '</div>',
                    showCancelButton: true,
                    confirmButtonClass: 'btn btn-success btn-fill',
                    cancelButtonClass: 'btn btn-danger btn-fill',
                    buttonsStyling: false
                }).then(function(result) {
                    swal({
                        type: 'success',
                        html: 'You entered: <strong>' +
                                $('#input-field').val() +
                              '</strong>',
                        confirmButtonClass: 'btn btn-success btn-fill',
                        buttonsStyling: false

                    })
                }).catch(swal.noop)
            }
        },

    checkFullPageBackgroundImage: function(){
        $page = $('.full-page');
        image_src = $page.data('image');

        if(image_src !== undefined){
            image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    },

    initWizard: function(){
        $(document).ready(function(){

            var $validator = $("#wizardForm").validate({
    		  rules: {
    		    email: {
                    required: true,
                    email: true,
                    minlength: 5
    		    },
    		    first_name: {
    		        required: false,
                    minlength: 5
    		    },
    		    last_name: {
    		        required: false,
                    minlength: 5
    		    },
    		    website: {
    		        required: true,
                    minlength: 5,
                    url: true
    		    },
    		    framework: {
        		    required: false,
        		    minlength: 4
    		    },
    		    cities: {
        		    required: true
    		    },
    		    price:{
        		    number: true
    		    }
    		  }
    		});

			// you can also use the nav-pills-[blue | azure | green | orange | red] for a different color of wizard
            $('#wizardCard').bootstrapWizard({
            	tabClass: 'nav nav-pills',
            	nextSelector: '.btn-next',
                previousSelector: '.btn-back',
            	onNext: function(tab, navigation, index) {
            		var $valid = $('#wizardForm').valid();

            		if(!$valid) {
            			$validator.focusInvalid();
            			return false;
            		}
            	},
                onInit : function(tab, navigation, index){

                    //check number of tabs and fill the entire row
                    var $total = navigation.find('li').length;
                    $width = 100/$total;

                    $display_width = $(document).width();

                    if($display_width < 600 && $total > 3){
                       $width = 50;
                    }

                    navigation.find('li').css('width',$width + '%');
                },
                onTabClick : function(tab, navigation, index){
                    // Disable the posibility to click on tabs
                    return false;
                },
                onTabShow: function(tab, navigation, index) {
                    var $total = navigation.find('li').length;
                    var $current = index+1;

                    var wizard = navigation.closest('.card-wizard');

                    // If it's the last tab then hide the last button and show the finish instead
                    if($current >= $total) {
                        $(wizard).find('.btn-next').hide();
                        $(wizard).find('.btn-finish').show();
                    } else if($current == 1){
                        $(wizard).find('.btn-back').hide();
                    } else {
                        $(wizard).find('.btn-back').show();
                        $(wizard).find('.btn-next').show();
                        $(wizard).find('.btn-finish').hide();
                    }
                }
            });
        });

        function onFinishWizard(){
            //here you can do something, sent the form to server via ajax and show a success message with swal

            swal("Good job!", "You clicked the finish button!", "success");
        }
    },

    initFormExtendedSliders: function(){
        // Sliders for demo purpose in refine cards section
        var slider = document.getElementById('sliderRegular');

        noUiSlider.create(slider, {
            start: 40,
            connect: [true,false],
            range: {
                min: 0,
                max: 100
            }
        });

        var slider2 = document.getElementById('sliderDouble');

        noUiSlider.create(slider2, {
            start: [ 20, 60 ],
            connect: true,
            range: {
                min:  0,
                max:  100
            }
        });
    },



    initFormExtendedDatetimepickers: function(){
        $('.datetimepicker').datetimepicker({
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
         });

         $('.datepicker').datetimepicker({
            format: 'MM/DD/YYYY',    //use this format if you want the 12hours timpiecker with AM/PM toggle
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
         });

         $('.timepicker').datetimepicker({
//          format: 'H:mm',    // use this format if you want the 24hours timepicker
            format: 'h:mm A',    //use this format if you want the 12hours timpiecker with AM/PM toggle
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }

         });
    },

    initFullCalendar: function(){
        $calendar = $('#fullCalendar');

        today = new Date();
        y = today.getFullYear();
        m = today.getMonth();
        d = today.getDate();

        $calendar.fullCalendar({
            viewRender: function(view, element) {
                // We make sure that we activate the perfect scrollbar when the view isn't on Month
                if (view.name != 'month'){
                    $(element).find('.fc-scroller').perfectScrollbar();
                }
            },
            header: {
				left: 'title',
				center: 'month,agendaWeek,agendaDay',
				right: 'prev,next,today'
			},
			defaultDate: today,
			selectable: true,
			selectHelper: true,
            views: {
                month: { // name of view
                    titleFormat: 'MMMM YYYY'
                    // other view-specific options here
                },
                week: {
                    titleFormat: " MMMM D YYYY"
                },
                day: {
                    titleFormat: 'D MMM, YYYY'
                }
            },

			select: function(start, end) {

                // on select we show the Sweet Alert modal with an input
				swal({
    				title: 'Create an Event',
    				html: '<div class="form-group">' +
                            '<input class="form-control" placeholder="Event Title" id="input-field">' +
                        '</div>',
    				showCancelButton: true,
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                }).then(function(result) {

                    var eventData;
                    event_title = $('#input-field').val();

                    if (event_title) {
    					eventData = {
    						title: event_title,
    						start: start,
    						end: end
    					};
    					$calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
    				}

    				$calendar.fullCalendar('unselect');

                });
			},
			editable: true,
			eventLimit: true, // allow "more" link when too many events


            // color classes: [ event-blue | event-azure | event-green | event-orange | event-red ]
            events: [
				{
					title: 'All Day Event',
					start: new Date(y, m, 1),
                    className: 'event-default'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: new Date(y, m, d-4, 6, 0),
					allDay: false,
					className: 'event-rose'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: new Date(y, m, d+3, 6, 0),
					allDay: false,
					className: 'event-rose'
				},
				{
					title: 'Meeting',
					start: new Date(y, m, d-1, 10, 30),
					allDay: false,
					className: 'event-green'
				},
				{
					title: 'Lunch',
					start: new Date(y, m, d+7, 12, 0),
					end: new Date(y, m, d+7, 14, 0),
					allDay: false,
					className: 'event-red'
				},
				{
					title: 'Md-pro Launch',
					start: new Date(y, m, d-2, 12, 0),
					allDay: true,
					className: 'event-azure'
				},
				{
					title: 'Birthday Party',
					start: new Date(y, m, d+1, 19, 0),
					end: new Date(y, m, d+1, 22, 30),
					allDay: false,
                    className: 'event-azure'
				},
				{
					title: 'Click for Creative Tim',
					start: new Date(y, m, 21),
					end: new Date(y, m, 22),
					url: 'http://www.creative-tim.com/',
					className: 'event-orange'
				},
				{
					title: 'Click for Google',
					start: new Date(y, m, 21),
					end: new Date(y, m, 22),
					url: 'http://www.creative-tim.com/',
					className: 'event-orange'
				}
			]
		});
    },

	showNotification: function(from, align, color, message){
    // color = color; //Math.floor((Math.random() * 4) + 1);
    // message = "Welcome to <b>Paper Dashboard</b> - a beautiful dashboard for every web developer.";

    $.notify({
        icon: "",
        message: message
      }, {
        type: type[color],
        timer: 4000,
        placement: {
          from: from,
          align: align
        }
      }
    );
	},

	initDocumentationCharts: function(){
//     	init single simple line chart
        var dataPerformance = {
          labels: ['6pm','9pm','11pm', '2am', '4am', '8am', '2pm', '5pm', '8pm', '11pm', '4am'],
          series: [
            [1, 6, 8, 7, 4, 7, 8, 12, 16, 17, 14, 13]
          ]
        };

        var optionsPerformance = {
          showPoint: false,
          lineSmooth: true,
          height: "200px",
          axisX: {
            showGrid: false,
            showLabel: true
          },
          axisY: {
            offset: 40,
          },
          low: 0,
          high: 16,
          height: "250px"
        };

        Chartist.Line('#chartPerformance', dataPerformance, optionsPerformance);

//     init single line with points chart
        var dataStock = {
          labels: ['\'07','\'08','\'09', '\'10', '\'11', '\'12', '\'13', '\'14', '\'15'],
          series: [
            [22.20, 34.90, 42.28, 51.93, 62.21, 80.23, 62.21, 82.12, 102.50, 107.23]
          ]
        };

        var optionsStock = {
          lineSmooth: false,
          height: "200px",
          axisY: {
            offset: 40,
            labelInterpolationFnc: function(value) {
                return '$' + value;
              }

          },
          low: 10,
          height: "250px",
          high: 110,
            classNames: {
              point: 'ct-point ct-green',
              line: 'ct-line ct-green'
          }
        };

        Chartist.Line('#chartStock', dataStock, optionsStock);

//      init multiple lines chart
        var dataSales = {
          labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
          series: [
             [287, 385, 490, 562, 594, 626, 698, 895, 952],
            [67, 152, 193, 240, 387, 435, 535, 642, 744],
            [23, 113, 67, 108, 190, 239, 307, 410, 410]
          ]
        };

        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 1000,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: true,
          showPoint: false,
        };

        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);

//      pie chart
        Chartist.Pie('#chartPreferences', {
          labels: ['62%','32%','6%'],
          series: [62, 32, 6]
        });

//      bar chart
        var dataViews = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]
          ]
        };

        var optionsViews = {
          seriesBarDistance: 10,
          classNames: {
            bar: 'ct-bar'
          },
          axisX: {
            showGrid: false,

          },
          height: "250px"

        };

        var responsiveOptionsViews = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Bar('#chartViews', dataViews, optionsViews, responsiveOptionsViews);

//     multiple bars chart
        var data = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [542, 543, 520, 680, 653, 753, 326, 434, 568, 610, 756, 895],
            [230, 293, 380, 480, 503, 553, 600, 664, 698, 710, 736, 795]
          ]
        };

        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "245px"
        };

        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];

        Chartist.Line('#chartActivity', data, options, responsiveOptions);

	}

}
;
/*****
* rateYo - v2.1.1
* http://prrashi.github.io/rateyo/
* Copyright (c) 2014 Prashanth Pamidi; Licensed MIT
*****/


;(function ($) {
  "use strict";

  // The basic svg string required to generate stars
  var BASICSTAR = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"+
                  "<svg version=\"1.1\""+
                        "xmlns=\"http://www.w3.org/2000/svg\""+
                        "viewBox=\"0 12.705 512 486.59\""+
                        "x=\"0px\" y=\"0px\""+
                        "xml:space=\"preserve\">"+
                    "<polygon "+
                              "points=\"256.814,12.705 317.205,198.566"+
                                      " 512.631,198.566 354.529,313.435 "+
                                      "414.918,499.295 256.814,384.427 "+
                                      "98.713,499.295 159.102,313.435 "+
                                      "1,198.566 196.426,198.566 \"/>"+
                  "</svg>";

  // The Default values of different options available in the Plugin
  var DEFAULTS = {

    starWidth : "32px",
    normalFill: "gray",
    ratedFill : "#f39c12",
    numStars  : 5,
    maxValue  : 5,
    precision : 1,
    rating    : 0,
    fullStar  : false,
    halfStar  : false,
    readOnly  : false,
    spacing   : "0px",
    multiColor: null,
    onInit    : null,
    onChange  : null,
    onSet     : null
  };

  //Default colors for multi-color rating
  var MULTICOLOR_OPTIONS = {

    startColor: "#c0392b", //red
    endColor  : "#f1c40f"  //yellow
  };

  function checkPrecision (value, minValue, maxValue) {

    /* 
     * This function removes the unnecessary precision, at Min and Max Values
     */

    // Its like comparing 0.0 with 0, which is true
    if (value === minValue) {

      value = minValue;
    }
    else if(value === maxValue) {

      value = maxValue;
    }

    return value;
  }

  function checkBounds (value, minValue, maxValue) {

    /*
     * Check if the value is between min and max values, if not, throw an error
     */

    var isValid = value >= minValue && value <= maxValue;

    if(!isValid){

        throw Error("Invalid Rating, expected value between "+ minValue +
                    " and " + maxValue);
    }

    return value;
  }

  function isDefined(value) {

    // Better way to check if a variable is defined or not
    return typeof value !== "undefined";
  }

  // Regex to match Colors in Hex Format like #FF00FF
  var hexRegex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

  var hexToRGB = function (hex) {

    /*
     * Extracts and returns the Red, Blue, Green Channel values,
     * in the form of decimals
     */

    if (!hexRegex.test(hex)) {

      return null;
    }

    var hexValues = hexRegex.exec(hex),
	r = parseInt(hexValues[1], 16),
	g = parseInt(hexValues[2], 16),
	b = parseInt(hexValues[3], 16);

    return {r:r, g:g, b:b};
  };

  function getChannelValue(startVal, endVal, percent) {

    /*
     * Returns a value between `startVal` and `endVal` based on the percent 
     */

    var newVal = (endVal - startVal)*(percent/100);
 
    newVal = Math.round(startVal + newVal).toString(16);

    if (newVal.length === 1) {

	newVal = "0" + newVal;
    }

    return newVal;
  }

  function getColor (startColor, endColor, percent) {

    /*
     * Given the percentage( `percent` ) of `endColor` to be mixed
     * with the `startColor`, returns the mixed color.
     * Colors should be only in Hex Format
     */

    if (!startColor || !endColor) {

      return null;
    }

    percent = isDefined(percent)? percent : 0;

    startColor = hexToRGB(startColor);
    endColor = hexToRGB(endColor);

    var r = getChannelValue(startColor.r, endColor.r, percent),
        b = getChannelValue(startColor.b, endColor.b, percent),
        g = getChannelValue(startColor.g, endColor.g, percent);

    return "#" + r + g + b;
  }

   function RateYo ($node, options) {

   /*
    * The Contructor, whose instances are used by plugin itself
    */

    // Storing the HTML element as a property, for future access
    this.node = $node.get(0);

    var that = this;

    // Remove any stuff that is present inside the container, and add the plugin class 
    $node.empty().addClass("jq-ry-container");

    /*
     * Basically the plugin displays the rating using two rows of stars lying one above
     * the other, the row that is on the top represents the actual rating, and the one
     * behind acts just like a background.
     *
     * `$groupWrapper`: is an element that wraps both the rows
     * `$normalGroup`: is the container for row of stars thats behind and
     *                 acts as background
     * `$ratedGroup`: is the container for row of stars that display the actual rating.
     *
     * The rating is displayed by adjusting the width of `$ratedGroup`
     */  	
    var $groupWrapper = $("<div/>").addClass("jq-ry-group-wrapper")
                                   .appendTo($node);

    var $normalGroup = $("<div/>").addClass("jq-ry-normal-group")
                                  .addClass("jq-ry-group")
                                  .appendTo($groupWrapper);

    var $ratedGroup = $("<div/>").addClass("jq-ry-rated-group")
                                 .addClass("jq-ry-group")
                                 .appendTo($groupWrapper);

    /*
     * Variable `step`: store the value of the rating for each star
     *                  eg: if `maxValue` is 5 and `numStars` is 5, value of each star
     *                      is 1.
     * Variable `starWidth`: stores the decimal value of width of star in units of px
     * Variable `percentOfStar`: stores the percentage of width each star takes w.r.t
     *                           the container
     * Variable `spacing`: stores the decimal value of the spacing between stars
     *                     in the units of px
     * Variable `percentOfSpacing`: stores the percentage of width of the spacing
     *                              between stars w.r.t the container
     */
    var step, starWidth, percentOfStar, spacing,
        percentOfSpacing, containerWidth, minValue = 0;

    /*
     * `currentRating` contains rating that is being displayed at the latest point of
     * time.
     *
     * When ever you hover over the plugin UI, the rating value changes
     * according to the place where you point the cursor, currentRating contains
     * the current value of rating that is being shown in the UI
     */
    var currentRating = options.rating;

    // A flag to store if the plugin is already being displayed in the UI
    var isInitialized = false;

    function showRating (ratingVal) {

      /*
       * The function is responsible for displaying the rating by changing
       * the width of `$ratedGroup`
       */

      if (!isDefined(ratingVal)) {

        ratingVal = options.rating;
      }

      // Storing the value that is being shown in `currentRating`.
      currentRating = ratingVal;

      var numStarsToShow = ratingVal/step;

      // calculating the percentage of width of $ratedGroup with respect to its parent
      var percent = numStarsToShow*percentOfStar;

      if (numStarsToShow > 1) {

        // adding the percentage of space that is taken by the gap the stars
        percent += (Math.ceil(numStarsToShow) - 1)*percentOfSpacing;
      }

      setRatedFill(options.ratedFill);

      $ratedGroup.css("width", percent + "%");
    }

    function setContainerWidth () {

      /*
       * Set the width of the `this.node` based on the width of each star and
       * the space between them 
       */

      containerWidth = starWidth*options.numStars + spacing*(options.numStars - 1);

      percentOfStar = (starWidth/containerWidth)*100;

      percentOfSpacing = (spacing/containerWidth)*100;

      $node.width(containerWidth);

      showRating();
    }

    function setStarWidth (newWidth) {

      /*
       * Set the width and height of each SVG star, called whenever one changes the
       * `starWidth` option
       */

      // The width and height of the star should be the same
      var starHeight = options.starWidth = newWidth;

      starWidth = window.parseFloat(options.starWidth.replace("px", ""));
 
      $normalGroup.find("svg")
                  .attr({width : options.starWidth,
                         height: starHeight});

      $ratedGroup.find("svg")
                 .attr({width : options.starWidth,
                        height: starHeight});

      setContainerWidth();
       
      return $node;
    }

    function setSpacing (newSpacing) {

      /*
       * Set spacing between the SVG stars, called whenever one changes
       * the `spacing` option
       */
      
      options.spacing = newSpacing;

      spacing = parseFloat(options.spacing.replace("px", ""));

      $normalGroup.find("svg:not(:first-child)")
                  .css({"margin-left": newSpacing});

      $ratedGroup.find("svg:not(:first-child)")
                 .css({"margin-left": newSpacing}); 

      setContainerWidth();

      return $node;
    }

    function setNormalFill (newFill) {

      /*
       * Set the background fill of the Stars, called whenever one changes the
       * `normalFill` option
       */

      options.normalFill = newFill;

      $normalGroup.find("svg").attr({fill: options.normalFill});

      return $node;
    }

    /*
     * Store the recent `ratedFill` option in a variable
     * so that if multiColor is unset, we can use the perviously set `ratedFill`
     * from this variable
     */
    var ratedFill = options.ratedFill;

    function setRatedFill (newFill) {

      /*
       * Set ratedFill of the stars, called when one changes the `ratedFill` option
       */

      /*
       * If `multiColor` option is set, `newFill` variable is dynamically set
       * based on the rating, what ever set as parameter will be discarded
       */
      if (options.multiColor) {

        var ratingDiff = currentRating - minValue,
            percentCovered = (ratingDiff/options.maxValue)*100;

        var colorOpts  = options.multiColor || {},
            startColor = colorOpts.startColor || MULTICOLOR_OPTIONS.startColor,
            endColor   = colorOpts.endColor || MULTICOLOR_OPTIONS.endColor;

        newFill = getColor(startColor, endColor, percentCovered);
      } else {

        ratedFill = newFill;
      }

      options.ratedFill = newFill;

      $ratedGroup.find("svg").attr({fill: options.ratedFill});

      return $node;
    }

    function setMultiColor (colorOptions) {

      /*
       * called whenever one changes the `multiColor` option
       */

      options.multiColor = colorOptions;

      // set the recently set `ratedFill` option, if multiColor Options are unset
      setRatedFill(colorOptions ? colorOptions : ratedFill);
    }

    function setNumStars (newValue) {

      /*
       * Set the number of stars to use to display the rating, called whenever one
       * changes the `numStars` option
       */

      options.numStars = newValue;

      step = options.maxValue/options.numStars;

      $normalGroup.empty();
      $ratedGroup.empty();

      for (var i=0; i<options.numStars; i++) {

        $normalGroup.append($(BASICSTAR));
        $ratedGroup.append($(BASICSTAR));
      }

      setStarWidth(options.starWidth);
      setNormalFill(options.normalFill);
      setSpacing(options.spacing);

      showRating();

      return $node;
    }

    function setMaxValue (newValue) {

      /*
       * set the Maximum Value of rating to be allowed, called whenever
       * one changes the `maxValue` option
       */

      options.maxValue = newValue;

      step = options.maxValue/options.numStars;

      if (options.rating > newValue) {
      
        setRating(newValue); 
      }

      showRating();

      return $node;
    }

    function setPrecision (newValue) {

      /*
       * Set the precision of the rating value, called if one changes the
       * `precision` option
       */

      options.precision = newValue;

      setRating(options.rating);

      return $node;
    }

    function setHalfStar (newValue) {

      /*
       * This function will be called if one changes the `halfStar` option
       */

      options.halfStar = newValue;

      return $node;
    }

    function setFullStar (newValue) {

      /*
       * This function will be called if one changes the `fullStar` option
       */   

      options.fullStar = newValue;

      return $node;
    }

    function round (value) {

      /*
       * Rounds the value of rating if `halfStar` or `fullStar` options are chosen
       */
      
      var remainder = value%step,
          halfStep = step/2,
          isHalfStar = options.halfStar,
          isFullStar = options.fullStar;

      if (!isFullStar && !isHalfStar) {
      
        return value;  
      }

      if (isFullStar || (isHalfStar && remainder > halfStep)) {
      
        value += step - remainder;
      } else {
      
        value = value - remainder;
        
        if (remainder > 0) {
          
          value += halfStep;
        }
      }

      return value;
    }

    function calculateRating (e) {

      /*
       * Calculates and returns the rating based on the position of cursor w.r.t the
       * plugin container
       */

      var position = $normalGroup.offset(),
          nodeStartX = position.left,
          nodeEndX = nodeStartX + $normalGroup.width();

      var maxValue = options.maxValue;

      // The x-coordinate(position) of the mouse pointer w.r.t page
      var pageX = e.pageX;

      var calculatedRating = 0;

      // If the mouse pointer is to the left of the container
      if(pageX < nodeStartX) {

        calculatedRating = minValue;
      }else if (pageX > nodeEndX) { // If the mouse pointer is right of the container

        calculatedRating = maxValue;
      }else { // If the mouse pointer is inside the continer

        /*
         * The fraction of width covered by the pointer w.r.t to the total width
         * of the container.
         */
        var calcPrcnt = ((pageX - nodeStartX)/(nodeEndX - nodeStartX));

        if (spacing > 0) {

	  /*
           * If there is spacing between stars, take the percentage of width covered
           * and subtract the percentage of width covered by stars and spacing, to find
           * how many stars are covered, the number of stars covered is the rating
           *
           * TODO: I strongly feel that this logic can be improved!, Please help!
           */
          calcPrcnt *= 100;

          var remPrcnt = calcPrcnt;

          while (remPrcnt > 0) {
            
            if (remPrcnt > percentOfStar) {

              calculatedRating += step;
              remPrcnt -= (percentOfStar + percentOfSpacing);
            } else {

              calculatedRating += remPrcnt/percentOfStar*step;
              remPrcnt = 0;
            }  
          }
        } else {
        
          /*
           * If there is not spacing between stars, the fraction of width covered per
           * `maxValue` is the rating
           */
          calculatedRating = calcPrcnt * (options.maxValue);  
        }

        // Round the rating if `halfStar` or `fullStar` options are chosen
        calculatedRating = round(calculatedRating);
      }

      return calculatedRating;
    }

    function setReadOnly (newValue) {

      /*
       * UnBinds mouse event handlers, called when whenever one changes the
       * `readOnly` option
       */

      options.readOnly = newValue;

      $node.attr("readonly", true);

      unbindEvents();

      if (!newValue) {

        $node.removeAttr("readonly");

        bindEvents();
      }

      return $node;
    }

    function setRating (newValue) {

      /*
       * Sets the rating of the Plugin, Called when option `rating` is changed
       * or, when `rating` method is called
       */

      var rating = newValue;

      var maxValue = options.maxValue;

      if (typeof rating === "string") {

        // If rating is given in percentage, maxValue should be 100
        if (rating[rating.length - 1] === "%") {

          rating = rating.substr(0, rating.length - 1);
          maxValue = 100;

          setMaxValue(maxValue);
        }

        rating = parseFloat(rating);
      }

      checkBounds(rating, minValue, maxValue);

      rating = parseFloat(rating.toFixed(options.precision));

      checkPrecision(parseFloat(rating), minValue, maxValue);

      options.rating = rating;

      showRating();

      if (isInitialized) {

        $node.trigger("rateyo.set", {rating: rating});
      }

      return $node;
    }

    function setOnInit (method) {

      /*
       * set what method to be called on Initialization
       */

      options.onInit = method;

      return $node;
    }

    function setOnSet (method) {

      /*
       * set what method to be called when rating is set
       */

      options.onSet = method;

      return $node;
    }

    function setOnChange (method) {

      /*
       * set what method to be called rating in the UI is changed
       */

      options.onChange = method;

      return $node;
    }

    this.rating = function (newValue) {

      /*
       * rating getter/setter
       */

      if (!isDefined(newValue)) {

        return options.rating;
      }

      setRating(newValue);

      return $node;
    };

    this.destroy = function () {

      /*
       * Removes the Rating UI by clearing the content, and removing the custom classes
       */

      if (!options.readOnly) {

        unbindEvents();
      }

      RateYo.prototype.collection = deleteInstance($node.get(0),
                                                   this.collection);

      $node.removeClass("jq-ry-container").children().remove();

      return $node;
    };

    this.method = function (methodName) {

      /*
       * Method to call the methods of RateYo Instance
       */

      if (!methodName) {

        throw Error("Method name not specified!");
      }

      if (!isDefined(this[methodName])) {

        throw Error("Method " + methodName + " doesn't exist!");
      }

      var args = Array.prototype.slice.apply(arguments, []),
          params = args.slice(1),
          method = this[methodName];

      return method.apply(this, params);
    };

    this.option = function (optionName, param) {

      /*
       * Method to get/set Options
       */

      if (!isDefined(optionName)) {

        return options;
      }

      var method;

      switch (optionName) {

        case "starWidth":

          method = setStarWidth;
          break;
        case "numStars":

          method = setNumStars;
          break;
        case "normalFill":

          method = setNormalFill;
          break;
        case "ratedFill":

          method = setRatedFill;
          break;
        case "multiColor":

          method = setMultiColor;
          break;
        case "maxValue":

          method = setMaxValue;
          break;
        case "precision":

          method = setPrecision;
          break;
        case "rating":

          method = setRating;
          break;
        case "halfStar":

          method = setHalfStar;
          break;
        case "fullStar":
        
          method = setFullStar;
          break;
        case "readOnly":

          method = setReadOnly;
          break;
        case "spacing":
        
          method = setSpacing;
          break;
        case "onInit":
          
          method = setOnInit;
          break;
        case "onSet":

          method = setOnSet;
          break;
        case "onChange":

          method = setOnChange;
          break;
        default:

          throw Error("No such option as " + optionName);
      }

      return isDefined(param) ? method(param) : options[optionName];
    };

    function onMouseEnter (e) {

      /*
       * If the Mouse Pointer is inside the container, calculate and show the rating
       * in UI
       */

      var rating = calculateRating(e).toFixed(options.precision);

      var maxValue = options.maxValue;

      rating = checkPrecision(parseFloat(rating), minValue, maxValue);

      showRating(rating);

      $node.trigger("rateyo.change", {rating: rating});
    }

    function onMouseLeave () {

      /*
       * If mouse leaves, revert the rating in UI to previously set rating,
       * when empty value is passed to showRating, it will take the previously set
       * rating
       */

      showRating();

      $node.trigger("rateyo.change", {rating: options.rating});
    }

    function onMouseClick (e) {

      /*
       * On clicking the mouse inside the container, calculate and set the rating
       */

      var resultantRating = calculateRating(e).toFixed(options.precision);
      resultantRating = parseFloat(resultantRating);

      that.rating(resultantRating);
    }
    
    function onInit(e, data) {

      if(options.onInit && typeof options.onInit === "function") {
        
        /* jshint validthis:true */
        options.onInit.apply(this, [data.rating, that]);
      }
    }

    function onChange (e, data) {

      if(options.onChange && typeof options.onChange === "function") {

        /* jshint validthis:true */
        options.onChange.apply(this, [data.rating, that]);
      }
    }

    function onSet (e, data) {

      if(options.onSet && typeof options.onSet === "function") {

        /* jshint validthis:true */
        options.onSet.apply(this, [data.rating, that]);
      }
    }

    function bindEvents () {

      $node.on("mousemove", onMouseEnter)
           .on("mouseenter", onMouseEnter)
           .on("mouseleave", onMouseLeave)
           .on("click", onMouseClick)
           .on("rateyo.init", onInit)
           .on("rateyo.change", onChange)
           .on("rateyo.set", onSet);
    }

    function unbindEvents () {

      $node.off("mousemove", onMouseEnter)
           .off("mouseenter", onMouseEnter)
           .off("mouseleave", onMouseLeave)
           .off("click", onMouseClick)
           .off("rateyo.init", onInit)
           .off("rateyo.change", onChange)
           .off("rateyo.set", onSet);
    }

    setNumStars(options.numStars);
    setReadOnly(options.readOnly);

    this.collection.push(this);
    this.rating(options.rating, true);

    isInitialized = true;
    $node.trigger("rateyo.init", {rating: options.rating});
  }

  RateYo.prototype.collection = [];

  function getInstance (node, collection) {

    /* 
     * Given a HTML element (node) and a collection of RateYo instances,
     * this function will search through the collection and return the matched
     * instance having the node
     */

    var instance;

    $.each(collection, function () {

      if(node === this.node){

        instance = this;
        return false;
      }
    });

    return instance;
  }

  function deleteInstance (node, collection) {

    /* 
     * Given a HTML element (node) and a collection of RateYo instances,
     * this function will search through the collection and delete the
     * instance having the node, and return the modified collection
     */

    $.each(collection, function (index) {

      if (node === this.node) {

        var firstPart = collection.slice(0, index),
            secondPart = collection.slice(index+1, collection.length);

        collection = firstPart.concat(secondPart);

        return false;
      }
    });

    return collection;
  }

  function _rateYo (options) {

    var rateYoInstances = RateYo.prototype.collection;

    /* jshint validthis:true */
    var $nodes = $(this);

    if($nodes.length === 0) {

      return $nodes;
    }

    var args = Array.prototype.slice.apply(arguments, []);

    if (args.length === 0) {

      //If args length is 0, Initialize the UI with default settings
      options = args[0] = {};
    }else if (args.length === 1 && typeof args[0] === "object") {

      //If an Object is specified as first argument, it is considered as options
      options = args[0];
    }else if (args.length >= 1 && typeof args[0] === "string") {

      /*
       * if there is only one argument, and if its a string, it is supposed to be a
       * method name, if more than one argument is specified, the remaining arguments
       * except the first argument, will be passed as a params to the specified method
       */

      var methodName = args[0],
          params = args.slice(1);

      var result = [];

      $.each($nodes, function (i, node) {

        var existingInstance = getInstance(node, rateYoInstances);

        if(!existingInstance) {

          throw Error("Trying to set options before even initialization");
        }

        var method = existingInstance[methodName];

        if (!method) {

          throw Error("Method " + methodName + " does not exist!");
        }

        var returnVal = method.apply(existingInstance, params);

        result.push(returnVal);
      });

      /*
       * If the plugin in being called on only one jQuery Element, return only the
       * first value, to support chaining.
       */
      result = result.length === 1? result[0]: result;

      return result;
    }else {

      throw Error("Invalid Arguments");
    }

    /*
     * if only options are passed, extend default options, and if the plugin is not
     * initialized on a particular jQuery element, initalize RateYo on it
     */
    options = $.extend({}, DEFAULTS, options);

    return $.each($nodes, function () {

               var existingInstance = getInstance(this, rateYoInstances);

               if (!existingInstance) {

                 return new RateYo($(this), $.extend({}, options));
               }
           });
  }

  function rateYo () {

    /* jshint validthis:true */
    return _rateYo.apply(this, Array.prototype.slice.apply(arguments, []));
  }

  window.RateYo = RateYo;
  $.fn.rateYo = rateYo;

}(window.jQuery));
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//

//require turbolinks

















function onPageLoad(){
  var ctrl, func_name, func;

  // $('.selectpicker').selectpicker({ size: false } );

  ctrl = $('#ctrl').data('name');

  if(ctrl){
    func_name = ctrl.replace(/\//g , '_');
    func = window[func_name];

    if(func){
      func();
    }
  }

  $('#c_year').html(new Date().getFullYear())

  $('.main-panel').perfectScrollbar()
  $('[data-toggle="tooltip"]').tooltip();


  if(initPaperTheme){
    initPaperTheme();
  }

  // Set Z-index of notification growl
  $("div.col-xs-11.col-sm-4.alert.alert-info.animated.fadeInDown").css("z-index", '999999')
  var $loading = $('.loader');
  //Attach the event handler to any element
  $(document)
    .ajaxStart(function () {
      //ajax request went so show the loading image
      console.log("Hello")
      $loading.css('display','block');
    })
  .ajaxStop(function () {
      //got response so hide the loading image
      console.log("Stop")

      $loading.css('display','none');
  });
}



// document.addEventListener("turbolinks:load", onPageLoad)

$(document).ready(onPageLoad);
