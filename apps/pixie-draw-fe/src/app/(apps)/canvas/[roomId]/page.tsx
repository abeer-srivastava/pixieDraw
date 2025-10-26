"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawAPI, initDraw } from "../../draw";
import { 
  ArrowBigRight, ArrowBigRightDash, Circle, Eraser, 
  Pencil, RectangleHorizontal, Trash, Triangle,Type, Image as ImageIcon
} from "lucide-react";
import { useParams } from "next/navigation";
import { WS_URL } from "../../../../../config";

type Tool = "" | "pen" | "rect" | "circle" | "eraser" | "arrow" | "dottedArrow" | "triangle" | "text"
  | "image";


function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawAPI, setDrawAPI] = useState<DrawAPI | null>(null);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#a78bfa");
  const [lineWidth, setLineWidth] = useState(2);
  const param = useParams();
  const roomId = String(param.roomId);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Handle window resize & WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log("token in effect", token, typeof token);

    if (!token) {
      console.log("token not found", token);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("ws connected", ws); // ✅ log ws, not stale socket
      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      ws.send(data);
      // console.log("sendingdata",data);
      setSocket(ws);

    };

    ws.onerror = (err) => console.error("WS error", err);
    ws.onclose = () => console.log("WS closed");

    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    updateSize();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
      ws.close(); // ✅ cleanup socket
    };
  }, [roomId]);

  // Initialize draw API when canvas ready or socket available
  useEffect(() => {
    if (!canvasRef.current) return;

    if (drawAPI) {
      drawAPI.destroy();
    }

    // Save current canvas content before re-initialization
    let imageData: ImageData | null = null;
    if (drawAPI && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        imageData = ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }

    // console.log("socket in 2nd useEffect", socket);
    if (!socket) {
      console.log("socket not found");
      return;
    }

    const api = initDraw(canvasRef.current, socket,Number(roomId),{
      defaultTool: tool,
      defaultColor: color,
      defaultLineWidth: lineWidth,
    });
    setDrawAPI(api);

    if (api) {
      api.setTool(tool);
      api.setColor(color);
      api.setLineWidth(lineWidth);

      // Restore previous drawing if it existed
      if (imageData && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          setTimeout(() => {
            ctx.putImageData(imageData!, 0, 0);
          }, 0);
        }
      }
    }
  }, [size, color, lineWidth, tool, socket]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Update tool/color/lineWidth when they change
  useEffect(() => {
    if (drawAPI) drawAPI.setTool(tool);
  }, [drawAPI, tool]);

  useEffect(() => {
    if (drawAPI) drawAPI.setColor(color);
  }, [drawAPI, color]);

  useEffect(() => {
    if (drawAPI) drawAPI.setLineWidth(lineWidth);
  }, [drawAPI, lineWidth]);

  const handleToolChange = useCallback((newTool: Tool) => {
    console.log("Changing tool to:", newTool);
    setTool(newTool);
  }, []);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
    },
    []
  );

  const handleLineWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLineWidth(parseInt(e.target.value));
    },
    []
  );

  const handleClear = useCallback(() => {
    if (drawAPI) {
      drawAPI.clear();
    }
  }, [drawAPI]);

  return (
    <div className="flex flex-col items-center z-50">
      <div className="flex gap-2 mb-4 z-50">
        {/* Tool buttons */}

      <button
        className={`p-2 m-2 border-2 rounded-2xl ${
          tool === "text" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"
        }`}
        onClick={() => handleToolChange("text")}
      >
        <Type className={`${tool === "text" ? "text-white" : "text-[#a78bfa]"}`} />
      </button>

      <button
        className={`p-2 m-2 border-2 rounded-2xl ${
          tool === "image" ? "bg-[#a78bfa] border-[#a78bfa]" : "bg-[#1f1f1f] border-gray-600"
        }`}
        onClick={() => handleToolChange("image")}
      >
        <ImageIcon className={`${tool === "image" ? "text-white" : "text-[#a78bfa]"}`} />
      </button>
        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "pen"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("pen")}
        >
          <Pencil
            className={`${tool === "pen" ? "text-white" : "text-[#a78bfa]"}`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "rect"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("rect")}
        >
          <RectangleHorizontal
            className={`${
              tool === "rect" ? "text-white" : "text-[#a78bfa]"
            }`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "circle"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("circle")}
        >
          <Circle
            className={`${tool === "circle" ? "text-white" : "text-[#a78bfa]"}`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "triangle"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("triangle")}
        >
          <Triangle
            className={`${
              tool === "triangle" ? "text-white" : "text-[#a78bfa]"
            }`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "arrow"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("arrow")}
        >
          <ArrowBigRight
            className={`${tool === "arrow" ? "text-white" : "text-[#a78bfa]"}`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "dottedArrow"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("dottedArrow")}
        >
          <ArrowBigRightDash
            className={`${
              tool === "dottedArrow" ? "text-white" : "text-[#a78bfa]"
            }`}
          />
        </button>

        <button
          className={`p-2 m-2 border-2 rounded-2xl ${
            tool === "eraser"
              ? "bg-[#a78bfa] border-[#a78bfa]"
              : "bg-[#1f1f1f] border-gray-600"
          }`}
          onClick={() => handleToolChange("eraser")}
        >
          <Eraser
            className={`${
              tool === "eraser" ? "text-white" : "text-[#a78bfa]"
            }`}
          />
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
