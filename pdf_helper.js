import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry'
import {
  PDFViewer,
  PDFLinkService,
  PDFFindController,
  EventBus,
  PDFPageView,
  DefaultTextLayerFactory,
} from 'pdfjs-dist/web/pdf_viewer'

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
    this.page = await this.load_page(this.pageNumber)
    this.initviewer()
    this.renderPage()
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
      this.viewer.currentScaleValue = this.scale
    })

    this.EventBus.on('textlayerrendered', (evt) => {
      console.log(evt)
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
    const textLayer = this.viewer.textLayer

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
    const viewport = this.viewer.viewport
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
    console.log('renderHighlights')
    const highlightLayer = this.findOrCreateHighlightLayer()
    if (highlightLayer) {
      let hs = this.highlights[String(this.pageNumber)] || []
      console.log(highlightLayer, hs)

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
    this.viewer = new PDFPageView({
      container: this.containerNode,
      id: this.pageNumber,
      scale: this.scale,
      defaultViewport: this.page.getViewport({ scale: this.scale }),
      textLayerFactory: new DefaultTextLayerFactory(),
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: this.pdfLinkService,
      findController: this.pdfFindController,
      eventBus: this.EventBus,
    })

    globalThis.pdfViewer = this.viewer
  }
  renderPage = () => {
    this.viewer.setPdfPage(this.page)
    this.viewer.draw()
  }
}
