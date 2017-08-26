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
const vec3 climate1 = vec3(168.0/255.0,137.0/255.0,105.0/255.0);
const vec3 climate2 = vec3(058.0/255.0,107.0/255.0,045.0/255.0);
const vec3 climate3 = vec3(054.0/255.0,096.0/255.0,042.0/255.0);
const vec3 climate4 = vec3(053.0/255.0,082.0/255.0,040.0/255.0);
const vec3 climate5 = vec3(122.0/255.0,115.0/255.0,087.0/255.0);
const vec3 climate6 = vec3(252.0/255.0,252.0/255.0,255.0/255.0);

const vec3 elevation = vec3(120.0/255.0,120.0/255.0,087.0/255.0);

const float river_width = 0.03;
const float river_shade = 0.14;
const float river_depth = 0.4;

float fbm(float s,vec2 p,float c,float H){
  float sum = 0.0;
  for(int i=0;i<3;i++){
    sum += c * pnoise(s*p,s*map_dims);
    c *= H;
    p *= 2.0;
  }

  return sum;
}

float elnoise(vec2 wld,int zone){
  // if(zone == 0) return fbm(3.0,wld,0.4,0.75);
  // if(zone == 1) return fbm(0.2, wld,0.02,0.4); //fbm(1.0, wld,0.3,0.35);
  // else if(zone == 2) return fbm(0.5, wld,0.1,0.4);
  // else if(zone == 3) return fbm(0.8, wld,0.3,0.75);
  return fbm(0.1*float(zone)*float(zone) - 10.5*min(0.0,float(zone)-1.0),
             wld,0.2,float(zone)*float(zone)*0.05+0.3);
}

// float edgeify(float edge,float x,float amt){
//   if(edge < amt){
//     return x*edge/amt +(1.0-edge/amt);
//   }else return x;
// }

vec2 eldir(vec2 wld,int zone){
  // find derivatives
  vec2 x = vec2(elnoise(wld,zone) - elnoise(wld+0.001,zone),
                elnoise(-wld,zone) - elnoise(-wld-0.001,zone));
  return x;
}

float dir_shade(vec2 dir,int zone){
  // calculate dot product to find shading vs. generic light source
  float el = dot(vec2(1.0,0.0),dir) / length(dir);
  float atten = 0.02*(9.0-float(zone)*float(zone)) + 0.70;
  return mix(el,1.0,atten);
}

vec3 climateColor(vec3 color,vec3 color2,/*float edge,*/vec2 wld,int zone){
  vec3 col;
  float p = step(0.45,fbm(6.0,wld,0.6,0.45) + 0.2*pnoise(0.4*wld,0.4*map_dims));
  float p2 = 0.88 + 0.12*step(0.15,fbm(6.0,-wld,0.6,0.45) +
                              0.2*pnoise(-0.4*wld,0.4*map_dims));

  col.rgb = mix(color,elevation,0.1*float(zone)*float(zone));//*patchy(wld);
  col.rgb = mix(col.rgb,color2,p)*p2;

  return col;
}


// TODO: fix this noisy distance, so that it doesn't mix
// spots of terrain, but is a single noisy line
// ALSO: there is a bug where we get black along the x edge now...
float noisy_dist(vec2 a,vec2 b){
  vec2 diff = b-a;
  return length(diff) + fbm(2.5,(normalize(diff) + a),3.0*0.13,0.7) + 3.0*0.13;
}

struct HexPos{
  vec2 hex;
  vec2 axl;
  vec2 wld;
  vec2 c;
};

HexPos wld2pos(vec2 wld_for_hex,vec2 true_wld){
  HexPos pos;
  pos.axl = wld2axl(wld_for_hex);
  pos.hex = axl2hex(pos.axl);

  // wrap the x dimension
  pos.hex.x -= map_dims.x * floor(pos.hex.x/map_dims.x);
  if(pos.hex.x < 0.0) pos.hex.x += map_dims.x;

  // bound the y dimension
  pos.hex.y = clamp(pos.hex.y,0.0,map_dims.y-1.0);

  // recalculate the axial coordinates after wrapping
  pos.axl = hex2axl(pos.hex);

  // find the center, and the true wold coordinate it around, if necssary
  pos.c = axl2wld(pos.axl);
  pos.wld = true_wld;
  if(pos.wld.x - pos.c.x > 2.0) pos.wld.x -= map_dims.x;
  else if(pos.wld.x - pos.c.x < -2.0) pos.wld.x += map_dims.x;

  return pos;
}

