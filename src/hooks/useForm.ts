import { useState, useCallback, useEffect } from 'react';



type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FieldRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: FieldRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(() => {
    const touchedFields = {} as Record<keyof T, boolean>;
    Object.keys(initialValues).forEach((key) => {
      touchedFields[key as keyof T] = false;
    });
    return touchedFields;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const fieldRules = validationRules[name];
      if (!fieldRules) return undefined;

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }

      return undefined;
    },
    [validationRules]
  );

  const validateForm = useCallback((): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};
    let hasErrors = false;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        hasErrors = true;
      }
    });

    return hasErrors ? newErrors : {};
  }, [values, validateField]);

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (validateOnChange) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validateOnBlur) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnBlur, validateField, values]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const formErrors = validateForm();
      setErrors(formErrors);

      if (Object.keys(formErrors).length === 0 && onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, onSubmit, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(
      Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as Record<keyof T, boolean>
      )
    );
  }, [initialValues]);

  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      handleChange(name, value);
    },
    [handleChange]
  );

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  useEffect(() => {
    return () => {
      setValues(initialValues);
      setErrors({});
      setTouched({} as Record<keyof T, boolean>);
    };
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm
  };
}; 