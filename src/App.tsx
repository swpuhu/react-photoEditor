import './App.css';
import { useEffect, useRef } from 'react';
import { Renderer } from './renderer/Renderer';
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        let renderer: Renderer;
        if (canvas) {
            const gl = canvas.getContext('webgl');
            if (gl) {
                renderer = new Renderer(gl);
                console.log(renderer);
            }
        }
        return () => {
            if (renderer) {
                console.log('destroy renderer!');
                renderer.destroy();
            }
        };
    }, []);
    return (
        <>
            <canvas
                style={{
                    minWidth: '500px',
                    minHeight: '500px',
                }}
                ref={canvasRef}
            ></canvas>
        </>
    );
}

export default App;
