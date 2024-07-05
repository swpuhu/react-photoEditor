import './App.css';
import { useEffect, useRef } from 'react';
import { Scene } from './renderer/Scene';
function App() {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (canvasRef.current) {
            const s = new Scene(canvasRef.current);
            console.log(s);
        }
    });
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
