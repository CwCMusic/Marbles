/* PHYSICS CODE HERE */

/* ---- GLOBAL VARS ---- */

var basePath = "http://localhost:3000";
var currentMode = "build";
var currentPage = 1;
var currentKeyWord = "";
var currentSorting = "date";

var contentLoader, sidebarController, trackStore;
var editorPosition = $('editor').cumulativeOffset($('editor'));

var shadowOffsetGetsTransformed = false;

var staticCanvas = document.getElementById("staticCanvas"),
    dynamicCanvas = document.getElementById("dynamicCanvas"),
    imageCanvas = document.getElementById("imageCanvas"),
    meterCanvas = document.getElementById("brickMeterCanvas");

var toggleElements = [
  "editorControlsTop", 
  "editorControlsBottom",
  "editorToolboxTop",
  "editorToolboxBottom",
  "showroomControlsTop",
  "showroomControlsBottom",
  "showroomDetail",
  "overviewControls",
  "overviewGrid",
  "staticCanvas",
  "dynamicCanvas",
  "publishButtonWarning",
  "aboutPage",
  "imprintPage",
  "contactPage",
  "errorPage",
  "loadingPage",
  "editorRuler"
];

/* ---- GLOBAL SETUP ---- */

dynamicCanvas.onselectstart = function() {return false;};
staticCanvas.onselectstart = function() {return false;};
meterCanvas.onselectstart = function() {return false;};

imageCanvas.style.display = 'none';

/* ---- HTML INTERFACE ---- */

$('buildSwitch').observe('click', function(event) {
  
  if ($('modeSwitch').hasClassName("build")) {
    return;
  }

  setSwitchMode("build");
  contentLoader.parseResponse({responseJSON: {mode: "build"}}, true);
});

$('viewSwitch').observe('click', function(event) {

  if ($('modeSwitch').hasClassName("view")) {
    return;
  }

  setSwitchMode("view");
  contentLoader.loadContent(getCurrentOverViewPath(), true);
});

$('helpButton').observe('click', function(event) {
  $('helpBox').toggle();
  $('helpButton').toggleClassName('active');
});

$('helpBox').toggleClassName('toggleElement');
$('helpBox').toggle();

$("newTrackButton").observe('click', function(event) {
  contentLoader.parseResponse({responseJSON: {mode: "build"}}, true);
});

$("galleryButton").observe('click', function(event) {
  contentLoader.loadContent(getCurrentOverViewPath());
});

$("menuAbout").observe('click', function(event) {
  contentLoader.parseResponse({responseJSON: {mode:"about"}}, true);
});

$("menuImprint").observe('click', function(event) {
  contentLoader.parseResponse({responseJSON: {mode:"imprint"}}, true);
});

$("menuContact").observe('click', function(event) {
  contentLoader.parseResponse({responseJSON: {mode:"contact"}}, true);
});

$('trackName').observe('focus', function(event) {
  if (this.value === 'TRACK NAME') {
    this.value = '';
  }
});

$('userName').observe('focus', function(event) {
  if (this.value === 'YOUR NAME') {
    this.value = '';
  }
});

$('trackName').observe('blur', function(event) {
  if (this.value === '') {
    this.value = 'TRACK NAME';
  }
});

$('userName').observe('blur', function(event) {
  if (this.value === '') {
    this.value = 'YOUR NAME';
  }
});

$('overviewPreviousButton').observe('click', function(event) {
  if (!$('overviewPreviousButton').hasClassName("inactive")) {
    var url = "/tracks?page=" + (currentPage - 1);
    
    if (currentKeyWord.length > 0) {
      url += "&search=" + currentKeyWord;
    }

    if (currentSorting.length > 0) {
      url += "&sorting=" + currentSorting;
    }

    contentLoader.loadContent(url);
  }
});

$('overviewNextButton').observe('click', function(event) {
  if (!$('overviewNextButton').hasClassName("inactive")) {
    var url = "/tracks?page=" + (currentPage + 1);
    
    if (currentKeyWord.length > 0) {
      url += "&search=" + currentKeyWord;
    }

    if (currentSorting.length > 0) {
      url += "&sorting=" + currentSorting;
    }

    contentLoader.loadContent(url);
  }
}); 

$('dateSortButton').observe('click', function(event) {
  $('dateSortButton').addClassName("active");
  $('dateSortButton').removeClassName("inactive");

  $('likesSortButton').removeClassName("active");
  $('likesSortButton').addClassName("inactive");

  currentKeyWord = "";
  currentSorting = "date";

  var url = '/tracks/?sorting=';
  url += 'date';
  url += '&page=1';
  contentLoader.loadContent(url, true);

  document.getElementById('searchField').value = "";
}); 

$('likesSortButton').observe('click', function(event) {
  $('dateSortButton').removeClassName("active");
  $('dateSortButton').addClassName("inactive");

  $('likesSortButton').addClassName("active");
  $('likesSortButton').removeClassName("inactive");
  
  currentKeyWord = "";
  currentSorting = "likes";

  var url = '/tracks/?sorting=';
  url += 'likes';
  url += '&page=1';
  contentLoader.loadContent(url, true);

  document.getElementById('searchField').value = "";
}); 

document.getElementById('searchForm').onsubmit = function() {
  $('dateSortButton').removeClassName("active");
  $('likesSortButton').removeClassName("active");

  $('dateSortButton').addClassName("inactive");
  $('likesSortButton').addClassName("inactive");

  var url = '/tracks/?search=';
  url += document.getElementById('searchField').value;
  url += '&page=1';

  currentKeyWord = document.getElementById('searchField').value;
  currentSorting = "";

  contentLoader.loadContent(url, true);

  return false;
};

/* ---- */

var setToggleElementsVisibility = function(visibleElements) {
  var i;
  
  for (i = 0; i < toggleElements.length; i++) {

    if (visibleElements.indexOf(toggleElements[i]) > -1) {

      $(toggleElements[i]).setStyle({visibility: "visible"});
      
    } else {

      $(toggleElements[i]).setStyle({visibility: "hidden"});

    }
  }
};

var setTrackTweetButton = function(trackID) {
  var parameters = {
    url: "http://marblerun.at/tracks/" + trackID,
    via: "themarblerun",
    text: "I built an awesome MARBLE RUN track, check it out!",
    counturl: "http://marblerun.at/tracks/" + trackID
  };

  Element.writeAttribute($('showroomTwitterButton'), {href: 'http://twitter.com/share?' + Object.toQueryString(parameters)});
};

var setBuildTweetButton = function() {
  var parameters = {
    url: "http://marblerun.at/",
    via: "themarblerun",
    text: "I help MARBLE RUN to build the longest marble run on earth!",
    counturl: "http://marblerun.at/tracks/"
  };

  Element.writeAttribute($('twitterButton'), {href: 'http://twitter.com/share?' + Object.toQueryString(parameters)});
};

var setSwitchMode = function(mode) {
  if (mode === currentMode){
    return;
  }

  $('modeSwitch').removeClassName(currentMode);
  $('modeSwitch').addClassName(mode);

  currentMode = mode;
};


var setToggleElementsVisibility = function(visibleElements) {
  var i;

  for (i = 0; i < toggleElements.length; i++) {

    if (visibleElements.indexOf(toggleElements[i]) > -1) {

      $(toggleElements[i]).setStyle({visibility: "visible"});
      
    } else {

      $(toggleElements[i]).setStyle({visibility: "hidden"});

    }
  }
};

var getCurrentOverViewPath = function() {
  var url = "/tracks?page=" + currentPage;
      
  if (currentKeyWord.length > 0) {
    url += "&search=" + currentKeyWord;
  }

  if (currentSorting.length > 0) {
    url += "&sorting=" + currentSorting;
  }

  return url;
};

window.onload = function() {
  
  shadowOffsetGetsTransformed = testShadowOffsetTransform();
  
  trackStore = new TrackStore();
  contentLoader = new ContentLoader();

  setTimeout(function() {

    window.onpopstate = function(event) {
      contentLoader.onPopState.call(contentLoader, event);
    };

  }, 50);
};

var DisplayObject = Class.create({
  
  initialize: function() {
    this.x = null;
    this.y = null;

    this.width = null;
    this.height = null;

    this.parent = null;
  },

  hitTest: function(x, y) {
    if (x < this.x || y < this.y  || x > this.x + this.width || y > this.y + this.height) {
      return false;
    } else {
      return true;
    }
  }, 

  parentToLocal: function(point) {
    
    return {x: point.x - this.x, y: point.y - this.y};

  }

});
var Event = Class.create({

  initialize: function(type) {
    this.type = type;
    this.parameter = null;
    this.mouseX = null;
    this.mouseY = null;
  }

});
EventEngine = Class.create({
  
  initialize: function() {

    this.listeners = [];
    this.state = {type: "unknown"};
    this.latestEvent = null;
    this.clickTimeout = null;

    this.clickTime = 250;

    var that = this;

    document.body.onmousedown = function(event) {that.onMouseDown.call(that, event);};
    document.body.onmouseup = function(event) {that.onMouseUp.call(that, event);};
    document.body.onmousemove = function(event) {that.onMouseMove.call(that, event);};

  },

  addListener: function(type, closure, thisArgument) {
    
    this.listeners.push({type: type, closure: closure, thisArgument: thisArgument});

  }, 

  removeListener: function(type, closure) {
    var i;

    for (i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].type === type && this.listeners[i].closure === closure) {
        this.listeners.splice(i, 1);
      }
    }
  },

  dispatchEvent: function(event) {
    var i;

    this.latestEvent = event;

    for (i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].type === event.type) {
        this.listeners[i].closure.call(this.listeners[i].thisArgument, event);
      }
    }
  },

  onMouseDown: function(event) {
    var coordinates = getRelativeCoordinates(event, $("editor"));

    var myEvent = new Event("mouseDown");
        myEvent.parameter = event;
        myEvent.mouseX = coordinates.x;
        myEvent.mouseY = coordinates.y;

    this.dispatchEvent(myEvent);

    this.state = {type: "down", x: coordinates.x, y: coordinates.y};

    var myScope = this;
    
    this.clickTimeoutID = setTimeout(
      
      function(coordinates, event) {
        myScope.onClickTimeout(coordinates, event);
      },
       
      this.clickTime, coordinates, event
    );
  }, 

  onMouseUp: function(event) {
    
    if (this.clickTimeoutID) {
      clearTimeout(this.clickTimeoutID);
      this.clickTimeoutID = null;
    }

    var type;

    if (this.state.type === "drag") {
      
      type = "stopDrag";
      
    } else if (this.state.type === "down") {
      
      type = "click";
      
    }

    var coordinates = getRelativeCoordinates(event, $("editor"));

    var myEvent = new Event(type);
        myEvent.parameter = event;
        myEvent.mouseX = coordinates.x;
        myEvent.mouseY = coordinates.y;

    this.state.type = "up";

    this.dispatchEvent(myEvent);
  },

  onMouseMove: function(event) {
    
    var coordinates = getRelativeCoordinates(event, $("editor"));
    
    var myEvent = new Event("mouseMove");
        myEvent.parameter = event;
        myEvent.mouseX = coordinates.x;
        myEvent.mouseY = coordinates.y;

    this.dispatchEvent(myEvent);

    if (this.state.type !== "up") {
      
      myEvent.type = "drag";
      this.dispatchEvent(myEvent);
      
    }

    if (this.state.type === "down") {
      var distance = (function(oldX, oldY, newX, newY) {
        
        var x = newX - oldX;
        var y = newY - oldY;

        return Math.sqrt(x * x + y * y);
      }(this.state.x, this.state.y, coordinates.x, coordinates.y));

      if (distance > 5) {
        
        this.onClickTimeout({x: this.state.x, y: this.state.y});

      }
    }
  },

  onClickTimeout: function(coordinates, event) {

    if (this.state.type !== "down") {
      return;
    }

    this.clickTimeoutID = null;

    this.state.type = "drag";

    var myEvent = new Event("startDrag");
        myEvent.parameter = event;
        myEvent.mouseX = coordinates.x;
        myEvent.mouseY = coordinates.y;

    this.dispatchEvent(myEvent);
  }

});
var Pattern = {};
Pattern.image = {};

Pattern.onload = null;
Pattern.loaded = 0;
Pattern.total = 0;

Pattern.onLoaded = function() {
  Pattern.loaded++;

  if (Pattern.loaded === Pattern.total) {
    if (Pattern.onload) {
      Pattern.onload();
    }
  }
};

Pattern.loadPattern = function(patterns) {
  var i,
      onImageLoad = function() {
        if (Pattern.context.createPattern) {
          Pattern[this.name] = Pattern.context.createPattern(this, "repeat");
          Pattern.onLoaded();
        }
      };

  Pattern.total = patterns.length;

  for (i = 0; i < patterns.length; i++) {
    var image = new Image();
    image.src = patterns[i].path;
    image.name = patterns[i].name;

    Pattern.image[patterns[i].name] = image;

    image.onload = onImageLoad;
  }
};
var Rectangle = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  
  this.width = width;
  this.height = height;
};

Rectangle.prototype.draw = function(context) {

  context.fillRect(this.x, this.y, this.width, this.height);

  context.addClearRectangle(this);

};
CanvasRenderingContext2D.prototype.dashedLine = function (fromX, fromY, toX, toY, dashLength) {
  
  var gt = function(a, b) {
    return Math.abs(a) > Math.abs(b);
  };

  var A = toX - fromX,
      B = toY - fromY;
      
  var C = Math.sqrt(A * A + B * B),
      c = dashLength;

  var a = (c * A) / C,
      b = (c * B) / C;

  var x = a,
      y = b,
      line = true;

  this.moveTo(fromX, fromY);

  while (gt(A, x) || gt(B, y)) {
    
    if (line) {
      
      this.lineTo(fromX + x, fromY + y);
    
    } else {
      
      this.moveTo(fromX + x, fromY + y);
      
    }

    line = !line;

    x += a;
    y += b;
    
  }
  
  if (line) {
    
    this.lineTo(toX, toY);
  
  } else {
    
    this.moveTo(toX, toY);
    
  }
  
};

CanvasRenderingContext2D.prototype.clearRects = [];

CanvasRenderingContext2D.prototype.addClearRectangle = function(rectangle) {
  
  this.clearRects.push(rectangle);
  
};

CanvasRenderingContext2D.prototype.clearRectangles = function() {
  var i;

  for (i = 0; i < this.clearRects.length; i++) {
    
    this.clearRect(
      this.clearRects[i].x - 1, this.clearRects[i].y - 1, 
      this.clearRects[i].width + 2, this.clearRects[i].height + 2
    );
    
  }
};

CanvasRenderingContext2D.prototype.clearShadow = function() {
  
  this.shadowColor = "rgba(0, 0, 0, 0)";
  
};

