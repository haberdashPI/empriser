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

const float r = 0.5; // hex radius
const float s = 1.0/sqrt(3.0); // hex side length

vec2 img2wld(vec2 img){
  vec2 view = (img - view_dims/2.0)/view_scale - view_position;
  view.x += map_dims.x/2.0;
  view.y += map_dims.y/2.0 * sqrt(3.0/4.0);
  return view;
}

vec2 wld2axl(vec2 wld){
  float t1 = wld.y / s;
  float t2 = wld.x / (2.0*r);

  vec2 axl;
  axl.x = floor((floor(wld.x / r) + floor(t2 - t1) + 2.0) / 3.0);
  axl.y = floor((floor(t1 - t2) + floor(t1 + t2) + 2.0) / 3.0);
  return axl;
}

const vec2 axX = vec2(1.0,0.5);
const vec2 axY = vec2(0.0,0.5/s);
vec2 axl2wld(vec2 axl){
  return vec2(dot(axl,axX),dot(axl,axY));
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

vec2 img2axl(vec2 img){
  return wld2axl(img2wld(img));
}

const float pi = 3.1415926535897932384626433832795;

vec4 closest_neighbors(vec2 axl,vec2 wld){
  vec2 c = axl2wld(axl);
  vec2 dir = wld - c;
  float angle = acos(dir.x / length(dir));
  if(wld.y > c.y){
    if(angle < pi/3.0)
      return vec4(axl.x+1.0, axl.y,
                  axl.x,     axl.y+1.0);
    else if(angle < 2.0*pi/3.0)
      return vec4(axl.x,     axl.y+1.0,
                  axl.x-1.0, axl.y+1.0);
    else
      return vec4(axl.x-1.0, axl.y+1.0,
                  axl.x-1.0, axl.y);
  }else{
    if(angle < pi/3.0)
      return vec4(axl.x+1.0, axl.y-1.0,
                  axl.x+1.0, axl.y);
    else if(angle < 2.0*pi/3.0)
      return vec4(axl.x,     axl.y-1.0,
                  axl.x+1.0, axl.y-1.0);
    else
      return vec4(axl.x-1.0, axl.y,
                  axl.x,     axl.y-1.0);
  }
}

// # pragma glslify: export(img2hex)
