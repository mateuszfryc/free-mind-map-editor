(function() {

    const Pointer = function() {
        this.x = 0;
        this.y = 0;
        this.xLast = 0;
        this.yLast = 0;
        this.isDown = {
            left: false,
            right: false
        };
        this.selection = undefined;
        this.isColliding = false;
    };
    
    Pointer.prototype.getPos = function( e ) {
    return {
        x: e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        y: e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    }
    };
    
    Pointer.prototype.getScaledPos = function() {
    return { 
        x: (this.x - canvas.offset.x) / SETTINGS.scale,
        y: (this.y - canvas.offset.y) / SETTINGS.scale
    }
    };
    
    Pointer.prototype.getCanvasPos = function() {
    return {
        x: this.x - canvas.offset.x,
        y: this.y - canvas.offset.y
    }
    };
    
    Pointer.prototype.move = function( e ) {
        e = e || window.event;
        this.xLast = this.x;
        this.yLast = this.y;
        
        const { x, y } = this.getPos( e );
        
        this.x = x;
        this.y = y;
    };
    
    Pointer.prototype.leftDown = function() {
        this.isDown.left = true;
    };
    
    Pointer.prototype.leftUp = function() {
        this.isDown.left = false;
    };

    const mouse = new Pointer();
    MindMapper.mouse = mouse;

    document.addEventListener( "mousemove", () => mouse.move()     );
    document.addEventListener( "mouseup",   () => mouse.leftUp()   );
    document.addEventListener( "mousedown", () => mouse.leftDown() );

})();

  