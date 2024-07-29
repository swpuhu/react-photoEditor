uniform sampler2D uTexture;

void main() {
    gl_FragColor = texture2D(uTexture, v_uv).rgba;
}