// add first top node
store.rootThought = new Thought(getScreenCenterCoords(), undefined, 'Map your new idea');
canvas.drawInstructions.push(Draw.thoughtConnectors);

const linkSelected = 'link-selected';
let lastSelected = get(`.${linkSelected}`);
get.all('.link').forEach(link => {
    link.on('click', ({ target }) => {
        const { className } = target;
        if (!className.includes(linkSelected)) {
            target.className += ` ${linkSelected}`;
            lastSelected.className = lastSelected.className.replace(linkSelected, '').trim();
            lastSelected = target;
        }
    });
});
