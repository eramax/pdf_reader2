import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry'
import {
  PDFViewer,
  PDFLinkService,
  PDFFindController,
  EventBus,
  PDFPageView,
  PDFSinglePageViewer,
  DefaultTextLayerFactory,
} from 'pdfjs-dist/web/pdf_viewer'
import optimizeClientRects from './optimize-client-rects'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default class PdfReader {
  constructor(containerId, url, scale, pageNumber, highlights) {
    this.containerId = containerId
    this.url = url
    this.highlights = highlights
    this.scale = scale
    this.pageNumber = pageNumber
    this.scaledHighlights = []
    globalThis.reader = this
  }

  nextPage = () => {
    if (this.pageNumber < this.viewer.pagesCount) {
      this.pageNumber++
      this.viewer.currentPageNumber = this.pageNumber
      this.hide_annotation()
    }
  }

  prevPage = () => {
    if (this.pageNumber > 1) {
      this.pageNumber--
      this.viewer.currentPageNumber = this.pageNumber
      this.hide_annotation()
    }
  }

  zoomIn = () => {
    this.scale *= 1.1
    this.viewer.currentScaleValue = this.scale
  }

  zoomOut = () => {
    this.scale /= 1.1
    this.viewer.currentScaleValue = this.scale
  }

  render = async () => {
    this.containerNode = document.getElementById(this.containerId)
    this.pdfDocument = await this.load_pdf()
    this.EventBus = new EventBus()

    this.setupEventBus()
    this.pdfLinkService = new PDFLinkService({ eventBus: this.EventBus })
    this.pdfFindController = new PDFFindController({
      eventBus: this.EventBus,
      linkService: this.pdfLinkService,
    })
    //this.page = await this.load_page(this.pageNumber)
    this.initviewer()
    this.setup_viewer()

    this.registerEventsHandler()
  }

  load_pdf = async () => {
    return await pdfjsLib.getDocument({
      url: this.url,
    }).promise
  }

  load_page = async (id) => {
    return await this.pdfDocument.getPage(id)
  }

  setupEventBus = () => {
    this.EventBus.on('pagesinit', (evt) => {
      const viewport = this.viewer.getPageView(this.pageNumber - 1).viewport
      this.scale = this.containerNode.clientWidth / (viewport.width * 1.03)
      this.viewer.currentScaleValue = this.scale
    })

    this.EventBus.on('pagerendered', (evt) => {
      this.hide_annotation()
    })

    this.EventBus.on('textlayerrendered', (evt) => {
      this.scaleHighlights()
    })
  }

  findOrCreateContainerLayer = (container, className) => {
    let layer = container.querySelector(`.${className}`)

    if (!layer) {
      layer = document.createElement('div')
      layer.className = className
      container.appendChild(layer)
    }

    return layer
  }

  findOrCreateHighlightLayer = () => {
    const textLayer = this.viewer.getPageView(this.pageNumber - 1).textLayer

    if (!textLayer) {
      return null
    }

    return this.findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      'PdfHighlighter__highlight-layer',
    )
  }
  scaledToViewport = (scaled, viewport, usePdfCoordinates = false) => {
    const { width, height } = viewport

    if (usePdfCoordinates) {
      return pdfToViewport(scaled, viewport)
    }

    const x1 = (width * scaled.x1) / scaled.width
    const y1 = (height * scaled.y1) / scaled.height

    const x2 = (width * scaled.x2) / scaled.width
    const y2 = (height * scaled.y2) / scaled.height

    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1,
    }
  }
  scaledPositionToViewport = ({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates,
  }) => {
    const viewport = this.viewer.getPageView(this.pageNumber - 1).viewport
    return {
      boundingRect: this.scaledToViewport(
        boundingRect,
        viewport,
        usePdfCoordinates,
      ),
      rects: (rects || []).map((rect) =>
        this.scaledToViewport(rect, viewport, usePdfCoordinates),
      ),
      pageNumber,
    }
  }

  scaleHighlights = () => {
    const highlightLayer = this.findOrCreateHighlightLayer()
    if (highlightLayer) {
      let hs = this.highlights[String(this.pageNumber)] || []

      this.scaledHighlights = hs.map((highlight, index) => {
        const { position, ...rest } = highlight

        const viewportHighlight = {
          position: this.scaledPositionToViewport(position),
          ...rest,
        }
        console.log('highlight', highlight)
        console.log('viewportHighlight', viewportHighlight)
        this.injectHighlights(viewportHighlight, highlightLayer)
        return viewportHighlight
      })
    }
  }

  injectHighlights = (highlight, layer) => {
    var h = document.createElement('div')
    h.className = 'Highlight'

    var parts = document.createElement('div')
    parts.className = 'Highlight__parts'

    highlight.position.rects.map((rect, index) => {
      let c = document.createElement('div')
      c.className = 'Highlight__part'
      c.style.height = `${rect.height}px`
      c.style.left = `${rect.left}px`
      c.style.top = `${rect.top}px`
      c.style.width = `${rect.width}px`
      parts.appendChild(c)
    })

    h.appendChild(parts)
    layer.appendChild(h)
  }

  initviewer = () => {
    this.viewer = new PDFSinglePageViewer({
      container: this.containerNode,
      id: this.pageNumber,
      scale: this.scale,
      //defaultViewport: this.page.getViewport({ scale: this.scale }),
      textLayerFactory: new DefaultTextLayerFactory(),
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: this.pdfLinkService,
      findController: this.pdfFindController,
      eventBus: this.EventBus,
      annotationLayerFactory: null,
      renderer: 'svg',
    })

    globalThis.viewer = this.viewer
  }

  hide_annotation = () => {
    this.viewer.getPageView(this.pageNumber - 1).annotationLayer.hide()
    this.viewer.getPageView(this.pageNumber - 1).annotationLayer.cancel()
  }
  setup_viewer = () => {
    //this.viewer.setPdfPage(this.page)
    //this.viewer.draw()
    //   console.log(this.viewer, this.pdfDocument)
    this.viewer.setDocument(this.pdfDocument)
    this.pdfLinkService.setDocument(this.pdfDocument, null)
  }

  registerEventsHandler = () => {
    document.addEventListener('selectionchange', this.onSelectionChange)
  }

  getPageFromElement = (target) => {
    const node = target.closest('.page')

    if (!(node instanceof HTMLElement)) {
      return null
    }

    const number = Number(node.dataset.pageNumber)

    return { node, number }
  }

  getPageFromRange = (range) => {
    const parentElement = range.startContainer.parentElement

    if (!(parentElement instanceof HTMLElement)) {
      return
    }
    return this.getPageFromElement(parentElement)
  }

  getClientRects = (range, containerEl, shouldOptimize = true) => {
    let clientRects = Array.from(range.getClientRects())

    const offset = containerEl.getBoundingClientRect()

    const rects = clientRects.map((rect) => {
      return {
        top: rect.top + containerEl.scrollTop - offset.top,
        left: rect.left + containerEl.scrollLeft - offset.left,
        width: rect.width,
        height: rect.height,
      }
    })

    return shouldOptimize ? optimizeClientRects(rects) : rects
  }

  getBoundingRect = (clientRects) => {
    const rects = Array.from(clientRects).map((rect) => {
      const { left, top, width, height } = rect

      const X0 = left
      const X1 = left + width

      const Y0 = top
      const Y1 = top + height

      return { X0, X1, Y0, Y1 }
    })

    const optimal = rects.reduce((res, rect) => {
      return {
        X0: Math.min(res.X0, rect.X0),
        X1: Math.max(res.X1, rect.X1),

        Y0: Math.min(res.Y0, rect.Y0),
        Y1: Math.max(res.Y1, rect.Y1),
      }
    }, rects[0])

    const { X0, X1, Y0, Y1 } = optimal

    return {
      left: X0,
      top: Y0,
      width: X1 - X0,
      height: Y1 - Y0,
    }
  }

  viewportToScaled = (rect, { width, height }) => {
    return {
      x1: rect.left,
      y1: rect.top,

      x2: rect.left + rect.width,
      y2: rect.top + rect.height,

      width,
      height,
    }
  }

  viewportPositionToScaled = (boundingRect, rects, pageNumber) => {
    const viewport = this.viewer.getPageView(this.pageNumber - 1).viewport
    return {
      boundingRect: this.viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map((rect) => this.viewportToScaled(rect, viewport)),
      pageNumber,
    }
  }

  onSelectionChange = (evt) => {
    const selection = window.getSelection && window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const content = range.toString()
      if (!content) return
      const page = this.getPageFromRange(range)
      if (!page) return
      const rects = this.getClientRects(range, page.node)
      const boundingRect = this.getBoundingRect(rects)
      const scaledPosition = this.viewportPositionToScaled(
        boundingRect,
        rects,
        this.pageNumber,
      )

      console.log(content, scaledPosition, rects)
    }
  }
}
