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

const vec3 climate_0 = vec3(60.0/360.0,1.0,0.9);
const vec3 climate_1 = vec3(37.0/360.0,0.6,0.8);
const vec3 climate_2 = vec3(93.0/360.0,0.7,0.95);
const vec3 climate_3 = vec3(112.0/360.0,0.5,0.75);
const vec3 climate_4 = vec3(92.0/360.0,0.32,0.65);
const vec3 climate_5 = vec3(73.0/360.0,0.15,0);
const vec3 climate_6 = vec3(0.0/360.0,0.0,0.95);

const vec3 veg_0 = vec3(116.0/360.0,1.0,0.25);
const vec3 veg_1 = vec3(116.0/360.0,1.0,0.53);
const vec3 veg_2 = vec3(133.0/360.0,0.61,0.19);
const vec3 veg_3 = vec3(80.0/360.0,1.0,0.53);
const vec3 veg_4 = vec3(58.0/360.0,1.0,0.15);

vec4 climateColor(vec3 hsv,int zone){
  hsv[2] *= (1.0 - 0.25*max(0.0,float(zone)-1.0));
  vec4 result;
  result.rgb = hsv2rgb(hsv);
  result.a = 1.0;
  return result;
}

void main(void){
  vec2 hex = img2hex(tex2img(vTextureCoord.xy,filterArea));
  if(hex.x < 0.0 || hex.y < 0.0 || hex.x >= map_dims.x || hex.y >= map_dims.y){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    vec4 tex  = texture2D(uSampler,hex2dat(hex,filterArea));
    int zone = int(255.0*tex.x)-1;
    float depth = tex.y;
    int vegetation = int(255.0*tex.z / 8.0);
    int climate = int(mod(255.0*tex.z,8.0));
    vegetation -= 1;
    climate -= 1;


    // gl_FragColor.rgb = hsv2rgb(vec3(0.0,0.0,float(climate)/20.0));

    if(zone == 0) gl_FragColor = zoneColor(zone_h_0,zone_s_0,depth);
    else if(vegetation == 0){
      if(climate == 0) gl_FragColor = climateColor(climate_0,zone);
      else if(climate == 1) gl_FragColor = climateColor(climate_1,zone);
      else if(climate == 2) gl_FragColor = climateColor(climate_2,zone);
      else if(climate == 3) gl_FragColor = climateColor(climate_3,zone);
      else if(climate == 4) gl_FragColor = climateColor(climate_4,zone);
      else if(climate == 5) gl_FragColor = climateColor(climate_5,zone);
      else if(climate == 6) gl_FragColor = climateColor(climate_6,zone);
    }
    else{
      if(vegetation == 1) gl_FragColor = climateColor(veg_0,zone);
      else if(vegetation == 2) gl_FragColor = climateColor(veg_1,zone);
      else if(vegetation == 3) gl_FragColor = climateColor(veg_2,zone);
      else if(vegetation == 4) gl_FragColor = climateColor(veg_3,zone);
      else if(vegetation == 5) gl_FragColor = climateColor(veg_4,zone);
    }
  }
}
