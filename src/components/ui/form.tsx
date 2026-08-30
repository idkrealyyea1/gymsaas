'use client'

import * as React from 'react'
import * as Slot from '@radix-ui/react-slot'
import { Controller, ControllerProps, FieldPath, FieldValues, UseFormProps, UseFormReturn, useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = React.forwardRef<HTMLFormElement, UseFormProps<FieldValues> & React.RefAttributes<HTMLFormElement>>(
  ({ children, ...props }, ref) => (
    <form ref={ref} {...props}>{children}</form>
  )
)
Form.displayName = 'Form'

const FormProvider = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof Slot.Slot> & { children: React.ReactNode }) => (
  <Slot.Slot {...props}>{children}</Slot.Slot>
)

const useFormField = () => {
  const fieldContext = React.useContext(Controller.Context)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { name, ...rest } = fieldContext

  if (!formContext) {
    throw new Error('useFormField should be used within <FormProvider>')
  }

  const { getFieldState, formState } = formContext
  const fieldState = getFieldState(name, formState)

  return { id: name, name, form: formContext, fieldState, ...rest }
}

type FormFieldContextValue< TFieldValues extends FieldValues = FieldValues > = ControllerProps< TFieldValues >['rules'] & {
  name: FieldPath< TFieldValues >
}

const FormFieldContext = React.createContext<FormFieldContextValue<FieldValues> | null>(null)

const FormField = < TFieldValues extends FieldValues = FieldValues, TName extends FieldPath< TFieldValues > = FieldPath< TFieldValues >>(
  { ...props }: ControllerProps< TFieldValues > & { name: TName }
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name, rules: props.rules }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
FormField.displayName = 'FormField'

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <Label ref={ref} className={cn('', className)} {...props} />
  )
)
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { fieldState } = useFormField()
    const message = fieldState?.error?.message

    if (!message) return null

    return (
      <p ref={ref} className={cn('text-sm text-destructive', className)} {...props}>
        {children || message}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'

export {
  useFormField,
  Form,
  FormProvider,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}