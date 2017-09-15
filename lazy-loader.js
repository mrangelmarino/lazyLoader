/**
 * @namespace LazyLoader
 * @property {string}       LazyLoader.selector   - Selector used when instantiating new LazyLoader.
 * @property {HTMLElement}  LazyLoader.images     - Array of stored references to elements selected by LazyLoader.selector
 * @property {boolean}      LazyLoader.loaded     - Boolean to prevent .load method from being called repeatedly
 * @property {method}       LazyLoader.loadImage  - Method that loads in full sized sources for single images
 * @property {method}       LazyLoader.load       - Method that loops over LazyLoader.images and calls LazyLoader.loadImage on each
 * @property {method}       LazyLoader.refresh    - Method that refreshes LazyLoader.images array with elements selected by LazyLoader.selector
 */

var LazyLoader = function() {
  /** @param {...string|function} [@arg] - Optional string of selector passed to LazyLoader.images to instantiate LazyLoader,
  *   and/or optional callback function called when instantiating LazyLoader
  */

  var images = '.lazy-image';

  for(var i in arguments) {
    if(typeof arguments[i] === 'string') {
      images = arguments[i];
    }

    if(typeof arguments[i] === 'function') {
      var loader = arguments[i];
    }
  }

  if(loader) {
    loader.apply(this);
  }

  var imageLoaded = function() {
    if(this.classList.contains('lazy-image')) {
      this.classList.remove('lazy-image');
    } else {
      this.parentElement.classList.remove('lazy-image');
    }
    this.removeEventListener('load', imageLoaded);
  };

  this.selector = images;

  this.images = document.querySelectorAll(images);

  this.loaded = false;

  this.loadImage = function(image){

    var image = image;
    var tag = image.tagName;

    if(tag === 'IMG') {

      image.addEventListener('load', imageLoaded);

      image.src = image.dataset.src;

      if(image.srcset) {
        image.srcset = image.dataset.srcset;
      }

    } else if(tag === 'PICTURE') {

      var children = image.childNodes;

      for(var node in children) {
        var child = children[node];

        if(child.src) {
          child.addEventListener('load', imageLoaded);
          child.src = child.dataset.src;
        }

        if(child.srcset) {
          child.srcset = child.dataset.srcset;
        }

      }

    }

  }

  this.load = function(callback) {
    var lazyLoader = this;

    if(this.images.length && this.loaded === false) {

      var counter = 0;
      var images = this.images;

      function recursiveLoader() {

        if(images.length > counter) {

          var image = images[counter];

          var tag = image.tagName;

          lazyLoader.loadImage(image);
          if(callback){
            callback.apply(image);
          }

          if(tag === 'IMG') {

            image.addEventListener('load', recursiveLoadEvent);

          } else if(tag === 'PICTURE') {

            var children = image.childNodes;

            for(var node in children) {
              var child = children[node];
              if(child.src) {
                child.addEventListener('load', recursiveLoadEvent);
              }
            }

          }

        }
      }

      function recursiveLoadEvent() {
        counter++;
        recursiveLoader();
        this.removeEventListener('load', recursiveLoadEvent);
      }

      recursiveLoader();

      this.loaded = true;

    }
  }

  this.refresh = function() {
    this.images = document.querySelectorAll(this.selector);
    this.loaded = false;
  }

}

var lazyLoaderConstructor = function() {
  var returnLazyLoader = function(args) {
    return LazyLoader.apply(this, args);
  }
  return new returnLazyLoader(arguments);
}

module.exports = function() {
  window.lazyImage = window.lazyImage || lazyLoaderConstructor;
}();
