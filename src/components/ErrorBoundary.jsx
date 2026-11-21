import { Component } from 'react'
import ErrorPage from '../pages/ErrorPage'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code={500}
          onRetry={() => {
            this.setState({ hasError: false })
            window.location.reload()
          }}
        />
      )
    }

    return this.props.children
  }
}
