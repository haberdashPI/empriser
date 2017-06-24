

# Stage 1: simple map generation and exploration

In this stage I create a working world map generator. It isn't fancy: I just generate random heights (via multiple frequencies of noise) and color them accordigly. The user can zoom in and out and pan around the map and save the current view as an image.

The steps are

1. Generate a static view with randomized elevations as points
   - [x] use a fixed set of heights and render each as an appropriate color
   - [x] convert to hexes
   - [x] generate random heights using gradient interpolation across multiple scales
2. Create an interface to manipulate the paramters of generation
   - [ ] setup a single slider setting using react and material-ui - terrain smoothness
   - [ ] setup other controls
       * [ ] randomization seed
       * [ ] zones (deep sea, ocean, coast, eacha  different color)

3. create an interface to zoom in and explore the elevations.

# Stage 2: improved world map generation (maybe 3)

In this stage I add more sophisticated generation of the world map, to allow for both more interesting terrain, and to allow more control of its generation.

# Stage 3: improved graphics (maybe 2)

In this stage I work on cleaning up the appearance of the program to make
maps, cities and dungeons more attractive.

# Stage 3.1: file management

This short stage will make the website usable. We need to

1. be able to save map settings as a file: settings should include the generation
parameters plus the particular view we're looking at

2. be able to save a view as an image (using .toDataURL())

# Stage 4: simple location generation

In this stage I create a method to generate cities and dungeons on the map.

# Stage 5: detailed location generation

In this stage I make it possible to zoom in to a particular city or dungeons and generate
details of that location.