vec2 proj(vec2 p,vec2 x){
  p = normalize(p);
  return p*dot(x,p);
}

// bitwise arethmatic with floating point numbers
// 'cause glsl 1.00 can't do bitwise operators
bool bit_on(float x,float bit){
  float bit_mask = pow(2.0,bit);
  float upper_bit_mask = pow(2.0,bit+1.0);

  return mod(x,upper_bit_mask)/bit_mask >= 1.0;
}

vec2 river_dir(float n){
  float angle = n*(pi/3.0) + 3.0*pi/2.0 + pi/6.0;
  return vec2(cos(angle),sin(angle));
}

vec2 river_dist(HexPos pos,float n){
  vec2 dir = pos.wld - pos.c;
  vec2 cdir = river_dir(n);
  float proj_len = dot(dir,cdir);

  if(proj_len > 0.0){
    vec2 dir_proj = cdir*proj_len;

    float base_noise = fbm(3.0,pos.c+dir_proj,0.25,0.6);
    float join_dist = min(proj_len,1.0-proj_len)/0.5;
    float noise = base_noise*smoothstep(join_dist,0.0,0.07);
    if(cdir.x < 0.0) noise = -noise;


    vec2 dir_noise = dir + noise*vec2(cdir.y,cdir.x);
    float d = dot(dir_noise,cdir);
    return dir_noise - cdir*d;
  }else{
    return dir;
  }
}

vec3 color_hex(vec2 wld,float shade,HexPos pos){
  vec4 tex  = texture2D(uSampler,hex2dat(pos.hex,filterArea));
  int climate = int(mod(255.0*tex.x,8.0))-1;
  int zone = int(255.0*tex.x / 8.0)-1;
  float depth = tex.y;
  int rivers = int(255.0*tex.z);
  
  vec3 color;
  if(zone == 0)
    color = zoneColor(zone0,2.0*depth)*shade;
  else{ // if(vegetation == 0){
    if(climate == 0)
      color =
        climateColor(climate0,climate1,pos.wld,zone)*shade;
    else if(climate == 1)
      color =
        climateColor(climate1,climate2,pos.wld,zone)*shade;
    else if(climate == 2)
      color =
        climateColor(climate2,climate1,pos.wld,zone)*shade;
    else if(climate == 3)
      color =
        climateColor(climate3,climate1,pos.wld,zone)*shade;
    else if(climate == 4)
      color =
        climateColor(climate4,climate5,pos.wld,zone)*shade;
    else if(climate == 5)
      color =
        climateColor(climate5,climate4,pos.wld,zone)*shade;
    else if(climate == 6)
      color =
        climateColor(climate6,climate5,pos.wld,zone)*shade;
  }

  // terrain shading
  vec2 shade_dir = eldir(/*edge,*/wld,zone);

  // Shading TODO:
  // 1. have a slow transition in shading near river join
  //    by using distance of proj_len from 0.0.
  // 2. use the dot product approach to make shading "3D"
  // like the shainding on the rest of the map

  if(rivers > 0){
    if(length(pos.wld - pos.c) < river_width){
      color = zoneColor(zone0,river_depth);
      return color;
    }

    float min_n=0.0;
    float min_lperp=2.0*river_shade;
    for(float n=0.0;n<6.0;n++){
      if(bit_on(float(rivers),n)){
        vec2 perp = river_dist(pos,n);
        float lperp = length(perp);
        if(lperp < river_width){
          color = zoneColor(zone0,river_depth);
          color *= dir_shade(eldir(wld,0),0); // use water shading
          return color;
        }if(lperp < river_shade){
          if(lperp < min_lperp){
            min_n = n;
            min_lperp = lperp;
          }
        }
      }
    }
    if(min_lperp < river_shade){
      float n = min_n;
      float lperp = min_lperp;
      vec2 g;
      HexPos pos_p = pos;
      pos_p.wld += vec2(0.01,0.0);
      g.x = lperp - length(river_dist(pos_p,n));
      pos_p.wld += vec2(-0.01,0.01);
      g.y = lperp - length(river_dist(pos_p,n));
      g = normalize(g);
      float fade = (lperp - river_width)/(river_shade - river_width);
      shade_dir = mix(g,normalize(shade_dir),fade);
      // color = vec3(g.x+0.5,g.y+0.5,0.0);
      // return;
    }
  }

  color *= dir_shade(shade_dir,zone);
  return color;
}

