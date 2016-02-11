+function ($) {

  const defaultOptions = {
    minScale: 1/10,        /*  1:10 */
    maxScale: 10,          /* 10:1  */
    scale: 2,              /*  1:1  */
    
    translateX: 0,
    translateY: 0
  };


  function ImageViewer(element, options) {
    this.element = element;
    this.options = $.extend(true, {
      imageUrl: this.element.data('image-url')
    }, options);

    init.call(this);
  }


  function init() {
    this.element.css({
      'user-select': 'none',
      'overflow': 'none',
      'margin': '0',
      'padding': '0'
    });
    this.canvas = $('<canvas>').appendTo(this.element).css({
      'width': '100%',
      'height': this.element.innerHeight()
    })[0];
    this.ctx = this.canvas.getContext('2d');

    this.image = new Image();

    $(this.image).on('load', redraw.bind(this));
    $(window).on('resize', redraw.bind(this));

    this.image.src = this.options.imageUrl;

    enableDrag(this);
  }

  function enableDrag(viewer) {
    var transX;
    var transY;
    var lastX;
    var lastY;
    var dragDown = false;
    var dragging = false;

    var options = viewer.options;

    $(document).on('mousedown touchstart', viewer.element, function (evt) {
      if (evt.button !== 0) return;

      transX = options.translateX;
      transY = options.translateY;
      lastX = evt.pageX - viewer.canvas.offsetLeft;
      lastY = evt.pageY - viewer.canvas.offsetTop;
      dragDown = true;
      dragging = false;

      evt.preventDefault();
      evt.stopPropagation();
      return false;
    }).on('mousemove touchmove', function (evt) {
      if (!dragDown) return;

      var x = evt.pageX - viewer.canvas.offsetLeft;
      var y = evt.pageY - viewer.canvas.offsetTop;

      options.translateX = (transX + (lastX - x) * options.scale);
      options.translateY = (transY + (lastY - y) * options.scale);

      redraw.call(viewer);

      dragging = true;
      //lastX = x;
      //lastY = y;

      evt.preventDefault();
      evt.stopPropagation();
      return false;
    }).on('mouseup touchend', function (evt) {
      dragDown = false;

      if (!dragging) {
        // zoom
      }
    }).on('mousewheel DOMMouseScroll', function (evt) {
      if (evt.originalEvent.wheelDelta > 0) {
        options.scale = options.scale * 0.8;
      } else {
        options.scale = options.scale / 0.8;
      }

      redraw.call(viewer);
    });

  }


  function redraw() {
    var transX = this.options.translateX;
    var transY = this.options.translateY;

    if (typeof transX === 'string') {
      if (transX.endsWith('%')) {
        this.options.translateX = transX = this.image.width * (parseFloat(transX.substr(0, transX.length - 1), 10) / 100) - (this.element.width() / 2);
      } else {
        this.options.translateX = transX = parseFloat(transX, 10);
      }
    }
    if (typeof transY === 'string') {
      if (transY.endsWith('%')) {
        this.options.translateY = transY = this.image.height * (parseFloat(transY.substr(0, transY.length - 1), 10) / 100) - (this.element.height() / 2);
      } else {
        this.options.translateY = transY = parseFloat(transY, 10);
      }
    }

    this.canvas.height = this.image.height * this.options.scale;
    this.canvas.width = this.image.width * this.options.scale;

    var scale = this.options.scale;
    var sx = transX;
    var sy = transY;
    var sw = this.element.width() * scale;
    var sh = this.element.height() * scale;
    var dx = 0;
    var dy = 0;
    var dw = this.image.width * scale;
    var dh = this.image.height * scale;

    this.ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
  }


  $.fn.imageviewer = function imageviewer(options) {
    var args;
    var ret;

    if (typeof options === 'string') {
      if (ImageViewer.prototype.hasOwnProperty(options)) {
        args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
          var viewer = $(this).data('uix.imageviewer');
          var retValue;
          
          if (viewer) {
            retValue = viewer[options].apply(viewer, args);

            if ((args.length === 0) && (ret === undefined) && (retValue !== undefined)) {
              ret = retValue;
            }
          }
        });
      }

      return ret;
    } else {
      options = $.extend(true, {}, defaultOptions, options);

      return this.each(function () {
        var element = $(this);
        var viewer = element.data('uix.imageviewer');

        if (!viewer) {
          element.data('uix.viewer', new ImageViewer(element, options));
        }
      });
    }
  };

}(jQuery);