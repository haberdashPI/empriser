
vec2 img2tex(vec2 coord,vec4 filterArea){
  coord -= filterArea.zw;
  coord /= filterArea.xy;
  return coord;
}

vec2 hex2dat(vec2 hex,vec4 filterArea){
  return img2tex(hex + 0.5,filterArea);
}

// # pragma glslify: export(hex2dat)
