/** On/off switch. On is a selection, so it takes the yellow ink (see .switch in index.css). */
export function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="switch"
    >
      <span className="switch__thumb" />
    </button>
  );
}

/** Two or three mutually exclusive choices in one control. The chosen one is raised, not inked. */
export function Segmented({ value, options, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className="segmented__item"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
