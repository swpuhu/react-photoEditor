void main() {
    mat3 mvp = u_projMat * u_viewMat * u_worldMat;
    gl_Position = vec4((mvp * vec3(a_position, 1.0)).xy, 0.0, 1.0);

    v_uv = a_uv;
}