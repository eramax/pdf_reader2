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
    this.renderedHighlights = []
    globalThis.reader = this
  }

  read = () => {
    console.log('read')
  }

  addHighlight = () => {
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

      const id = new Date().toISOString()
      this.currentHighlight = {
        content: {
          text: content,
        },
        position: {
          boundingRect: scaledPosition.boundingRect,
          rects: scaledPosition.rects,
          pageNumber: this.pageNumber,
        },
        comment: {
          text: '',
          emoji: '😍',
        },
        id: id,
      }
    }
    console.log(JSON.stringify(this.currentHighlight))

    if (!this.currentHighlight) return
    this.highlights[String(this.pageNumber)] =
      String(this.pageNumber) in this.highlights
        ? [...this.highlights[String(this.pageNumber)], this.currentHighlight]
        : [this.currentHighlight]

    this.currentHighlight = null
    this.renderHighlights()
  }

  nextPage = () => {
    if (this.pageNumber < this.viewer.pagesCount) {
      this.pageNumber++
      this.viewer.currentPageNumber = this.pageNumber
      this.hide_annotation()
      this.renderHighlights()
    }
  }

  prevPage = () => {
    if (this.pageNumber > 1) {
      this.pageNumber--
      this.viewer.currentPageNumber = this.pageNumber
      this.hide_annotation()
      this.renderHighlights()
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
      console.log('pagerendered')
      this.hide_annotation()

      // const arrClass = document.querySelectorAll('.Highlight__part')
      // for (let i of arrClass) {
      //   i.addEventListener('click', (e) => {
      //     console.log('Perfrom Action', e.target)
      //   })
      // }
    })

    this.EventBus.on('textlayerrendered', (evt) => {
      console.log('textlayerrendered')
      this.renderHighlights()
    })

    //  eventBus._on("resize", webViewerResize);
    // eventBus._on("hashchange", webViewerHashchange);
    // eventBus._on("beforeprint", _boundEvents.beforePrint);
    // eventBus._on("afterprint", _boundEvents.afterPrint);
    // eventBus._on("pagerendered", webViewerPageRendered);
    // eventBus._on("updateviewarea", webViewerUpdateViewarea);
    // eventBus._on("pagechanging", webViewerPageChanging);
    // eventBus._on("scalechanging", webViewerScaleChanging);
    // eventBus._on("rotationchanging", webViewerRotationChanging);
    // eventBus._on("sidebarviewchanged", webViewerSidebarViewChanged);
    // eventBus._on("pagemode", webViewerPageMode);
    // eventBus._on("namedaction", webViewerNamedAction);
    // eventBus._on("presentationmodechanged", webViewerPresentationModeChanged);
    // eventBus._on("presentationmode", webViewerPresentationMode);
    // eventBus._on("print", webViewerPrint);
    // eventBus._on("download", webViewerDownload);
    // eventBus._on("save", webViewerSave);
    // eventBus._on("firstpage", webViewerFirstPage);
    // eventBus._on("lastpage", webViewerLastPage);
    // eventBus._on("nextpage", webViewerNextPage);
    // eventBus._on("previouspage", webViewerPreviousPage);
    // eventBus._on("zoomin", webViewerZoomIn);
    // eventBus._on("zoomout", webViewerZoomOut);
    // eventBus._on("zoomreset", webViewerZoomReset);
    // eventBus._on("pagenumberchanged", webViewerPageNumberChanged);
    // eventBus._on("scalechanged", webViewerScaleChanged);
    // eventBus._on("rotatecw", webViewerRotateCw);
    // eventBus._on("rotateccw", webViewerRotateCcw);
    // eventBus._on("optionalcontentconfig", webViewerOptionalContentConfig);
    // eventBus._on("switchscrollmode", webViewerSwitchScrollMode);
    // eventBus._on("scrollmodechanged", webViewerScrollModeChanged);
    // eventBus._on("switchspreadmode", webViewerSwitchSpreadMode);
    // eventBus._on("spreadmodechanged", webViewerSpreadModeChanged);
    // eventBus._on("documentproperties", webViewerDocumentProperties);
    // eventBus._on("find", webViewerFind);
    // eventBus._on("findfromurlhash", webViewerFindFromUrlHash);
    // eventBus._on("updatefindmatchescount", webViewerUpdateFindMatchesCount);
    // eventBus._on("updatefindcontrolstate", webViewerUpdateFindControlState);
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

  pdfToViewport = (pdf, viewport) => {
    const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
      pdf.x1,
      pdf.y1,
      pdf.x2,
      pdf.y2,
    ])

    return {
      left: x1,
      top: y1,

      width: x2 - x1,
      height: y1 - y2,
    }
  }

  scaledToViewport = (scaled, viewport, usePdfCoordinates = false) => {
    const { width, height } = viewport

    if (usePdfCoordinates) {
      return this.pdfToViewport(scaled, viewport)
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

  renderHighlights = () => {
    const highlightLayer = this.findOrCreateHighlightLayer()
    if (highlightLayer) {
      console.log(`Load page ${this.pageNumber}`)
      let pagehighlights = this.highlights[String(this.pageNumber)] || []

      pagehighlights
        .filter((h) => !this.renderedHighlights.includes(h.id))
        .map((highlight) => {
          //debugger
          console.log(`Highlight ${highlight.id}`)
          const { position, ...rest } = highlight

          const viewportHighlight = {
            position: this.scaledPositionToViewport(position),
            ...rest,
          }
          this.injectHighlights(viewportHighlight, highlightLayer)

          this.renderedHighlights.push(highlight.id)
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
      c.addEventListener('click', (e) => {
        console.log('Perfrom Action', highlight.id)
      })
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
    if (this.viewer.getPageView(this.pageNumber - 1).annotationLayer) {
      this.viewer.getPageView(this.pageNumber - 1).annotationLayer.hide()
      this.viewer.getPageView(this.pageNumber - 1).annotationLayer.cancel()
    }
  }
  setup_viewer = () => {
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

  onSelectionChange = (evt) => {}
}
