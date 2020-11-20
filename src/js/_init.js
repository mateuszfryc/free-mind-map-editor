window.on('load', () => {
    const canvas = get('#canvas');
    function updateDocumentSize() {
        const { width, height } = get.windowInnerSize();
        [document.body, canvas, get('#mindmap')].forEach(element => {
            element.width = width;
            element.height = height;
        });
    }
    updateDocumentSize();
    window.on('resize', updateDocumentSize);

    // add first top node
    store.rootThought = new Thought(get.screenCenterCoords(), undefined, true, 'What\'s on your mind?');
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

    animate();
});
