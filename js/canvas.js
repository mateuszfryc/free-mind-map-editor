const canvas = get('#canvas');
const context = canvas.getContext('2d');

canvas.offset = new Vector();
canvas.drawInstructions = [];
canvas.redraw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.drawInstructions.length > 0) {
        canvas.drawInstructions.forEach(instruction => {
            instruction();
        })
    }
}
