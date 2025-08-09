import { useState } from "react";

const DebugData = ({ data, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-bold">Debug Data</h3>
				<button
					onClick={() => {
						setIsVisible(false);
						onClose();
					}}
					className="text-gray-300 hover:text-white"
				>
					✕
				</button>
			</div>
			<pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
};

export default DebugData;

