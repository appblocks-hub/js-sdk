import { loadComponent } from './utils'

const cache = {};
const errorsCache = {};
const urlCache = new Set();
const loadDynamicScript = url => {

    if (!url) return;
  
    if (urlCache.has(url)) {
        console.log('inside url cache ----- '. url)
      return new Promise(true)
    }
    return new Promise((resolve, reject) => {
      const element = document.createElement('script');
  
      element.src = url;
      element.type = 'text/javascript';
      element.async = true;
  
      element.onload = () => {
        urlCache.add(url);
        resolve(true)
      };
  
      element.onerror = () => {
        reject(false)
      };
  
      document.head.appendChild(element);
    })
  };
  export const useSuspense = (remoteUrl, scope, module, React) => {
    const key = `${remoteUrl}-${scope}-${module}`;
    const [scriptModule, setScriptModule] = React.useState(null);
  
    const cachedModule = cache[key];
    // already loaded previously
    if (cachedModule) {
        console.log('Returning a cached module from useSuspend', cachedModule)
        return cachedModule;
    }
    if (errorsCache[key]) throw errorsCache[importPath];
  
    throw loadDynamicScript(remoteUrl, React).then(() => loadComponent(scope, module)())
      .then((scriptM) => {
        cache[key] = scriptM.default
        return cache[key]
      }).catch((err) => {
        errorsCache[key] = err;
      })
  };