Array.prototype.shuffle = function() { 
  var i = this.length; 
  
  if (i < 2) {
    return false;
  }
      
  do { 
    var zi = Math.floor(Math.random() * i); 
    var t = this[zi];
     
    this[zi] = this[--i];
    this[i] = t;
  } while (i);
  
  return true;
};

Date.prototype.getMonthName = function() {
  return ["January", "February", "March", "April", "May", "June",
          "July", "August", "September",
          "October", "November", "December"][this.getMonth()];
};

Date.prototype.getFormatHours = function() {
  if (this.getHours() === 12) {
    return 12;
  }

  return this.fullString(this.getHours() % 12);
};

Date.prototype.getFormatMinutes = function() {
  return this.fullString(this.getMinutes());
};

Date.prototype.fullString = function(value) {
  value = value.toString();

  if (value.length === 1) {
    return "0" + value;
  }

  return value;
};

Date.prototype.getDayTime = function() {
  if (this.getHours() > 11) { 
    return "PM";
  }

  return "AM";
};

function getAbsolutePosition(element) {
  var r = { x: element.offsetLeft, y: element.offsetTop };
  if (element.offsetParent) {
    var tmp = getAbsolutePosition(element.offsetParent);
    r.x += tmp.x;
    r.y += tmp.y;
  }
  return r;
}

function getRelativeCoordinates(event, reference) {

  var x, y, e, pos;
  event = event || window.event;

  var el = event.target || event.srcElement;

  if (!window.opera && typeof event.offsetX !== 'undefined') {
    pos = { x: event.offsetX, y: event.offsetY };

    e = el;
    while (e) {
      e.mouseX = pos.x;
      e.mouseY = pos.y;
      pos.x += e.offsetLeft;
      pos.y += e.offsetTop;
      e = e.offsetParent;
    }

    e = reference;
    var offset = { x: 0, y: 0 };

    while (e) {

      if (typeof e.mouseX !== 'undefined') {
        x = e.mouseX - offset.x;
        y = e.mouseY - offset.y;
        break;
      }

      offset.x += e.offsetLeft;
      offset.y += e.offsetTop;
      e = e.offsetParent;
    }

    e = el;

    while (e) {

      e.mouseX = undefined;
      e.mouseY = undefined;
      e = e.offsetParent;

    }

  } else {


    pos = getAbsolutePosition(reference);
    x = event.pageX  - pos.x;
    y = event.pageY - pos.y;
  }


  return { x: x, y: y };
}

function testShadowOffsetTransform() {
  
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 8;

  var context = canvas.getContext('2d');
  
  context.shadowColor = "rgba(255, 255, 255, 1.0)";
  context.shadowOffsetX = 4;
  
  context.translate(1.5, 1.5);
  context.rotate(Math.PI / 2);
  
  context.fillStyle = "#000000";
  context.fillRect(-2, -2, 4, 4);
  
  var imageData = context.getImageData(1, 5, 1, 1);
  
  return (imageData.data[0] === 255);
};

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 25);
              };
    })();
var Brick = Class.create(DisplayObject, {
  
  initialize: function($super) {
    $super();

    this.x = 0;
    this.y = 0;
    
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotateID = null;
    
    this.isVisible = true;
    this.isDraggable = true;
    this.isRemoveable = true;
    
    this.isPreview = false;
    this.isInFront = true;
    this.isDynamic = false;
    this.hasShadow = true;

    this.cell = {
      row: 0,
      col: 0
    };
  },
  
  update: function() {
    
  },

  draw: function(context) {
    
    if (this.isVisible) {

      if (this.rotation !== 0) { 
        this.applyRotation(context);
      }

      if (context.drawShadows && this.hasShadow && !this.isPreview) {
        this.applyShadow(context);
      }
      
      if (this.isPreview) {
        
        context.globalAlpha = .3;
        
      }

      this.drawShape(context);
      
      if (this.isPreview) {
        
        this.applyStyle(context);
        
      }

      if (this.rotateID) {
        this.applyClearing(context);
      }

      context.beginPath();

    }
  },

  reset: function() {
    
  },

  drawShape: function(context) {

    context.fillRect(0, 0, Brick.SIZE, Brick.SIZE);
    
    context.clearShadow();

    context.strokeRect(0, 0, Brick.SIZE, Brick.SIZE);

  },
  
  applyStyle: function(context) {
     
    Brick.FILL = "#FF4020";
    Brick.STROKE = "#400000";

    context.fillStyle = Brick.FILL;
    context.strokeStyle = Brick.STROKE;
    
    context.lineJoin = "round";
    context.lineWidth = 2;
    
  },

  applyShadow: function(context) {

    var shadowOffset = new b2Vec2(Math.cos(Math.PI / 4) * -Brick.SIZE / 4, Math.sin(Math.PI / 4) * Brick.SIZE / 4);
    
    if (shadowOffsetGetsTransformed) {
      
      shadowOffset = this.rotateVector(shadowOffset, -this.rotation);
      
    }

    context.shadowOffsetX = shadowOffset.x;
    context.shadowOffsetY = shadowOffset.y;

    context.shadowBlur = 5;
    context.shadowColor = "rgba(0, 0, 0, 0.5)";

  },

  applyScale: function(context) {
    
    context.translate(Brick.SIZE / 2, Brick.SIZE / 2);
    context.scale(1.1, 1.1);
    context.translate(- Brick.SIZE / 2, - Brick.SIZE / 2);

  },

  applyRotation: function(context) {

    context.translate(Brick.SIZE / 2, Brick.SIZE / 2);
    context.rotate(this.rotation);
    context.translate(- Brick.SIZE / 2, - Brick.SIZE / 2);

  },
  
  applyClearing: function(context) {
    
    var clearRectangle = new Rectangle(
      this.x - Brick.SIZE * 0.4, this.y - Brick.SIZE * 0.2, 
      Brick.SIZE * 1.6, Brick.SIZE * 1.6
    );
    
    context.addClearRectangle(clearRectangle);
  },

  drawGlobal: function(context) {

    var storeSize = Brick.SIZE;
    Brick.SIZE = Brick.BIG_SIZE;

    context.save();

      context.translate(this.x, this.y);
      this.applyStyle(context);
      this.draw(context);

    context.restore();

    this.applyClearing(context);

    Brick.SIZE = storeSize;
  },

  createBody: function(world) {
    var bodyDefinition = new b2BodyDef();

    bodyDefinition.position.Set(this.cell.col + 0.5, this.cell.row + 0.5);

    this.body = world.CreateBody(bodyDefinition);

    this.createShapes(this.body);

    this.body.SetMassFromShapes();
    
    this.setRotation(this.rotation);
  },
  
  createShapes: function(body) {
    
    var shapeDefinition = new b2PolygonDef();
    
    shapeDefinition.SetAsBox(0.5, 0.5);
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    body.CreateShape(shapeDefinition);
    
  },
  
  removeBody: function(world) {
    
    var bodyCount = world.m_bodyCount;

    world.DestroyBody(this.body);

    this.body = null;

    if (bodyCount === world.m_bodyCount) {
    }
    
  },
  
  moveToCell: function(cell) {
    
    this.cell = cell;
    
    if (this.body) {
    
      this.body.SetXForm(new b2Vec2(cell.col + 0.5, cell.row + 0.5), this.body.GetAngle());
    
    }
  },

  rotate: function(radian) {
    
    if (this.rotateID) {
      
      clearTimeout(this.rotateID);
      
      this.targetRotation += radian;
    
    } else {
    
      this.storedDynamic = this.isDynamic;
      this.isDynamic = true;
    
      this.parent.renderNew = true;
    
      this.targetRotation = this.rotation + radian;
      
    }
    
    var myScope = this;
    
    this.rotateID = setTimeout(function() {
      myScope.rotateTimeout();
    }, 30);
    
  },
  
  rotateTimeout: function() {
    
    this.rotation += (this.targetRotation - this.rotation) / 3;

    if (Math.abs(this.rotation - this.targetRotation) < 0.03) {

      this.rotateStop();

    } else {

      var myScope = this;

      this.rotateID = setTimeout(function() {
        myScope.rotateTimeout();
      }, 30);
      
    }
    
  }, 
  
  rotateStop: function() {
    
    this.setRotation(this.targetRotation);
    
    this.isDynamic = this.storedDynamic;
    
    this.parent.renderNew = true;
    
    this.rotateID = null;
    
  },
  
  setRotation: function(radian) {
    
    if (this.body) {

      this.body.SetXForm(this.body.GetPosition(), radian);

      this.rotation = this.body.GetAngle();

    } else {

      this.rotation = radian;

    }
    
  },
  
  rotateVector: function(vector, angle) {
    return new b2Vec2(
      vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
      vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
    );
  }

});

Brick.SIZE = 28;
Brick.BIG_SIZE = 32;
Brick.TINY_SIZE = 12;

Brick.prototype.type = "Brick";

var Kicker = Class.create(Brick, {

  drawShape: function(context) {

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(1, 0);
    context.bezierCurveTo(1, Brick.SIZE / 2, Brick.SIZE / 2, Brick.SIZE - 1, Brick.SIZE, Brick.SIZE - 1);
    context.lineTo(Brick.SIZE, Brick.SIZE);
    context.lineTo(0, Brick.SIZE);
    context.lineTo(0, 0);
    context.closePath();
    
    context.fill();
    
    context.clearShadow();

    context.stroke();

  },

  createShapes: function(body) {
    var shapeDefinitions = [],
        numberOfSegments = 6,
        i;

    for (i = 0; i < numberOfSegments; i++) {
      shapeDefinitions[i] = new b2PolygonDef();
      shapeDefinitions[i].vertexCount = 4;
      shapeDefinitions[i].restitution = 0;
      shapeDefinitions[i].friction = 0.9;  
    }

    var angle = Math.PI / 2 / numberOfSegments;

    var circleVector = {x: -Math.cos(angle), y: Math.sin(angle)},
        lineVector = {x: -1.0, y: Math.tan(angle)};

    shapeDefinitions[0].vertexCount = 3;
    shapeDefinitions[0].vertices[0].Set(-0.5, -0.5);
    shapeDefinitions[0].vertices[1].Set(circleVector.x + 0.5, circleVector.y - 0.5);
    shapeDefinitions[0].vertices[2].Set(lineVector.x + 0.5, lineVector.y - 0.5);

    for (i = 1; i < numberOfSegments - 1; i++) {
      var newCircleVector = {x: -Math.cos((i + 1) * angle), y: Math.sin((i + 1) * angle)},
          newLineVector;

      if (i >= numberOfSegments / 2) {

        var n = numberOfSegments - i - 1;
        newLineVector = {x: -Math.tan(n * angle), y: 1.0};

      } else {

        newLineVector = {x: -1.0, y: Math.tan((i + 1) * angle)};
        
      }
      
      shapeDefinitions[i].vertices[0].Set(circleVector.x + 0.5, circleVector.y - 0.5);
      shapeDefinitions[i].vertices[1].Set(newCircleVector.x + 0.5, newCircleVector.y - 0.5);
      shapeDefinitions[i].vertices[2].Set(newLineVector.x + 0.5, newLineVector.y - 0.5);
      shapeDefinitions[i].vertices[3].Set(lineVector.x + 0.5, lineVector.y - 0.5);

      circleVector = newCircleVector;
      lineVector = newLineVector;
    }

    shapeDefinitions[numberOfSegments - 1].vertexCount = 3;
    shapeDefinitions[numberOfSegments - 1].vertices[0].Set(0.5, 0.5);
    shapeDefinitions[numberOfSegments - 1].vertices[1].Set(lineVector.x + 0.5, lineVector.y - 0.5);
    shapeDefinitions[numberOfSegments - 1].vertices[2].Set(circleVector.x + 0.5, circleVector.y - 0.5);
    
    for (i = 0; i < numberOfSegments; i++) {
      body.CreateShape(shapeDefinitions[i]);
    }

  }

});

Kicker.prototype.type = "Kicker";
var Ramp = Class.create(Brick, {

  drawShape: function(context) {

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Brick.SIZE, Brick.SIZE);
    context.lineTo(0, Brick.SIZE);
    context.lineTo(0, 0);
    context.closePath();
    
    context.fill();

    context.clearShadow();

    context.stroke();

  },

  createShapes: function(body) {
    var shapeDefinition = new b2PolygonDef();

    shapeDefinition.vertexCount = 3;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;  

    shapeDefinition.vertices[0].Set(-0.5, -0.5);
    shapeDefinition.vertices[1].Set(0.5, 0.5);
    shapeDefinition.vertices[2].Set(-0.5, 0.5);

    body.CreateShape(shapeDefinition);
    
  }
});

Ramp.prototype.type = "Ramp";
var Curve = new Class.create(Brick, {

  drawShape: function(context) {

    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(Brick.SIZE / 2, 0,  Brick.SIZE, Brick.SIZE / 2, Brick.SIZE, Brick.SIZE);
    context.lineTo(0, Brick.SIZE);
    context.lineTo(0, 0);
    context.closePath();
     
    context.fill();
      
    context.clearShadow();

    context.stroke();

  },

  createShapes: function(body) {
    var shapeDefinition = new b2PolygonDef(),
      angle = Math.PI / 2 / 6,
      i, j;

    shapeDefinition.vertexCount = 8;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    shapeDefinition.vertices[0].Set(-0.5, 0.5);

    for (i = 6, j = 0; i >= 0; i--, j++) {
      shapeDefinition.vertices[j].Set(Math.cos(angle * i) - 0.5, -Math.sin(angle * i) + 0.5);
    }

    shapeDefinition.vertices[7].Set(-0.5, 0.5);

    body.CreateShape(shapeDefinition);
    
  }

});

Curve.prototype.type = "Curve";
var Line = Class.create(Brick, {

  drawShape: function(context) {

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Brick.SIZE, 0);
    context.lineTo(Brick.SIZE, Brick.SIZE / 7);
    context.lineTo(0, Brick.SIZE / 7);
    context.lineTo(0, 0);
    context.closePath();
  
    context.fill();
      
    context.clearShadow();

    context.stroke();

  },

  createShapes: function(body) {
    var shapeDefinition = new b2PolygonDef(),
        horizAlign = 0.01,
        vertAlign = 0.001;

    shapeDefinition.vertexCount = 8;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    shapeDefinition.vertices[0].Set(-0.5, -0.5 + vertAlign);
    shapeDefinition.vertices[1].Set(-0.5 + horizAlign, -0.5);
    
    shapeDefinition.vertices[2].Set(0.5 - horizAlign, -0.5);
    shapeDefinition.vertices[3].Set(0.5, -0.5 + vertAlign);
    
    shapeDefinition.vertices[4].Set(0.5, -0.5 + 0.125 - vertAlign);
    shapeDefinition.vertices[5].Set(0.5 - horizAlign, -0.5 + 0.125);
    
    shapeDefinition.vertices[6].Set(-0.5 + horizAlign, -0.5 + 0.125);
    shapeDefinition.vertices[7].Set(-0.5, -0.5 + 0.125 - vertAlign);

    body.CreateShape(shapeDefinition);

  }

});

