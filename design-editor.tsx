"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Type,
  ImageIcon,
  Square,
  Circle,
  Triangle,
  Bold,
  Italic,
  Underline,
  Trash2,
  Upload,
  Eye,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
} from "lucide-react"
import html2canvas from "html2canvas"

interface DesignObject {
  id: string
  type: "text" | "image" | "shape" | "svg"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  // Text properties
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  color?: string
  textAlign?: string
  // Image properties
  imageUrl?: string
  // Shape properties
  shapeType?: "rectangle" | "circle" | "triangle"
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  borderRadius?: number
  // SVG properties
  svgData?: string
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  dragStart: { x: number; y: number }
  resizeHandle: string | null
}

interface ProductSpec {
  id: string
  name: string
  backgroundImage: string
  printArea: {
    x: number
    y: number
    width: number
    height: number
  }
  canvasSize: {
    width: number
    height: number
  }
  productInfo?: {
    type: string
    printAreaDescription: string
    maxPrintSize: string
    dpi: number
  }
}

interface DesignTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  objects: DesignObject[]
}

const RESIZE_HANDLES = ["nw", "ne", "sw", "se", "n", "s", "w", "e"]

const FONT_FAMILIES = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New"]

const TEMPLATE_IMAGES = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop",
]

// Sample Product Specifications with realistic T-shirt calculations
const PRODUCT_SPECS: ProductSpec[] = [
  {
    id: "tshirt-front",
    name: "T-Shirt Front",
    backgroundImage:
      "https://rendering.documents.cimpress.io/v1/dsc/preview?format=webp&category=design-stack&scene=https%3A%2F%2Fcdn.scenes.documents.cimpress.io%2Fv3%2Fassets%2F706b5db8-b2d4-4f6e-b2dd-c16c56b0b860%2Fcontent&width=1534&height=1534",
    printArea: {
      x: 180, // Adjusted for T-shirt chest area
      y: 200, // Below neckline, above pocket
      width: 200, // Standard chest print width
      height: 250, // Standard chest print height
    },
    canvasSize: { width: 500, height: 600 },
    productInfo: {
      type: "apparel",
      printAreaDescription: "Front chest area",
      maxPrintSize: '8" × 10"',
      dpi: 25,
    },
  },
  {
    id: "tshirt-pocket",
    name: "T-Shirt Pocket",
    backgroundImage:
      "https://rendering.documents.cimpress.io/v1/dsc/preview?format=webp&category=design-stack&scene=https%3A%2F%2Fcdn.scenes.documents.cimpress.io%2Fv3%2Fassets%2F706b5db8-b2d4-4f6e-b2dd-c16c56b0b860%2Fcontent&width=1534&height=1534",
    printArea: {
      x: 350, // Left chest pocket area
      y: 180, // Pocket position
      width: 100, // Small pocket size
      height: 80, // Small pocket height
    },
    canvasSize: { width: 500, height: 600 },
    productInfo: {
      type: "apparel",
      printAreaDescription: "Left chest pocket",
      maxPrintSize: '4" × 3.2"',
      dpi: 25,
    },
  },
  {
    id: "tshirt-back",
    name: "T-Shirt Back",
    backgroundImage: "/placeholder.svg?height=600&width=500&text=T-Shirt+Back",
    printArea: {
      x: 100,
      y: 120,
      width: 300,
      height: 350,
    },
    canvasSize: { width: 500, height: 600 },
    productInfo: {
      type: "apparel",
      printAreaDescription: "Back panel",
      maxPrintSize: '12" × 14"',
      dpi: 25,
    },
  },
]

// Sample Design Templates with SVG data
const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: "birthday-card",
    name: "Birthday Card",
    category: "Cards",
    thumbnail: "/placeholder.svg?height=200&width=300",
    objects: [
      {
        id: "bg-1",
        type: "shape",
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        shapeType: "rectangle",
        fillColor: "#fef3c7",
        strokeColor: "#f59e0b",
        strokeWidth: 2,
        borderRadius: 10,
      },
      {
        id: "star-1",
        type: "svg",
        x: 50,
        y: 50,
        width: 60,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        svgData: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        color: "#f59e0b",
      },
      {
        id: "text-1",
        type: "text",
        x: 100,
        y: 120,
        width: 200,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        text: "Happy Birthday!",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#dc2626",
        textAlign: "center",
      },
    ],
  },
]

