const nodes = [];
const input = 'input';
const click = 'click';
const body = document.body;
const log = console.log;
const mouse = {
    isLeftButtonDown: false,
    x: 0,
    y: 0,
}

function onMouseDown() {

}

body.width = window.innerWidth && document.documentElement.clientWidth
  ? Math.min( window.innerWidth, document.documentElement.clientWidth )
  : window.innerWidth
    || document.documentElement.clientWidth
    || document.getElementsByTagName('body')[0].clientWidth;

body.height = window.innerHeight && document.documentElement.clientHeight
  ? Math.min(window.innerHeight, document.documentElement.clientHeight)
  : window.innerHeight
    || document.documentElement.clientHeight
    || document.getElementsByTagName('body')[0].clientHeight;



function addNode(clickEvent) {
    log(clickEvent)
    const element = document.createElement(input);
    nodes.push(element);
    document.body.appendChild(element);
};

document.body.addEventListener(click, addNode);



