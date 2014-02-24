/**
 * Exchange.js
 * 
 * Inspired by Foundation's interchange.js (foundation.zurb.com), exchange.js
 * allows you to dynamically load responsive content. Like interchange.js,
 * exchange.js uses media queries to load appropriate content but overcomes
 * several drawbacks, adds more flexibility, optimizes functionality and
 * being written in native javascript, is faster by multiple folds.
 *
 * @author Shikhar Jaiswal <mail@shikharjaiswal.com>
 * @version 0.1
 */

'use strict';

var Exchange = Exchange || {
  name : 'Exchange',
  version : '0.1',

  // Settings
  settings : {
    target_attr : 'exchange', // Data attribute to be checked for media queries
    media_queries : {
      'default' : 'only screen',
      small : 'only screen and (max-width: 640px)',
      medium : 'only screen and (min-width:641px) and (max-width:1024px)',
      large : 'only screen and (min-width:1025px)',
      retina : 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 
          'only screen and (min--moz-device-pixel-ratio: 2),' + 
          'only screen and (-o-min-device-pixel-ratio: 2/1),' + 
          'only screen and (min-device-pixel-ratio: 2),' + 
          'only screen and (min-resolution: 192dpi),' + 
          'only screen and (min-resolution: 2dppx)'
      // more attributes like xlarge, xxlarge etc. can be added here.
    }
  },

  // Other Properties
  cache : [],
  load_attr : '',

  /**
   * Initializes Exchange.js by setting cache and attaching even listeners.
   * 
   * @param {Object} Custom settings for media queries and data attribute name
   */
  init : function(options){
    this.set_options(options);
    this.load_attr = 'data-' + this.settings.target_attr;

    this.set_cache();

    this._addResizeEventListener();
    return this;
  },

  /**
   * Evaluates if options have been provided to Exchange and 
   * updates settings.
   */
  set_options : function(options) {
    if (typeof options !== "object") return false;

    // Set custom options
    var key = '';
    for(key in options){
      if(this.settings.hasOwnProperty(key))
        this.settings[key] = options[key];
    }
  },

  /**
   * Cache elements with data attribute and initialize them (attach properties
   * and load initial content) 
   */
  set_cache : function(){
    // Cache elements
    this.cache = _getElementByAttribute('[' + this.load_attr + ']');
    var i = this.cache.length;

    while(i--){
      this.attach_properties(this.cache[i]);
      this.update_content(this.cache[i]);
    }
  },

  /**
   * Parse the query string attached to data attribute
   * 
   * @param {Object} Element whose data attribute value is to be parsed
   */
  parse_data_attr : function(el){
    var raw = el.getAttribute(this.load_attr).split(/\[(.*?)\]/);
    var i = raw.length; 
    var output = [];

    while (i--) {
      if (raw[i].replace(/[\W\d]+/, '').length > 4) {
        output.push(raw[i]);
      }
    }

    return output;
  },

  /**
   * Attach media query states and active states to cached elements.
   * These properties are evaluated when media queries change, and active state
   * are also cached to avoid unnecessary reflows.
   *
   * @param {Object} Element to whom properties are to be attached.
   */
  attach_properties : function(el){
    var raw_arr = this.parse_data_attr(el);

    // Get an empty template to be attached with element for future use.
    var exchange_vars = this._el_template();

    for(var i=0, raw; raw = raw_arr[i]; i++){
      var o = raw.split(',');
      var path = o[0].trim();
      var media_query = o[1].trim().replace(/\)|\(/g,'');

      if(this.settings.media_queries[media_query]){
        media_query = this.settings.media_queries[media_query];
      }

      exchange_vars.all_queries.push({
        path : path,
        media_query : media_query
      });
    }

    el.exchange = exchange_vars;
    return this;
  },

  /**
   * Update content / src attribute of el / image.
   * It goes through all the cached elements, check media query
   * states and updates element property if validated media query
   * is different from the one currently active. It saves ajax requests
   * by remembering previous states. It also boosts performance since
   * objects holding state array and active state and added to already
   * cached elements (tested). Hence DOM is traversed again and again.
   * 
   * @param {Object} el - Element which has to be updated.
   */
  update_content : function(el){
    var q = el.exchange.all_queries;
    for(var i = 0, s; s = q[i]; i++){
      if(matchMedia(s.media_query).matches && s.media_query != el.exchange.active_mq) {
        if(el.tagName == "IMG") {
          el.src = s.path;
        } else {
          this.load(s.path, el);
        }
        el.exchange.active_mq = s.media_query;
        break;
      }
    }

    return this;
  },

  /**
   * Load the content from given URL inside element
   *
   * @param {Object} el - Element whose content has to be updated
   */
  load : function(url, el){
    _ajax(url,function(data){el.innerHTML = data});
  },

  resize : function() {
    var i = this.cache.length;

    while(i--){
      this.update_content(this.cache[i]);
    }
  },

  /**
   * Internal method to create objects that will store a list
   * of attached media queries and active media query. These
   * objects are attached to cached elements.
   */
  _el_template : function() {
    // all_queries holds an array of all media queries
    // attached to element. Each array element is an object
    // with keys - 'path' and 'media_query'
    var output = {
      all_queries : [],
      active_mq: ''
    }
    return output;
  },

  /**
   * Internal method to attach event listener to window object.
   */
  _addResizeEventListener : function(){
    var that = this;

    var callback = function(){
      that.resize();
    }

    if(window.attachEvent) {
      window.attachEvent('onresize', this.resize);
    }
    else if(window.addEventListener) {
      window.addEventListener('resize', callback);
    }
  }

  
};

/**
 * Use this method to search DOM elements by attribute name.
 * It falls back to searching the entire DOM in case of IE8 or less.
 *
 * @param {String} attr - Any selector attribute
 * @paran {Object} [context] - Search withing context
 * @returns {Array} Array of nodes
 */
function _getElementByAttribute(attr, context){
  context = context || document;
  if(typeof context.querySelectorAll == "undefined"){
    var nodeList = context.getElementByTagName('*');
    var nodeArray = [];
    for(var i=0,node; node=nodeList[i]; i++){
      if(node.getAttribute(attr)) nodeArray.push(node);
    }

    return nodeArray;
  }

  return context.querySelectorAll(attr);
};

/**
 * Use this method to make ajax calls. It accepts a mandatory
 * callback function. Response data is passed to this function on
 * successful ajax call.
 */
function _ajax(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function(){callback(xhr.responseText)};
  xhr.send();
};
