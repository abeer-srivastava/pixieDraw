import axios from "axios";
import { HTTP_BACKEND } from "../../../../config";

type Tool = "" | "pen" | "rect" | "circle" | "eraser" | "arrow" | "dottedArrow" | "triangle";

type Shape =
  | { type: "pen" | "eraser"; points: { x: number; y: number }[]; color: string; lineWidth: number }
  | { type: "rect" | "circle" | "arrow" | "dottedArrow" | "triangle"; startX: number; startY: number; endX: number; endY: number; color: string; lineWidth: number };

const shapes: Shape[] = [];
let currentStroke: { x: number; y: number }[] = [];

export interface DrawAPI {
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  clear: () => void;
  destroy: () => void;
  getShapes: () => Shape[];
}

export function initDraw(
  canvas: HTMLCanvasElement,
  socket: WebSocket,
  options: {
    defaultTool?: Tool;
    defaultColor?: string;
    defaultLineWidth?: number;
  } = {}
): DrawAPI | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
    console.log("socket in the INIT ",socket)
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawing = false;
  let startX = 0;
  let startY = 0;
  let tool: Tool = options.defaultTool || "pen";
  let strokeColor = options.defaultColor || "#a78bfa";
  let lineWidth = options.defaultLineWidth || 2;

  const setTool = (newTool: Tool) => (tool = newTool);
  const setColor = (color: string) => (strokeColor = color);
  const setLineWidth = (w: number) => (lineWidth = w);

  let savedImage: ImageData | null = null;

  const handleMouseDown = (e: MouseEvent) => {
    if (!tool) return;
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (tool !== "pen" && tool !== "eraser") {
      savedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      currentStroke = [{ x: startX, y: startY }];
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!drawing || !tool) return;

    const x = e.offsetX;
    const y = e.offsetY;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
    }

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
      currentStroke.push({ x, y });
    } else {
      if (savedImage) ctx.putImageData(savedImage, 0, 0);

      ctx.beginPath();
      if (tool === "rect") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === "arrow" || tool === "dottedArrow") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.setLineDash(tool === "dottedArrow" ? [5, 5] : []);
        ctx.stroke();

        const angle = Math.atan2(y - startY, x - startX);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (tool === "triangle") {
        ctx.moveTo(startX, y);
        ctx.lineTo((startX + x) / 2, startY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    let shape: Shape | null = null;

    if (tool === "pen" || tool === "eraser") {
      shape = { type: tool, points: currentStroke, color: strokeColor, lineWidth };
    } else if (tool) {
      shape = {
        type: tool,
        startX,
        startY,
        endX: e.offsetX,
        endY: e.offsetY,
        color: strokeColor,
        lineWidth,
      };
    }

    if (shape) {
      shapes.push(shape);
      // ✅ Broadcast the shape to other clients
      console.log("shape in the mouseup",shape);
      console.log(JSON.stringify({
        type:"shape",
        message:shape
      }));
      
      const res=socket.send(JSON.stringify({ type: "shape", message: shape }));
      console.log("res in the init ",res);

    }

    drawing = false;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
  };

  const handleMouseLeave = () => {
    drawing = false;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
  };

  // ✅ Listen for shapes from other clients
  socket.onmessage = (event) => {
    try {
        console.log(event.data);
      const data = JSON.parse(event.data);
      console.log("the data in chat",data);
      if (data.type === "chat") {
        const shape: Shape = data.message;
        console.log("shapes in the chat",shape)
        shapes.push(shape);
        redrawAllShapes(ctx);
      }
    } catch (err) {
      console.error("Invalid socket message:", err);
    }
  };

  const redrawAllShapes = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
      ctx.beginPath();
      ctx.lineWidth = s.lineWidth;
      ctx.strokeStyle = s.color;
      ctx.setLineDash([]);

      if (s.type === "pen" || s.type === "eraser") {
        ctx.globalCompositeOperation = s.type === "eraser" ? "destination-out" : "source-over";
        s.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (s.type === "rect") {
        ctx.strokeRect(s.startX, s.startY, s.endX - s.startX, s.endY - s.startY);
      } else if (s.type === "circle") {
        const radius = Math.sqrt(Math.pow(s.endX - s.startX, 2) + Math.pow(s.endY - s.startY, 2));
        ctx.arc(s.startX, s.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === "arrow" || s.type === "dottedArrow") {
        ctx.moveTo(s.startX, s.startY);
        ctx.lineTo(s.endX, s.endY);
        if (s.type === "dottedArrow") ctx.setLineDash([5, 5]);
        ctx.stroke();

        const angle = Math.atan2(s.endY - s.startY, s.endX - s.startX);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(s.endX, s.endY);
        ctx.lineTo(s.endX - headLen * Math.cos(angle - Math.PI / 6), s.endY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(s.endX, s.endY);
        ctx.lineTo(s.endX - headLen * Math.cos(angle + Math.PI / 6), s.endY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (s.type === "triangle") {
        ctx.moveTo(s.startX, s.endY);
        ctx.lineTo((s.startX + s.endX) / 2, s.startY);
        ctx.lineTo(s.endX, s.endY);
        ctx.closePath();
        ctx.stroke();
      }
    });

    ctx.globalCompositeOperation = "source-over";
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseLeave);

  return {
    setTool,
    setColor,
    setLineWidth,
    clear: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      shapes.length = 0;
      socket.send(JSON.stringify({ type: "clear" }));
    },
    destroy: () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    },
    getShapes: () => shapes,
  };
}
