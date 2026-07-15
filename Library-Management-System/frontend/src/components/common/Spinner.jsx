const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
};

const Spinner = ({ size = "md", fullScreen = false }) => {
    const spinner = (
        <div
            className={`
                ${sizeMap[size]}
                rounded-full
                border-gray-200
                border-t-blue-600
                animate-spin
            `}
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            {spinner}
        </div>
    );
};

export default Spinner;