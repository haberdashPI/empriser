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
#pragma glslify: import('./noise.glsl')

const vec3 climate_0 = vec3(240.0/255.0,220.0/255.0,192.0/255.0);
const vec3 climate_1 = vec3(148.0/255.0,137.0/255.0,105.0/255.0);
const vec3 climate_2 = vec3(058.0/255.0,107.0/255.0,045.0/255.0);
const vec3 climate_3 = vec3(054.0/255.0,096.0/255.0,042.0/255.0);
const vec3 climate_4 = vec3(053.0/255.0,082.0/255.0,040.0/255.0);
const vec3 climate_5 = vec3(122.0/255.0,115.0/255.0,087.0/255.0);
const vec3 climate_6 = vec3(252.0/255.0,252.0/255.0,255.0/255.0);

const vec3 elevation = vec3(145.0/255.0,120.0/255.0,087.0/255.0);

// const vec3 veg_0 = vec3(116.0/360.0,1.0,0.25);
// const vec3 veg_1 = vec3(116.0/360.0,1.0,0.53);
// const vec3 veg_2 = vec3(133.0/360.0,0.61,0.19);
// const vec3 veg_3 = vec3(80.0/360.0,1.0,0.53);
// const vec3 veg_4 = vec3(58.0/360.0,1.0,0.15);

vec3 climateColor(vec3 climate,int zone){
  return mix(climate,elevation,(float(zone)-1.0)/2.0);
}

float noisy_dist(vec2 a,vec2 b){
  vec2 diff = b-a;
  return length(diff) +
    2.0*(0.13    * (cnoise(03.0*(normalize(diff) + a))+1.0) +
         0.065   * (cnoise(06.0*(normalize(diff) + a))+1.0) +
         0.0325  * (cnoise(12.0*(normalize(diff) + a))+1.0) +
         0.01625 * (cnoise(24.0*(normalize(diff) + a))+1.0));
}

void main(void){
  vec2 wld = img2wld(tex2img(vTextureCoord.xy,filterArea));
  vec2 axl = wld2axl(wld);

  vec2 n1 = axl2hex(axl);
  vec2 np1 = axl2wld(axl);

  vec4 n23 = closest_neighbors(axl,wld);

  vec2 n2 = axl2hex(n23.xy);
  vec2 np2 = axl2wld(n23.xy);

  vec2 n3 = axl2hex(n23.zw);
  vec2 np3 = axl2wld(n23.zw);

  float dist1 = noisy_dist(wld,np1);
  float dist2 = noisy_dist(wld,np2);
  float dist3 = noisy_dist(wld,np3);

  vec2 hex;
  if(dist1 < dist2 && dist1 < dist3) hex = n1;
  else if(dist2 < dist3) hex = n2;
  else hex = n3;

  // vec2 hex = n1;
  // if(length(np1 - wld) > 0.25){
  //   if(length(np2 - wld) < length(np3 - wld)) hex = n2;
  //   else hex = n3;
  // }

  if(hex.x < 0.0 || hex.y < 0.0 || hex.x >= map_dims.x || hex.y >= map_dims.y){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  }else{
    vec4 tex  = texture2D(uSampler,hex2dat(hex,filterArea));
    int zone = int(255.0*tex.x)-1;
    float depth = tex.y;
    int vegetation = int(255.0*tex.z / 8.0)-1;
    int climate = int(mod(255.0*tex.z,8.0))-1;

    if(zone == 0) gl_FragColor = zoneColor(zone_h_0,zone_s_0,depth);
    else{ // if(vegetation == 0){
      if(climate == 0) gl_FragColor.rgb = climate_0;
      else if(climate == 1) gl_FragColor.rgb = climateColor(climate_1,zone);
      else if(climate == 2) gl_FragColor.rgb = climateColor(climate_2,zone);
      else if(climate == 3) gl_FragColor.rgb = climateColor(climate_3,zone);
      else if(climate == 4) gl_FragColor.rgb = climateColor(climate_4,zone);
      else if(climate == 5) gl_FragColor.rgb = climateColor(climate_5,zone);
      else if(climate == 6) gl_FragColor.rgb = climateColor(climate_6,zone);
    }
    // else{
    //   if(vegetation == 1) gl_FragColor = climateColor(veg_0,zone);
    //   else if(vegetation == 2) gl_FragColor = climateColor(veg_1,zone);
    //   else if(vegetation == 3) gl_FragColor = climateColor(veg_2,zone);
    //   else if(vegetation == 4) gl_FragColor = climateColor(veg_3,zone);
    //   else if(vegetation == 5) gl_FragColor = climateColor(veg_4,zone);
    // }
  }
}
