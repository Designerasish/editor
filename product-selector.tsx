"use client"

import { useState } from "react"
import DesignEditor from "./design-editor"

const PRODUCT_SPECS = [
  {
    id: "tshirt-front",
    name: "T-Shirt Front",
    backgroundImage: "/placeholder.svg?height=600&width=500&text=T-Shirt+Front",
    printArea: { x: 125, y: 150, width: 250, height: 300 },
    canvasSize: { width: 500, height: 600 },
    productInfo: {
      type: "apparel",
      printAreaDescription: "Front chest area",
      maxPrintSize: '10" × 12"',
      dpi: 25,
    },
  },
  {
    id: "tshirt-back",
    name: "T-Shirt Back",
    backgroundImage: "/placeholder.svg?height=600&width=500&text=T-Shirt+Back",
    printArea: { x: 100, y: 120, width: 300, height: 350 },
    canvasSize: { width: 500, height: 600 },
    productInfo: {
      type: "apparel",
      printAreaDescription: "Back panel",
      maxPrintSize: '12" × 14"',
      dpi: 25,
    },
  },
  {
    id: "mug-wrap",
    name: "Mug Wrap",
    backgroundImage: "/placeholder.svg?height=400&width=600&text=Coffee+Mug",
    printArea: { x: 75, y: 100, width: 450, height: 200 },
    canvasSize: { width: 600, height: 400 },
    productInfo: {
      type: "drinkware",
      printAreaDescription: "Wrap around area",
      maxPrintSize: '18" × 8"',
      dpi: 25,
    },
  },
]

export default function ProductSelector() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  if (showEditor && selectedProduct) {
    return <DesignEditor mode="product" productSpec={selectedProduct} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Choose a Product to Customize</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_SPECS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedProduct(product)
                setShowEditor(true)
              }}
            >
              <img
                src={product.backgroundImage || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Canvas: {product.canvasSize.width} × {product.canvasSize.height}px
                </p>
                <p className="text-sm text-gray-600">Print Area: {product.productInfo?.maxPrintSize}</p>
                <p className="text-xs text-blue-600 mt-2">{product.productInfo?.printAreaDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