Line.prototype.type = "Line";
var Exit = Class.create(Brick, {

  initialize: function($super) {
    $super();

    this.isDraggable = false;
    this.isRemoveable = false;

    this.isInFront = false;
    this.hasShadow = false;
  },

  drawShape: function(context) {
    var checkerBoardSize = 5,
        checkerSize = Brick.SIZE / checkerBoardSize,
        counter = 0,
        i, j;

    for (i = 0; i < checkerBoardSize; i++) {

      for (j = 0; j < checkerBoardSize; j++) {

        if (counter % 2 === 0) {
          context.fillRect(checkerSize * j, checkerSize * i, checkerSize, checkerSize);
        }

        counter++;
      }

    }
  },

  createShapes: function(body) {
    var shapeDefinition = new b2PolygonDef();

    shapeDefinition.vertexCount = 4;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    shapeDefinition.vertices[0].Set(0.3, 0.3);
    shapeDefinition.vertices[1].Set(-0.3, 0.3);
    shapeDefinition.vertices[2].Set(-0.3, -0.3);
    shapeDefinition.vertices[3].Set(0.3, -0.3);

    shapeDefinition.isSensor = true;

    body.CreateShape(shapeDefinition);

    var myScope = this;

    body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };

  },

  onCollision: function(contact) {
    if (contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance) {

      this.parent.parent.onBallExit();
      this.parent.endTick = performance.now();

      if (this.parent.trackLength && this.parent.bricks.length > 2) {

        this.parent.validTrack = true;
        $('publishButton').addClassName('activePublish');
        $('publishButtonWarning').style.visibility = "hidden";

      }

    }
  },

  rotate: function() {
    return;
  }

});

Exit.prototype.type = "Exit";

var Spring = new Class.create(Brick, {

  drawShape: function(context) {
    
    context.strokeStyle = context.fillStyle;
    context.lineWidth = 2;

    context.beginPath();
    
    context.moveTo(Brick.SIZE / 5, Brick.SIZE * 0.22);
    context.lineTo(Brick.SIZE * 4 / 5, Brick.SIZE * 0.07);
    
    context.moveTo(Brick.SIZE / 5, Brick.SIZE * 0.37);
    context.lineTo(Brick.SIZE * 4 / 5, Brick.SIZE * 0.22);
    
    context.moveTo(Brick.SIZE / 5, Brick.SIZE * 0.52);
    context.lineTo(Brick.SIZE * 4 / 5, Brick.SIZE * 0.37);
        
    context.stroke();
    
    
    context.fillRect(0, 0, Brick.SIZE, Brick.SIZE / 8);
    context.fillRect(0, Brick.SIZE / 2, Brick.SIZE, Brick.SIZE / 2);
    
    context.clearShadow();
    
    this.applyStyle(context);
    
    context.strokeRect(0, 0, Brick.SIZE, Brick.SIZE);
    
  },

  createBody: function($super, world) {
    
    $super(world);

    var myScope = this;

    this.body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };
  },

  onCollision: function(contact) {
    var ball;
    
    if (contact.shape1.GetBody().ballInstance) {
      
      ball = contact.shape1.GetBody().ballInstance;
      
    } else if (contact.shape2.GetBody().ballInstance) {
      
      ball = contact.shape2.GetBody().ballInstance;
      
    } else {
      
      return;
      
    }
    
    var bodyPoint = this.body.GetPosition();
    var relativeContactPoint = new b2Vec2(
      contact.position.x - bodyPoint.x, 
      contact.position.y - bodyPoint.y
    );
    var contactPoint = this.rotateVector(relativeContactPoint, -this.body.GetAngle());
    
    if (contactPoint.x > - 0.5 && contactPoint.x < 0.5 && contactPoint.y > - 0.6 && contactPoint.y < - 0.4) {
    
      var springVector = new b2Vec2(0, -6);
    
      ball.impulseVector.Add(this.rotateVector(springVector, this.body.GetAngle()));
    }

  }

});

Spring.prototype.type = "Spring";
var Boost = new Class.create(Brick, {
  
  initialize: function($super) {
    $super();

    this.isInFront = false;
    this.hasShadow = false;
  },

  drawShape: function(context) {
    
    context.beginPath();
    context.moveTo(Brick.SIZE / 7, Brick.SIZE * 3 / 14);
    context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE * 3 / 14);
    context.lineTo(Brick.SIZE * 4 / 7, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE * 11 / 14);
    context.lineTo(Brick.SIZE / 7, Brick.SIZE * 11 / 14);
    context.lineTo(Brick.SIZE * 3 / 7, Brick.SIZE / 2);
    context.closePath();
    
    context.fill();
    
    context.beginPath();
    context.moveTo(Brick.SIZE * 3 / 7, Brick.SIZE * 3 / 14);
    context.lineTo(Brick.SIZE * 4 / 7, Brick.SIZE * 3 / 14);
    context.lineTo(Brick.SIZE * 6 / 7, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE * 4 / 7, Brick.SIZE * 11 / 14);
    context.lineTo(Brick.SIZE * 3 / 7, Brick.SIZE * 11 / 14);
    context.lineTo(Brick.SIZE * 5 / 7, Brick.SIZE / 2);
    context.closePath();
    
    context.fill();
    
  },

  createShapes: function(body) {
    var shapeDefinition = new b2PolygonDef();

    shapeDefinition.vertexCount = 4;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    shapeDefinition.vertices[0].Set(-0.4, -0.4);
    shapeDefinition.vertices[1].Set(0.4, -0.4);
    shapeDefinition.vertices[2].Set(0.4, 0.4);
    shapeDefinition.vertices[3].Set(-0.4, 0.4);

    shapeDefinition.isSensor = true;

    shapeDefinition.filter.maskBits = 0x0002;

    body.CreateShape(shapeDefinition);

    var myScope = this;

    body.whileCollision = function(contact) {
      myScope.whileCollision(contact);
    };
  },

  whileCollision: function(contact) {
    
    var ball;

    if (contact.shape1.GetBody().ballInstance) {
      
      ball = contact.shape1.GetBody().ballInstance;
      
    } else {
      
      ball = contact.shape2.GetBody().ballInstance;
      
    }

    var boostVector = new b2Vec2(.3, 0);
    
    ball.impulseVector.Add(this.rotateVector(boostVector, this.body.GetAngle()));

  }

});

Boost.prototype.type = "Boost";
var Ball = Class.create(Brick, {

  initialize: function($super) {
    $super();

    this.impulseVector = new b2Vec2();
    this.positionVector = new b2Vec2();
    this.velocityVector = new b2Vec2();

    this.lastPosition = new b2Vec2();

    this.isDraggable = false;
    this.isRemoveable = false;

    this.isDynamic = true;
    this.hasShadow = false;
  },

  update: function() {

    if (this.impulseVector.Length() > 0) {

      this.body.ApplyImpulse(this.impulseVector, this.body.GetPosition());
      this.impulseVector.Set(0, 0);

    }

    if (this.positionVector.Length() > 0) {

      this.body.SetXForm(this.positionVector, this.body.GetAngle());
      this.body.SetLinearVelocity(this.velocityVector);

      this.lastPosition.Set(this.positionVector.x, this.positionVector.y);
      this.positionVector.Set(0, 0);

    }

    var difference = this.minus(this.lastPosition, this.body.GetPosition());
    this.parent.trackLength += difference.Length() / 10;

    this.lastPosition.Set(this.body.GetPosition().x, this.body.GetPosition().y);

    if (this.parent.trackLength > 9999) {
      this.parent.trackLength = 9999;
    }

    $('lengthDisplay').update(this.getFormatString(this.parent.trackLength * 10));
    $('durationDisplayEditor').update(this.getDurationString((performance.now() - this.parent.startTick) / 1000, 2) + ' Seconds');
    $('durationDisplayShowroom').update(this.getDurationString((performance.now() - this.parent.startTick) / 1000, 2) + ' Seconds');

  },

  minus: function(a, b) {
    return new b2Vec2(
      a.x - b.x,
      a.y - b.y
    );
  },

  getDurationString: function(value, decimalPlaces) {
    var multiplier = Math.pow(10, decimalPlaces);
    return (Math.round(value * multiplier) / multiplier).toFixed(decimalPlaces);
  },

  getFormatString: function(number) {

    number = parseInt(number, 10).toString();

    while (number.length < 4) {
      number = "0" + number;
    }

    return number.toString();
  },

  reset: function() {

    this.lastPosition.Set(this.cell.col + 0.5, this.cell.row + 0.5);

    if (this.body) {

      this.body.SetXForm(this.lastPosition, 0);

      this.body.SetLinearVelocity({x: 0, y: 0});
      this.body.SetAngularVelocity(0);

    }

    this.impulseVector.Set(0, 0);
  },

  drawShape: function(context) {

    var position;

    if (this.body) {

      position = this.body.GetPosition();

      var x = this.x + (position.x - this.cell.col - Ball.radius) * Brick.SIZE,
          y = this.y + (position.y - this.cell.row - Ball.radius) * Brick.SIZE;

      context.addClearRectangle(new Rectangle(x, y, Ball.radius * 2 * Brick.SIZE, Ball.radius * 2 * Brick.SIZE));

    } else {

      position = {
        x: this.cell.col + 0.5,
        y: this.cell.row + 0.5
      };

    }

    context.save();

      context.translate((position.x - this.cell.col) * Brick.SIZE, (position.y - this.cell.row) * Brick.SIZE);

      if (this.body) {
        context.rotate(this.body.GetAngle());
      }

      context.fillStyle = "#0040F0";

      context.beginPath();
      context.arc(0, 0, Ball.radius * Brick.SIZE, 0, Math.PI * 2, true);
      context.lineTo(Ball.radius * Brick.SIZE, 0);

      context.fill();

    context.restore();

  },

  createShapes: function(body) {
    var shapeDefinition = new b2CircleDef();

    shapeDefinition.radius = Ball.radius;
    shapeDefinition.restitution = 0;
    shapeDefinition.density = 2;
    shapeDefinition.friction = 0.9;

    shapeDefinition.filter.categoryBits = 0x0002;

    body.CreateShape(shapeDefinition);
    body.SetMassFromShapes();

    body.ballInstance = this;

  },

  rotate: function() {
    return;
  }

});

Ball.prototype.type = "Ball";

Ball.radius = 0.25;

var Breaker = new Class.create(Brick, {

  initialize: function($super) {
    $super();
    
    this.bodies = null;
    this.isBroken = false;
    
    this.timeoutID = 0;
    this.isDynamic = false;
    this.hasShadow = true;
    
    this.generateShapes();
  },

  reset: function() {
    
    this.isDynamic = false;
    this.isBroken = false;
    
    if (this.timeoutID) {
      
      clearTimeout(this.timeoutID);
      this.timeoutID = 0;
    
    }
    
    if (this.bodies) {
      
      this.removeBodies(this.world);
      
    }
    
    if (!this.body) {
      
      this.createBody(this.world);
      
    }
  },
  
  createBody: function($super, world) {
    
    this.world = world;
    
    $super(world);
    
    var myScope = this;
    
    this.body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };
    
    this.body.afterCollision = function(contact) {
      myScope.afterCollision(contact);
    }
    
  },
  
  createBodies: function(world) {
    
    this.bodies = [];
    
    var i;

    for (i = 0; i < this.shapes.length; i++) {
      
      var bodyDefinition = new b2BodyDef();

      bodyDefinition.position.Set(this.cell.col + 0.5, this.cell.row + 0.5);

      var body = world.CreateBody(bodyDefinition);

      this.createShape(body, i);

      body.SetMassFromShapes();

      this.bodies.push(body);

    }
    
  },
  
  removeBody: function($super, world) {
    
    $super(world);
    
    if (this.bodies) {
      
      this.removeBodies(world);
      
    }
    
    this.body = null;
  },

  removeBodies: function(world) {

    var bodyCount = world.m_bodyCount,
        i;

    for (i = 0; i < this.bodies.length; i++) {
      world.DestroyBody(this.bodies[i]);
    }

    if (bodyCount === world.m_bodyCount) {
      console.error("Bodies were not removed");
    }
    
    this.bodies = null;

  },

  drawShape: function(context) {
    
    if (this.isBroken) {
      return;
    }
    
    var i, j, x, y, position;
    
    context.save();
  
    if (this.bodies) {
      context.clearShadow();
    }
    
    context.translate(-this.cell.col * Brick.SIZE, -this.cell.row * Brick.SIZE);

    for (i = 0; i < this.shapes.length; i++) {
  
      context.save();
        
        if (this.bodies) { 
          
          position = this.bodies[i].GetPosition();
          
        } else {
          
          position = {x: this.cell.col + 0.5, y: this.cell.row + 0.5};
          
        }
    
        context.translate(position.x * Brick.SIZE, position.y * Brick.SIZE);
        
        if (this.bodies) {
          context.rotate(this.bodies[i].GetAngle());
        }
  
        context.beginPath();

        context.moveTo(this.shapes[i][0].x * Brick.SIZE, this.shapes[i][0].y * Brick.SIZE);
      
        for (j = 1; j < this.shapes[i].length; j++) {

            context.lineTo(this.shapes[i][j].x * Brick.SIZE, this.shapes[i][j].y * Brick.SIZE);

        }
      
        context.closePath();
        
        context.fill();
        context.stroke();
  
      context.restore();
    
      if (this.bodies) {

        x = this.x + (position.x - this.cell.col - 0.7) * Brick.SIZE;
        y = this.y + (position.y - this.cell.row - 0.7) * Brick.SIZE;

        context.addClearRectangle(new Rectangle(x, y, Brick.SIZE * 1.4, Brick.SIZE * 1.4));

      }
  
    }
    
    context.restore();
    
  },
  
  createShape: function(body, index) {
    
    var shapeDefinition = new b2PolygonDef(),
        i;

    shapeDefinition.vertexCount = this.shapes[index].length;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    for (i = 0; i < this.shapes[index].length; i++) {
    
      shapeDefinition.vertices[i] = this.shapes[index][i];
    
    }

    shapeDefinition.density = 2;

    shapeDefinition.filter.maskBits = 0x0001;

    body.CreateShape(shapeDefinition);
  },
  
  onCollision: function(contact) {
    
    if (this.timeoutID && (contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance)) {
      
      clearTimeout(this.timeoutID);
      this.timeoutID = 0;
    
    }
  },

  afterCollision: function(contact) {
    if (this.isBroken) {
      return;
    }
    
    if (contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance) {

      if (this.timeoutID) {

        clearTimeout(this.timeoutID);
        this.timeoutID = 0;

      }

      var myScope = this;

      this.timeoutID = setTimeout(function() {
        myScope.onTimeout();
      }, 200);
    }
  },
  
  onTimeout: function() {
    
    this.isDynamic = true;
    this.parent.renderNew = true;
    
    this.removeBody(this.world);
    this.createBodies(this.world);
    
    this.applyImpulse();
    
    var myScope = this;
    
    this.timeoutID = setTimeout(function() {
      myScope.removeBodies(myScope.world);
      myScope.isBroken = true;
    }, 500);
    
  },
  
  applyImpulse: function() {
    
    var i;
    
    var impulseVector = new b2Vec2(0, -Math.random());
    impulseVector = this.rotateVector(impulseVector, -Math.PI / 3);
    
    for (i = 0; i < this.bodies.length; i++) {
      
      this.bodies[i].ApplyImpulse(
        impulseVector, 
        this.bodies[i].GetPosition()
      );
      
      impulseVector = this.rotateVector(impulseVector, Math.PI / 3);
    }
  },
  
  generateShapes: function() {

    this.shapes = [];

    var middlePoint = new b2Vec2((Math.random() / 2) - 0.25, (Math.random() / 2) - 0.25),
        outlinePoints = [
          new b2Vec2(-0.5, (Math.random() / 2) - 0.25),

          new b2Vec2(-0.5, -0.5),

          new b2Vec2(-Math.random() / 2, -0.501),
          new b2Vec2(Math.random() / 2, -0.501),

          new b2Vec2(0.5, -0.5),

          new b2Vec2(0.501, (Math.random() / 2) - 0.25),

          new b2Vec2(0.5, 0.5),

          new b2Vec2(Math.random() / 2, 0.501),
          new b2Vec2(-Math.random() / 2, 0.501),

          new b2Vec2(-0.501, 0.5)
        ],
        vertexNumbers = [3, 2, 3, 3, 2, 3],
        counter = 0,
        i, j;
        
    vertexNumbers.shuffle();

    for (i = 0; i < 6; i++) {

      var shape = [];

      shape.push(middlePoint);

      for (j = 0; j < vertexNumbers[i]; j++) {

        shape.push(outlinePoints[counter % 10]);

        counter++;

      }

      counter--;

      this.shapes.push(shape);
    }
  },
  
  rotate: function() {
    return;
  }

});

