
const vs = `
precision mediump float;

layout (location = 0) in vec4 position;
layout (location = 5) in vec4 color;

out vec4 v_color;

uniform mat4 uMMatrix;

void czm_log_depth_main()
{
	gl_Position = czm_viewProjection * uMMatrix * position;
	v_color = color;
	gl_PointSize = 5.0;
}

void main()
{
    czm_log_depth_main();
    czm_vertexLogDepth();
}
`

const fs = `
precision mediump float;
in vec4 v_color;

void czm_log_depth_main()
{
	out_FragColor = v_color;
}

void main()
{
    czm_log_depth_main();
    czm_writeLogDepth();
}
`

const gridVs = `
precision mediump float;

layout (location = 0) in vec3 position;
layout (location = 5) in vec4 color;

out vec4 v_color;

uniform mat4 uMMatrix;

void czm_log_depth_main()
{
	gl_Position = czm_viewProjection * uMMatrix * vec4(position, 1.0);
	v_color = color;
	gl_PointSize = 5.0;
}

void main()
{
    czm_log_depth_main();
    czm_vertexLogDepth();
}
`

export {
    vs,
    fs,
    gridVs
}
