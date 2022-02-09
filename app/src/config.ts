interface IConfig {
  isDev: boolean
  isProd: boolean
  version: string
  buildDate: string
  api: string
}

export const config: IConfig = {
  isDev: process.env.NODE_ENV === 'development' ? true : false,
  isProd: process.env.NODE_ENV === 'production' ? true : false,
  version: `${process.env.REACT_APP_GIT_SHA}`,
  buildDate: `${process.env.REACT_APP_BUILD_DATE}`,
  api: `${process.env.REACT_APP_API}`,
}