Breaker.prototype.type = "Breaker";
var Beamer = new Class.create(Brick, {
  
  initialize: function($super) {
    $super();
    
    this.partner = null;
    this.hasBeamed = false;
  },
  
  reset: function() {
    
    this.hasBeamed = false;
    
  },

  drawShape: function(context) {

    context.beginPath();

    context.moveTo(0, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE / 5, Brick.SIZE / 2);
    
    context.bezierCurveTo(
      Brick.SIZE / 5, Brick.SIZE * 9 / 10, 
      Brick.SIZE * 4 / 5, Brick.SIZE * 9 / 10, 
      Brick.SIZE * 4 / 5, Brick.SIZE / 2
    );
    
    context.lineTo(Brick.SIZE, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE, Brick.SIZE);
    context.lineTo(0, Brick.SIZE);
    
    context.closePath();
    
    context.fill();
    
    context.clearShadow();
    
    context.stroke();
  },

  createShapes: function(body) {
    var rect1Definition = new b2PolygonDef();

    rect1Definition.vertexCount = 3;
    rect1Definition.restitution = 0;
    rect1Definition.friction = 0.9;

    rect1Definition.vertices[0].Set(-0.5, 0);
    rect1Definition.vertices[1].Set(0.2, 0.5);
    rect1Definition.vertices[2].Set(-0.5, 0.5);
    
    body.CreateShape(rect1Definition);
    
    var rect2Definition = new b2PolygonDef();

    rect2Definition.vertexCount = 3;
    rect2Definition.restitution = 0;
    rect2Definition.friction = 0.9;

    rect2Definition.vertices[0].Set(0.5, 0);
    rect2Definition.vertices[1].Set(0.5, 0.5);
    rect2Definition.vertices[2].Set(-0.2, 0.5);
    
    body.CreateShape(rect2Definition);
    
    var sensorDefinition = new b2PolygonDef();

    sensorDefinition.vertexCount = 3;
    sensorDefinition.restitution = 0;
    sensorDefinition.friction = 0.9;

    sensorDefinition.vertices[0].Set(0, 0);
    sensorDefinition.vertices[1].Set(0.2, 0.2);
    sensorDefinition.vertices[2].Set(-0.2, 0.2);
    
    sensorDefinition.isSensor = true;
    
    sensorDefinition.filter.maskBits = 0x0002;
    
    body.CreateShape(sensorDefinition);

    var myScope = this;

    body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };
    
    body.afterCollision = function(contact) {
      myScope.afterCollision(contact);
    };
    
    this.divorce();
  },
  
  removeBody: function($super, world) {
    $super(world);
    
    if (this.partner) {
      
      this.partner.divorce();
      this.partner = null;
      
    } else if (this.parent.singles[this.pairType] === this) {
      
      this.parent.singles[this.pairType] = null;
      
    }
    
  },
  
  divorce: function() {
    
    this.partner = null;
    this.parent.findPartner(this);
    
  },

  onCollision: function(contact) {
    
    var ball;

    if (contact.shape1.m_isSensor) {
      
      ball = contact.shape2.GetBody().ballInstance;
      
    } else if (contact.shape2.m_isSensor) {
      
      ball = contact.shape1.GetBody().ballInstance;
      
    } else {
      
      return;
      
    }
    
    if (this.partner && !this.hasBeamed) {
      
      var positionOffset = this.rotateVector(new b2Vec2(0, -0.1), this.partner.rotation);
      
      ball.positionVector.Set(this.partner.cell.col + 0.5 + positionOffset.x, this.partner.cell.row + 0.5 + positionOffset.y);
      
      positionOffset.Multiply(10);
      positionOffset.Multiply(ball.body.GetLinearVelocity().Length());
      ball.velocityVector = positionOffset;
      
      
      this.hasBeamed = this.partner.hasBeamed = true;
    }
  },
  
  afterCollision: function(contact) {
    
    if (this.hasBeamed && this.partner &&
      (contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance)) {
      
      this.hasBeamed = this.partner.hasBeamed = false;
    }
  }

});

Beamer.prototype.type = "Beamer";
Beamer.prototype.pairType = "Beamer";
var OneWay = Class.create(Line, {
  
  initialize: function($super) {
    
    $super();
    
    this.isActive = false;
    
  },
  
  reset: function() {
    
    this.isActive = false;
    
  },

  drawShape: function($super, context) {
    
    $super(context);
    
    context.beginPath();
    context.moveTo(Brick.SIZE / 2, Brick.SIZE * 7 / 20);
    context.lineTo(Brick.SIZE * 7 / 10, Brick.SIZE * 13 / 20);
    context.lineTo(Brick.SIZE * 3 / 10, Brick.SIZE * 13 / 20);
    context.closePath();
    
    context.fill();

  },

  createShapes: function($super, body) {
    
    $super(body);
    
    var shapeDefinition = new b2PolygonDef();

    shapeDefinition.vertexCount = 4;
    shapeDefinition.restitution = 0;
    shapeDefinition.friction = 0.9;

    shapeDefinition.vertices[0].Set(-1.5, -0.45);
    shapeDefinition.vertices[1].Set(1.5, -0.45);
    shapeDefinition.vertices[2].Set(1.5, 0);
    shapeDefinition.vertices[3].Set(-1.5, 0);

    shapeDefinition.isSensor = true;

    shapeDefinition.filter.maskBits = 0x0002;

    body.CreateShape(shapeDefinition);
    
    var myScope = this;
    
    body.beforeCollision = function(shape1, shape2) {
      return myScope.beforeCollision(shape1, shape2);
    };

    body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };

    body.afterCollision = function(contact) {
      myScope.afterCollision(contact);
    };
  },

  removeBody: function($super, world) {
    $super(world);

  },
  
  beforeCollision: function(shape1, shape2) {
    
    if (shape1.GetBody().ballInstance && this.isActive) {
        
      return false;
      
    } else if (shape2.GetBody().ballInstance && this.isActive) {
        
      return false;
      
    }
    
    return true;
    
  },

  onCollision: function(contact) {

    if (contact.shape1.GetBody().ballInstance && contact.shape2.m_isSensor) {

      this.isActive = true;
      
    } else if (contact.shape2.GetBody().ballInstance && contact.shape1.m_isSensor) {
        
      this.isActive = true;
      
    }

  },

  afterCollision: function(contact) {
    
    if (contact.shape1.GetBody().ballInstance && contact.shape2.m_isSensor) { 
        
      this.isActive = false;
      
    } else if (contact.shape2.GetBody().ballInstance && contact.shape1.m_isSensor) {
        
      this.isActive = false;

    }

  }

});

OneWay.prototype.type = "OneWay";
var Graviton = new Class.create(Brick, {

  initialize: function($super) {
    $super();
    
    this.isActive = false;
    this.timeoutID = 0;
    
    this.isDynamic = false;
    this.hasShadow = true;
  },

  reset: function() {
    
    this.isActive = false;
    
    if (this.timeoutID) {
    
      clearTimeout(this.timeoutID);
      this.timeoutID = 0;
      
    }
  },
  
  createBody: function($super, world) {
    
    $super(world);
    
    var myScope = this;
    
    this.body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };
    
  },

  drawShape: function($super, context) {
    
    $super(context);

    context.beginPath();

    context.moveTo(Brick.SIZE / 2, Brick.SIZE / 7);
    context.lineTo(Brick.SIZE * 6 / 7, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE * 5 / 7, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE * 5 / 7, Brick.SIZE * 6 / 7);
    context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE * 6 / 7);
    context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE / 2);
    context.lineTo(Brick.SIZE / 7, Brick.SIZE / 2);
    
    context.closePath();

    if (this.isActive) {
      
      context.save();
      
      context.fillStyle = context.strokeStyle;
      context.fill();
      
      context.restore();

    } else {

      context.stroke();

    }

  },
  
  onCollision: function(contact) {
    
    if (contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance) {
      
      this.parent.setActiveGraviton(this);
      this.isActive = true;
      this.parent.renderNew = true;
      
      var myScope = this;
      
      this.timeoutID = setTimeout(function() {

        var gravity = new b2Vec2(0, -9.81),
            world = myScope.body.GetWorld();

        world.SetGravity(myScope.rotateVector(gravity, myScope.body.GetAngle()));

        myScope.timeoutID = 0;
        
      }, 50);
    }
  }

});

Graviton.prototype.type = "Graviton";
var BallBox = Class.create(Brick, {
  
  initialize: function($super) {
    $super();
    
    this.ball = new Ball();
    this.timeoutID = 0;
    
  },
  
  update: function() {
    
    if (this.ball.body) {
      
      this.ball.update();
      
    }
    
  },
  
  reset: function() {
      
    this.ball.reset();
    
    if (this.timeoutID) {
    
      clearTimeout(this.timeoutID);
      this.timeoutID = 0;
      
    } else if (this.ball.body) {
      
      this.isDynamic = false;
      
      var world = this.body.GetWorld();
      
      this.ball.removeBody(world);
      
    }
    
  },
  
  createBody: function($super, world) {
    
    $super(world);

    var myScope = this;

    this.body.onCollision = function(contact) {
      myScope.onCollision(contact);
    };
  },

  drawShape: function(context) {
    
    if (this.ball.body && !this.parent.renderStatics) {

      context.restore();
      context.save();

      context.translate(this.cell.col * Brick.SIZE, this.cell.row * Brick.SIZE);

      this.ball.draw(context);

      context.restore();
      context.save();
    
    } else {
      
      context.beginPath();

      context.moveTo(0, 0);
      context.lineTo(Brick.SIZE, 0);
      context.lineTo(Brick.SIZE, Brick.SIZE * 5 / 14);
      context.lineTo(0, Brick.SIZE * 5 / 14);

      context.closePath();
      context.fill();


      context.beginPath();

      context.moveTo(0, Brick.SIZE * 5 / 14);
      context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE * 5 / 14);
      context.lineTo(Brick.SIZE / 2, Brick.SIZE * 9 / 14);
      context.lineTo(Brick.SIZE / 2, Brick.SIZE);
      context.lineTo(0, Brick.SIZE);

      context.closePath();
      context.fill();


      context.beginPath();

      context.moveTo(Brick.SIZE, Brick.SIZE * 5 / 14);
      context.lineTo(Brick.SIZE * 5 / 7, Brick.SIZE * 5 / 14);
      context.lineTo(Brick.SIZE / 2, Brick.SIZE * 9 / 14);
      context.lineTo(Brick.SIZE / 2, Brick.SIZE);
      context.lineTo(Brick.SIZE, Brick.SIZE);

      context.closePath();
      context.fill();

      context.clearShadow();


      context.strokeRect(0, 0, Brick.SIZE, Brick.SIZE);

      context.beginPath();

      context.moveTo(Brick.SIZE * 5 / 7, Brick.SIZE * 5 / 14);
      context.lineTo(Brick.SIZE / 2, Brick.SIZE * 9 / 14);
      context.lineTo(Brick.SIZE * 2 / 7, Brick.SIZE * 5 / 14);

      context.closePath();
      
      if (!this.ball.body) {
        
        context.save();
        
        context.fillStyle = "#800000";
        context.fill();
        
        context.restore();
        
      }
      
      context.stroke();
      
    }

  },
  
  shootBall: function() {
    
    this.isDynamic = true;
    
    var world = this.body.GetWorld(),
        shootVector = new b2Vec2(0, 6),
        offset = this.rotateVector(new b2Vec2(0, 0.6), this.body.GetAngle());

    this.ball.createBody(world);
    
    this.ball.parent = this.parent;
    this.ball.cell = this.cell;
    
    this.ball.reset();
    
    this.ball.x = this.x;
    this.ball.y = this.y;
    
    offset.Add(this.ball.body.GetPosition());
    this.ball.body.SetXForm(offset, 0);
    
    this.ball.impulseVector.Add(this.rotateVector(shootVector, this.body.GetAngle()));
    
    this.parent.renderNew = true;
    
  },
  
  onCollision: function(contact) {
    
    if ((contact.shape1.GetBody().ballInstance || contact.shape2.GetBody().ballInstance)
      && !this.timeoutID && !this.ball.body) {
      
      var myScope = this;
      
      this.timeoutID = setTimeout(function() {
        
        myScope.shootBall();
        myScope.timeoutID = 0;
        
      }, 50);
    }
  }
  
});

