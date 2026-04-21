export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidShader = `
  precision highp float;
  precision highp int;

  uniform float iTime;
  uniform vec2 iResolution;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uFluidDecay;
  uniform float uTrailLength;
  varying vec2 vUv;

  vec2 ur;

  vec4 tx(vec2 v) {
    return texture2D(iPreviousFrame, fract(v / ur));
  }

  vec4 txO(vec2 v, int a, int b) {
    return texture2D(iPreviousFrame, fract((v + vec2(float(a), float(b))) / ur));
  }

  void main() {
    vec2 U = vUv * iResolution;
    ur = iResolution.xy;

    if (iFrame < 1) {
      float q = length(U - 0.5 * ur);
      gl_FragColor = vec4(0.1 * exp(-0.001 * q * q), 0.0, 0.0, 0.0);
      return;
    }

    vec2 v = U,
         A = v + vec2( 1,  1),
         B = v + vec2( 1, -1),
         C = v + vec2(-1,  1),
         D = v + vec2(-1, -1);

    for (int i = 0; i < 3; i++) {
      v -= tx(v).xy;
      A -= tx(A).xy;
      B -= tx(B).xy;
      C -= tx(C).xy;
      D -= tx(D).xy;
    }

    vec4 me = tx(v);
    vec4 n  = txO(v,  0,  1),
         e  = txO(v,  1,  0),
         s  = txO(v,  0, -1),
         w  = txO(v, -1,  0);
    vec4 ne = txO(v,  1,  1),
         nw = txO(v, -1,  1),
         se = txO(v,  1, -1),
         sw = txO(v, -1, -1);

    vec4 avg = 0.125 * (n + e + s + w + ne + nw + se + sw);
    me = mix(tx(v), avg, vec4(0.16, 0.16, 0.94, 0.0));

    vec2 ab = B.xy - A.xy, ac = C.xy - A.xy;
    vec2 ba = A.xy - B.xy, bc = C.xy - B.xy;
    float triArea = abs(ab.x * ac.y - ab.y * ac.x)
                  + abs(ba.x * bc.y - ba.y * bc.x);

    // Clamp triArea so the correction term cannot sustain positive feedback.
    // Without this, highly deformed velocity fields drive triArea << 4.0
    // permanently, causing me.z to accumulate toward +0.45 across the whole
    // texture and saturate the simulation over long sessions.
    float triCorrection = clamp(triArea - 4.0, -2.0, 2.0);
    me.z = me.z - 0.011 * triCorrection;

    vec4 pr = vec4(e.z, w.z, n.z, s.z);
    me.xy = me.xy + 110.0 * vec2(pr.x - pr.y, pr.z - pr.w) / ur;

    float vort = (ne.z + sw.z - nw.z - se.z) * 0.25;
    me.xy += vec2(-vort, vort) * 12.0;

    float velLen = length(me.xy);
    if (velLen > 0.4) {
      me.xy = (me.xy / velLen) * 0.4;
    }

    float t = iTime;
    float spatialVar = (vUv.x + vUv.y) * 3.14159;
    me.xy *= uFluidDecay  * (0.82 + 0.18 * sin(t * 0.6  + spatialVar));
    me.z  *= uTrailLength * (0.89 + 0.11 * cos(t * 0.35 + spatialVar));

    gl_FragColor = clamp(me, -0.45, 0.45);
  }
`;

export const displayShader = `
  precision highp float;

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

  void main() {
    vec4 fluid = texture2D(iFluid, vUv);
    float fluidDensity = fluid.z;

    float mr = min(iResolution.x, iResolution.y);
    vec2 fragCoord = vUv * iResolution;
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    float t = iTime;

    float d = -t * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 5.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += t * 0.5;

    float globalPhase = t * 0.4;

    float noise = fract(sin(dot(uv, vec2(127.1, 311.7))) * 43758.5453) * 2.0 - 1.0;

    float mixer1 = clamp(cos(uv.x * d) * 0.5 + 0.5 + 0.08 * noise, 0.0, 1.0);
    float mixer2 = clamp(cos(uv.y * a) * 0.5 + 0.5 + 0.06 * noise, 0.0, 1.0);
    float mixer3 = clamp(sin(d + a)    * 0.5 + 0.5 + 0.04 * noise, 0.0, 1.0);

    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);

    float rippleWave = fluidDensity * uDistortionAmount;
    mixer1 = clamp(mixer1 + rippleWave * 0.42, 0.0, 1.0);
    mixer2 = clamp(mixer2 + rippleWave * 0.35, 0.0, 1.0);
    mixer3 = clamp(mixer3 + rippleWave * 0.28, 0.0, 1.0);

    vec3 col = uColor1;
    col = mix(col, uColor2, mixer1 * sqrt(mixer1));
    col = mix(col, uColor3, mixer2 * mixer2);
    col = mix(col, uColor4, mixer3 * sqrt(mixer3));

    float breath     = sin(globalPhase) * 0.5 + 0.5;
    float sinPhase12 = sin(globalPhase * 1.2);
    float cosPhase15 = cos(globalPhase * 1.5);

    col = mix(col, uColor5, clamp(mixer1 * 0.5 + mixer2 * 0.5 + 0.06 * breath,     0.0, 1.0));
    col = mix(col, uColor6, clamp(mixer2 * 0.6 + mixer3 * 0.4 + 0.05 * sinPhase12, 0.0, 1.0));
    col = mix(col, uColor7, clamp(mixer1 * 0.7 + mixer3 * 0.3 + 0.04 * cosPhase15, 0.0, 1.0));
    col = mix(col, uColor8, clamp(mixer1 * 0.3 + mixer2 * 0.7 + 0.04 * breath,     0.0, 1.0));

    col *= uColorIntensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;
