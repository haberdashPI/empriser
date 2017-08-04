
vec3 zone0 = vec3(56.0/255.0,108.0/255.0,176.0/255.0);
vec3 zone1 = vec3(127.0/255.0,201.0/255.0,127.0/255.0);
vec3 zone2 = vec3(253.0/255.0,192.0/255.0,134.0/255.0);
vec3 zone3 = vec3(190.0/255.0,174.0/255.0,212.0/255.0);

vec3 zoneColor(vec3 zone,float depth){
  return clamp(zone*(1.0 + depth*0.5),0.0,1.0);
}
