const float zone_h_0 = 235.0/360.0;
const float zone_h_1 = 97.0/360.0;
const float zone_h_2 = 61.0/360.0;
const float zone_h_3 = 0.0/360.0;

const float zone_s_0 = 0.67;
const float zone_s_1 = 0.50;
const float zone_s_2 = 0.41;
const float zone_s_3 = 0.00;

vec3 zoneColor(float zone_h,float zone_s,float depth){
  return hsv2rgb(vec3(zone_h,zone_s,depth*0.6 + 0.8));;
}
