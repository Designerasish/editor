"use client"

import { useState } from "react"
import DesignEditor from "./design-editor"

const DESIGN_TEMPLATES = [
  {
    id: "birthday-card",
    name: "Birthday Card",
    category: "Cards",
    thumbnail: "/placeholder.svg?height=200&width=300",
    objects: [
      {
        id: "bg-1",
        type: "shape" as const,
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        shapeType: "rectangle" as const,
        fillColor: "#fef3c7",
        strokeColor: "#f59e0b",
        strokeWidth: 2,
        borderRadius: 10,
      },
      {
        id: "star-1",
        type: "svg" as const,
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
        type: "text" as const,
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
        textAlign: "center" as const,
      },
    ],
  },
  {
    id: "business-card",
    name: "Business Card",
    category: "Business",
    thumbnail: "/placeholder.svg?height=200&width=350",
    objects: [
      {
        id: "bg-2",
        type: "shape" as const,
        x: 0,
        y: 0,
        width: 350,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        shapeType: "rectangle" as const,
        fillColor: "#1f2937",
        strokeColor: "#374151",
        strokeWidth: 1,
        borderRadius: 8,
      },
      {
        id: "text-2",
        type: "text" as const,
        x: 20,
        y: 30,
        width: 200,
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        text: "John Doe",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "left" as const,
      },
      {
        id: "text-3",
        type: "text" as const,
        x: 20,
        y: 80,
        width: 200,
        height: 30,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        text: "CEO & Founder",
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        color: "#9ca3af",
        textAlign: "left" as const,
      },
    ],
  },
]

export default function TemplateSelector() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  if (showEditor && selectedTemplate) {
    return <DesignEditor mode="template" initialTemplate={selectedTemplate} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Choose a Design Template</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGN_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template)
                setShowEditor(true)
              }}
            >
              <img
                src={template.thumbnail || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                <p className="text-sm text-blue-600 mt-2">Click to customize</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
