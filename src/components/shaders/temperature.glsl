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

const vec3 t0 = vec3(103.0/255.0,0.0/255.0,31.0/255.0);
const vec3 t1 = vec3(178.0/255.0,24.0/255.0,43.0/255.0);
const vec3 t2 = vec3(214.0/255.0,96.0/255.0,77.0/255.0);
const vec3 t3 = vec3(244.0/255.0,165.0/255.0,130.0/255.0);
const vec3 t4 = vec3(253.0/255.0,219.0/255.0,199.0/255.0);
const vec3 t5 = vec3(247.0/255.0,247.0/255.0,247.0/255.0);
const vec3 t6 = vec3(209.0/255.0,229.0/255.0,240.0/255.0);
const vec3 t7 = vec3(146.0/255.0,197.0/255.0,222.0/255.0);
const vec3 t8 = vec3(67.0/255.0,147.0/255.0,195.0/255.0);
const vec3 t9 = vec3(33.0/255.0,102.0/255.0,172.0/255.0);
const vec3 t10 = vec3(5.0/255.0,48.0/255.0,97.0/255.0);

vec3 hex_color(vec4 data){
  float temp = 1.0-data.x;
  if(temp < 1.0/10.0) return mix(t1,t2,(temp - 1.0/10.0)*10.0);
  if(temp < 2.0/10.0) return mix(t2,t3,(temp - 2.0/10.0)*10.0);
  if(temp < 3.0/10.0) return mix(t3,t4,(temp - 3.0/10.0)*10.0);
  if(temp < 4.0/10.0) return mix(t4,t5,(temp - 4.0/10.0)*10.0);
  if(temp < 5.0/10.0) return mix(t5,t6,(temp - 5.0/10.0)*10.0);
  if(temp < 6.0/10.0) return mix(t6,t7,(temp - 6.0/10.0)*10.0);
  if(temp < 7.0/10.0) return mix(t7,t8,(temp - 7.0/10.0)*10.0);
  if(temp < 8.0/10.0) return mix(t8,t9,(temp - 8.0/10.0)*10.0);
  else return mix(t9,t10,(temp - 9.0/10.0)*10.0);
}

#pragma glslify: import('./color_hex.glsl')

void main(void){
  color_hex(); // calls hex_color
}
