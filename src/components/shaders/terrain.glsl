precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform float view_scale;
uniform vec2 view_dims;
uniform vec2 view_position;
uniform vec2 map_dims;

uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

ivec2 tohex(vec2 coord){
  ivec2 result;
  result.y = int(0.5 + coord.y / sqrt(3.0/4.0));
  result.x = int(0.5 + coord.x - 0.5*abs(mod(float(result.y),2.0)));
  return result;
}

// ivec2 fromhex(ivec2 coord){
//   fvec2 result;
//   result.x = coord.x + 0.5*abs(mod(coord.y,2));
//   result.y = coord.y * sqrt(3.0/4.0)
// }

// ivec2 hex_neighbors(in fvec2 coord,out ivec2 a,out ivec2 b,out ivec3 c){
//   ivec2 hexp = tohex(coord);
//   if(coord.y < hexp.y){
//     fvec2 center = fromhex(hexp);

//     fvec2 leftpoint = hexp;
//     fvec2 rightpoint = hexp;

//     coord = coord - center;
//     if(mod(hexp.y,2) > 0){
//       leftpoint.y -= 1;
//       coord_left = fromhex(leftpoint);

//       rightpoint.y -= 1;
//       rightpoint.x += 1;
//       coord_right = fromhex(rightpoint);
//     }else{
//       leftpoint.y -= 1;
//       leftpoint.x -= 1;
//       coord_left = fromhex(leftpoint);

//       rightpoint.y -= 1;
//       coord_right = fromhex(rightpoint);
//     }

//     fvec2 perp = dot(coord,normalize(coord_left)) - coord;
//     if(perp.y < 0){
//       a = hexp;
//       b = leftpoint;
//       c = hexp;
//       c.x -= 1;

//       return;
//     }

//     fvec2 perp = dot(coord,normalize(coord_right)) - coord;
//     if(perp.y < 0){
//       a = hexp;
//       b = rightpoint;
//       c = hexp;
//       c.x += 1;

//       return
//     }

//     a = hexp;
//     b = rightpoint;
//     c = leftpoint;
//   }
//   if(coord.y < hexp.y){
//     fvec2 center = fromhex(hexp);

//     fvec2 leftpoint = hexp;
//     fvec2 rightpoint = hexp;

//     coord = coord - center;
//     if(mod(hexp.y,2) > 0){
//       leftpoint.y += 1;
//       coord_left = fromhex(leftpoint);

//       rightpoint.y += 1;
//       rightpoint.x += 1;
//       coord_right = fromhex(rightpoint);
//     }else{
//       leftpoint.y += 1;
//       leftpoint.x -= 1;
//       coord_left = fromhex(leftpoint);

//       rightpoint.y += 1;
//       coord_right = fromhex(rightpoint);
//     }

//     fvec2 perp = dot(coord,normalize(coord_left)) - coord;
//     if(perp.y > 0){
//       a = hexp;
//       b = leftpoint;
//       c = hexp;
//       c.x -= 1;

//       return;
//     }

//     fvec2 perp = dot(coord,normalize(coord_right)) - coord;
//     if(perp.y > 0){
//       a = hexp;
//       b = rightpoint;
//       c = hexp;
//       c.x += 1;

//       return
//     }

//     a = hexp;
//     b = rightpoint;
//     c = leftpoint;
//   }
// }

void main(void){
  vec2 uvs = vTextureCoord.xy;

  vec2 map_pos = floor((mapCoord(uvs) - view_dims/2.0)/view_scale - view_position + map_dims/2.0);
  map_pos = map_pos + vec2(0.5,0.5);

  vec4 terrain = texture2D(uSampler,unmapCoord(map_pos));
  gl_FragColor = vec4(terrain.r,terrain.r,terrain.r,1.0);

  // ivec2 a;
  // ivec2 b;
  // ivec2 c;
  // hex_neighbors(map_coord,a,b,c);

  // float dist_a = length(map_coord,fromhex(a));
  // float dist_b = length(map_coord,fromhex(b));
  // float dist_c = length(map_coord,fromhex(c));

  // if(dist_a > dist_b && dist_a > dist_c){
  //   vec4 terrain = texelFetch(uSampler,a);
  //   gl_FragColor = vec4(terrain.r,terrain.r,terrain.r,1.0);
  // }else if(dist_b > dist_c){
  //   vec4 terrain = texelFetch(uSampler,b);
  //   gl_FragColor = vec4(terrain.r,terrain.r,terrain.r,1.0);
  // }else{
  //   vec4 terrain = texelFetch(uSampler,c);
  //   gl_FragColor = vec4(terrain.r,terrain.r,terrain.r,1.0);
  // }
}
