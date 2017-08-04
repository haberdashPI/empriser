

# Stage 1: simple map generation and exploration

In this stage I create a working world map generator. It isn't super fancy: just
enough to get all of the map features I want to design a map on top of

The steps are:

1. Generate a static view with randomized elevations as points
   - [x] use a fixed set of heights and render each as an appropriate color
   - [x] convert to hexes
   - [x] generate random heights using gradient interpolation across multiple scales
2. Create an interface to manipulate the paramters of map generation
   - [x] setup a single slider setting using react and material-ui - terrain smoothness
       * [x] create the initial interface
       * [x] implement redux state mangement and render a new map
   - [x] setup other controls
       * [x] randomization seed
       * [x] refactor terrain dialog
       * [x] size of map
       * [x] refactor map generation: split out terrain and rendering
       * [x] refactor data organization split terrain and zones
       * [x] re-map histogram (intergate with zone "ocean area, coast, etc..."
             and select % of map and depth for each type)
             . [x] build dialog interface (left: adjust others and limit range
                   as needed)
             . [x] implement rendering
       * [x] improve zone icon (customize in illlustrator and create svgicon)
       * [x] add *very* simple temperature and moisture cotrol
             . [x] build dialog for temperature and moisture
                   make terrain layout more like this layout!!!
             . [x] determine temperature based on distance from water +
                   equator + noise
             . [x] determine moisture based on noise + integrated distance from 
             . [x] color temperature using red through blue
             . [x] color moister in blue through grey
       * [x] have a gui grouping all the different display modes (terrain, zones, etc...)
             togethor
       * [x] determine vegetation based on temperature
             and moisture (plus noise?)
       * [x] visualize final map with vegetation + indication of height (shading probably)
             . [x] determine setting constraints
             . [x] generate gui
             . [x] implement gui constraints
             . [x] implement tile rendering
             . [x] debug tile generation
             . [x] create better icons

3. create an interface to zoom in and explore the map
   - [x] create zoom tool - clickable button
   - [x] create pan tool - draggable

# Stage 2: file management

This short stage will yield a usable website. We need to:

- [ ] be able to save map settings as a file: settings should include the generation
parameters plus the particular view we're looking at
    * [x] basic save
    * [x] be able to change the file name

- [x] be able to load a saved map

- [x] be able to save a given view as an image (e.g. using .toDataURL())
  this currently works through right click on the canvas (no need to implement)
  I my need to revisit this when I switch to PIXI

- [x] host the resulting website on github

# Stage 2.1: code refactoring

There is some cruft in the code. Confusing names for anyone trying to read the
source that aren't the same as those in the user interface. Also a few
organizational issues (we can probably breakup map.js into severla files)

DONE!!!

# Stage 3: improved graphics

In this stage I work on an initial cleaning up the appearance of the map
to make it look nice and presentable. j

X improve zoom interface: I didn't make this better earlier because
  paper.js is slow
* switch from Paper.j to PIXI - same output, just faster
  - [x] implemented terrain
  - [x] implemented terrain zones
  - [x] implemented moisture
  - [x] implemented temperature
  - [x] implemented climate zones

X * improve colors for climate zone view
X * add noisy border to tiles

X * add basic annotations for:
    - moutains
    - hills

X * add noisy interior

At this point I can definitely create my Aleron map

* fix bug on edge of large maps (maybe limit map size?)

X * have a clean edge cutoff
X * allow navigation in all modes and remove the hand from the toolbar
X * allow x to wrap (mark edge??)
X * set limits on position and zoom based on map size
X * zoom to mouse point (not screen center)
X * allow for modern navigation?? (use scroll to move around the map, pinch to
zoom)
X * fix visualization on terrain views.

X * optimize switching from one terrain view to another (only copy once)
X * use periodic texturing to avoid a seam
X * optimize terrain rendering (if possible)
X * adding variable coloring to improve texutring
* add warp to give in impression of globe?? (should be optional)

X * add black border to hexes in the helper views
X * add legends to make the map easier to read
X * improve color interpolation (use color brewer) for helper views

* add a spinner during terrain generation??
  (this will require breaking up the loops, maybe by
  having a schedular, or just a web worker)

* change name of the climate zone view

* EXTRA (after improved world map generation + rivers): improve edges to climate
  zone view.

# Stage 4: improved world map generation

Anything I didn't finish in stage two, I now finalize here.

* scale parameter: allow the scale of continents to be selected
X * allow moisture to wrap around x axis
X * optimization: implement terrain generation using typed arrays
* wind generation to create adjusted moisture and temperature values
* generate rivers based on moisture concentrations near mountains

# Stage 5: simple location generation

In this stage I create a method to generate locations for cities and dungeons on the map.

# Stage 6: detailed location generation

In this stage I make it possible to zoom in to a particular city or dungeons and generate
details of that location.

This is essentially a new application within the world generation, and will
likely involve a separate plan document. I could link to this
app, which could take some inputs from the world map.

