

# Stage 1: simple map generation and exploration

In this stage I create a working world map generator. It isn't fancy: I just generate random heights (via multiple frequencies of noise) and color them accordigly. The user can zoom in and out and pan around the map and save the current view as an image.

The steps are

TODO: fix validation so bad values are not passed to upate

1. Generate a static view with randomized elevations as points
   - [x] use a fixed set of heights and render each as an appropriate color
   - [x] convert to hexes
   - [x] generate random heights using gradient interpolation across multiple scales
2. Create an interface to manipulate the paramters of map generation
   - [ ] setup a single slider setting using react and material-ui - terrain smoothness
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
       * [ ] allow different display modes (terrain, zones, etc...)
       * [ ] improve zone icon (customize in illlustrator and create svgicon)
       * [ ] add *very* simple temperature and moister cotrol
       * [ ] add a spinner during terrain generation??

3. create an interface to zoom in and explore the map
   - [ ] create zoom tool - touch interface and clickable button
   - [ ] create pan tool - touch interface and clickable button
   - [ ] display the exact coordinates and scale to allow easy recovery
   - [ ] display a scale marker to the bottom right (allow scale defintion)

# Stage 2 (optional): improved world map generation

In this stage I add more sophisticated generation of the world map, to allow for
both more interesting terrain, and to allow more control of its generation.

I do this stage now only if I'm not happy with the kind of terrain I'm getting
with the default approach.

# Stage 3: file management

This short stage will make the website usable. We need to

1. be able to save map settings as a file: settings should include the generation
parameters plus the particular view we're looking at

2. be able to save a view as an image (using .toDataURL())

3. host the resulting website on github

# Stage 4: improved graphics (maybe 2)

In this stage I work on an initial cleaning up the appearance of the map
to make it look nicer.

switch from Paper.j to PIXI

# Stage 5: more improved world map generation

Anything I didn't finish in stage two, I now finalize here.

# Stage 6: simple location generation

In this stage I create a method to generate locations for cities and dungeons on the map.

# Stage 7: detailed location generation

In this stage I make it possible to zoom in to a particular city or dungeons and generate
details of that location.

This is essentially an new application within the world generation, and will
 likely involve a separate plan document.

# Stage 8: improved graphics

In this final stage I improve the graphics for location and dungeon generation.
