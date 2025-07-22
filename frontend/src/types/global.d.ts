declare global {
  var mockFiles: Map<string, {
    fileName: string
    fileSize: number
    mockVideoPath: string,
    contentType: string
  }> | undefined
}

export { }