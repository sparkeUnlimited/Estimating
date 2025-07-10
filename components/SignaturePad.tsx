"use client";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { useRef, useEffect, useState } from "react";

type Props = {
  onChange?: (dataUrl: string) => void;
};

export default function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Responsive width state
  const [canvasWidth, setCanvasWidth] = useState(400);
  const canvasHeight = 200;

  useEffect(() => {
    // Set width based on screen size
    const newWidth = isMobile ? window.innerWidth * 0.9 : 600;
    setCanvasWidth(newWidth);
  }, [isMobile]);

  const getContext = () => canvasRef.current?.getContext("2d") || null;

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (canvasRef.current && onChange) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange?.("");
  };

  return (
    <Box>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          width: "100%",
          height: canvasHeight,
          border: "1px solid #000",
          touchAction: "none",
          display: "block",
        }}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <Button onClick={clear} size="small" sx={{ mt: 1 }}>
        Clear
      </Button>
    </Box>
  );
}