BallBox.prototype.type = "BallBox";
Grid = Class.create(DisplayObject, {

  initialize: function($super) {
    $super();

    this.rows = 0;
    this.cols = 0;

    this.bricks = [];
    
    this.renderNew = false;
    
    this.renderStatics = false;
    this.renderDynamics = false;
  },

  draw: function(context) {
    
    this.drawStatics(context);
    this.drawDynamics(context);

  },
  
  drawStatics: function(context) {

    this.renderNew = false;

    this.setClipping(context);

      context.translate(this.x, this.y);

      this.drawStaticElements(context);

      this.drawFrame(context);

    this.releaseClipping(context);
    
  },
  
  drawDynamics: function(context) {
    this.setClipping(context);

      context.translate(this.x, this.y);

      this.renderDynamics = true;

      context.drawShadows = true;
      this.drawElements(context, true);

      this.renderDynamics = false;

    this.releaseClipping(context);
  },

  setClipping: function(context) {

    context.save();

    context.translate(0.5, 0.5);

      context.beginPath();
      context.moveTo(this.x - 2, this.y - 2);
      context.lineTo(this.x + this.width, this.y - 2);
      context.lineTo(this.x + this.width, this.y + this.height);
      context.lineTo(this.x - 2, this.y + this.height);
      context.closePath();

    context.translate(-0.5, -0.5);

    context.clip();
    
  },

  releaseClipping: function(context) {
    context.restore();
  },

  drawFrame: function(context) {
    
    context.save();

      context.translate(-0.5, -0.5);

      context.strokeStyle = "#40CCCC";
      context.lineWidth = 2;

      context.strokeRect(0, 0, this.width, this.height);

    context.restore();

  },

  drawGrid: function (context) {

    context.strokeStyle = "#200020";
    context.lineWidth = 0.5;

    var i;
    
    for (i = 1; i < this.rows; i++) {
      
      context.beginPath();
      context.dashedLine(0, i * Brick.SIZE, this.cols * Brick.SIZE, i * Brick.SIZE, 3);
      context.closePath();
      
      context.stroke();

    }

    for (i = 1; i < this.cols; i++) {
      
      context.beginPath();
      context.dashedLine(i * Brick.SIZE, 0,  i * Brick.SIZE, this.rows * Brick.SIZE, 3);
      context.closePath();
      
      context.stroke();

    }

    context.beginPath();

  },

  drawFieldShadow: function(context) {

    context.save();

      context.beginPath();
      context.moveTo(- 10, 0);
      context.lineTo(this.width, 0);
      context.lineTo(this.width, this.height);
      context.lineTo(this.width + 10, this.height);
      context.lineTo(this.width + 10, - 10);
      context.lineTo(- 10, - 10);
      context.closePath();

      context.shadowOffsetX = -6;
      context.shadowOffsetY = 6;
      context.shadowBlur = 5;
      context.shadowColor = "rgba(0, 0, 0, 0.4)";

      context.fill();
    
    context.restore();

  },
  
  drawStaticElements: function(context) {
    
    this.drawGrid(context);
    this.drawFieldShadow(context);

    this.renderStatics = true;

    context.drawShadows = true;
    this.drawElements(context);

    context.drawShadows = false;
    this.drawElements(context);

    this.renderStatics = false;
    
  },

  drawElements: function(context) {

    if (this.bricks.length === 0) {
      return;
    }
    
    this.bricks[0].applyStyle(context);

    var i;

    for (i = 0; i < this.bricks.length; i++) {
      if ((this.bricks[i].isDynamic && this.renderDynamics) || 
          (!this.bricks[i].isDynamic && this.renderStatics) ||
          (this.bricks[i].type === "BallBox" && this.bricks[i].ball.body)) {
      
        context.save();

          context.translate(this.bricks[i].cell.col * Brick.SIZE, this.bricks[i].cell.row * Brick.SIZE);
          this.bricks[i].draw(context);

        context.restore();
      }
    }

  },

  getCell: function(x, y) {
    if (x > 0 && y > 0 && x < this.width && y < this.height) {
      return {
        row: (Math.round(parseFloat(y / Brick.SIZE, 10) * 4) / 4) - 0.5, 
        col: (Math.round(parseFloat(x / Brick.SIZE, 10) * 4) / 4) - 0.5
      };
    }
    
    return null;
  },
  
  checkCell: function(cell) {
    return (cell && cell.row >= 0 && cell.row < this.rows && cell.col >= 0 && cell.col < this.cols);
  },
  
  getCellBox: function(cell) {
    if (!this.checkCell(cell)) {
      return null;
    }
    
    return new Rectangle(
      this.x + cell.col * Brick.SIZE, this.y + cell.row * Brick.SIZE,
      Brick.SIZE, Brick.SIZE
    );
  },

  getBrickAt: function(cell) {
    var i;
    
    if (this.checkCell(cell)) {
      for (i = 0; i < this.bricks.length; i++) {
        if (this.bricks[i].cell.row === cell.row && this.bricks[i].cell.col === cell.col) {
          return this.bricks[i];
        }
      }
    }

    return null;
  },

  removeBrickAt: function(cell) {
    if (!this.checkCell(cell)) {
      return false;
    }
    
    var i;

    for (i = 0; i < this.bricks.length; i++) {
      
      if (this.bricks[i].cell.row === cell.row && this.bricks[i].cell.col === cell.col) {
          
        this.bricks.splice(i, 1);
        
        this.renderNew = true;
        
        return true;
      }
    }

    return true;
  },

  dropBrickAt: function(brick, cell) {
    
    if (!this.checkCell(cell)) {
      return false;
    }
    
    brick.cell = cell;
    
    return this.insertBrick(brick);
  },
  
  insertBrick: function(brick) {
    
    brick.parent = this;
    
    if (!this.removeBrickAt(brick.cell)) {
      return false;
    }
    
    brick.x = this.x + brick.cell.col * Brick.SIZE;
    brick.y = this.y + brick.cell.row * Brick.SIZE;
    
    brick.width = brick.height = Brick.SIZE;
    
    if (brick.isInFront) {
      
      this.bricks.push(brick);
      
    } else {
      
      this.bricks.unshift(brick);
      
    }
    
    this.renderNew = true;
    
    return true;
  }

});
var Toolbox = Class.create(Grid, {
  
  initialize: function($super) {
    $super();

    this.rows = 15;
    this.cols = 3;

    this.width = Brick.SIZE * this.cols;
    this.height = Brick.SIZE * this.rows;
    
    this.brickCounter = 0;

  },

  addBrick: function(klass) {
    var brick = new klass();

    brick.cell = {row: this.brickCounter * 2 + 1, col: 1};
    brick.parent = this;

    this.dropBrickAt(brick, brick.cell);
    this.brickCounter++;
    
    if (brick.pairType) {
      var pairBrick = new klass();
      pairBrick.parent = this;
      
      pairBrick.setRotation(Math.PI);
      pairBrick.cell = brick.cell;
      this.bricks.push(pairBrick);
      
      brick.partner = pairBrick;
    }
    
    return brick;

  },
  
  addPreviewBrick: function(klass) {
    var brick = this.addBrick(klass);
    brick.isDraggable = false;
    brick.isPreview = true;
    
    if (brick.partner) {
      
      brick.partner.isDraggable = false;
      brick.partner.isPreview = true;
      
    }
  },
  
  onClick: function(mouseX, mouseY) {
    var cell = this.getCell(mouseX, mouseY),
        brick = this.getBrickAt(cell);

    if (brick && brick.isDraggable && this.parent.selectElement && this.parent.selectElement.brick === brick) {

      brick.rotate(Math.PI / 4);
      this.renderNew = true;
      
      if (brick.partner) {
        
        brick.partner.rotate(Math.PI / 4);
        
      }

    }

    this.select(cell);
  },

  onStartDrag: function(mouseX, mouseY) {
    var cell = this.getCell(mouseX, mouseY),
        brick = this.getBrickAt(cell);
    
    if (brick && brick.isDraggable) {

      var dragBrick = new (eval(brick.type))();
          dragBrick.rotation = brick.rotation;
          
      this.parent.dragBrick(dragBrick);
      
    }
    
    this.select(cell);
  },

  select: function(cell) {
    var brick = this.getBrickAt(cell),
        box = null;

    box = this.getCellBox(cell);
    
    if (brick && brick.isDraggable) {
      
      box.brick = brick;
      
    }
    
    this.parent.selectElement = box;
  }

});

