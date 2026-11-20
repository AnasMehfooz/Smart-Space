/** Keys of a shortcut, e.g. <Keys combo="Alt+Space" /> → [Alt] [Space]. */
export function Keys({ combo, className }) {
  return (
    <span className={className ? `inline-flex gap-1 ${className}` : "inline-flex gap-1"}>
      {combo.split("+").map((k) => (
        <kbd key={k} className="kbd">
          {k}
        </kbd>
      ))}
    </span>
  );
}
