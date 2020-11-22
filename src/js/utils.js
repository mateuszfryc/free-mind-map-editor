const log = console.log;

const on = function(event, callback, element = document, bubble = false) {
    element.addEventListener(event, callback, bubble)
};

const get = function(query, element = document) {
    return element.querySelector(query);
}

get.all = function(query, element = document) {
    return Array.from(element.querySelectorAll(query));
}

get.screenCenterCoords = function() {
    return new Vector(
        parseInt(document.body.width) * 0.5,
        parseInt(document.body.height) * 0.5,
    )
}

get.twoPointsDistance = function(p1, p2) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt(a * a + b * b);
}

get.windowInnerSize = function() {
    return {
        width: window.innerWidth && document.documentElement.clientWidth
                ? Math.min( window.innerWidth, document.documentElement.clientWidth )
                : document.documentElement.clientWidth
                    || document.getElementsByTagName('body')[0].clientWidth,
        height: window.innerHeight && document.documentElement.clientHeight
                ? Math.min(window.innerHeight, document.documentElement.clientHeight)
                : document.documentElement.clientHeight
                    || document.getElementsByTagName('body')[0].clientHeight,
    }
};

get.parsedStyle = function(element, ...valueNames) {
    const style = window.getComputedStyle(element);
    let parsed = {}
    valueNames.forEach(name => {
       parsed[name] = parseInt(style[name], 10);
    });

    return parsed;
}

get.time = typeof performance === 'function' ? performance.now : Date.now;

function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
};
