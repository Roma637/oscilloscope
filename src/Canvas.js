import React from 'react';

function Canvas({draw, height, width, mscbFunc }) {

    const canvas = React.useRef()

    React.useEffect(() => {
        const context = canvas.current.getContext('2d'); //so that we do 2d and not 3d drawings
        // const context = canvas.getContext('2d')
        draw(context,canvas)
    })

    return(
        <canvas 
        id="myCanvas"
        height={height}
        width={width}
        ref={canvas}
        onMouseDown={(e1) => {mscbFunc("DOWN", e1.clientX ,e1.clientY, e1)}}
        onMouseUp={(e1) => {mscbFunc("UP", e1.clientX ,e1.clientY, e1)}}
        onMouseMove={(e1) => {mscbFunc("MOVE", e1.clientX ,e1.clientY, e1)}}>

        </canvas>
    )
}

export default Canvas