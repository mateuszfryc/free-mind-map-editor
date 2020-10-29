const store = {
    // settings
    defaultSpawnGap: new Vector(25, 10),
    isDebugDrawOn: false,
    scaleStep: 0.1,
    
    // state
    animationQueue: [],
    highlight: undefined,
    rootThought: undefined,
    scale: 1,
    selection: undefined,
    styleSheet: get.styleSheetByName('default'),
    thoughts: [],
}
