/** Campo de formulario (label + input) con las clases de Stitch que pasa cada pantalla; el `id` enlaza etiqueta y control. */
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
  id: string;
  label: React.ReactNode;
  labelClassName: string;
  inputClassName: string;
  wrapperClassName?: string;
};

export function ProductField({ id, label, labelClassName, inputClassName, wrapperClassName, ...input }: Props) {
  return (
    <div className={wrapperClassName}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>{" "}
      <input className={inputClassName} id={id} {...input} />
    </div>
  );
}
