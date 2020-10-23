const canvas = get('#canvas');
const context = canvas.getContext('2d');

canvas.redraw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    state.ideas.forEach(idea => {
        idea.drawConnector(true);
    })
}
