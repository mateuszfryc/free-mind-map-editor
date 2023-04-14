### MVP:

- [ ] !! fixfeat: new overlaps solver: move overlaps away for all ndoes? like in simple simulation?

- [ ] new mind map button
  - [ ] modal informing that this will remove current mind map
    - [ ] add modal functionality
- [ ] fix: small shadow (or other indication) showing which node will become new parent while dragging
- [ ] feat: on hover over potential parent indicate new parent (shadow or something)

- [ ] some kind of indication that single mind map mode can be expanded to list of mind maps
- [ ] three (or any number) of basic styles
- [ ] info of upcomming paid bonuses
- [ ] alternative drag form: on drag create shadow under item with shadow link and that instead?
- [ ] feat: while draggin node show notification that pressing shift allows for draggin parent alone
  - [ ] add notifications module
- [ ] fix/feat: there is no way to do a next line while editing text. Consider adding text editor, if [Enter] then use other key for sibling - solution?: [shift] + [enter] ?
- [ ] feat: Q&A - copy from the first version
- [ ] feat: [shift] + [tab] for the child on the left?
- [ ] feat: tips at the bottom of the screen
- [ ] feat: bezier curves or oter more accurate curves so that input/output arrives from the right direction
- [ ] feat: arrows!
- [ ] app styles: clean, programmer, doodle (doodle.css, forked)
- [ ] feat: vertical text
- [ ] feat: rotate node
- [ ] feat: change size of the node with resize drag operations (like illustrator)
- [ ] feat: attach link to node
- [ ] feat: select multiple nodes
  - [ ] move multiple nodes
  - [ ] remove multiple nodes
- [ ] fix: when draging node on the left of the parent sometimes children of that node get flipped to the right

- [x] feat: use hand draw graphics for selection, highligt etc
- [x] feat: graphic circle around root
- [x] change parent change action to happen on mouse hover not entire node
- [x] fix: while draging the mouse should not interact with minimap
- [x] fix: click on minimap viewport miniature jumps that viewport to center on the mouse but shouldn't
- [x] fix: right after loading the app parent can be dragged without children even though shift isn't pressed

### Paid user options:

- [ ] additional styles
- [ ] custom styles
- [ ] register new user
- [ ] log in/out
- [ ] mind maps CRUD per user
  - [ ] mind maps list
    - [ ] new mind map
    - [ ] open existing mind map
    - [ ] remove mind map

### To do:

- [ ] app icon instead of burger menu? UX compliant?
- [ ] generate link with mind map data
- [ ] load mind map by url data
- [ ] zoom in/out
  - [ ] funcionality (zomm in/out text, nodes and connectors)
  - [ ] buttons, touch gesture and UI buttons (next to mini map)
- [ ] mouse controlls
  - [ ] open node menu on right click?
    - [ ] align children in different ways
    - [ ] make child
    - [ ] make sibling
    - [ ] delete
- [ ] touch controlls
  - [ ] edit on double touch
  - [ ] drag on touch & hold
  - [ ] open node menu on longer thouch hold
- [ ] save as jpg/png
- [ ] save as PDF
- [ ] printint optimisations
- [ ] settings (styles & behavior, dark mode, auto alignmen)
- [ ] Q&A
- [ ] footer

### Done:

- [x] how to instructions
- [x] bug: after comming back from other routs the state is not restored (or maybe even not saved before changing route)
- [x] design & implement logo
  - [x] favicon
- [x] persist current mind map in cokies
- [x] burger icon with action to open/close menu (close menu on: item click or elsewhere on the page)
- [x] save to desktop as JSON
- [x] load from desktop as JSON
- [x] mouse controlls
  - [x] select tought on mouse click
  - [x] edit node on dbl click
  - [x] dragg node on mouse click & hold
  - [x] drag & drop nodes to change their parent (i.e. move node above the other node to change parent)
- [x] keyboard controlls
  - [x] TAB key to make child
  - [x] ENTER key to make
  - [x] SHIFT key to drag parent without children
  - [x] SHIFT + TAB to select parent
  - [x] DELETE to remove node
- [x] configure: eslint, prettier, ts
- [x] single node react component: base style, highlight style, selected style
- [x] edit existing nodes by dbl click
- [x] resize textarea along with changes to node content dynamically
- [x] save & restore child nodes relative position
- [x] mobox observables for nodes state
- [x] mirror children position to the other side when draggin node from one parent side to the other
- [x] global store to manage data and state
- [x] drag existing nodes
- [x] create node
- [x] create child
- [x] create sibling
- [x] save mind map to JSON file & download on dekstop (funcionality, UI)
- [x] load JSON file from dekstop (funcionality, UI)
- [x] draggable minimap that will alow for fast navigation of the entire mind map, draw minimap connectors
- [x] resolve overlaps between overlapping nodes
- [x] bug: hiting Enter key after selecting newly created child node brakes nodes tree
