vec2 tex2img(vec2 coord,vec4 filterArea){
  coord *= filterArea.xy;
  coord += filterArea.zw;

  return coord;
}
// # pragma glslify: export(tex2img);
