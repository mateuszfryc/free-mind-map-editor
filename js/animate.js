(function() {

    const movementSpeed = 0.5;
    let lastTime = 0;

    function animate() {
        // 100 stands for desired frame rate
        const now = get.time();
        const deltaMiliseconds = (now - lastTime);

        if (store.animationQueue.length > 0) {
            store.animationQueue.forEach(thought => {
                
            });
        }
        
        lastTime = now;
        requestAnimationFrame(animate);
    }

    window.animate = animate;

})();
