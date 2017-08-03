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

const vec3 least_temp = vec3(014.0/255.0, 000.0/255.0, 143.0/255.0);
const vec3 most_temp  = vec3(168.0/255.0, 000.0/255.0, 000.0/255.0);

vec3 hex_color(vec4 data){
  float moisture = data.x;
  return mix(least_temp,most_temp,moisture);
}

#pragma glslify: import('./color_hex.glsl')

void main(void){
  color_hex(); // calls hex_color
}
