import { useState, useEffect } from "react";

// delays updating the value until user stops typing for `delay` ms
// prevents an API call on every single keystroke
const useDebounce = (value, delay = 400) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // cleanup — cancels the timer if value changes before delay expires
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;