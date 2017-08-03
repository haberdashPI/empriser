void color_hex(){
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
    gl_FragColor.rgb = hex_color(texture2D(uSampler,hex2dat(hex,filterArea)));

    float width = min(4.0/view_scale,0.1);
    if(view_scale > 10.0){
      float edge = min(1.0,min(width,min(dist2 - dist1,dist3 - dist1))/width);
      gl_FragColor.rgb = mix(gl_FragColor.rgb,vec3(1.0,1.0,1.0),1.0-edge);
    }
  }
}
