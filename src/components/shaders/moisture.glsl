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
    vec2 wld = img2wld(tex2img(vTextureCoord.xy,filterArea));
  wld.x = mod(wld.x,map_dims.x);
  if(wld.x < 0.0) wld.x += map_dims.x;

  if(wld.y < 0.0 || wld.y > map_dims.y * 0.5/s){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    vec2 hex = axl2hex(wld2axl(wld));
    hex.x = mod(hex.x,map_dims.x);
    if(hex.x < 0.0) hex.x += map_dims.x;
    hex.y = clamp(hex.y,0.0,map_dims.y-1.0);
    float moisture = texture2D(uSampler,hex2dat(hex,filterArea)).x;
    gl_FragColor.rgb = mix(least_moist,most_moist,moisture);
  }
}
