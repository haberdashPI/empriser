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


const vec3 m0 = vec3(84.0/255.0,48.0/255.0,5.0/255.0);
const vec3 m1 = vec3(140.0/255.0,81.0/255.0,10.0/255.0);
const vec3 m2 = vec3(191.0/255.0,129.0/255.0,45.0/255.0);
const vec3 m3 = vec3(223.0/255.0,194.0/255.0,125.0/255.0);
const vec3 m4 = vec3(246.0/255.0,232.0/255.0,195.0/255.0);
const vec3 m5 = vec3(245.0/255.0,245.0/255.0,245.0/255.0);
const vec3 m6 = vec3(199.0/255.0,234.0/255.0,229.0/255.0);
const vec3 m7 = vec3(128.0/255.0,205.0/255.0,193.0/255.0);
const vec3 m8 = vec3(53.0/255.0,151.0/255.0,143.0/255.0);
const vec3 m9 = vec3(1.0/255.0,102.0/255.0,94.0/255.0);
const vec3 m10 = vec3(0.0/255.0,60.0/255.0,48.0/255.0);


vec3 hex_color(vec4 data){
  float moist = data.x;
  if(moist < 1.0/9.0) return mix(m1,m2,(moist)*9.0);
  if(moist < 2.0/9.0) return mix(m2,m3,(moist - 1.0/9.0)*9.0);
  if(moist < 3.0/9.0) return mix(m3,m4,(moist - 2.0/9.0)*9.0);
  if(moist < 4.0/9.0) return mix(m4,m5,(moist - 3.0/9.0)*9.0);
  if(moist < 5.0/9.0) return mix(m5,m6,(moist - 4.0/9.0)*9.0);
  if(moist < 6.0/9.0) return mix(m6,m7,(moist - 5.0/9.0)*9.0);
  if(moist < 7.0/9.0) return mix(m7,m8,(moist - 6.0/9.0)*9.0);
  if(moist < 8.0/9.0) return mix(m8,m9,(moist - 7.0/9.0)*9.0);
  else return mix(m9,m10,(moist - 8.0/9.0)*9.0);
}

#pragma glslify: import('./color_hex.glsl')

void main(void){
  color_hex(); // calls hex_color
}
