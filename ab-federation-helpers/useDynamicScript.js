if (!window?.__ab__?.urlCache) {
  window.__ab__ = {
    urlCache: new Set(),
  }
}
export const useDynamicScript = (url, React) => {
  const [ready, setReady] = React.useState(false)
  const [errorLoading, setErrorLoading] = React.useState(false)

  React.useEffect(() => {
    if (!url) return

    if (window.__ab__.urlCache.has(url)) {
      setReady(true)
      setErrorLoading(false)
      return
    }

    setReady(false)
    setErrorLoading(false)

    const element = document.createElement('script')

    element.src = url
    element.type = 'text/javascript'
    element.async = true

    element.onload = () => {
      window.__ab__.urlCache.add(url)
      setReady(true)
    }

    element.onerror = () => {
      setReady(false)
      setErrorLoading(true)
    }

    document.head.appendChild(element)

    return () => {
      window.__ab__.urlCache.delete(url)
      document.head.removeChild(element)
    }
  }, [url])

  return {
    errorLoading,
    ready,
  }
}

export default useDynamicScript
