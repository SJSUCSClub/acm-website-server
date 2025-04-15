import { AnyFieldApi } from '@tanstack/react-form'
import React from 'react'

function FieldErrorMessage({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className='text-red-500'>{field.state.meta.errors[0].message}</p>
      ) : null}
    </>
  )
}

export { FieldErrorMessage }
