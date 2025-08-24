"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawAPI, initDraw, sendShapes } from "../../draw";
import { Circle, Eraser, Pencil, RectangleHorizontal, Trash } from "lucide-react";
import { useParams } from "next/navigation";

type Tool = "pen" | "rect" | "circle" | "eraser";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawAPI, setDrawAPI] = useState<DrawAPI | null>(null);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [tool, setTool] = useState<Tool>("pen"); // Start with valid tool
  const [color, setColor] = useState("#a78bfa");
  const [lineWidth, setLineWidth] = useState(2);
  const param=useParams();
  const roomId=String(param.roomId);
  // Handle window resize with debouncing
  useEffect(() => {

    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    updateSize();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      // Debounce resize to avoid too many re-initializations
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Initialize draw API only once when canvas is ready or size changes
  useEffect(() => {
    if (canvasRef.current) {
    if (drawAPI) {
      sendShapes(drawAPI, roomId); 
      drawAPI.destroy();           
    }
      // Save current canvas content before re-initialization
      let imageData: ImageData | null = null;
      if (drawAPI && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }

      const api = initDraw(canvasRef.current, {
        defaultTool: tool,
        defaultColor: color,
        defaultLineWidth: lineWidth,
      });
      setDrawAPI(api);

      // Apply current state to the new API instance immediately
      if (api) {
        api.setTool(tool);
        api.setColor(color);
        api.setLineWidth(lineWidth);
        
        // Restore canvas content if it existed
        if (imageData && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // Clear and restore the previous drawing
            setTimeout(() => {
              ctx.putImageData(imageData!, 0, 0);
            }, 0);
          }
        }
      }
    }
  }, [size,color,lineWidth,tool]);

  // Update tool when it changes
  useEffect(() => {
    if (drawAPI) {
      drawAPI.setTool(tool);
    }
  }, [drawAPI, tool]);

  // Update color when it changes
  useEffect(() => {
    if (drawAPI) {
      drawAPI.setColor(color);
    }
  }, [drawAPI, color]);

  // Update line width when it changes
  useEffect(() => {
    if (drawAPI) {
      drawAPI.setLineWidth(lineWidth);
    }
  }, [drawAPI, lineWidth]);

  const handleToolChange = useCallback((newTool: Tool) => {
    console.log("Changing tool to:", newTool);
    setTool(newTool);
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  }, []);

  const handleLineWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(parseInt(e.target.value));
  }, []);

  const handleClear = useCallback(() => {
    if (drawAPI) {
      drawAPI.clear();
    }
  }, [drawAPI]);

  return (
    <div className="flex flex-col items-center z-50">
      <div className="flex gap-2 mb-4 z-50">
        <button 
          className={`p-2 m-2 border-2 rounded-2xl ${tool === "pen" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"}`}
          onClick={() => handleToolChange("pen")}
        >
          <Pencil className={`${tool === "pen" ? "text-white" : "text-[#a78bfa]"}`} />
        </button>
        
        <button 
          className={`p-2 m-2 border-2 rounded-2xl ${tool === "rect" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"}`}
          onClick={() => handleToolChange("rect")}
        >
          <RectangleHorizontal className={`${tool === "rect" ? "text-white" : "text-[#a78bfa]"}`} />
        </button>
        
        <button 
          className={`p-2 m-2 border-2 rounded-2xl ${tool === "circle" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"}`}
          onClick={() => handleToolChange("circle")}
        >
          <Circle className={`${tool === "circle" ? "text-white" : "text-[#a78bfa]"}`} />
        </button>
        
        <button 
          className={`p-2 m-2 border-2 rounded-2xl ${tool === "eraser" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"}`}
          onClick={() => handleToolChange("eraser")}
        >
          <Eraser className={`${tool === "eraser" ? "text-white" : "text-[#a78bfa]"}`} />
        </button>
        
        <button 
          className="bg-[#1f1f1f] p-2 m-2 border-2 border-gray-600 rounded-2xl hover:bg-red-900" 
          onClick={handleClear}
        >
          <Trash className="text-[#a78bfa]" />
        </button>
        
        <input
          className="mt-3"
          type="color"
          value={color}
          onChange={handleColorChange}
        />
        
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={handleLineWidthChange}
          className="mt-4"
        />
      </div>
      
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className="fixed top-0 left-0 w-full h-full cursor-crosshair"
      />
    </div>
  );
}

export default Canvas;