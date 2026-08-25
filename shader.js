const canvas = document.getElementById("shaderCanvas");

const gl = canvas.getContext("webgl");

if (!gl) {

    console.warn("WebGL is not supported.");

    canvas.style.display = "none";
    document.body.style.background ="linear-gradient(135deg, #FF2B00, #6600FF, #FF00D0)";

} else {

    const vertexShaderSource = `
        attribute vec2 position;

        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;


    const fragmentShaderSource = `
        precision mediump float;

        uniform float time;

        uniform sampler2D texture1;
        uniform sampler2D texture2;


        void main() {

            vec2 uv =gl_FragCoord.xy / vec2(1000,1000);


            vec2 movement =vec2(-0.05, -0.05) * time;
            vec2 grid =(uv + movement) * 4.0;
            vec2 cell =floor(grid);
            vec2 cellUV = fract(grid);


            float checker = mod(cell.x + cell.y, 2.0);


            float state =
                mod(
                    floor(time / 1.),
                    2.0
                );

            float useTexture1 =abs(checker - state);


            vec4 color1 =texture2D(texture1, cellUV);
            vec4 color2 =texture2D(texture2, cellUV);

            gl_FragColor = mix(color2,color1,useTexture1);
        }
    `;



    function createShader(type, source) {

        const shader =gl.createShader(type);

        gl.shaderSource(shader,source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }


    const vertexShader =createShader(gl.VERTEX_SHADER,vertexShaderSource);
    const fragmentShader =createShader(gl.FRAGMENT_SHADER,fragmentShaderSource);
    const program = gl.createProgram();

    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);


    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }


    gl.useProgram(program);

    const vertices = new Float32Array([

        -1, -1,
        1, -1,
        -1, 1,

        -1, 1,
        1, -1,
        1, 1

    ]);


    const buffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program,"position");

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );



    const timeLocation = gl.getUniformLocation( program, "time");
    const texture1Location = gl.getUniformLocation(program, "texture1");
    const texture2Location = gl.getUniformLocation(program, "texture2");



    function loadTexture(url) {
        const texture = gl.createTexture();

        gl.bindTexture( gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([
                255,
                255,
                255,
                255
            ])
        );


        const image =new Image();

        image.onload = function () {

            gl.bindTexture(gl.TEXTURE_2D,texture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image
            );


            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.REPEAT
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.REPEAT
            );


            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                gl.LINEAR
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MAG_FILTER,
                gl.LINEAR
            );

        };


        image.src = url;

        return texture;
    }


    const texture1 =loadTexture("texture1.png");
    const texture2 =loadTexture("texture2.png");



    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture1);
    gl.uniform1i(texture1Location,0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,texture2);
    gl.uniform1i(texture2Location,1);


    function resize() {

        const pixelRatio =
            Math.min(
                window.devicePixelRatio,
                2
            );

        canvas.width =window.innerWidth *pixelRatio;
        canvas.height =window.innerHeight *pixelRatio;
        canvas.style.width =window.innerWidth + "px";
        canvas.style.height =window.innerHeight + "px";


        gl.viewport(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    window.addEventListener("resize",resize);


    resize();


    const startTime =performance.now();


    function render() {

        const elapsed = (performance.now() - startTime) / 1000;

        gl.useProgram(program);
        gl.uniform1f(timeLocation,elapsed);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,texture1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,texture2);
        gl.drawArrays(gl.TRIANGLES,0,6);

        requestAnimationFrame(render);
    }


    render();
}
