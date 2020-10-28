const store = {
    // settings
    defaultSpawnGap: {
        horiz: 30,
        vert: 15
    },
    isDebugDrawOn: false,
    scaleStep: 0.1,
    
    // state
    highlight: undefined,
    rootThought: undefined,
    scale: 1,
    selection: undefined,
    styleSheet: get.styleSheetByName('default'),
    thoughts: [],
}
