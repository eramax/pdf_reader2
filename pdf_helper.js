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
      //onTextLayerRendered()
    })
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
