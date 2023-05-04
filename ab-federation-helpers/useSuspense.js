import { loadComponent } from './utils'

const cache = {}
const errorsCache = {}
if (!window?.__ab__?.urlCache) {
  window.__ab__ = {
    urlCache: new Set(),
  }
}
// const urlCache = new Set()
const loadDynamicScript = (url) => {
  if (!url) return

  if (window.__ab__.urlCache.has(url)) {
    return Promise.resolve(true)
  }
  return new Promise((resolve, reject) => {
    const element = document.createElement('script')

    element.src = url
    element.type = 'text/javascript'
    element.async = true

    element.onload = () => {
      window.__ab__.urlCache.add(url)
      resolve(true)
    }

    element.onerror = () => {
      reject(false)
    }

    document.head.appendChild(element)
  })
}
export const useSuspense = (remoteUrl, scope, module, React) => {
  const key = `${remoteUrl}-${scope}-${module}`
  const cachedModule = cache[key]
  // already loaded previously
  if (cachedModule) {
    return cachedModule
  }
  if (errorsCache[key]) throw errorsCache[key]

  throw loadDynamicScript(remoteUrl, React)
    .then(() => loadComponent(scope, module)())
    .then((scriptM) => {
      cache[key] = scriptM.default
      return cache[key]
    })
    .catch((err) => {
      errorsCache[key] = err
      throw err
    })
}
