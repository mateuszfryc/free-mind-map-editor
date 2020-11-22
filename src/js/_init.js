window.on('load', () => {
    const { width, height } = get.windowInnerSize();
    function updateDocumentSize() {
        [document.body, get('#mindmap'), draw.canvas].forEach(element => {
            element.width = width;
            element.height = height;
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        });
        draw.setMiniMapViewportProportionalSize();
        draw.connectors();
    }
    updateDocumentSize();
    window.on('resize', updateDocumentSize);
    
    draw.setThoughtsContainerPosition();
    draw.centerMindMap();

    // add first top node
    store.rootThought = new Thought(draw.getMapCenterCoordinates(), undefined, true, 'What\'s on your mind?');
    store.rootThought.edit();

    // switching menu selected links logic
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
});