const float edge_size = 0.1;

void main(void){
  vec3 wld_shade = img2wld_shade(tex2img(vTextureCoord.xy,filterArea));
  vec2 wld = wld_shade.xy;
  HexPos pos = wld2pos(wld,wld);

  if(wld.y < 0.0 || wld.y > map_dims.y * 0.5/s)
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
  else{
    
    // vec4 n23 = closest_neighbors(axl,wld);
    // vec2 np1 = axl2wld(axl);
    // vec2 np2 = axl2wld(n23.xy);
    // vec2 np3 = axl2wld(n23.zw);

    // float dist1 = noisy_dist(wld,np1);
    // float dist2 = noisy_dist(wld,np2);
    // float dist3 = noisy_dist(wld,np3);
    // // float edge;
    // vec2 hex;
    // if(dist1 < dist2 && dist1 < dist3){
    //   // if(dist2 < dist3) edge = dist2 - dist1;
    //   // else edge = dist3 - dist1;
    //   hex = axl2hex(axl);
    // }
    // else if(dist2 < dist3){
    //   // if(dist3 < dist1) edge = dist3 - dist2;
    //   // else edge = dist1 - dist2;
    //   hex = axl2hex(n23.xy);
    // }
    // else{
    //   // if(dist2 < dist1) edge = dist2 - dist3;
    //   // else edge = dist1 - dist3;
    //   hex = axl2hex(n23.zw);
    // }

    // hex.x = mod(hex.x,map_dims.x);
    // if(hex.x < 0.0) hex.x += map_dims.x;

    // TODO: it's possible with just one additional texture lookup,
    // that we can do neighbor blending...??

    // position relative to center
    vec2 dir = pos.wld - pos.c;

    // get point along edge
    // TODO: we can find the edge point by
    // 1. find the cannonical direction (as below)
    // 2. find the two points along the spokes, by adjust the angle by π/12
    // and using the radius (should be based on side constant)
    // 3. project the current point onto the edge defined by these two points.

    float angle = mod(atan(dir.y,dir.x) - 3.0*pi/2.0,2.0*pi);
    float n = floor(angle/(pi/3.0));
    float a_angle = n*(pi/3.0) + 3.0*pi/2.0;
    float b_angle = a_angle + pi/3.0;
    vec2 a = vec2(s*cos(a_angle),s*sin(a_angle));
    vec2 b = vec2(s*cos(b_angle),s*sin(b_angle));
    vec2 edgep = dir-(a+proj(b-a,dir-a));

    // move to closest neighbor if edge dist + noise too distant

    float enoise = fbm(3.0,pos.c+dir-edgep,0.3,0.5);
    float taper = min(length(dir-edgep - a),length(dir-edgep - b))/s;

    // if(length(edgep) < 0.2){
    //   gl_FragColor.rgb = vec3(enoise,enoise,enoise);
    //   return;
    // }

    // TODO: not yet, quite the kidn of noise I want
    // needs to be one-dimensional

    enoise = enoise*smoothstep(taper,0.0,0.1);
    float edgel = length(edgep);
    edgep = normalize(edgep);
    
    vec2 offset = edgep*enoise;
    // reflect the offset to ensure deflections on the hex
    // sharing a side match
    if(offset.x < 0.0) offset *= -1.0;

    // (possible) move to a new hex
    HexPos new_pos = wld2pos(pos.c + dir + offset,wld);

    gl_FragColor.rgb = color_hex(wld,wld_shade.z,new_pos);

    
    // if(edgel > edge_size){
    //   if(new_pos.c != pos.c) edgep = -edgep;
    //   HexPos edge = wld2pos(pos.c + edgep,wld);
    //   vec3 fade_with = color_hex(wld,wld_shade.z,edge);
    //   gl_FragColor.rgb = mix(gl_FragColor.rgb,fade_with,0.5);
    // }

    // TODO: instead of setting the color below
    // note the color in this region, and note
    // the slope in this region.
    // at a later point this slope
    // will be modified (by the river)
    // and then shaded at the end

  }
}
