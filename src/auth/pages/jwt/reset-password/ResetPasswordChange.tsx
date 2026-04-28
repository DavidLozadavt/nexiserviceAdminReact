import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  changepassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match")
});

const initialValues = {
  password: '',
  changepassword: ''
};

const ResetPasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentLayout } = useLayout();
  const token = searchParams.get('token') || '';

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!resetPassword) {
          throw new Error('JWTProvider is required for this form.');
        }

        await resetPassword(values.password, values.changepassword, token);

        navigate(currentLayout?.name === 'auth-branded' ? '/auth/reset-password/changed' : '/auth/classic/reset-password/changed');
      } catch (error) {
        console.error(error);
        setStatus('Hubo un error al restablecer la contraseña. El token podría haber expirado.');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Establecer nueva contraseña</h3>
          <span className="text-2sm text-gray-700">Ingrese su nueva contraseña a continuación</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Nueva Contraseña</label>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.password && formik.errors.password }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showPassword })} />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Confirmar Contraseña</label>
          <label className="input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              autoComplete="off"
              {...formik.getFieldProps('changepassword')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.changepassword && formik.errors.changepassword }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showConfirmPassword })} />
              <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showConfirmPassword })} />
            </button>
          </label>
          {formik.touched.changepassword && formik.errors.changepassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.changepassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Procesando...' : 'Restablecer contraseña'}
        </button>

        {formik.status && (
          <div className="text-danger text-xs mt-1" role="alert">
            {formik.status}
          </div>
        )}
      </form>
    </div>
  );
};

export { ResetPasswordChange };
