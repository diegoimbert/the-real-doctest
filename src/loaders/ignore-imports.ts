import { URL, pathToFileURL } from 'node:url';

const baseURL = pathToFileURL(`${process.cwd()}/`).href;

const extensionsRegex = /\.(html|css|scss|sass|png|webp|jpg|svg)$/;

export function resolve(specifier: string, context: any, next: any) {
  const { parentURL = baseURL } = context;
  if (extensionsRegex.test(specifier)) {
    return {
      url: new URL(specifier, parentURL).href,
      format: "module",
      shortCircuit: true
    };
  }
  return next(specifier, context);
}

export function load(url: string, context: any, next: any) {
  if (extensionsRegex.test(url)) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default 'Ignored file type'"
    }
  }
  return next(url, context)
}