var Field = Class.create(Grid, {

  initialize: function($super) {
    $super();

    this.rows = 15;
    this.cols = 10;

    this.width = Brick.SIZE * this.cols;
    this.height = Brick.SIZE * this.rows;

    this.bricks = [];
    this.singles = {};

    this.debugMode = false;

    this.trackLength = 0;
    this.startTick = 0;
    this.endTick = 0;
  },

  setup: function() {
    $('lengthDisplay').update("0000");
    this.trackLength = 0;

    this.initializeBox2D();

    this.clearTrack(true);
  },

  draw: function($super, context) {

    if (!this.debugMode) {

      $super(context);

    } else {

      this.drawBodies(context);

    }
  },

  drawStatics: function($super, context) {

    this.renderNew = false;

    if (this.parent.tweenMode) {

      this.setClipping(context);

        context.translate(this.x, this.y);

        context.save();

          context.translate(10, 0);
          this.drawFieldShadow(context);

        context.restore();

        context.save();

          context.translate(0, this.parent.fieldOffset);

          this.drawStaticElements(context);

        context.restore();

        this.parent.drawTweenMode(context);

        this.drawFrame(context);

      this.releaseClipping(context);

    } else {

      $super(context);

    }

  },

  drawBodies: function(context) {
    context.strokeStyle = "#40CCCC";
    context.lineWidth = 1;

    context.save();

      context.translate(this.x, this.y);

      var body;

      for (body = this.world.GetBodyList(); body !== null; body = body.GetNext()) {
        this.drawBody(context, body);
      }

    context.restore();

    context.addClearRectangle(new Rectangle(
      this.x - Brick.SIZE, this.y - Brick.SIZE,
      (this.cols + 2) * Brick.SIZE, (this.rows + 2) * Brick.SIZE
    ));
  },

  drawBody: function(context, body) {
    context.save();

      var position = body.GetPosition(),
        shape, i;

      context.translate(Brick.SIZE * position.x, Brick.SIZE * position.y);
      context.rotate(body.GetAngle());

      context.beginPath();

      context.moveTo(0, 0);
      context.lineTo(0, -Brick.SIZE / 2);

      for (shape = body.GetShapeList(); shape !== null; shape = shape.GetNext()) {

        if (shape.m_vertices && shape.m_vertices[0]) {
          context.moveTo(shape.m_vertices[0].x * Brick.SIZE, shape.m_vertices[0].y * Brick.SIZE);

          for (i = 1; i < shape.m_vertexCount; i++) {

            context.lineTo(shape.m_vertices[i].x * Brick.SIZE, shape.m_vertices[i].y * Brick.SIZE);

          }

          context.lineTo(shape.m_vertices[0].x * Brick.SIZE, shape.m_vertices[0].y * Brick.SIZE);

        } else {

          context.moveTo(Ball.radius * Brick.SIZE, 0);
          context.arc(0, 0, Ball.radius * Brick.SIZE, 0, Math.PI * 2, true);

        }
      }

      context.stroke();

    context.restore();
  },

  initializeBox2D: function() {
    var worldBoundingBox = new b2AABB(),
        gravity = new b2Vec2(0, 9.81);

    worldBoundingBox.lowerBound.Set(-10, -10);
    worldBoundingBox.upperBound.Set(20, 25);

    this.world = new b2World(worldBoundingBox, gravity, true);

    this.createBorders();
    this.initContactListener();
    this.initContactFilter();

    this.intervalLength = 1 / 120;
  },

  startBox2D: function() {

    this.resetTrack();
    var myScope = this;

    this.world.SetGravity(new b2Vec2(0, 9.81));

    this.intervalID = setInterval(function() {
      myScope.calculateBox2D();
    }, this.intervalLength * 1000);

    $('lengthDisplay').update("0000");
    this.trackLength = 0;
    this.startTick = performance.now();
  },

  stopBox2D: function() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }

    this.intervalID = null;
  },

  calculateBox2D: function() {
    var i;

    for (i = 0; i < this.bricks.length; i++) {

      this.bricks[i].update();

    }

    this.world.Step(0.02, 20);

  },

  createBorders: function() {
    var bodyDefinition = new b2BodyDef(),
        body, i;

    bodyDefinition.position.Set(0, 0);

    body = this.world.CreateBody(bodyDefinition);

    var createBorderShape = function(pointA, pointB) {

      var shapeDefinition = new b2PolygonDef();
      shapeDefinition.vertexCount = 4;
      shapeDefinition.restitution = 0;
      shapeDefinition.friction = 0.9;

      shapeDefinition.vertices[0].Set(pointA.x, pointA.y);
      shapeDefinition.vertices[1].Set(pointB.x, pointA.y);
      shapeDefinition.vertices[2].Set(pointB.x, pointB.y);
      shapeDefinition.vertices[3].Set(pointA.x, pointB.y);

      return shapeDefinition;
    };

    var borderPoints = [
      {A: new b2Vec2(0, -1), B: new b2Vec2(this.cols, 0)},
      {A: new b2Vec2(this.cols, 0), B: new b2Vec2(this.cols + 1, this.rows)},
      {A: new b2Vec2(0, this.rows), B: new b2Vec2(this.cols, this.rows + 1)},
      {A: new b2Vec2(-1, 0), B: new b2Vec2(0, this.rows)}
    ];

    for (i = 0; i < 4; i++) {
      body.CreateShape(createBorderShape(
        borderPoints[i].A, borderPoints[i].B
      ));
    }

    body.SetMassFromShapes();
  },

  initContactListener: function() {

    var contactListener = new b2ContactListener();

    contactListener.Add = function(contact) {

      if (contact.shape1.GetBody().onCollision) {

        contact.shape1.GetBody().onCollision(contact);

      } else if (contact.shape2.GetBody().onCollision) {

        contact.shape2.GetBody().onCollision(contact);

      }

    };

    contactListener.Persist = function(contact) {

      if (contact.shape1.GetBody().whileCollision) {

        contact.shape1.GetBody().whileCollision(contact);

      } else if (contact.shape2.GetBody().whileCollision) {

        contact.shape2.GetBody().whileCollision(contact);

      }

    };

    contactListener.Remove = function(contact) {

      if (contact.shape1.GetBody().afterCollision) {

        contact.shape1.GetBody().afterCollision(contact);

      } else if (contact.shape2.GetBody().afterCollision) {

        contact.shape2.GetBody().afterCollision(contact);

      }

    };

    this.world.SetContactListener(contactListener);

  },

  initContactFilter: function() {

    var contactFilter = new b2ContactFilter();

    contactFilter.ShouldCollide = function(shape1, shape2) {

      if (shape1.GetBody().beforeCollision) {

        return shape1.GetBody().beforeCollision(shape1, shape2);

      } else if (shape2.GetBody().beforeCollision) {

        return shape2.GetBody().beforeCollision(shape1, shape2);

      }

      var filter1 = shape1.GetFilterData(),
          filter2 = shape2.GetFilterData();

      if (filter1.groupIndex === filter2.groupIndex && filter1.groupIndex !== 0) {
          return filter1.groupIndex > 0;
      }

      return (filter1.maskBits & filter2.categoryBits) !== 0 && (filter1.categoryBits & filter2.maskBits) !== 0;

    };

    this.world.SetContactFilter(contactFilter);

  },

  findPartner: function(brick) {

    if (this.singles[brick.pairType]) {

      if (this.singles[brick.pairType] === brick) {
        return;
      }

      brick.partner = this.singles[brick.pairType];
      this.singles[brick.pairType].partner = brick;

      this.singles[brick.pairType] = null;

    } else {

      this.singles[brick.type] = brick;

    }

  },

  setActiveGraviton: function(graviton) {

    if (this.activeGraviton) {

      this.activeGraviton.isActive = false;

    }

    this.activeGraviton = graviton;

  },

  dropBrickAt: function($super, brick, cell) {

    if ($super(brick, cell)) {
      brick.createBody(this.world);

      $('publishButton').addClassName('activePublish');
      this.validTrack = true;
    }
  },

  removeBrickAt: function($super, cell) {
    var brick = this.getBrickAt(cell);

    if (brick) {
      if ($super(cell)) {

        brick.removeBody(this.world);

        $('publishButton').addClassName('activePublish');
        this.validTrack = true;

        return true;

      } else {

        return false;

      }
    }

    return true;
  },

  onClick: function(mouseX, mouseY) {

    var cell = this.getCell(mouseX, mouseY),
        brick = this.getBrickAt(cell);

    if (brick) {

      brick.rotate(Math.PI / 4);

      $('publishButton').addClassName('activePublish');
      this.validTrack = true;

    } else if (cell && this.parent.selectElement && this.parent.selectElement.brick) {

      var dropBrick = new (eval(this.parent.selectElement.brick.type))();
          dropBrick.setRotation(this.parent.selectElement.brick.rotation);

      this.dropBrickAt(dropBrick, cell);

    }

    this.renderNew = true;
  },

  onStartDrag: function(mouseX, mouseY) {
    var brick = this.getBrickAt(this.getCell(mouseX, mouseY));

    if (brick) {

      if (brick.isDraggable) {

        brick.isVisible = false;
        this.renderNew = true;

        var draggedBrick = new (eval(brick.type))();
            draggedBrick.setRotation(brick.rotation);
            draggedBrick.origin = brick;

        this.parent.dragBrick(draggedBrick);

        $('publishButton').addClassName('activePublish');
        this.validTrack = true;

      }

    } else {

      this.onDrag(mouseX, mouseY);
      this.parent.startDragBricking();

    }
  },

  onDrag: function(mouseX, mouseY) {

    var cell = this.getCell(mouseX, mouseY),
        brick = this.getBrickAt(cell);

    if (!cell || !this.parent.selectElement) {
      return;
    }

    if (this.parent.selectElement.brick) {

      if (brick && (!brick.isRemoveable ||
        (brick.type === this.parent.selectElement.brick.type && brick.rotation === this.parent.selectElement.brick.rotation))) {
        return;
      }

      var dropBrick = new (eval(this.parent.selectElement.brick.type))();
          dropBrick.setRotation(this.parent.selectElement.brick.rotation);

      this.dropBrickAt(dropBrick, cell);

    } else if (brick && brick.isRemoveable) {

      this.removeBrickAt(cell);

    }

    this.renderNew = true;
  },

  onStopDrag: function(event, dragBrick) {

    var cell = this.getCell(
      dragBrick.x - this.x + Brick.SIZE / 2,
      dragBrick.y - this.y + Brick.SIZE / 2
    );

    if (cell) {

      var brick = this.getBrickAt(cell);

      if (this.intervalID) {

        this.resetTrack();

      }

      if (brick && !brick.isRemoveable) {

        if (dragBrick.origin) {

          dragBrick.origin.isVisible = true;
          this.renderNew = true;

        }

      } else {

        if (brick && dragBrick.origin !== brick) {

          this.removeBrickAt(cell);

        }

        if (dragBrick.origin) {

          dragBrick.origin.x = this.x + cell.col * Brick.SIZE;
          dragBrick.origin.y = this.y + cell.row * Brick.SIZE;

          dragBrick.origin.moveToCell(cell);

          dragBrick.origin.isVisible = true;
          this.renderNew = true;

        } else {

          this.dropBrickAt(dragBrick, cell);

        }

      }

    } else if (dragBrick.origin) {

      if (dragBrick.isRemoveable) {

        this.removeBrickAt(dragBrick.origin.cell);

      } else {

        dragBrick.origin.isVisible = true;
        this.renderNew = true;

      }

    }

    $('publishButton').addClassName('activePublish');
    this.validTrack = true;
  },

  resetTrack: function() {

    this.stopBox2D();

    this.renderNew = true;

    var i;

    for (i = 0; i < this.bricks.length; i++) {

      this.bricks[i].reset();

    }
  },

  setTrack: function(track) {

    var that = this,
        p, b;

    this.clearTrack();

    for (b in track.bricks) {

      if (track.bricks.hasOwnProperty(b)) {

        var brick = track.bricks[b];

        var dropBrick = new (eval(brick.type))();

        dropBrick.setRotation(brick.rotation * Math.PI / 2);

        this.dropBrickAt(
          dropBrick,
          {
            row: brick.row,
            col: brick.col
          }
        );
      }
    }

    if (track.pairs) {
      for (p = 0; p < track.pairs.length; p++) {

        var girl = this.getBrickAt(track.pairs[p].girl),
            boy = this.getBrickAt(track.pairs[p].boy);

        if (girl && boy && girl.pairType === boy.type) {

          girl.partner = boy;
          boy.partner = girl;

        }
      }
    }

    return true;
  },

  getTrack: function() {

    this.resetTrack();

    var track = {
      bricks: {},
      pairs: []
    };

    var getRotationAsNumber = function(radians) {
      var number = radians / (Math.PI / 2);

      return (number %= 4);
    };

    for (i = 0; i < this.bricks.length; i++) {

      var brick = this.bricks[i];

      track.bricks[brick.cell.row * this.cols + brick.cell.col] = {
        type: brick.type,
        rotation: getRotationAsNumber(brick.rotation),
        row: brick.cell.row,
        col: brick.cell.col
      };

      if (brick.pairType && brick.partner) {

        var isPushed = false;

        for (j = 0; j < track.pairs.length; j++) {

          if (track.pairs[j].girl === brick || track.pairs[j].boy === brick) {

            isPushed = true;
            break;

          }

        }

        if (!isPushed) {
          track.pairs.push({
            girl: {
              row: brick.cell.row,
              col: brick.cell.col
            },
            boy: {
              row: brick.partner.cell.row,
              col: brick.partner.cell.col
            }
          });
        }
      }
    }

    return track;

  },

  clearTrack: function(setBallAndExit) {

    this.resetTrack();

    var i;

    for (i = 0; i < this.bricks.length; i++) {

      this.bricks[i].removeBody(this.world);

    }

    this.bricks = [];
    this.singles = {};

    if (setBallAndExit) {

      this.dropBrickAt(new Ball(), {row: 0, col: 0});
      this.dropBrickAt(new Exit(), {row: (this.rows - 1), col: 0});

    }

  },

  getTrackImage: function(canvas) {

    this.resetTrack();

    var context = canvas.getContext("2d");
    var storeBrickSize = Brick.SIZE,
        i;
    Brick.SIZE = Brick.TINY_SIZE;

    canvas.width = Brick.SIZE * this.cols + 2;
    canvas.height = Brick.SIZE * this.rows + 2;

    context.save();

      context.translate(0.5, 0.5);

      context.lineWidth = 0.5;

      context.beginPath();

      for (i = 1; i < this.rows; i++) {

        context.dashedLine(0, Brick.SIZE * i, Brick.SIZE * this.cols, Brick.SIZE * i, 2);

      }

      for (i = 1; i < this.cols; i++) {

        context.dashedLine(Brick.SIZE * i, 0, Brick.SIZE * i, Brick.SIZE * this.rows, 2);

      }

      context.stroke();
      context.beginPath();

      if (this.bricks.length) {

        this.bricks[0].applyStyle(context);
        context.lineWidth = 0.5;

        for (i = 0; i < this.bricks.length; i++) {
          context.save();

            context.translate(this.bricks[i].cell.col * Brick.SIZE, this.bricks[i].cell.row * Brick.SIZE);
            this.bricks[i].draw(context);

          context.restore();
        }
      }

      context.strokeStyle = "#000000";
      context.lineWidth = 1;

      context.strokeRect(0, 0, Brick.SIZE * this.cols, Brick.SIZE * this.rows);

    context.restore();

    Brick.SIZE = storeBrickSize;

    return canvas.toDataURL("image/png");

  }

});

