// Создание канваса и контекста
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FF6138";
var animations = [];
var circles = [];

// Выбор цветов
var colorPicker = (function() {
  var colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741"];
  var index = 0;
  
  function next() {
    index = index++ < colors.length-1 ? index : 0;
    return colors[index];
  }
  
  function current() {
    return colors[index]
  }
  
  return {
    next: next,
    current: current
  }
})();

// Удаление анимации из списка
function removeAnimation(animation) {
  var index = animations.indexOf(animation);
  if (index > -1) animations.splice(index, 1);
}

// Расчет радиуса заливки страницы
function calcPageFillRadius(x, y) {
  var l = Math.max(x - 0, cW - x);
  var h = Math.max(y - 0, cH - y);
  return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

// Добавление обработчиков событий клика и касания
function addClickListeners() {
  document.addEventListener("touchstart", handleEvent);
  document.addEventListener("mousedown", handleEvent);
};

// Обработка события клика или касания
function handleEvent(e) {
  if (e.touches) { 
    e.preventDefault();
    e = e.touches[0];
  }
  
  var currentColor = colorPicker.current();
  var nextColor = colorPicker.next();
  var targetR = calcPageFillRadius(e.pageX, e.pageY);
  var rippleSize = Math.min(200, (cW * .4));
  var minCoverDuration = 750;
  
  // Создание объекта для заливки страницы
  var pageFill = new Circle({
    x: e.pageX,
    y: e.pageY,
    r: 0,
    fill: nextColor
  });
  var fillAnimation = anime({
    targets: pageFill,
    r: targetR,
    duration: Math.max(targetR / 2 , minCoverDuration),
    easing: "easeOutQuart",
    complete: function(){
      bgColor = pageFill.fill;
      removeAnimation(fillAnimation);
    }
  });
  
  // Создание объекта для ряби
  var ripple = new Circle({
    x: e.pageX,
    y: e.pageY,
    r: 0,
    fill: currentColor,
    stroke: {
      width: 3,
      color: currentColor
    },
    opacity: 1
  });
  var rippleAnimation = anime({
    targets: ripple,
    r: rippleSize,
    opacity: 0,
    easing: "easeOutExpo",
    duration: 900,
    complete: removeAnimation
  });
  
  // Создание объектов для частиц
  var particles = [];
  for (var i = 0; i < 32; i++) {
    var particle = new Circle({
      x: e.pageX,
      y: e.pageY,
      fill: currentColor,
      r: anime.random(24, 48)
    });
    particles.push(particle);
  }
  var particlesAnimation = anime({
    targets: particles,
    x: function(particle){
      return particle.x + anime.random(rippleSize, -rippleSize);
    },
    y: function(particle){
      return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
    },
    r: 0,
    easing: "easeOutExpo",
    duration: anime.random(1000,1300),
    complete: removeAnimation
  });
  
  // Добавление анимаций в список
  animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

// Расширение объекта
function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

// Описание класса Circle
var Circle = function(opts) {
  extend(this, opts);
}

// Метод для отрисовки круга
Circle.prototype.draw = function() {
  ctx.globalAlpha = this.opacity || 1;
    
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  if (this.stroke) {
    ctx.strokeStyle = this.stroke.color;
    ctx.lineWidth = this.stroke.width;
    ctx.stroke();
  }
  if (this.fill) {
    ctx.fillStyle = this.fill;
    ctx.fill();
  }
  ctx.closePath();
};
// Инициализация и запуск анимации
function init() {
var resizeCanvas = function() {
cW = window.innerWidth;
cH = window.innerHeight;
c.width = cW * devicePixelRatio;
c.height = cH * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

addClickListeners();
anime({
duration: Infinity,
update: function() {
ctx.clearRect(0, 0, cW, cH);
ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, cW, cH);
animations.forEach(function(anim) {
anim.animatables.forEach(function(animatable) {
animatable.target.draw();
});
});
}
});
}

// Запускаем инициализацию после полной загрузки страницы
window.addEventListener("DOMContentLoaded", init);