const log = console.log;

const on = function(event, callback, element = document, bubble = false) {
    element.addEventListener(event, callback, bubble)
};

const get = function(query, element = document) {
    return element.querySelector(query);
}

get.styleSheetByName = function(name) {
    return Object.entries(document.styleSheets)
        .find(sheet => 
            sheet.find(entry => 
                entry.href && entry.href.includes(`css/${name}.css`)))[1].cssRules;
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
}