var Renderer = Class.create(DisplayObject, {
  
  initialize: function($super, staticCanvas, dynamicCanvas) {
    $super();

    this.staticCanvas = staticCanvas;
    this.dynamicCanvas = dynamicCanvas;

    this.staticContext = this.staticCanvas.getContext('2d');
    this.dynamicContext = this.dynamicCanvas.getContext('2d');

    this.initField();

    this.timeoutID = null;
    this.isAnimated = false;

  },

  initField: function() {

    this.field = new Field();
    this.field.parent = this;
    this.field.x = 64;
    this.field.y = Brick.SIZE;
    this.field.setup();

  },

  initializeHTMLInterface: function() {},
  
  debug: function() {
    this.field.debugMode = !this.field.debugMode;
  },

  startRender: function() {
    
    if (!this.isAnimated) {
      
      this.isAnimated = true;
      this.animate();
      
    }
  },

  stopRender: function() {
    
    this.isAnimated = false;
    
  },

  quit: function() {
    this.stopRender();
    this.field.stopBox2D();

    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }
  },

  init: function() {
    this.startRender();
  },

  onBallExit: function() {
    
    this.field.stopBox2D();
    
  }, 

  clearCanvas: function(canvas) {
    var context = canvas.getContext('2d');
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.beginPath();
  },
  
  animate: function() {
    
    if (this.isAnimated) {
      
      var myScope = this;
      
      requestAnimFrame(function() {
        myScope.animate();
      });
    }
    
    this.draw();
  },

  draw: function() {
    
    this.drawDynamics();
    this.drawStatics();
    
    
    this.dynamicContext.getImageData(0, 0, 1, 1);
    
  },
  
  drawStatics: function() {
    
    if (this.field.renderNew) {
      
      this.staticContext.save();
      
        this.clearCanvas(this.staticCanvas);

        this.staticContext.translate(0.5, 0.5);
        this.field.drawStatics(this.staticContext);

      this.staticContext.restore();
    }
  },
  
  drawDynamics: function() {
    
    this.dynamicContext.save();
    
      this.clearDynamicCanvas();
      
      this.dynamicContext.translate(0.5, 0.5);
      
      this.field.drawDynamics(this.dynamicContext);
      
      
      if (this.field.debugMode) {
      
        this.field.draw(this.dynamicContext);
      
      }
    
    this.dynamicContext.restore();
  },
  
  clearDynamicCanvas: function() {
    
    this.dynamicContext.clearRectangles();
    
    this.dynamicContext.clearRects = [];
    
  }

});
var Editor = Class.create(Renderer, {

  initialize: function($super, staticCanvas, dynamicCanvas, imageCanvas) {
    $super(staticCanvas, dynamicCanvas);

    this.imageCanvas = imageCanvas;

    this.baseToolbox = new Toolbox();
    this.baseToolbox.parent = this;
    this.baseToolbox.x = this.field.x + this.field.width + 3 * Brick.SIZE;
    this.baseToolbox.y = this.field.y;

    this.specialToolbox = new Toolbox();
    this.specialToolbox.parent = this;
    this.specialToolbox.x = this.baseToolbox.x + this.baseToolbox.width + Brick.SIZE;
    this.specialToolbox.y = this.baseToolbox.y;

    this.eventEngine = new EventEngine();
    this.dragElement = this.hoverElement = this.selectElement = null;

    this.setSize();
    this.addBricksToToolboxes();
    this.initializeHTMLInterface();

  },

  quit: function($super) {
    $super();

    this.removeEventListening();
  },

  init: function($super) {
    $super();

    this.addEventListening();
    this.field.resetTrack();
  },

  setSize: function() {

    var width = this.specialToolbox.x + this.specialToolbox.width + 3,
        height = this.field.y + this.field.height + Brick.SIZE;

    this.width = this.staticCanvas.width = this.dynamicCanvas.width = width;
    this.height = this.staticCanvas.height = this.dynamicCanvas.height = height;

  },

  addEventListening: function() {

    this.eventEngine.addListener("click", this.onClick, this);
    this.eventEngine.addListener("mouseMove", this.onMouseMove, this);

    this.eventEngine.addListener("startDrag", this.onStartDrag, this);
    this.eventEngine.addListener("stopDrag", this.onStopDrag, this);

  },

  removeEventListening: function() {
    this.eventEngine.removeListener("click", this.onClick);
    this.eventEngine.removeListener("mouseMove", this.onMouseMove);

    this.eventEngine.removeListener("startDrag", this.onStartDrag);
    this.eventEngine.removeListener("stopDrag", this.onStopDrag);
  },

  addBricksToToolboxes: function() {

    var baseBricks = [Brick, Ramp, Kicker, Curve, Line],
      i;

    for (i = 0; i < baseBricks.length; i++) {
      this.baseToolbox.addBrick(baseBricks[i]);
    }

    var that = this;

    var request = new Ajax.Request('/unlocks', {
      method: 'get',
      requestHeaders: {Accept: 'application/json'},

      onSuccess: function(transport) {

        for (i = 5; i < transport.responseJSON.unlocks.length; i++) {
          that.specialToolbox.addBrick(eval(transport.responseJSON.unlocks[i]));
        }

        if (transport.responseJSON.locks) {
          that.specialToolbox.addPreviewBrick(eval(transport.responseJSON.locks[0]))
        }
      },

      onFailure: function(transport) {

      }
    });
  },

  initializeHTMLInterface: function($super) {
    var myScope = this;

    $('runButton').observe('click', function(event) {
      myScope.field.startBox2D();
    });

    $('clearButton').observe('click', function(event) {
      myScope.field.clearTrack(true);
    });

    $('publishButton').observe('click', function(event) {
      if ($('publishButton').hasClassName('activePublish') && myScope.field.validTrack) {

        myScope.publishTrack();
        $('publishButtonWarning').style.visibility = "hidden";

      } else {

        $('publishButtonWarning').style.visibility = "visible";

      }
    });
  },

  drawStatics: function() {

    if (this.field.renderNew ||
      this.baseToolbox.renderNew || this.specialToolbox.renderNew) {

        this.clearCanvas(this.staticCanvas);

        this.staticContext.save();

          this.staticContext.translate(0.5, 0.5);

          this.field.drawStatics(this.staticContext);

          this.baseToolbox.drawStatics(this.staticContext);
          this.specialToolbox.drawStatics(this.staticContext);

        this.staticContext.restore();
    }
  },

  drawDynamics: function() {

    this.dynamicContext.save();

      this.clearDynamicCanvas();


      this.dynamicContext.translate(0.5, 0.5);

      this.field.drawDynamics(this.dynamicContext);

      this.baseToolbox.drawDynamics(this.dynamicContext);
      this.specialToolbox.drawDynamics(this.dynamicContext);

      if (this.hoverElement) {

        this.dynamicContext.save();

          this.dynamicContext.fillStyle = "#FF00FF";
          this.dynamicContext.globalAlpha = 0.3;

          this.hoverElement.draw(this.dynamicContext);

        this.dynamicContext.restore();

      }

      if (this.selectElement) {

        this.dynamicContext.save();

          this.dynamicContext.fillStyle = "#0000FF";
          this.dynamicContext.globalAlpha = 0.4;

          this.selectElement.draw(this.dynamicContext);

        this.dynamicContext.restore();

      }

      if (this.field.debugMode) {

        this.field.draw(this.dynamicContext);

      }

      if (this.dragElement) {

        this.dynamicContext.drawShadows = true;

        this.dragElement.drawGlobal(this.dynamicContext);

        this.dynamicContext.drawShadows = false;

      }

    this.dynamicContext.restore();
  },

  onClick: function(event) {

    if (this.field.hitTest(event.mouseX, event.mouseY)) {

      this.field.resetTrack();

      if (!this.field.intervalID) {

        this.field.onClick(event.mouseX - this.field.x, event.mouseY - this.field.y);

      }

    } else if (this.baseToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.baseToolbox.onClick(event.mouseX - this.baseToolbox.x, event.mouseY - this.baseToolbox.y);

    } else if (this.specialToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.specialToolbox.onClick(event.mouseX - this.specialToolbox.x, event.mouseY - this.specialToolbox.y);

    }
  },

  onMouseMove: function(event) {

    this.hoverElement = null;

    if (this.field.hitTest(event.mouseX, event.mouseY)) {

      this.hoverElement = this.getCellBox(this.field, event.mouseX, event.mouseY);

    } else if (this.baseToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.hoverElement = this.getCellBox(this.baseToolbox, event.mouseX, event.mouseY);

    } else if (this.specialToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.hoverElement = this.getCellBox(this.specialToolbox, event.mouseX, event.mouseY);

    }
  },

  getCellBox: function(grid, mouseX, mouseY) {
    return grid.getCellBox(
      grid.getCell(
        mouseX - grid.x,
        mouseY - grid.y
      )
    );
  },

  onStartDrag: function(event) {

    this.field.resetTrack();

    if (this.field.hitTest(event.mouseX, event.mouseY)) {

      this.field.resetTrack();
      this.field.onStartDrag(event.mouseX - this.field.x, event.mouseY - this.field.y);

    } else if (this.baseToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.baseToolbox.onStartDrag(event.mouseX - this.baseToolbox.x, event.mouseY - this.baseToolbox.y);

    } else if (this.specialToolbox.hitTest(event.mouseX, event.mouseY)) {

      this.specialToolbox.onStartDrag(event.mouseX - this.specialToolbox.x, event.mouseY - this.specialToolbox.y);

    }
  },

  onDrag: function(event) {

    if (this.dragElement && event.mouseX && event.mouseY) {

      this.dragElement.x = parseInt(event.mouseX - Brick.SIZE / 2, 10);
      this.dragElement.y = parseInt(event.mouseY - Brick.SIZE / 2, 10);

    }
  },

  dragBrick: function(brick) {

    var point = {x: this.eventEngine.latestEvent.mouseX, y: this.eventEngine.latestEvent.mouseY};

    brick.x = point.x - Brick.BIG_SIZE / 2;
    brick.y = point.y - Brick.BIG_SIZE / 2;

    this.dragElement = brick;

    this.eventEngine.addListener("drag", this.onDrag, this);
  },

  startDragBricking: function() {

    this.eventEngine.addListener("drag", this.onDragBricking, this);

  },

  onDragBricking: function(event) {

    if (this.field.hitTest(event.mouseX, event.mouseY)) {

      this.field.onDrag(event.mouseX - this.field.x, event.mouseY - this.field.y);

    }

  },

  onStopDrag: function(event) {

    if (this.dragElement) {

      this.field.onStopDrag(event, this.dragElement);

      this.dragElement = null;

    }

    this.eventEngine.removeListener("drag", this.onDragBricking);
    this.eventEngine.removeListener("drag", this.onDrag);
  },

  publishTrack: function() {

    if (this.field.validTrack) {

      contentLoader.parseResponse({responseJSON: {mode: "load"}});

      var parameters = {},
          length = this.field.trackLength,
          duration = this.field.endTick - this.field.startTick;

      parameters['track[json]'] = Object.toJSON(this.field.getTrack());
      parameters['track[length]'] = length;
      parameters['track[duration]'] = duration;
      parameters['track[imagedata]'] = this.field.getTrackImage(this.imageCanvas);
      parameters['track[username]'] = $('userName').value;
      parameters['track[trackname]'] = $('trackName').value;

      var request = new Ajax.Request('/tracks', {
        method: 'post',
        parameters: parameters,
        requestHeaders: {Accept: 'application/json'},

        onSuccess: function(transport) {
          contentLoader.parseResponse(transport, true);
        },

        onFailure: function(transport) {
          contentLoader.parseResponse(transport, false);
        }
      });

      this.field.clearTrack(true);
    }
  }

});

var Showroom = Class.create(Renderer, {
  
  initialize: function($super, staticCanvas, dynamicCanvas) {
    $super(staticCanvas, dynamicCanvas);
    
    this.initializeHTMLInterface();

    this.trackID = null;
    this.autoMode = false;
    
    this.tweenMode = false;
    this.tweenDown = true;
    this.tweenStart = false;
    
    this.fieldOffset = 0;
    this.fieldImage = null;
    
  },

  quit: function($super) {
    $super();
    
    if (this.tweenTimeoutID) {
      clearTimeout(this.tweenTimeoutID);
      this.tweenTimeoutID = null;
      this.tweenMode = false;
    }
    
    $('showroomLikeButton').stopObserving();
    $('showroomFlagButton').stopObserving();
  },
  
  drawDynamics: function($super, context) {
    
    if (this.tweenMode) {
      
      this.clearDynamicCanvas();
      
    } else if (this.tweenStart) {
      
      this.tweenStart = false;
      
      if (this.tweenDown) {
      
        this.fadeTrack(trackStore.next(this.trackID));
      
      } else {
        
        this.fadeTrack(trackStore.previous(this.trackID));
        
      }
      
    } else {
      
      $super(context);
      
    }
    
  },
  
  drawTweenMode: function(context) {
    
    var offset;
    
    context.save();
    
      offset = this.fieldOffset + (this.field.height + Brick.SIZE) * (this.fieldOffset < 0 ? 1 : -1);
    
      context.translate(-0.5, offset - 0.5);
      
      context.drawImage(
        this.fieldImage,
        this.field.x, this.field.y, this.field.width, this.field.height,
        0, 0, this.field.width, this.field.height
      );
    
    context.restore();
    
    
    context.save();
    
      offset = this.fieldOffset + (this.fieldOffset > 0 ? -Brick.SIZE : this.field.height);
      
      context.translate(0, offset);
      
      this.drawInlay(context);
    
    context.restore();
    
  },
  
  drawInlay: function(context) {
    
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.field.width, 0);
    context.lineTo(this.field.width, Brick.SIZE);
    context.lineTo(0, Brick.SIZE);
    context.closePath();
    
    context.clip();
    
    
    context.fillStyle = Brick.FILL;
    context.strokeStyle = Brick.STROKE;
    context.lineWidth = 3;
    
    context.fillRect(0, 0, this.field.width, Brick.SIZE);
    
    
    context.beginPath();
    var i;
    
    for (i = 0; i < this.field.width + Brick.SIZE; i += Brick.SIZE / 3) {
      
      context.moveTo(i, 0);
      context.lineTo(i - Brick.SIZE, Brick.SIZE);
      
    }
    
    context.stroke();
    
    
    context.lineWidth = 1;
    context.beginPath();
    
    for (i = 1; i < this.field.cols; i++) {
      
      context.moveTo(i * Brick.SIZE, 0);
      context.lineTo(i * Brick.SIZE, Brick.SIZE);
      
    }
    
    context.stroke();
    
    context.beginPath();
    
  },

  onBallExit: function($super) {

    $super();

    if (this.autoMode) {

      if (trackStore.hasNext(this.trackID)) {

        this.tweenDown = true;
        this.fadeTrack(trackStore.next(this.trackID));

      } else {

        contentLoader.loadContent("/tracks/" + this.trackID + "/next", true);

      }

    }

  },

  parseTrack: function(data) {
    
    this.initField();
    
    this.trackID = data.id;
    this.field.setTrack(data.json);
    
    trackStore.loadNext(this.trackID);
    trackStore.loadPrevious(this.trackID);
    this.setLikeBlameButtons();

    if (this.autoMode && !this.tweenMode) {
      this.field.startBox2D();
    }
  },

  initializeHTMLInterface: function() {
    var myScope = this;

    $('showButton').observe('click', function(event) {
      myScope.field.startBox2D();
    });

    $('autoButton').observe('click', function(event) {
      $('autoButton').toggleClassName('active');

      myScope.autoMode = $('autoButton').hasClassName('active');
    });
    
    $('nextButton').observe('click', function(event) {

      if (trackStore.hasNext(myScope.trackID)) {
        myScope.tweenDown = true;
        myScope.tweenStart = true;
        return;
      }

      contentLoader.loadContent("/tracks/" + myScope.trackID + "/next");
    });

    $('previousButton').observe('click', function(event) {

      if (trackStore.hasPrevious(myScope.trackID)) {
        myScope.tweenDown = false;
        myScope.tweenStart = true;
        return;
      }

      contentLoader.loadContent("/tracks/" + myScope.trackID + "/previous");
    });
    
  },

  setLikeBlameButtons: function() {
    var myScope = this;

    if (Cookie.likedTracks.indexOf(this.trackID) === -1) {
      $('showroomLikeButton').observe('click', function() {
        myScope.like();
      });

      $('showroomLikeButton').setStyle({display: "block"});
    } else {

      $('showroomLikeButton').stopObserving();
      $('showroomLikeButton').setStyle({display: "none"});
    }

    if (Cookie.flagedTracks.indexOf(this.trackID) === -1) {
      $('showroomFlagButton').observe('click', function() {
        myScope.flag();
      });

      $('showroomFlag').setStyle({display: "block"});
    } else {
      $('showroomFlagButton').stopObserving();
      $('showroomFlag').setStyle({display: "none"});
    }
  },

  startRender: function($super) {
    $super();
    
    if (this.autoMode && !this.tweenTimeoutID) {

      this.field.startBox2D();

    }
  },

  like: function() {

    if (this.trackID) {
      var parameters = {};
      var myScope = this;

      parameters.likes = 1;
        
      var request = new Ajax.Request('/tracks/' + this.trackID, {
        method: 'put',
        parameters: parameters,
        requestHeaders: {Accept: 'application/json'},
        
        onSuccess: function(transport) {
          Cookie.likedTracks.push(myScope.trackID);
          Cookie.set('likes', JSON.stringify(Cookie.likedTracks), {maxAge: 60 * 60 * 24 * 365});

          $('tableLikes').update(parseInt($('tableLikes').innerHTML, 10) + 1);

          $('showroomLikeButton').setStyle({display: "none"});
        },
        
        onFailure: function(transport) {
          $('showroomLikeButton').setStyle({display: "none"});
        }
      });
    }
  },

  flag: function() {
    if (this.trackID) {
      var parameters = {};
      var myScope = this;

      parameters.flags = 1;
        
      var request = new Ajax.Request('/tracks/' + this.trackID, {
        method: 'put',
        parameters: parameters,
        requestHeaders: {Accept: 'application/json'},
        
        onSuccess: function(transport) {
          Cookie.flagedTracks.push(myScope.trackID);
          Cookie.set('flags', JSON.stringify(Cookie.flagedTracks), {maxAge: 60 * 60 * 24 * 365});

          $('showroomFlag').setStyle({display: "none"});
        },
        
        onFailure: function(transport) {
          $('showroomFlag').setStyle({display: "none"});
        }
      });
    }
  },
  
  fadeTrack: function(trackID) {
    
    this.tweenPercent = 0;
    this.fieldOffset = this.totalHeight = (this.field.height + Brick.SIZE) * (this.tweenDown ? 1 : -1);
    
    this.fieldImage = new Image();
    var myScope = this;
    
    this.fieldImage.onload = function() {
      
      myScope.tweenMode = true;
      trackStore.loadTrack(trackID, contentLoader.parseResponse, contentLoader, true);
      myScope.tweenMode = true;
      myScope.tween();
      
    };
    
    this.fieldImage.src = this.staticCanvas.toDataURL("image/png");
  },
  
  tween: function() {
    
    this.field.renderNew = true;
    
    if (this.tweenPercent >= 1.0) {
      
      this.tweenMode = false;
      this.tweenTimeoutID = null;
      
      this.fieldOffset = 0;
      
      if (this.autoMode) {
        this.field.startBox2D();
      }
      
    } else {
    
      this.fieldOffset = (Math.cos(this.tweenPercent * Math.PI) + 1.0) / 2 * this.totalHeight;
      this.tweenPercent += 0.05;
      
      var myScope = this;
          
      this.tweenTimeoutID = setTimeout(function() {
      
        myScope.tween();
      
      }, 50);
      
    }
  }

});
var Meter = Class.create(DisplayObject, {
  
  initialize: function($super, canvas) {
    $super();

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.translate(0.5, 0.5);

    this.width = 218;
    this.height = 185;

    this.angle = - Math.PI / 4;
    this.targetAngle = null;
    this.timeINT = null;
  },

  setSize: function() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  setRotation: function(percent) {
    clearTimeout(this.timeINT);
    this.targetAngle = percent * Math.PI / 2 - Math.PI / 4;

    var that = this;
    setTimeout(function() {that.calculateRotation();}, 1000);
  },

  calculateRotation: function() {
    this.angle += (this.targetAngle - this.angle) / 8;

    if (Math.abs(this.angle - this.targetAngle) < 0.01) {

      this.angle = this.targetAngle;
      this.draw();
      
      this.timeINT = null;

    } else {
      this.draw();

      var that = this;
      this.timeINT = setTimeout(function() {that.calculateRotation();}, 50);
    }
  },

  draw: function() {

    this.setSize();

    this.context.fillStyle = Pattern.meterBackground;
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.save();

      this.context.translate(109, 120);
      this.context.rotate(this.angle);
      this.context.translate(-19, -65);

      this.context.drawImage(Pattern.image.meterPointer, 0, 0, 22, 92);

    this.context.restore();

    this.context.fillStyle = Pattern.meterForeground;
    this.context.fillRect(0, 0, this.width, this.height);

  }

});
var SidebarController = Class.create({

  initialize: function() {

    this.meter = new Meter(meterCanvas);
    this.meter.setRotation(0.0);

    var thisClass = this;

    var request = new Ajax.PeriodicalUpdater('', '/tracks/info', {

      method: 'get',
      frequency: 6,
      decay: 1,

      onSuccess: function(transport) {thisClass.onInfoUpdate.call(thisClass, transport);},
      onFailure: function(transport) {
        console.error("Periodical Update failed!");
      }
    });

    this.targetMeters = null;
    this.meters = 0;

  },

  onInfoUpdate: function(transport) {

    response = JSON.parse(transport.responseText);

    this.meter.setRotation(response.percentage);

    this.setMeters(parseInt(response.total_length / 100, 10));

    this.setLatestTrack(response.latest_track);
  },

  setMeters: function(length) {

    this.targetMeters = length;

    var myScope = this;

    setTimeout(function() {
      myScope.updateMeters();
    }, 100);

  },

  updateMeters: function() {

    if (this.targetMeters - this.meters > 1) {

      this.meters += (this.targetMeters - this.meters) / 9;

      var myScope = this;

      setTimeout(function() {
        myScope.updateMeters();
      }, 50);

    } else {

      this.meters = this.targetMeters;

    }

    var length = (parseInt(this.meters, 10).toString());

    while(length.length < 7) {
      length = "0" + length;
    }

    $('lengthMeter').update(length);

  },

  setLatestTrack: function(track) {

    $('lastTrackHolder').writeAttribute({onclick: 'contentLoader.loadContent(\'/tracks/' + track.id + '\', true)'});
    $('latestTrackReflection').writeAttribute({onclick: 'contentLoader.loadContent(\'/tracks/' + track.id + '\', true)'});

    var newTag = '<div><img width="122" height="182" src="';
    newTag += track.imagedata;
    newTag += '" /><div class="background"></div><div><div class="header">LATEST TRACK</div><div id="latestInfo">';
    newTag += track.trackname.toUpperCase() + "<br>";
    newTag += track.username.toUpperCase() + "<br>";
    newTag += (Math.round(track.length * 10) / 10).toString() + " METER" + "<br>";
    newTag += (Math.round(track.duration / 1000 * 1000) / 1000).toFixed(2) + " SECONDS";
    newTag += "</div></div></div>";

    $('lastTrackHolder').update(newTag);

  }

});

