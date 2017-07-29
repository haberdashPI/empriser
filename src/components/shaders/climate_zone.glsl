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

const vec3 climate0 = vec3(240.0/255.0,220.0/255.0,192.0/255.0);
const vec3 climate1 = vec3(148.0/255.0,137.0/255.0,105.0/255.0);
const vec3 climate2 = vec3(058.0/255.0,107.0/255.0,045.0/255.0);
const vec3 climate3 = vec3(054.0/255.0,096.0/255.0,042.0/255.0);
const vec3 climate4 = vec3(053.0/255.0,082.0/255.0,040.0/255.0);
const vec3 climate5 = vec3(122.0/255.0,115.0/255.0,087.0/255.0);
const vec3 climate6 = vec3(252.0/255.0,252.0/255.0,255.0/255.0);

const vec3 elevation = vec3(120.0/255.0,120.0/255.0,087.0/255.0);

// const vec3 veg_0 = vec3(116.0/360.0,1.0,0.25);
// const vec3 veg_1 = vec3(116.0/360.0,1.0,0.53);
// const vec3 veg_2 = vec3(133.0/360.0,0.61,0.19);
// const vec3 veg_3 = vec3(80.0/360.0,1.0,0.53);
// const vec3 veg_4 = vec3(58.0/360.0,1.0,0.15);

float elnoise(vec2 wld,int zone){
  float amt = 0.0;
  wld /= 3.0;
  if(zone == 2)
    amt += 0.3*cnoise(4.0*wld) +
      0.1*cnoise(8.0*wld) +
      0.05*cnoise(16.0*wld);

  if(zone == 3)
    amt += 0.3*cnoise(4.0*wld) +
      0.15*cnoise(8.0*wld) +
      0.075*cnoise(16.0*wld);

  return 2.0*(float(zone)-1.9)*(float(zone)-1.9)*amt;
}

float edgeify(float edge,float x,float k){
  if(edge < k) return x*edge/k + (1.0-edge/k);
  else return x;
}

float elshade(float edge,vec2 wld,int zone){
  if(zone > 1){
    vec2 dir;
    dir.x = elnoise(wld,zone) - elnoise(wld+0.001,zone);
    dir.y = elnoise(-wld,zone) - elnoise(-wld-0.001,zone);

    float el = dot(vec2(1.0,0.0),dir) * float(zone-1) / length(dir);
    return 0.75 + edgeify(edge,el,0.4)*(1.0-0.75);
  }
  return 1.0;
}

vec3 climateColor0(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);

  float sand = 0.8 + 0.1*cnoise(100.0*wld) +
    0.05*cnoise(200.0*wld) +
    0.025*cnoise(400.0*wld) +
    0.05*cnoise(3.0*wld);
  // sand = edgeify(edge,sand,0.1);

  return climate0*vec3(el,el,el)*vec3(sand,sand,sand);
}

vec3 climateColor1(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);
  return mix(climate1,elevation,max(0.0,float(zone)-1.0))*
    vec3(el,el,el);
}
vec3 climateColor2(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);

  vec3 color = mix(climate2*vec3(1.2,1.2,1.2),climate3*vec3(0.8,0.8,0.8),grass);

  return mix(color,elevation,max(0.0,float(zone)-1.0))*vec3(el,el,el);
}
vec3 climateColor3(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);
  return mix(climate3,elevation,max(0.0,float(zone)-1.0))*
    vec3(el,el,el);
}
vec3 climateColor4(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);
  return mix(climate4,elevation,max(0.0,float(zone)-1.0))*
    vec3(el,el,el);
}
vec3 climateColor5(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);
  return elevation*vec3(el,el,el);
}
vec3 climateColor6(float edge,vec2 wld,int zone){
  float el = elshade(edge,wld,zone);
  return climate6*vec3(el,el,el);
}

float noisy_dist(vec2 a,vec2 b){
  vec2 diff = b-a;
  return length(diff) +
    2.0*(0.13    * (cnoise(03.0*(normalize(diff) + a))+1.0) +
         0.065   * (cnoise(06.0*(normalize(diff) + a))+1.0) +
         0.0325  * (cnoise(12.0*(normalize(diff) + a))+1.0) +
         0.01625 * (cnoise(24.0*(normalize(diff) + a))+1.0));
}

vec4 hex_color(vec2 hex,vec2 wld){
  if(hex.x < 0.0 || hex.y < 0.0 || hex.x >= map_dims.x || hex.y >= map_dims.y)
    return vec4(1.0,1.0,1.0,1.0);

  vec4 tex  = texture2D(uSampler,hex2dat(hex,filterArea));
  int zone = int(255.0*tex.x)-1;
  float depth = tex.y;
  int vegetation = int(255.0*tex.z / 8.0)-1;
  int climate = int(mod(255.0*tex.z,8.0))-1;

  if(zone == 0) return zoneColor(zone_h_0,zone_s_0,depth);
  else{ // if(vegetation == 0){
    if(climate == 0) returngb = climateColor0(wld,zone);
    else if(climate == 1) return climateColor1(wld,zone);
    else if(climate == 2) return climateColor2(wld,zone);
    else if(climate == 3) return climateColor3(wld,zone);
    else if(climate == 4) return climateColor4(wld,zone);
    else if(climate == 5) return climateColor5(wld,zone);
    else if(climate == 6) return climateColor6(wld,zone);
  }
  // else{
  //   if(vegetation == 1) gl_FragColor = climateColor(veg_0,zone);
  //   else if(vegetation == 2) gl_FragColor = climateColor(veg_1,zone);
  //   else if(vegetation == 3) gl_FragColor = climateColor(veg_2,zone);
  //   else if(vegetation == 4) gl_FragColor = climateColor(veg_3,zone);
  //   else if(vegetation == 5) gl_FragColor = climateColor(veg_4,zone);
  // }
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

  vec4 nc1 = hex_color(n1,wld);
  vec4 nc2 = hex_color(n2,wld);
  vec4 nc3 = hex_color(n3,wld);
  nc1.a *= 1.0-dist1;
  nc2.a *= 1.0-dist2;
  nc3.a *= 1.0-dist3;

  gl_FragColor.rgb = (nc1.rgb * rc1.a + nc2.rgb * rc2.a + nc3.rgb * rc3.a)/
    (nc1.a + nc2.a + nc3.a);
}
