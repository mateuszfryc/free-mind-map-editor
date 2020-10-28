const log = console.log;

const on = function(event, callback, element = document, bubble = false) {
    element.addEventListener(event, callback, bubble)
};

function get(query, element = document) {
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

function isElementOverflowing(element) {
    const { value } = element;
    let {
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft
    } = window.getComputedStyle(element);
    paddingTop = parseInt(paddingTop);
    paddingRight = parseInt(paddingRight);
    paddingBottom = parseInt(paddingBottom);
    paddingLeft = parseInt(paddingLeft);
    const innerWidth = element.clientWidth - (paddingRight + paddingLeft);
    const innerHeight = element.clientHeight - (paddingTop + paddingLeft);

    test.innerHTML = value;
    const testWidth = test.scrollWidth;
    const testHeight = test.scrollWidth;
        
    return isOverflowing = innerWidth < testWidth || innerHeight < testHeight;
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
window.on('resize', updateWindowInnerSize);

const IDLE = 'idle'
const HIGHLIGHTED = 'highlighted';
const SELECTED = 'selected';
const EDITED = 'edited';

const THOUGHT_STATE = {
    IDLE,
    HIGHLIGHTED,
    SELECTED,
    EDITED,
}