var ContentLoader = Class.create({

  initialize: function() {

    this.visibleList = null;
    this.loadingInterval = null;
    this.oldMode = null;
    this.oldContent = null;

    this.setInitialScreen();

    this.editor = new Editor(staticCanvas, dynamicCanvas, imageCanvas);
    this.editor.x = editorPosition.left;
    this.editor.y = editorPosition.top;

    this.showroom = new Showroom(staticCanvas, dynamicCanvas);
    this.showroom.x = editorPosition.left;
    this.showroom.y = editorPosition.top;

    var thisClass = this;

    Pattern.context = meterCanvas.getContext("2d");
    Pattern.loadPattern([
      {name: "meterBackground", path: "../images/sidebar-meter-background.png"},
      {name: "meterForeground", path: "../images/sidebar-meter-foreground.png"},
      {name: "meterPointer", path: "../images/sidebar-meter-pointer.png"},
      {name: "fieldBackground", path: "../images/background-yellow.png"}
    ]);

    Pattern.onload = function() {
      sidebarController = new SidebarController();

      /* set page and search value on initial site call */
      var path = window.location.href;
      var strippedLink = path.substr(path.indexOf("/", 7));
      if (strippedLink.substr(0, 8) == "/tracks?") {

        strippedLink = strippedLink.substr(8);
        var params = strippedLink.split("&");

        for (var i = 0; i < params.length; i++) {

          var keyValue = params[i].split("=");

          var key = keyValue[0];
          var value = keyValue[1];

          if (key == "page") {
            currentPage = value;
          } else if (key == "search") {
            currentKeyWord = value;
            document.getElementById('searchField').value = value;
          } else if (key == "sorting") {
            currentSorting = value;
          }
        }
      }

      thisClass.loadContent(path);
    };

  },

  loadContent: function(path, setPath) {

    this.parseResponse({responseJSON: {mode: "load"}});

    if (path === "/about" || path === "/imprint" || path === "/contact") {

      this.parseResponse({responseJSON: {mode: path.substr(1)}}, setPath);
      return;

    }

    var thisClass = this;

    var request = new Ajax.Request(path, {
      method: 'get',
      requestHeaders: {Accept: 'application/json'},

      onSuccess: function(transport) {
        thisClass.parseResponse.call(thisClass, transport, setPath);
      },

      onFailure: function(transport) {
        thisClass.parseResponse.call(thisClass, transport, false);
      }
    });

  },

  parseResponse: function(jsonContent, setPath) {

    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }

    if (typeof(setPath) === "undefined") {
      setPath = true;
    }

    var content = jsonContent.responseJSON;
    var path;

    this.visibleList = [];

    if (content.mode != "show") {
      this.showroom.tweenMode = false;
    }

    if (this.oldContent) {
      this.oldContent.quit();
    }

    switch(content.mode) {

      case "build":
        this.oldContent = this.editor;
        this.createBuildMode(content);
        path = "/tracks/new";
      break;

      case "show":
        this.oldContent = this.showroom;
        this.createShowMode(content);
        trackStore.addTrack(content.track);
        path = "/tracks/" + content.track.id;
        setSwitchMode("none");
      break;

      case "overview":
        this.oldContent = null;
        this.createOverviewMode(content);
        path = "/tracks?page=" + currentPage;

        if (currentKeyWord.length > 0) {
          path += "&search=" + currentKeyWord;
        }

        if (currentSorting.length > 0) {
          path += "&sorting=" + currentSorting;
        }

      break;

      case "about":
      case "imprint":
      case "contact":
        this.oldContent = null;
        this.visibleList = [content.mode + "Page"];
        path = "/" + content.mode;
      break;

      case "load":
        this.oldContent = null;
        setPath = false;
        this.visibleList = ["loadingPage"];
        this.loadingInterval = setInterval(function() {
          $("loadingPage").toggleClassName("blink");
        }, 500);
      break;

      case "failure":
        this.oldContent = null;
        this.visibleList = ["errorPage"];
        $("errorMessage").update(content.message.toUpperCase());
      break;

    }

    this.oldMode = content.mode;

    setToggleElementsVisibility(this.visibleList);

    if (setPath) {
      this.pushURL(path, jsonContent);
    }

    $('helpBox').setStyle({display: "none"});
    $('helpButton').removeClassName('active');

  },

  createBuildMode: function(content, visibleList) {

    setBuildTweetButton();
    setSwitchMode("build");

    this.editor.init();

    $('editor').setStyle({height: "560px"});

    this.visibleList = [
      "editorControlsTop", "editorControlsBottom",
      "editorToolboxTop", "editorToolboxBottom",
      "staticCanvas", "dynamicCanvas", "editorRuler"
    ];

  },

  createShowMode: function(content) {

    setTrackTweetButton(content.track.id);
    setSwitchMode("view");

    this.showroom.parseTrack(content.track);
    this.showroom.init();

    $('tableTrack').update(content.track.trackname.toUpperCase());
    $('tableBuilder').update(content.track.username.toUpperCase());
    $('tableLength').update((parseInt(content.track.length * 10, 10)) / 10 + " METER");
    $('tableDuration').update((Math.round(content.track.duration / 1000 * 1000) / 1000).toFixed(2) + " SECONDS");
    $('durationDisplayShowroom').update((Math.round(content.track.duration / 1000 * 1000) / 1000).toFixed(2) + " Seconds");
    $('tableDate').update(content.track.date);
    $('tableTime').update(content.track.time);
    $('tableLikes').update(content.track.likes);

    $('editor').setStyle({height: "520px"});

    this.visibleList = [
      "showroomControlsTop", "showroomControlsBottom",
      "showroomDetail", "staticCanvas", "dynamicCanvas"
    ];

  },

  createOverviewMode: function(content) {

    setSwitchMode("view");
    currentPage = content.current_page;

    $('overviewPageDisplay').update("" + content.current_page + " / " + content.total_pages);

    $('overviewPreviousButton').removeClassName("inactive");
    $('overviewNextButton').removeClassName("inactive");

    if (content.current_page <= 1) {

      $('overviewPreviousButton').addClassName("inactive");

    }

    if (content.current_page >= content.total_pages) {

      $('overviewNextButton').addClassName("inactive");

    }


    var htmlString = "<ul>", i, next = null, previous = null;

    if (content.tracks.length == 0) {
      htmlString = '<p class="no-track-warning">No track found</p>';
    }

    for (i = 0; i < content.tracks.length; i++) {

      if (i === content.tracks.length - 1) {
        next = null;
      } else {
        next = content.tracks[i + 1].id;
      }

      trackStore.addTrack(content.tracks[i], next, previous);

      previous = content.tracks[i].id;

      var listString = "<li>";

      listString += '<a onclick="trackStore.loadTrack(' + content.tracks[i].id + ', contentLoader.parseResponse, contentLoader)"><img src="' + content.tracks[i].imagedata + '"></a>';
      listString += '<ul>';
      listString += '<li class="trackname">' + content.tracks[i].trackname + '</li>';
      listString += '<li class="username">' + content.tracks[i].username + '</li>';
      listString += '<li class="length">' + Math.round(content.tracks[i].length * 10) / 10 + ' Meter | LIKES ' + content.tracks[i].likes + '</li>';

      if (content.tracks[i].duration !== null) {
        listString += '<li class="length">' + (Math.round(content.tracks[i].duration / 1000 * 1000) / 1000).toFixed(2) + ' Seconds' + '</li>';
      } else {
        listString += '<li class="length">&nbsp;</li>'
      }

      listString += '</ul>';

      listString += "</li>";

      htmlString += listString;
    }

    htmlString += "</ul>";

    $('overviewGrid').update(htmlString);

    this.visibleList = ["overviewControls", "overviewGrid"];

  },

  pushURL: function(path, content) {

    if (history && history.pushState) {

      history.pushState(content, "", path);

    }

  },

  onPopState: function(event) {

    this.parseResponse(event.state, false);

  },

  setInitialScreen: function() {

    if (!Cookie.get("isFirstVisit")) {

      $('firstVisitContainer').setStyle({visibility: "visible"});
      $('firstVisitText').setStyle({visibility: "visible"});
      $('firstVisitCloseButton').setStyle({visibility: "visible"});

      $('firstVisitCloseButton').observe('click', function(event) {
        $('firstVisitContainer').setStyle({visibility: "hidden"});
        $('firstVisitText').setStyle({visibility: "hidden"});
        $('firstVisitCloseButton').setStyle({visibility: "hidden"});
      });

    } else {

      $('firstVisitContainer').setStyle({visibility: "hidden"});
      $('firstVisitText').setStyle({visibility: "hidden"});
      $('firstVisitCloseButton').setStyle({visibility: "hidden"});
    }

    Cookie.set("isFirstVisit", true, {maxAge: 60 * 60 * 24 * 30 * 2});

    Cookie.likedTracks = JSON.parse(Cookie.get('likes')) || [];
    Cookie.flagedTracks = JSON.parse(Cookie.get('flags')) || [];

  }

});

var TrackStore = Class.create({
  
  initialize: function() {
    this.tracks = {};
  },

  addTrack: function(track, next, previous) {

    if (this.tracks[track.id]) {
      if (next) {
        this.tracks[track.id].next = next;
      } 

      if (previous) {
        this.tracks[track.id].previous = previous;
      }

      return;
    }

    this.tracks[track.id] = {
      track: track,
      next: next,
      previous: previous
    }
  },

  getTrack: function(id) {
    if (!this.tracks[id]) {
      return null;
    } 
      
    return this.tracks[id].track;

  },

  loadTrack: function(id, callback, thisArgument, param) {

    if (this.tracks[id]) {
      if (callback) {
        callback.call(thisArgument, {responseJSON: {mode: "show", track: this.tracks[id].track}}, param);
        return;
      }
    }

    var thisClass = this;

    var request = new Ajax.Request("/tracks/" + id, {
      method: 'get',
      requestHeaders: {Accept: 'application/json'},

      onSuccess: function(transport) {
        thisClass.addTrack.call(thisClass, transport.responseJSON.track);

        if (callback) {
          callback.call(thisArgument, transport, param);
        }
      },

      onFailure: function(transport) {
      }

    });

  },

  loadNext: function(id) {

    if (this.tracks[id] && this.tracks[id].next && this.tracks[this.tracks[id].next]) {
      return;
    }

    var thisClass = this;
    var request = new Ajax.Request("/tracks/" + id + "/next", {
      method: 'get',
      requestHeaders: {Accept: 'application/json'},

      onSuccess: function(transport) {
        thisClass.tracks[id].next = transport.responseJSON.track.id;
        thisClass.addTrack.call(thisClass, transport.responseJSON.track, null, id);
      },

      onFailure: function(transport) {
        thisClass.tracks[id].next = id;
      }

    });
  },

  loadPrevious: function(id) {
    if (this.tracks[id] && this.tracks[id].previous && this.tracks[this.tracks[id].previous]) {
      return;
    }

    var thisClass = this;
    var request = new Ajax.Request("/tracks/" + id + "/previous", {
      method: 'get',
      requestHeaders: {Accept: 'application/json'},

      onSuccess: function(transport) {
        thisClass.tracks[id].previous = transport.responseJSON.track.id;
        thisClass.addTrack.call(thisClass, transport.responseJSON.track, id, null);
      },

      onFailure: function(transport) {
        thisClass.tracks[id].previous = id;
      }

    });
  },

  hasNext: function(id) {
    return (this.tracks[id].next !== null);
  },

  next: function(id) {
    if (this.hasNext(id)) {
      return this.tracks[id].next;
    }

    return null;
  },

  hasPrevious: function(id) {
    return (this.tracks[id].previous !== null);
  },

  previous: function(id) {
    if (this.hasPrevious(id)) {
      return this.tracks[id].previous;
    }

    return null;
  }

});
