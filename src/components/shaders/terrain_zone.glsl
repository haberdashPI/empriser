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
  vec2 wld = img2wld(tex2img(vTextureCoord.xy,filterArea));
  vec2 axl = wld2axl(wld);

  vec4 n23 = closest_neighbors(axl,wld);
  vec2 np1 = axl2wld(axl);
  vec2 np2 = axl2wld(n23.xy);
  vec2 np3 = axl2wld(n23.zw);

  float dist1 = length(wld-np1);
  float dist2 = length(wld-np2);
  float dist3 = length(wld-np3);

  wld.x = mod(wld.x,map_dims.x);
  if(wld.x < 0.0) wld.x += map_dims.x;

  if(wld.y < 0.0 || wld.y > map_dims.y * 0.5/s){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    vec2 hex = axl2hex(axl);
    hex.x = mod(hex.x,map_dims.x);
    if(hex.x < 0.0) hex.x += map_dims.x;
    hex.y = clamp(hex.y,0.0,map_dims.y-1.0);

    vec2 tex  = texture2D(uSampler,hex2dat(hex,filterArea)).xy;
    int zone = int(255.0*tex.x)-1;
    float depth = tex.y;

    // int zone = 3;
    if(zone == 0)      gl_FragColor = zoneColor(zone_h_0,zone_s_0,depth);
    else if(zone == 1) gl_FragColor = zoneColor(zone_h_1,zone_s_1,depth);
    else if(zone == 2) gl_FragColor = zoneColor(zone_h_2,zone_s_2,depth);
    else if(zone == 3) gl_FragColor = zoneColor(zone_h_3,zone_s_3,depth);

    float width = min(4.0/view_scale,0.1);
    if(view_scale > 10.0){
      float edge = min(1.0,min(width,min(dist2 - dist1,dist3 - dist1))/width);
      gl_FragColor.rgb = mix(gl_FragColor.rgb,vec3(1.0,1.0,1.0),1.0-edge);
    }
  }
}
