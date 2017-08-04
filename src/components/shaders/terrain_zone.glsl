precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform float view_scale;
uniform vec2 view_dims;
uniform vec2 view_position;
uniform vec2 map_dims;

uniform vec4 filterArea;

#pragma glslify: import('./coords/img2hex.glsl')
#pragma glslify: import('./coords/tex2img.glsl')
#pragma glslify: import('./coords/hex2dat.glsl')
#pragma glslify: import('./color/hsv2rgb.glsl')
#pragma glslify: import('./color/terrain_zones.glsl')

vec3 hex_color(vec4 data){
  vec2 tex  = data.xy;
  int zone = int(255.0*tex.x)-1;
  float depth = tex.y;

  // int zone = 3;
  if(zone == 0)      return zoneColor(zone0,depth);
  else if(zone == 1) return zoneColor(zone1,depth);
  else if(zone == 2) return zoneColor(zone2,depth);
  else if(zone == 3) return zoneColor(zone3,depth);
}

#pragma glslify: import('./color_hex.glsl')

void main(void){
  color_hex(); // calls hex_color
}
