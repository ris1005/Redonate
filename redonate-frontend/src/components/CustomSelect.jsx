import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, options, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      {label && <span className="custom-select-label">{label}</span>}
      <button type="button" className={open ? "open" : ""} onClick={() => setOpen((current) => !current)}>
        <span>{selected.label}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="custom-select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={option.value === value ? "active" : ""}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
