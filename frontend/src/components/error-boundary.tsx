'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getError } from '@/lib/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const errorInfo = getError('GENERAL_ERROR')
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {errorInfo.message}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {errorInfo.details}
            </p>
            {this.state.error && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mb-4">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              ページを再読み込み
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}