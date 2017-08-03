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

const vec3 least_moist = vec3(255.0/255.0, 205.0/255.0, 112.0/255.0);
const vec3 most_moist  = vec3(010.0/255.0, 000.0/255.0, 204.0/255.0);

vec3 hex_color(vec4 data){
  float moisture = data.x;
  return mix(least_moist,most_moist,moisture);
}

#pragma glslify: import('./color_hex.glsl')

void main(void){
  color_hex(); // calls hex_color
}