// Sample SVG Icons
const SAMPLE_SVG_DATA = [
  {
    name: "Star",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  },
  {
    name: "Heart",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>`,
  },
  {
    name: "Arrow",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>`,
  },
  {
    name: "Check",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>`,
  },
]

interface DesignEditorProps {
  mode?: "free" | "product" | "template"
  productSpec?: ProductSpec
  initialTemplate?: DesignTemplate
}

const DesignEditor: React.FC<DesignEditorProps> = ({ mode = "free", productSpec = null, initialTemplate = null }) => {
  const [objects, setObjects] = useState<DesignObject[]>(initialTemplate?.objects || [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    dragStart: { x: 0, y: 0 },
    resizeHandle: null,
  })
  const [objectCounter, setObjectCounter] = useState(initialTemplate?.objects.length || 0)
  const [activePanel, setActivePanel] = useState<"text" | "image" | "shape" | "svg" | "templates" | null>(
    mode === "template" ? "templates" : "text",
  )
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")

  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textMeasureRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  // Get canvas dimensions based on mode
  const getCanvasDimensions = useCallback(() => {
    if (mode === "product" && productSpec) {
      return productSpec.canvasSize
    }
    return { width: 800, height: 600 }
  }, [mode, productSpec])

  // Zoom functions - Updated to work with print area scaling
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 5))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1))
  }, [])

  const resetZoom = useCallback(() => {
    // Reset to show full image (0% equivalent)
    if (mode === "product" && productSpec) {
      fitFullImageToScreen()
    } else {
      setZoom(1)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [])

  // Fit full T-shirt image to screen (0% zoom equivalent)
  const fitFullImageToScreen = useCallback(() => {
    if (!canvasContainerRef.current || !productSpec) return

    const container = canvasContainerRef.current
    const containerRect = container.getBoundingClientRect()
    const canvasDimensions = getCanvasDimensions()

    // Calculate available space (with padding)
    const availableWidth = containerRect.width - 100
    const availableHeight = containerRect.height - 100

    // Scale to fit entire canvas/T-shirt
    const scaleX = availableWidth / canvasDimensions.width
    const scaleY = availableHeight / canvasDimensions.height
    const newZoom = Math.min(scaleX, scaleY, 1)

    // Center the entire canvas
    setZoom(newZoom)
    setPanOffset({ x: 0, y: 0 })
  }, [productSpec, getCanvasDimensions])

  // Fit print area to screen (100% zoom equivalent)
  const fitPrintAreaToScreen = useCallback(() => {
    if (!canvasContainerRef.current || !productSpec) return

    const container = canvasContainerRef.current
    const containerRect = container.getBoundingClientRect()

    // Calculate available space (with padding)
    const availableWidth = containerRect.width - 100
    const availableHeight = containerRect.height - 100

    // Calculate scale needed to fit print area to screen
    const scaleX = availableWidth / productSpec.printArea.width
    const scaleY = availableHeight / productSpec.printArea.height
    const newZoom = Math.min(scaleX, scaleY, 5) // Max zoom of 5x

    // Calculate pan offset to center the print area
    const printAreaCenterX = (productSpec.printArea.x + productSpec.printArea.width / 2) * newZoom
    const printAreaCenterY = (productSpec.printArea.y + productSpec.printArea.height / 2) * newZoom

    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    const panX = containerCenterX - printAreaCenterX
    const panY = containerCenterY - printAreaCenterY

    setZoom(newZoom)
    setPanOffset({ x: panX, y: panY })
  }, [productSpec, setZoom, setPanOffset])

  // Calculate zoom percentage based on print area fit
  const getZoomPercentage = useCallback(() => {
    if (!canvasContainerRef.current || !productSpec) return Math.round(zoom * 100)

    const container = canvasContainerRef.current
    const containerRect = container.getBoundingClientRect()
    const availableWidth = containerRect.width - 100
    const availableHeight = containerRect.height - 100

    // Calculate what 100% (print area fit) zoom would be
    const printAreaFitScaleX = availableWidth / productSpec.printArea.width
    const printAreaFitScaleY = availableHeight / productSpec.printArea.height
    const printAreaFitZoom = Math.min(printAreaFitScaleX, printAreaFitScaleY, 5)

    // Calculate what 0% (full image fit) zoom would be
    const canvasDimensions = getCanvasDimensions()
    const fullImageFitScaleX = availableWidth / canvasDimensions.width
    const fullImageFitScaleY = availableHeight / canvasDimensions.height
    const fullImageFitZoom = Math.min(fullImageFitScaleX, fullImageFitScaleY, 1)

    // Calculate percentage between full image (0%) and print area fit (100%)
    if (printAreaFitZoom === fullImageFitZoom) return Math.round(zoom * 100)

    const percentage = ((zoom - fullImageFitZoom) / (printAreaFitZoom - fullImageFitZoom)) * 100
    return Math.max(0, Math.min(100, Math.round(percentage)))
  }, [zoom, productSpec, getCanvasDimensions])

  // Replace the existing fitToScreen function
  const fitToScreen = useCallback(() => {
    if (mode === "product" && productSpec) {
      fitPrintAreaToScreen() // Fit to print area (100%)
    } else {
      if (!canvasContainerRef.current) return

      const container = canvasContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const canvasDimensions = getCanvasDimensions()

      const scaleX = (containerRect.width - 100) / canvasDimensions.width
      const scaleY = (containerRect.height - 100) / canvasDimensions.height
      const newZoom = Math.min(scaleX, scaleY, 1)

      setZoom(newZoom)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [mode, productSpec, fitPrintAreaToScreen, getCanvasDimensions])

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)))
      }
    },
    [setZoom],
  )

  // Handle pan start
  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle mouse or Alt+Left click
        e.preventDefault()
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      }
    },
    [panOffset, setIsPanning, setPanStart],
  )

  // Handle pan move
  useEffect(() => {
    const handlePanMove = (e: MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    }

    const handlePanEnd = () => {
      setIsPanning(false)
    }

    if (isPanning) {
      document.addEventListener("mousemove", handlePanMove)
      document.addEventListener("mouseup", handlePanEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handlePanMove)
      document.removeEventListener("mouseup", handlePanEnd)
    }
  }, [isPanning, panStart, setPanOffset, setIsPanning])

  // Measure text dimensions
  const measureTextDimensions = useCallback((obj: DesignObject) => {
    if (obj.type !== "text" || !textMeasureRef.current) return { width: obj.width, height: obj.height }

    const measureEl = textMeasureRef.current
    measureEl.style.fontSize = `${obj.fontSize}px`
    measureEl.style.fontFamily = obj.fontFamily || "Arial"
    measureEl.style.fontWeight = obj.fontWeight || "normal"
    measureEl.style.fontStyle = obj.fontStyle || "normal"
    measureEl.style.textDecoration = obj.textDecoration || "none"
    measureEl.style.whiteSpace = "nowrap"
    measureEl.textContent = obj.text || ""

    const rect = measureEl.getBoundingClientRect()
    return {
      width: Math.max(rect.width + 16, 50),
      height: Math.max(rect.height + 8, 20),
    }
  }, [])

  // Generate preview image with proper scaling
  const generatePreview = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const canvasDimensions = getCanvasDimensions()
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 1,
        useCORS: true,
        allowTaint: true,
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        scrollX: 0,
        scrollY: 0,
      })
      const imageUrl = canvas.toDataURL("image/png")
      setPreviewImage(imageUrl)
      setShowPreview(true)
    } catch (error) {
      console.error("Failed to generate preview:", error)
    }
  }, [setPreviewImage, setShowPreview, getCanvasDimensions])

  // Add new object
  const addObject = useCallback(
    (type: "text" | "image" | "shape" | "svg", data: Partial<DesignObject> = {}) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const canvasDimensions = getCanvasDimensions()
      let defaultX = Math.random() * (canvasDimensions.width - 200) + 50
      let defaultY = Math.random() * (canvasDimensions.height - 100) + 50

      // If in product mode, place objects in print area
      if (mode === "product" && productSpec) {
        defaultX = productSpec.printArea.x + Math.random() * (productSpec.printArea.width - 100)
        defaultY = productSpec.printArea.y + Math.random() * (productSpec.printArea.height - 50)
      }

      const newId = `${type}-${objectCounter + 1}`
      const baseObject: DesignObject = {
        id: newId,
        type,
        x: defaultX,
        y: defaultY,
        width: type === "text" ? 200 : 150,
        height: type === "text" ? 50 : 150,
        rotation: 0,
        opacity: 1,
        zIndex: objectCounter + 1,
        ...data,
      }

      if (type === "text") {
        baseObject.text = "Double click to edit"
        baseObject.fontSize = 16
        baseObject.fontFamily = "Arial"
        baseObject.fontWeight = "normal"
        baseObject.fontStyle = "normal"
        baseObject.textDecoration = "none"
        baseObject.color = "#000000"
        baseObject.textAlign = "left"

        const dimensions = measureTextDimensions(baseObject)
        baseObject.width = dimensions.width
        baseObject.height = dimensions.height
      }

      if (type === "shape") {
        baseObject.shapeType = "rectangle"
        baseObject.fillColor = "#3b82f6"
        baseObject.strokeColor = "#1d4ed8"
        baseObject.strokeWidth = 2
        baseObject.borderRadius = 0
      }

      setObjects((prev) => [...prev, baseObject])
      setSelectedId(newId)
      setObjectCounter((prev) => prev + 1)
    },
    [
      objectCounter,
      measureTextDimensions,
      mode,
      productSpec,
      setObjects,
      setSelectedId,
      setObjectCounter,
      getCanvasDimensions,
    ],
  )

  // Load template
  const loadTemplate = useCallback(
    (template: DesignTemplate) => {
      setObjects(template.objects)
      setSelectedId(null)
      setObjectCounter(template.objects.length)
    },
    [setObjects, setSelectedId, setObjectCounter],
  )

  // Add SVG object
  const addSvgObject = useCallback(
    (svgData: string) => {
      addObject("svg", { svgData, width: 100, height: 100 })
    },
    [addObject],
  )

  // Handle mouse events with zoom consideration
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, objectId: string, isHandle = false, handleType?: string) => {
      e.preventDefault()
      e.stopPropagation()

      setSelectedId(objectId)
      setEditingTextId(null)

      const canvas = canvasRef.current
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()
      const obj = objects.find((o) => o.id === objectId)
      if (!obj) return

      // Adjust for zoom and pan
      const adjustedX = (e.clientX - canvasRect.left - panOffset.x) / zoom
      const adjustedY = (e.clientY - canvasRect.top - panOffset.y) / zoom

      if (isHandle && handleType) {
        setDragState({
          isDragging: false,
          isResizing: true,
          dragStart: { x: e.clientX, y: e.clientY },
          resizeHandle: handleType,
        })
      } else {
        setDragState({
          isDragging: true,
          isResizing: false,
          dragStart: {
            x: adjustedX - obj.x,
            y: adjustedY - obj.y,
          },
          resizeHandle: null,
        })
      }
    },
    [objects, zoom, panOffset, setSelectedId, setEditingTextId, setDragState],
  )

  // Mouse move handler with smooth animations and zoom support
  useEffect(() => {
    let animationFrame: number

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedId || (!dragState.isDragging && !dragState.isResizing)) return

      const canvas = canvasRef.current
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()
      const canvasDimensions = getCanvasDimensions()

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }

      animationFrame = requestAnimationFrame(() => {
        setObjects((prev) =>
          prev.map((obj) => {
            if (obj.id !== selectedId) return obj

            if (dragState.isDragging) {
              const adjustedX = (e.clientX - canvasRect.left - panOffset.x) / zoom
              const adjustedY = (e.clientY - canvasRect.top - panOffset.y) / zoom

              const newX = adjustedX - dragState.dragStart.x
              const newY = adjustedY - dragState.dragStart.y

              // Constrain to print area in product mode
              let constrainedX = Math.max(0, Math.min(newX, canvasDimensions.width - obj.width))
              let constrainedY = Math.max(0, Math.min(newY, canvasDimensions.height - obj.height))

              if (mode === "product" && productSpec) {
                constrainedX = Math.max(
                  productSpec.printArea.x,
                  Math.min(newX, productSpec.printArea.x + productSpec.printArea.width - obj.width),
                )
                constrainedY = Math.max(
                  productSpec.printArea.y,
                  Math.min(newY, productSpec.printArea.y + productSpec.printArea.height - obj.height),
                )
              }

              return {
                ...obj,
                x: constrainedX,
                y: constrainedY,
              }
            }

            if (dragState.isResizing && dragState.resizeHandle) {
              const adjustedMouseX = (e.clientX - canvasRect.left - panOffset.x) / zoom
              const adjustedMouseY = (e.clientY - canvasRect.top - panOffset.y) / zoom

              let newWidth = obj.width
              let newHeight = obj.height
              let newX = obj.x
              let newY = obj.y

              switch (dragState.resizeHandle) {
                case "se":
                  newWidth = adjustedMouseX - obj.x
                  newHeight = adjustedMouseY - obj.y
                  break
                case "sw":
                  newWidth = obj.x + obj.width - adjustedMouseX
                  newHeight = adjustedMouseY - obj.y
                  newX = adjustedMouseX
                  break
                case "ne":
                  newWidth = adjustedMouseX - obj.x
                  newHeight = obj.y + obj.height - adjustedMouseY
                  newY = adjustedMouseY
                  break
                case "nw":
                  newWidth = obj.x + obj.width - adjustedMouseX
                  newHeight = obj.y + obj.height - adjustedMouseY
                  newX = adjustedMouseX
                  newY = adjustedMouseY
                  break
                case "e":
                  newWidth = adjustedMouseX - obj.x
                  break
                case "w":
                  newWidth = obj.x + obj.width - adjustedMouseX
                  newX = adjustedMouseX
                  break
                case "s":
                  newHeight = adjustedMouseY - obj.y
                  break
                case "n":
                  newHeight = obj.y + obj.height - adjustedMouseY
                  newY = adjustedMouseY
                  break
              }

              return {
                ...obj,
                width: Math.max(50, newWidth),
                height: Math.max(20, newHeight),
                x: newX,
                y: newY,
              }
            }

            return obj
          }),
        )
      })
    }

    const handleMouseUp = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      setDragState({
        isDragging: false,
        isResizing: false,
        dragStart: { x: 0, y: 0 },
        resizeHandle: null,
      })
    }

    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [dragState, selectedId, mode, productSpec, zoom, panOffset, setObjects, setDragState, getCanvasDimensions])

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedId(null)
        setEditingTextId(null)
      }
    },
    [setSelectedId, setEditingTextId],
  )

  // Update object property with dimension recalculation for text
  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedId) return
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedId) return obj

        const updatedObj = { ...obj, [property]: value }

        if (obj.type === "text" && ["text", "fontSize", "fontFamily", "fontWeight", "fontStyle"].includes(property)) {
          const dimensions = measureTextDimensions(updatedObj)
          updatedObj.width = dimensions.width
          updatedObj.height = dimensions.height
        }

        return updatedObj
      }),
    )
  }

  // Delete selected object
  const deleteSelected = () => {
    if (!selectedId) return
    setObjects((prev) => prev.filter((obj) => obj.id !== selectedId))
    setSelectedId(null)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        addObject("image", { imageUrl: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Add template image
  const addTemplateImage = (imageUrl: string) => {
    addObject("image", { imageUrl })
  }

  // Handle text double click for inline editing
  const handleTextDoubleClick = (objectId: string) => {
    const obj = objects.find((o) => o.id === objectId)
    if (obj && obj.type === "text") {
      setEditingTextId(objectId)
      setEditingText(obj.text || "")
      setTimeout(() => {
        textInputRef.current?.focus()
        textInputRef.current?.select()
      }, 0)
    }
  }

  // Handle text edit completion
  const handleTextEditComplete = () => {
    if (editingTextId) {
      updateObjectProperty("text", editingText)
      setEditingTextId(null)
      setEditingText("")
    }
  }

  // Handle text input key press
  const handleTextInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTextEditComplete()
    } else if (e.key === "Escape") {
      setEditingTextId(null)
      setEditingText("")
    }
  }

  // Auto-fit on component mount - start with full image view (0%)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === "product" && productSpec) {
        fitFullImageToScreen() // Start with full image (0%)
      } else {
        fitToScreen()
      }
    }, 100)

    // Handle window resize
    const handleResize = () => {
      if (mode === "product" && productSpec) {
        fitPrintAreaToScreen()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", handleResize)
    }
  }, [mode, productSpec, fitPrintAreaToScreen, fitToScreen, fitFullImageToScreen])

  const canvasDimensions = getCanvasDimensions()

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col relative">
      {/* Hidden text measurement element */}
      <div
        ref={textMeasureRef}
        className="absolute -top-1000 left-0 pointer-events-none opacity-0"
        style={{ whiteSpace: "nowrap" }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-blue-600">DesignStudio</div>
          {mode === "product" && productSpec && (
            <div className="text-sm text-gray-600">Editing: {productSpec.name}</div>
          )}
          {mode === "template" && initialTemplate && (
            <div className="text-sm text-gray-600">Template: {initialTemplate.name}</div>
          )}
        </div>
        <div className="flex space-x-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
            <button onClick={zoomOut} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {mode === "product" && productSpec ? `${getZoomPercentage()}%` : `${Math.round(zoom * 100)}%`}
            </span>
            <button onClick={zoomIn} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button onClick={resetZoom} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Reset Zoom">
              <RotateCcw size={16} />
            </button>
            <button
              onClick={fitFullImageToScreen}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Show Full Image (0%)"
            >
              <span className="text-xs">0%</span>
            </button>
            <button
              onClick={fitPrintAreaToScreen}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Fit Print Area (100%)"
            >
              <span className="text-xs">100%</span>
            </button>
            <button
              onClick={fitToScreen}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Fit to Screen"
            >
              <Move size={16} />
            </button>
          </div>

          <button
            onClick={generatePreview}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Sub Header - Properties Panel (Absolute positioned) */}
      {selectedObject && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 z-20 shadow-md">
          <div className="flex items-center space-x-4">
            {selectedObject.type === "text" && (
              <>
                <select
                  value={selectedObject.fontFamily || "Arial"}
                  onChange={(e) => updateObjectProperty("fontFamily", e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedObject.fontSize || 16}
                  onChange={(e) => updateObjectProperty("fontSize", Number.parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="8"
                  max="72"
                />
                <input
                  type="color"
                  value={selectedObject.color || "#000000"}
                  onChange={(e) => updateObjectProperty("color", e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <button
                  onClick={() =>
                    updateObjectProperty("fontWeight", selectedObject.fontWeight === "bold" ? "normal" : "bold")
                  }
                  className={`p-2 rounded transition-colors ${selectedObject.fontWeight === "bold" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() =>
                    updateObjectProperty("fontStyle", selectedObject.fontStyle === "italic" ? "normal" : "italic")
                  }
                  className={`p-2 rounded transition-colors ${selectedObject.fontStyle === "italic" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() =>
                    updateObjectProperty(
                      "textDecoration",
                      selectedObject.textDecoration === "underline" ? "none" : "underline",
                    )
                  }
                  className={`p-2 rounded transition-colors ${selectedObject.textDecoration === "underline" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                >
                  <Underline size={16} />
                </button>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <button
                    onClick={() => updateObjectProperty("textAlign", "left")}
                    className={`p-2 transition-colors ${selectedObject.textAlign === "left" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => updateObjectProperty("textAlign", "center")}
                    className={`p-2 border-x border-gray-300 transition-colors ${selectedObject.textAlign === "center" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => updateObjectProperty("textAlign", "right")}
                    className={`p-2 transition-colors ${selectedObject.textAlign === "right" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </>
            )}

            {selectedObject.type === "image" && (
              <>
                <div className="text-sm text-gray-600">Image Properties:</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedObject.opacity * 100}
                  onChange={(e) => updateObjectProperty("opacity", Number.parseInt(e.target.value) / 100)}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">Opacity: {Math.round(selectedObject.opacity * 100)}%</span>
              </>
            )}

            {selectedObject.type === "shape" && (
              <>
                <select
                  value={selectedObject.shapeType || "rectangle"}
                  onChange={(e) => updateObjectProperty("shapeType", e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                </select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Fill:</span>
                  <input
                    type="color"
                    value={selectedObject.fillColor || "#3b82f6"}
                    onChange={(e) => updateObjectProperty("fillColor", e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Stroke:</span>
                  <input
                    type="color"
                    value={selectedObject.strokeColor || "#1d4ed8"}
                    onChange={(e) => updateObjectProperty("strokeColor", e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Radius:</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedObject.borderRadius || 0}
                    onChange={(e) => updateObjectProperty("borderRadius", Number.parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500">{selectedObject.borderRadius || 0}px</span>
                </div>
              </>
            )}

            {selectedObject.type === "svg" && (
              <>
                <div className="text-sm text-gray-600">SVG Properties:</div>
                <input
                  type="color"
                  value={selectedObject.color || "#000000"}
                  onChange={(e) => updateObjectProperty("color", e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedObject.opacity * 100}
                  onChange={(e) => updateObjectProperty("opacity", Number.parseInt(e.target.value) / 100)}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">Opacity: {Math.round(selectedObject.opacity * 100)}%</span>
              </>
            )}

            <button
              onClick={deleteSelected}
              className="p-2 text-red-600 hover:bg-red-50 rounded ml-auto transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1" style={{ marginTop: selectedObject ? "60px" : "0" }}>
        {/* Left Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-200 text-xs">
            {mode === "template" && (
              <button
                onClick={() => setActivePanel("templates")}
                className={`flex-1 py-3 px-1 text-sm font-medium transition-colors ${activePanel === "templates" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                <Layers size={16} className="mx-auto" />
                <div className="mt-1">Templates</div>
              </button>
            )}
            <button
              onClick={() => setActivePanel("text")}
              className={`flex-1 py-3 px-1 text-sm font-medium transition-colors ${activePanel === "text" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <Type size={16} className="mx-auto" />
              <div className="mt-1">Text</div>
            </button>
            <button
              onClick={() => setActivePanel("image")}
              className={`flex-1 py-3 px-1 text-sm font-medium transition-colors ${activePanel === "image" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <ImageIcon size={16} className="mx-auto" />
              <div className="mt-1">Image</div>
            </button>
            <button
              onClick={() => setActivePanel("shape")}
              className={`flex-1 py-3 px-1 text-sm font-medium transition-colors ${activePanel === "shape" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <Square size={16} className="mx-auto" />
              <div className="mt-1">Shape</div>
            </button>
            <button
              onClick={() => setActivePanel("svg")}
              className={`flex-1 py-3 px-1 text-sm font-medium transition-colors ${activePanel === "svg" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <FileText size={16} className="mx-auto" />
              <div className="mt-1">SVG</div>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activePanel === "templates" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-3">Choose a template to start:</div>
                {DESIGN_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => loadTemplate(template)}
                  >
                    <img
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.category}</div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === "text" && (
              <div>
                <button
                  onClick={() => addObject("text")}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                >
                  <Type size={24} className="mx-auto mb-2" />
                  <div>Add Text</div>
                </button>
              </div>
            )}

            {activePanel === "image" && (
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                >
                  <Upload size={24} className="mx-auto mb-2" />
                  <div>Upload Image</div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Templates</h4>
                  {TEMPLATE_IMAGES.map((img, index) => (
                    <img
                      key={index}
                      src={img || "/placeholder.svg"}
                      alt={`Template ${index + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity duration-200"
                      onClick={() => addTemplateImage(img)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activePanel === "shape" && (
              <div className="space-y-3">
                <button
                  onClick={() => addObject("shape", { shapeType: "rectangle" })}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                >
                  <Square size={20} />
                  <span>Rectangle</span>
                </button>
                <button
                  onClick={() => addObject("shape", { shapeType: "circle" })}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                >
                  <Circle size={20} />
                  <span>Circle</span>
                </button>
                <button
                  onClick={() => addObject("shape", { shapeType: "triangle" })}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                >
                  <Triangle size={20} />
                  <span>Triangle</span>
                </button>
              </div>
            )}

            {activePanel === "svg" && (
              <div className="space-y-3">
                {SAMPLE_SVG_DATA.map((svgIcon) => (
                  <button
                    key={svgIcon.name}
                    onClick={() => addSvgObject(svgIcon.svg)}
                    className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                  >
                    <div dangerouslySetInnerHTML={{ __html: svgIcon.svg }} className="w-6 h-6" />
                    <span>{svgIcon.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6">
          <div
            ref={canvasContainerRef}
            className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex items-center justify-center"
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            style={{ cursor: isPanning ? "grabbing" : "grab" }}
          >
            <div
              ref={canvasRef}
              className="relative cursor-default border border-gray-300"
              style={{
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: "center center",
                background:
                  mode === "product" && productSpec
                    ? `url(${productSpec.backgroundImage}) no-repeat center center`
                    : `
                  linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                  linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)
                `,
                backgroundSize: mode === "product" && productSpec ? "contain" : "20px 20px",
                backgroundPosition:
                  mode === "product" && productSpec ? "center center" : "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
              onClick={handleCanvasClick}
            >
              {/* Enhanced Print Area Overlay for Product Mode */}
              {mode === "product" && productSpec && (
                <>
                  {/* Print area with better styling */}
                  <div
                    className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-10"
                    style={{
                      left: productSpec.printArea.x,
                      top: productSpec.printArea.y,
                      width: productSpec.printArea.width,
                      height: productSpec.printArea.height,
                    }}
                  >
                    {/* Print area label */}
                    <div className="absolute -top-6 left-0 text-xs text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-200">
                      {productSpec.productInfo?.printAreaDescription || "Print Area"} -{" "}
                      {productSpec.productInfo?.maxPrintSize}
                    </div>

                    {/* Corner markers for better visibility */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-blue-500"></div>
                  </div>

                  {/* Safe area guide (smaller area within print area) */}
                  <div
                    className="absolute border border-yellow-400 border-dashed bg-yellow-50 bg-opacity-5"
                    style={{
                      left: productSpec.printArea.x + 10,
                      top: productSpec.printArea.y + 10,
                      width: productSpec.printArea.width - 20,
                      height: productSpec.printArea.height - 20,
                    }}
                  >
                    <div className="absolute -top-5 left-0 text-xs text-yellow-700 bg-white px-1 rounded">
                      Safe Area
                    </div>
                  </div>
                </>
              )}

              {objects.map((obj) => {
                const isSelected = obj.id === selectedId
                const isDragging = isSelected && dragState.isDragging
                const isEditing = editingTextId === obj.id

                return (
                  <div
                    key={obj.id}
                    className={`absolute select-none transition-all duration-75 ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    } ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg"
                        : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1"
                    }`}
                    style={{
                      left: obj.x,
                      top: obj.y,
                      width: obj.width,
                      height: obj.height,
                      transform: `rotate(${obj.rotation}deg)`,
                      opacity: obj.opacity,
                      zIndex: obj.zIndex,
                      transformOrigin: "center center",
                    }}
                    onMouseDown={(e) => !isEditing && handleMouseDown(e, obj.id)}
                    onDoubleClick={() => obj.type === "text" && handleTextDoubleClick(obj.id)}
                  >
                    {/* Render different object types */}
                    {obj.type === "text" && (
                      <>
                        {isEditing ? (
                          <input
                            ref={textInputRef}
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={handleTextEditComplete}
                            onKeyDown={handleTextInputKeyPress}
                            className="w-full h-full bg-transparent border-none outline-none resize-none"
                            style={{
                              fontSize: obj.fontSize,
                              fontFamily: obj.fontFamily,
                              fontWeight: obj.fontWeight,
                              fontStyle: obj.fontStyle,
                              textDecoration: obj.textDecoration,
                              color: obj.color,
                              textAlign: obj.textAlign as any,
                              padding: "8px",
                              lineHeight: "1.2",
                            }}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-start overflow-hidden"
                            style={{
                              fontSize: obj.fontSize,
                              fontFamily: obj.fontFamily,
                              fontWeight: obj.fontWeight,
                              fontStyle: obj.fontStyle,
                              textDecoration: obj.textDecoration,
                              color: obj.color,
                              textAlign: obj.textAlign as any,
                              padding: "8px",
                              lineHeight: "1.2",
                            }}
                          >
                            {obj.text}
                          </div>
                        )}
                      </>
                    )}

                    {obj.type === "image" && (
                      <img
                        src={obj.imageUrl || "/placeholder.svg"}
                        alt="Design element"
                        className="w-full h-full object-cover rounded"
                        draggable={false}
                      />
                    )}

                    {obj.type === "shape" && (
                      <div className="w-full h-full">
                        {obj.shapeType === "rectangle" && (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: obj.fillColor,
                              border: `${obj.strokeWidth}px solid ${obj.strokeColor}`,
                              borderRadius: `${obj.borderRadius}px`,
                            }}
                          />
                        )}
                        {obj.shapeType === "circle" && (
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              backgroundColor: obj.fillColor,
                              border: `${obj.strokeWidth}px solid ${obj.strokeColor}`,
                            }}
                          />
                        )}
                        {obj.shapeType === "triangle" && (
                          <div
                            className="w-full h-full"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: `${obj.width / 2}px solid transparent`,
                              borderRight: `${obj.width / 2}px solid transparent`,
                              borderBottom: `${obj.height}px solid ${obj.fillColor}`,
                              borderTop: "none",
                            }}
                          />
                        )}
                      </div>
                    )}

                    {obj.type === "svg" && (
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: obj.svgData || "" }}
                        style={{ color: obj.color || "#000000" }}
                      />
                    )}

                    {/* Canva-style Selection Handles (Circular, no rotation) */}
                    {isSelected && !isEditing && (
                      <>
                        {RESIZE_HANDLES.map((handle) => (
                          <div
                            key={handle}
                            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:bg-blue-50 hover:scale-110 transition-all duration-150"
                            style={{
                              ...(handle.includes("n") && { top: -8 }),
                              ...(handle.includes("s") && { bottom: -8 }),
                              ...(handle.includes("w") && { left: -8 }),
                              ...(handle.includes("e") && { right: -8 }),
                              ...(handle === "n" && { left: "50%", transform: "translateX(-50%)" }),
                              ...(handle === "s" && { left: "50%", transform: "translateX(-50%)" }),
                              ...(handle === "w" && { top: "50%", transform: "translateY(-50%)" }),
                              ...(handle === "e" && { top: "50%", transform: "translateY(-50%)" }),
                              cursor: `${handle}-resize`,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, obj.id, true, handle)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {Math.round(zoom * 100)}% | Ctrl+Wheel to zoom | Alt+Drag to pan
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignEditor
