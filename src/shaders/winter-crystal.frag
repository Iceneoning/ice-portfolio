precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;

const float PI = 3.14159265359;
mat2 turn(float angle) { float c=cos(angle), s=sin(angle); return mat2(c,-s,s,c); }

// A pointed, faceted branch. Its shoulder is widest at 20% of its length.
float blade(vec2 p, vec2 a, vec2 b, float width) {
  vec2 axis=b-a;
  float t=dot(p-a,axis)/dot(axis,axis);
  float clamped=clamp(t,0.0,1.0);
  float taper=min(clamped/0.2,(1.0-clamped)/0.8);
  return length(p-a-axis*clamped)-width*max(taper,0.0);
}
float crystal(vec2 p) {
  // Fold into one of six arms, then mirror its left/right dendrites.
  float angle=atan(p.x,p.y);
  float sector=floor((angle+PI/6.0)/(PI/3.0));
  vec2 q=turn(-sector*PI/3.0)*p;
  q.x=abs(q.x);
  float d=10.0;
  // __BRANCH_FIELD__
  vec2 h=abs(p);
  float core=max(dot(h,vec2(0.8660254,0.5)),h.y)-0.068;
  return min(d,core);
}
float relief(vec2 p) {
  float d=crystal(p);
  float bevel=0.035*clamp(-d/0.025,0.0,1.0);
  vec2 h=abs(p);
  float hexRadius=max(dot(h,vec2(0.8660254,0.5)),h.y);
  float core=0.052*max(0.0,1.0-hexRadius/0.075);
  return bevel+core;
}
void main() {
  vec2 p=(gl_FragCoord.xy*2.0-u_resolution)/min(u_resolution.x,u_resolution.y);
  p=turn(-0.2094395)*p;
  p/=0.95;
  // Extremely small optical drift; the silhouette never spins.
  p.y+=0.004*sin(u_time*0.32);
  float d=crystal(p);
  float aa=2.0/min(u_resolution.x,u_resolution.y);
  float cover=1.0-smoothstep(-aa,aa,d);
  if(cover<0.001) { gl_FragColor=vec4(0.0); return; }

  // Sample over a small bevel footprint to keep pointed facets calm at hero size.
  float e=0.006;
  vec2 slope=vec2(relief(p+vec2(e,0.0))-relief(p-vec2(e,0.0)),
                  relief(p+vec2(0.0,e))-relief(p-vec2(0.0,e)))/(2.0*e);
  vec3 normal=normalize(vec3(-slope*0.75,0.8));
  vec3 light=normalize(vec3(-0.6+u_pointer.x*0.18+0.045*sin(u_time*0.27),0.75+u_pointer.y*0.13,1.25));
  float diffuse=max(dot(normal,light),0.0);
  float specular=pow(clamp(dot(normal,normalize(light+vec3(0.0,0.0,1.0))),0.0001,1.0),38.0);
  // Clamp before fractional powers: normalize can round z slightly above 1.
  float fresnel=pow(clamp(1.0-normal.z,0.0001,1.0),2.4);

  // Analytic daylight environment: warm sky and cool refracted ice faces.
  vec3 ice=mix(vec3(0.40,0.62,0.76),vec3(0.87,0.96,0.96),smoothstep(0.12,0.95,diffuse));
  vec3 sky=mix(vec3(0.69,0.85,0.94),vec3(1.0,0.98,0.87),clamp(normal.y*0.5+0.5,0.0,1.0));
  ice=mix(ice,sky,0.18+fresnel*0.18);
  ice+=vec3(0.96,0.98,1.0)*specular*0.31;
  float rim=1.0-smoothstep(0.001,0.007,abs(d));
  ice=mix(ice,vec3(0.97,0.995,0.97),rim*0.57);
  // Narrow iridescent tint; no bloom, particles or sweeping spotlight.
  ice+=fresnel*0.035*vec3(sin(p.y*9.0+0.7),sin(p.x*8.0+2.0),1.0);
  gl_FragColor=vec4(clamp(ice,0.0,1.0),cover*0.96);
}
