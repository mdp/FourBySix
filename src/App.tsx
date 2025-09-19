import { useState, useEffect, useRef } from 'react'
import './App.css'
import headerIcon from '/labelPrinterIcon.png'

interface LabelData {
  id: string
  text: string
}

type Orientation = 'horizontal' | 'vertical'
type TextAlignment = 'left' | 'center' | 'right'
type BorderStyle = 'none' | 'thick' | 'rounded'

interface MeasuredTextareaProps {
  value: string
  onChange: (text: string) => void
  fontSize: number
  textAlignment: TextAlignment
  borderRadius: string
  measureAndCenter: (textarea: HTMLTextAreaElement, labelContainer: HTMLDivElement) => void
}

function MeasuredTextarea({ value, onChange, fontSize, textAlignment, borderRadius, measureAndCenter }: MeasuredTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current && containerRef.current) {
      measureAndCenter(textareaRef.current, containerRef.current)
    }
  }, [value, fontSize, measureAndCenter])

  return (
    <div ref={containerRef} className="label-input-wrapper">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="label-input"
        style={{
          fontSize: fontSize + 'px',
          textAlign: textAlignment,
          borderRadius: borderRadius
        }}
      />
    </div>
  )
}

function App() {
  const [rows, setRows] = useState(6)
  const [cols, setCols] = useState(2)
  const [orientation, setOrientation] = useState<Orientation>('vertical')
  const [textAlignment, setTextAlignment] = useState<TextAlignment>('center')
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('thick')
  const [labels, setLabels] = useState<LabelData[]>([])
  const [bulkEditText, setBulkEditText] = useState('')
  const [labelTextGrid, setLabelTextGrid] = useState<string[][]>([[]])

  const initializeLabels = () => {
    // Initialize or expand the text grid to accommodate new dimensions
    const newTextGrid: string[][] = []
    for (let row = 0; row < rows; row++) {
      newTextGrid[row] = []
      for (let col = 0; col < cols; col++) {
        // Keep existing text if it exists, otherwise use default
        const existingText = labelTextGrid[row]?.[col]
        newTextGrid[row][col] = existingText || `Label ${row * cols + col + 1}`
      }
    }
    setLabelTextGrid(newTextGrid)

    // Create flat labels array from the grid
    const newLabels: LabelData[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newLabels.push({
          id: `label-${row}-${col}`,
          text: newTextGrid[row][col]
        })
      }
    }
    setLabels(newLabels)
  }

  const updateLabel = (id: string, text: string) => {
    // Extract row and col from id (format: "label-row-col")
    const [, rowStr, colStr] = id.split('-')
    const row = parseInt(rowStr)
    const col = parseInt(colStr)

    // Update the text grid
    setLabelTextGrid(prev => {
      const newGrid = [...prev]
      if (newGrid[row]) {
        newGrid[row] = [...newGrid[row]]
        newGrid[row][col] = text
      }
      return newGrid
    })

    // Update the labels array
    setLabels(prev => prev.map(label =>
      label.id === id ? { ...label, text } : label
    ))
  }

  const calculateFontSize = (text: string) => {
    if (!text.trim()) return Math.max(12, Math.min(40, labelWidth * 72 / 4)) // Bigger default for empty text

    const lineCount = text.split('\n').length
    const longestLine = Math.max(...text.split('\n').map(line => line.length))

    // For landscape mode, we need to use the actual visual space after rotation
    // The textarea sees the swapped dimensions but the text flows in the rotated space
    let availableWidth, availableHeight

    if (orientation === 'horizontal') {
      // In landscape, text flows in the rotated space
      // labelWidth is actually the visual height, labelHeight is the visual width
      availableWidth = (labelHeight - 0.25) * 72 // 0.3 padding on each side
      availableHeight = (labelWidth - 0.25) * 72 // 0.3 padding on each side
    } else {
      // Normal portrait mode
      availableWidth = (labelWidth - 0.25) * 72 // 0.3 padding on each side
      availableHeight = (labelHeight - 0.25) * 72 // 0.3 padding on each side
    }

    // Calculate font size based on width constraint (longest line) - more aggressive sizing
    const fontSizeByWidth = longestLine > 0 ? availableWidth / (longestLine * 0.5) : 40 // 0.5 instead of 0.6 for tighter char spacing

    // Calculate font size based on height constraint (line count) - more aggressive sizing
    const fontSizeByHeight = availableHeight / (lineCount * 1.2) // 1.2 instead of 1.4 for tighter line spacing

    // Use the smaller of the two constraints, but allow growing up to 40px
    const optimalSize = Math.min(fontSizeByWidth, fontSizeByHeight)

    // Constrain between 8px and 40px for much bigger fonts
    return Math.max(8, Math.min(40, optimalSize))
  }

  const measureAndCenterText = (textarea: HTMLTextAreaElement, labelContainer: HTMLDivElement) => {
    if (!textarea || !labelContainer) return

    // Create a hidden div to measure text dimensions
    const measurer = document.createElement('div')
    measurer.style.position = 'absolute'
    measurer.style.visibility = 'hidden'
    measurer.style.whiteSpace = 'pre-wrap'
    measurer.style.fontFamily = window.getComputedStyle(textarea).fontFamily
    measurer.style.fontSize = window.getComputedStyle(textarea).fontSize
    measurer.style.fontWeight = window.getComputedStyle(textarea).fontWeight
    measurer.style.lineHeight = window.getComputedStyle(textarea).lineHeight
    measurer.style.width = `${labelContainer.offsetWidth - 16}px` // Account for padding
    measurer.textContent = textarea.value

    document.body.appendChild(measurer)

    // Get measurements
    const textHeight = measurer.offsetHeight
    const labelHeight = labelContainer.offsetHeight

    // Calculate centered position - only adjust vertical, keep horizontal padding fixed
    const topOffset = Math.max(8, (labelHeight - textHeight) / 2)

    // Apply positioning - keep left/right padding equal
    textarea.style.paddingTop = `${topOffset}px`
    textarea.style.paddingBottom = `${Math.max(8, labelHeight - textHeight - topOffset)}px`
    textarea.style.paddingLeft = '8px'
    textarea.style.paddingRight = '8px'

    // Clean up
    document.body.removeChild(measurer)
  }

  const applyBulkEdit = () => {
    // Update the text grid
    setLabelTextGrid(() => {
      const newGrid: string[][] = []
      for (let row = 0; row < rows; row++) {
        newGrid[row] = []
        for (let col = 0; col < cols; col++) {
          newGrid[row][col] = bulkEditText
        }
      }
      return newGrid
    })

    // Update the labels array
    setLabels(prev => prev.map(label => ({ ...label, text: bulkEditText })))
    setBulkEditText('')
  }

  // Apply layout on initial load
  useEffect(() => {
    initializeLabels()
  }, [])

  // Remove auto-apply for grid changes - only apply when button is clicked

  const handlePrint = () => {
    window.print()
  }

  const getLabelDimensions = () => {
    // Available space: 4" x 6" page with 0.15" margins = 3.7" x 5.7"
    // Gap between labels: 0.0625" (1/16")
    const pageWidth = 4.0
    const pageHeight = 6.0
    const margin = 0.15
    const gap = 0.0625

    const availableWidth = pageWidth - (2 * margin)
    const availableHeight = pageHeight - (2 * margin)

    // For landscape, transpose the grid layout (swap rows and cols)
    const effectiveRows = orientation === 'horizontal' ? cols : rows
    const effectiveCols = orientation === 'horizontal' ? rows : cols

    // Calculate total gap space needed
    const totalGapWidth = (effectiveCols - 1) * gap
    const totalGapHeight = (effectiveRows - 1) * gap

    // Calculate label dimensions after subtracting gaps
    const labelWidth = (availableWidth - totalGapWidth) / effectiveCols
    const labelHeight = (availableHeight - totalGapHeight) / effectiveRows

    return { width: labelWidth, height: labelHeight }
  }

  const { width: labelWidth, height: labelHeight } = getLabelDimensions()

  const getBorderStyles = () => {
    switch (borderStyle) {
      case 'none':
        return { border: 'none', borderRadius: '0', overflow: 'visible' }
      case 'thick':
        return { border: '2px solid #000', borderRadius: '0', overflow: 'visible' }
      case 'rounded':
        return { border: '2px solid #000', borderRadius: '8px', overflow: 'hidden' }
      default:
        return { border: '1px solid #ddd', borderRadius: '0', overflow: 'visible' }
    }
  }

  return (
    <div className="app">
      <div className="header no-print">
        <img src={headerIcon} alt="FourBySix Icon" className="header-icon" />
        <h1>FourBySix</h1>
      </div>
      <div className="controls no-print">

        <div className="control-group">
          <label>
            Grid Layout:
            <input
              type="number"
              min="1"
              max="6"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              onBlur={initializeLabels}
            />
            x
            <input
              type="number"
              min="1"
              max="6"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value))}
              onBlur={initializeLabels}
            />
          </label>
          <button onClick={initializeLabels}>Apply Layout</button>
          <span className="label-size-info">
            Label size: {labelWidth.toFixed(2)}" x {labelHeight.toFixed(2)}"
            ({orientation === 'horizontal' ? `${cols}x${rows}` : `${rows}x${cols}`})
          </span>
        </div>


        <div className="control-group">
          <label>
            Orientation:
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)}>
              <option value="vertical">Portrait (Normal)</option>
              <option value="horizontal">Landscape (Rotated 90°)</option>
            </select>
          </label>
        </div>

        <div className="control-group">
          <label>
            Text Alignment:
            <select value={textAlignment} onChange={(e) => setTextAlignment(e.target.value as TextAlignment)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>

        <div className="control-group">
          <label>
            Border Style:
            <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value as BorderStyle)}>
              <option value="none">No Border</option>
              <option value="thick">Thick Line</option>
              <option value="rounded">Rounded Corners</option>
            </select>
          </label>
        </div>

        <div className="control-group bulk-edit">
          <textarea
            placeholder="Bulk edit text (supports multiple lines)"
            value={bulkEditText}
            onChange={(e) => setBulkEditText(e.target.value)}
            rows={3}
            className="bulk-edit-textarea"
          />
          <button onClick={applyBulkEdit}>Apply to All Labels</button>
        </div>

        <button className="print-button" onClick={handlePrint}>Print Labels</button>
      </div>

      <div className="print-area">
        <div
          className="label-grid"
          style={{
            gridTemplateColumns: `repeat(${orientation === 'horizontal' ? rows : cols}, ${labelWidth}in)`,
            gridTemplateRows: `repeat(${orientation === 'horizontal' ? cols : rows}, ${labelHeight}in)`,
          }}
        >
          {labels.map((label) => (
            <div
              key={label.id}
              className="label"
              style={{
                width: orientation === 'horizontal' ? `${labelHeight}in` : `${labelWidth}in`,
                height: orientation === 'horizontal' ? `${labelWidth}in` : `${labelHeight}in`,
                transform: orientation === 'horizontal' ? 'rotate(90deg)' : 'none',
                ...getBorderStyles()
              }}
            >
              <MeasuredTextarea
                value={label.text}
                onChange={(text) => updateLabel(label.id, text)}
                fontSize={calculateFontSize(label.text)}
                textAlignment={textAlignment}
                borderRadius={borderStyle === 'rounded' ? '6px' : '0'}
                measureAndCenter={measureAndCenterText}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
