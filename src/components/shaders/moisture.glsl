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

void main(void){
  vec2 hex = img2hex(tex2img(vTextureCoord.xy,filterArea));
  if(hex.x < 0.0 || hex.y < 0.0 || hex.x >= map_dims.x || hex.y >= map_dims.y){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    float moisture = texture2D(uSampler,hex2dat(hex,filterArea)).x;
    gl_FragColor.rgb = (most_moist - least_moist)*moisture + least_moist;
  }
}
