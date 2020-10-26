const canvas = get('#canvas');
const context = canvas.getContext('2d');

canvas.offset = new Vector();
canvas.redraw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    store.ideas.forEach(idea => {
        idea.drawConnector(true);
    })
}
