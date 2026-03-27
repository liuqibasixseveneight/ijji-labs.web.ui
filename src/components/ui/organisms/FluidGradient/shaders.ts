export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec4 iMouse;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uBrushSize;
  uniform float uBrushStrength;
  uniform float uFluidDecay;
  uniform float uTrailLength;
  uniform float uStopDecay;
  varying vec2 vUv;

  vec2 ur, U;

  float ln(vec2 p, vec2 a, vec2 b) {
    return length(p-a-(b-a)*clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.));
  }

  vec4 t(vec2 v, int a, int b) {
    return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur));
  }

  vec4 t(vec2 v) {
    return texture2D(iPreviousFrame, fract(v/ur));
  }

  float area(vec2 a, vec2 b, vec2 c) {
    float A = length(b-c), B = length(c-a), C = length(a-b), s = 0.5*(A+B+C);
    return sqrt(s*(s-A)*(s-B)*(s-C));
  }

  void main() {
    U = vUv * iResolution;
    ur = iResolution.xy;

    if (iFrame < 1) {
      float w = 0.5 * sin(0.2*U.x)*0.5;
      float q = length(U-0.5*ur);
      gl_FragColor = vec4(0.1*exp(-0.001*q*q),0,0,w);
    } else {
      vec2 v = U,
           A = v + vec2( 1, 1),
           B = v + vec2( 1,-1),
           C = v + vec2(-1, 1),
           D = v + vec2(-1,-1);

      for (int i = 0; i < 9; i++) {
        v -= t(v).xy;
        A -= t(A).xy;
        B -= t(B).xy;
        C -= t(C).xy;
        D -= t(D).xy;
      }

      vec4 me = t(v);
      vec4 n = t(v, 0, 1),
           e = t(v, 1, 0),
           s = t(v, 0, -1),
           w = t(v, -1, 0);
      
      vec4 ne = t(v, 1, 1),
           nw = t(v, -1, 1),
           se = t(v, 1, -1),
           sw = t(v, -1, -1);
      
      vec4 avg = .125*(n+e+s+w+ne+nw+se+sw);
      me = mix(t(v), avg, vec4(0.16,0.16,0.94,0.));
      
      me.z = me.z - 0.011*((area(A,B,C)+area(B,C,D))-4.);

      vec4 pr = vec4(e.z,w.z,n.z,s.z);
      me.xy = me.xy + 110.*vec2(pr.x-pr.y, pr.z-pr.w)/ur;
      
      float vort = (ne.z + sw.z - nw.z - se.z) * 0.25;
      me.xy += vec2(-vort, vort) * 12.0;

      float spatialVar = length(v) * 0.008;
      me.xy *= uFluidDecay * (0.82 + 0.18*sin(iTime*0.6 + spatialVar));
      me.z *= uTrailLength * (0.89 + 0.11*cos(iTime*0.35 + spatialVar));

      if (iMouse.z > 0.0) {
        vec2 mousePos = iMouse.xy;
        vec2 mousePrev = iMouse.zw;
        vec2 mouseVel = mousePos - mousePrev;
        float velMagnitude = length(mouseVel);
        float q = ln(U, mousePos, mousePrev);
        vec2 m = mousePos - mousePrev;
        float l = length(m);
        if (l > 0.0) {
          m = (m / l) * min(l, 55.0);
        } else {
          m = vec2(0.0);
        }

        float brushSizeFactor = 1e-4 / uBrushSize;
        float strengthFactor = 0.028 * uBrushStrength;

        float falloff = exp(-brushSizeFactor * q * q);
        falloff = pow(falloff, 0.38);

        me.xyw += strengthFactor * falloff * vec3(m, 9.0);

        if (velMagnitude < 10.0) {
          float distToCursor = length(U - mousePos);
          float influence = exp(-distToCursor * 0.0025);
          float cursorDecay = mix(1.0, uStopDecay, influence);
          me.xy *= cursorDecay;
          me.z *= cursorDecay;
        }
      }

      gl_FragColor = clamp(me, -0.45, 0.45);
    }
  }
`;

export const displayShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform float uDistortionAmount;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform vec3 uColor7;
  uniform vec3 uColor8;
  uniform float uColorIntensity;
  uniform float uSoftness;
  varying vec2 vUv;

  float random(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution;
    vec4 fluid = texture2D(iFluid, vUv);
    float fluidDensity = fluid.z;

    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;

    float globalPhase = iTime * 0.4;
    float noise = sin(uv.x*8.0 + globalPhase) * cos(uv.y*8.0 - globalPhase*0.8);
    
    float mixer1 = clamp(cos(uv.x * d) * 0.5 + 0.5 + 0.08*noise, 0.0, 1.0);
    float mixer2 = clamp(cos(uv.y * a) * 0.5 + 0.5 + 0.06*noise, 0.0, 1.0);
    float mixer3 = clamp(sin(d + a) * 0.5 + 0.5 + 0.04*noise, 0.0, 1.0);

    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);

    float rippleWave = fluidDensity * uDistortionAmount;
    mixer1 = clamp(mixer1 + rippleWave * 0.42, 0.0, 1.0);
    mixer2 = clamp(mixer2 + rippleWave * 0.35, 0.0, 1.0);
    mixer3 = clamp(mixer3 + rippleWave * 0.28, 0.0, 1.0);

    vec3 col = uColor1;
    col = mix(col, uColor2, pow(mixer1, 1.4));
    col = mix(col, uColor3, pow(mixer2, 1.8));
    col = mix(col, uColor4, pow(mixer3, 1.15));
    
    float breath = sin(globalPhase) * 0.5 + 0.5;
    col = mix(col, uColor5, mixer1*0.5 + mixer2*0.5 + 0.06*breath);
    col = mix(col, uColor6, mixer2*0.6 + mixer3*0.4 + 0.05*sin(globalPhase*1.2));
    col = mix(col, uColor7, mixer1*0.7 + mixer3*0.3 + 0.04*cos(globalPhase*1.5));
    col = mix(col, uColor8, mixer1*0.3 + mixer2*0.7 + 0.04*breath);

    col *= uColorIntensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;
