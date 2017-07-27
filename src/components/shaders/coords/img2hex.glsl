// TERMINOLOGY:
//
// A bit of the following terminology assumes some background reading from
// [here](http://www.redblobgames.com/grids/hexagons) and
// [here](http://playtechs.blogspot.co.uk/2007/04/hex-grids.html)
//
// Abbreviations are listed in []'s
//
// ---Image Coordinates [img] ---
// Units of image pixels, with 0 at the starting edge of the image. Note that
// values can go slighlty below 0 and slighlty beyond edge of image.
//
// ---World Coordinates [wld] ---
// Caretesian coordinates in world space. World space is the space that the map
// exists in (independent of the view of that world being displayed). In
// world space, each hex is 1 unit wide and √3 tall.
//
// ---Hex Coordinates [hex] ---
// As integers, odd-r hex coordinate system in world space.
// Visually, rows and columns of hexes correspond to the numbered rows and
// columns in this grid system.
//
// ---Axial Coordinates [axl] ---
// The axial hex coordinate system in world space. In this system
// the two principal axes fall along the "grain" of the hexes, simplifying
// world to grid translation.
//

vec2 img2wld(vec2 img){
  vec2 view = (img - view_dims/2.0)/view_scale - view_position;
  return view + map_dims/2.0;
}

const float r = 0.5; // hex radius
const float s = 1.0/sqrt(3.0); //sqrt(3.0)/4.0; // hex side length

vec2 wld2axl(vec2 wld){
  float t1 = wld.y / s;
  float t2 = wld.x / (2.0*r);

  vec2 axl;
  axl.x = floor((floor(wld.x / r) + floor(t2 - t1) + 2.0) / 3.0);
  axl.y = floor((floor(t1 - t2) + floor(t1 + t2) + 2.0) / 3.0);
  return axl;
}

vec2 axl2hex(vec2 axl){
  vec2 hex;
  hex.x = axl.x + (axl.y - mod(axl.y,2.0)) / 2.0;
  hex.y = axl.y;
  return hex;
}

vec2 img2hex(vec2 img){
  return axl2hex(wld2axl(img2wld(img)));
}

// # pragma glslify: export(img2hex)
