const log = console.log;

function listen(event, handler, element) {
    element = element || document;
    element.addEventListener(event, handler);
}

function get(query, element) {
    element = element || document;
    return element.querySelector(query);
}

function getScreenCenterCoords() {
    return {
        x: document.body.width * 0.5,
        y: document.body.height * 0.5,
    }
}

function updateWindowInnerSize() {
    document.body.width = canvas.width = window.innerWidth && document.documentElement.clientWidth
        ? Math.min( window.innerWidth, document.documentElement.clientWidth )
        : window.innerWidth
            || document.documentElement.clientWidth
            || document.getElementsByTagName('body')[0].clientWidth;
    
    document.body.height = canvas.height = window.innerHeight && document.documentElement.clientHeight
        ? Math.min(window.innerHeight, document.documentElement.clientHeight)
        : window.innerHeight
            || document.documentElement.clientHeight
            || document.getElementsByTagName('body')[0].clientHeight;
}
updateWindowInnerSize();
listen('resize', updateWindowInnerSize, window);
