import { useState, useEffect } from "react";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => onClose(), 300);
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
	const icon = type === "success" ? "✓" : "✕";

	return (
		<div
			className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
				isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
			}`}
		>
			<div
				className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[300px]`}
			>
				<span className="text-lg font-bold">{icon}</span>
				<span>{message}</span>
				<button
					onClick={() => {
						setIsVisible(false);
						setTimeout(() => onClose(), 300);
					}}
					className="ml-auto text-white hover:text-gray-200"
				>
					✕
				</button>
			</div>
		</div>
	);
};

export default Toast;
