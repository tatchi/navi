import * as React from 'react'
import { Navigation, Route, Matcher, createBrowserNavigation } from 'navi'
import { NaviProvider } from './NaviProvider'
import { View } from './View'

export interface RouterProps<Context extends object> {
  basename?: string

  children?: React.ReactNode

  context?: Context

  /**
   * Navi will attempt to detect a non browser environment in order to
   * prevent rendering of <Suspense>, but if it fails, you can manually
   * set `fallback` to `undefined`.
   */
  fallback?: React.ReactNode | undefined

  history?: any

  navigation?: Navigation<Context, Route>

  routes?: Matcher<Context>
}

export class Router<Context extends object={}> extends React.Component<RouterProps<Context>> {
  static defaultProps = {
    fallback: undefined,
  }

  navigation: Navigation<Context, Route>

  constructor(props: RouterProps<Context>) {
    super(props)

    if (process.env.NODE_ENV !== 'production' && props.navigation) {
      if (props.basename) {
        console.warn(`Warning: <Router> can't receive both a "basename" and a "navigation" prop. Proceeding by ignoring "basename".`)
      }
      if (props.routes) {
        console.warn(`Warning: <Router> can't receive both a "routes" and a "navigation" prop. Proceeding by ignoring "routes".`)
      }
      if (props.history) {
        console.warn(`Warning: <Router> can't receive both a "history" and a "navigation" prop. Proceeding by ignoring "history".`)
      }
    }

    this.navigation = props.navigation || createBrowserNavigation({
      basename: props.basename,
      context: props.context,
      history: props.history,
      routes: props.routes,
    })
  }

  render() {
    let { children, fallback } = this.props
    return (
      <NaviProvider fallback={fallback} navigation={this.navigation}>
        {children || <View />}
      </NaviProvider>
    )
  }

  componentDidMount() {
    if (this.props.navigation && this.props.context) {
      this.props.navigation.setContext(this.props.context!)
    }
  }

  componentDidUpdate(prevProps: RouterProps<Context>) {
    if (shallowDiffers(prevProps.context || {}, this.props.context || {})) {
      this.navigation.setContext(this.props.context! || {})
    }
  }

  componentWillUnmount() {
    // Clean up any navigation object that we've created.
    if (!this.props.navigation) {
      this.navigation.dispose()
    }
    delete this.navigation
  }
}

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
function shallowDiffers (a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}
