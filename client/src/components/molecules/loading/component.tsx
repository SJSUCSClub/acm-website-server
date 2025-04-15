import Spinner, { SpinnerProps } from '@/components/atoms/spinner'
import React from 'react'

export interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerProps?: SpinnerProps;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, children, spinnerProps }) => {
  return (
    <div>
      {isLoading ? <Spinner {...spinnerProps} /> : children}
    </div>
  )
}

export { Loading }
