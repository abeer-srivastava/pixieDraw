import axios from "axios";
import { HTTP_BACKEND } from "../../../../config";

type Tool = "" | "pen" | "rect" | "circle" | "eraser";
type Shape =
  | { type: "pen" | "eraser"; points: { x: number; y: number }[]; color: string; lineWidth: number }
  | { type: "rect" | "circle"; startX: number; startY: number; endX: number; endY: number; color: string; lineWidth: number };
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
  options: {
    defaultTool?: Tool;
    defaultColor?: string;
    defaultLineWidth?: number;
  } = {}
): DrawAPI | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawing = false;
  let startX = 0;
  let startY = 0;
  let tool: Tool = options.defaultTool || "pen";
  let strokeColor = options.defaultColor || "#a78bfa"; // purple
  let lineWidth = options.defaultLineWidth || 2;

  const setTool = (newTool: Tool) => {
    tool = newTool;
    console.log("Tool set to:", tool);
  };
  const setColor = (color: string) => (strokeColor = color);
  const setLineWidth = (w: number) => (lineWidth = w);

  // Store original image before drawing shape
  let savedImage: ImageData | null = null

  // Event handlers
  const handleMouseDown = (e: MouseEvent) => {
    // Don't draw if no tool is selected
    if (!tool) return;

    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (tool === "rect" || tool === "circle") {
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

    // Set drawing properties
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    console.log("move tool", tool);

    if (tool === "eraser") {
      // Use destination-out for proper erasing
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)"; // Any opaque color works with destination-out
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
    }

    if (tool === "pen" || tool === "eraser") {
        ctx.lineTo(x, y);
        ctx.stroke();
        currentStroke.push({ x, y });
    } else if (tool === "rect" || tool === "circle") {
      // Restore the saved image and redraw the shape
      if (savedImage) {
        ctx.putImageData(savedImage, 0, 0);
      }

      // Reset composite operation for shapes
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      if (tool === "rect") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
        );
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e:MouseEvent) => {
  if (tool === "pen" || tool === "eraser") {
    shapes.push({
      type: tool,
      points: currentStroke,
      color: strokeColor,
      lineWidth,
    });
  } else if (tool === "rect" || tool === "circle") {
    shapes.push({
      type: tool,
      startX,
      startY,
      endX: e.offsetX,
      endY: e.offsetY,
      color: strokeColor,
      lineWidth,
    });
  }
    drawing = false;
    ctx.closePath();
    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  };

  const handleMouseLeave = () => {
    drawing = false;
    ctx.closePath();
    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  };

  // Add event listeners
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
    },
    destroy: () => {
      // Cleanup event listeners
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    },
    getShapes: () => shapes
  };
}

export async function getExistingShapes(roomId:string){
    const res=await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages=res.data.messages
    const shapes=messages.map((x:{message:string})=>{
        const messageData=JSON.parse(x.message);
        return messageData
    });
    return shapes;
}

export async function sendShapes(api: DrawAPI | null, roomId: string) {
  if (!api) return;
  const shapes = api.getShapes();
  if (!shapes.length) return;

  await axios.get(`http://localhost:8080/api/v1/chats/${roomId}`, {
    message: JSON.stringify({
      type: "shapes",
      data: shapes,
    }),
  });
}
