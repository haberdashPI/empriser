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

void main(void){
  vec2 hex = img2hex(tex2img(vTextureCoord.xy,filterArea));
  if(hex.x < 0.0 || hex.y < 0.0 || hex.x >= map_dims.x || hex.y >= map_dims.y){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    vec2 tex  = texture2D(uSampler,hex2dat(hex,filterArea)).xy;
    int zone = int(255.0*tex.x)-1;
    float depth = tex.y;

    // int zone = 3;
    if(zone == 0)      gl_FragColor = zoneColor(zone_h_0,zone_s_0,depth);
    else if(zone == 1) gl_FragColor = zoneColor(zone_h_1,zone_s_1,depth);
    else if(zone == 2) gl_FragColor = zoneColor(zone_h_2,zone_s_2,depth);
    else if(zone == 3) gl_FragColor = zoneColor(zone_h_3,zone_s_3,depth);
  }
}
