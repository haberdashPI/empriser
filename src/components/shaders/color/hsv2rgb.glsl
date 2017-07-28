// pulled from https://github.com/hughsk/glsl-hsv2rgb

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// float c = hsv[1] * hsv[2];
//   float x = c * (1.0-abs(mod(hsv[0]*6.0,2.0) - 1.0));
//   float m = hsv[2] - c;

//   vec3 color;
//   if(hsv[0] <= 1.0/6.0) color = vec3(c,x,0.0)+m;
//   else if(hsv[1] <= 2.0/6.0) color = vec3(x,c,0.0)+m;
//   else if(hsv[1] <= 3.0/6.0) color = vec3(0.0,c,x)+m;
//   else if(hsv[1] <= 4.0/6.0) color = vec3(0.0,x,c)+m;
//   else if(hsv[1] <= 5.0/6.0) color = vec3(x,0.0,c)+m;
//   else if(hsv[1] <= 6.0/6.0) color = vec3(c,0.0,x)+m;

//   return color;
