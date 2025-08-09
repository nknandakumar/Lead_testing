import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

// Environment-based URL selection
const isDevelopment = import.meta.env.DEV;
const GOOGLE_SCRIPT_URL = isDevelopment
	? "/api/google-script" // Use Vite proxy in development
	: "https://script.google.com/macros/s/AKfycby8YgdngfyuTXX9Vo4PsR_1y-oTfbN0QlVwYndV_OUUlt5g5XgTwHWGmNg11erShbE/exec"; // Direct URL in production

export default function NewLead() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [toast, setToast] = useState(null);
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const showToast = (message, type = "success") => {
		setToast({ message, type });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Clear the form immediately for better UX
		const formData = { ...form };
		setForm({ name: "", email: "", phone: "", message: "" });

		try {
			const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 15000, // Increased timeout for Google Scripts
			});

			console.log("Success:", response.data);
			
			// Check if the response indicates success
			if (response.data && response.data.success === false) {
				throw new Error(response.data.error || "Server returned an error");
			}
			
			showToast("Lead submitted successfully!", "success");
			setTimeout(() => navigate("/leads"), 1500);
			
		} catch (error) {
			console.error("Submission error:", error);
			
			// Restore form data if submission failed
			setForm(formData);

			let errorMessage = "Failed to submit lead. ";
			
			if (error.code === "ECONNABORTED") {
				errorMessage += "Request timed out. Please try again.";
			} else if (error.code === "ERR_NETWORK") {
				errorMessage += "Network error. Please check your internet connection.";
			} else if (error.response) {
				errorMessage += `Server error: ${error.response.status}`;
			} else if (error.message.includes("Server returned an error")) {
				errorMessage += error.message;
			} else {
				errorMessage += "Please try again later.";
			}
			
			showToast(errorMessage, "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-4">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
			<div className="w-full max-w-md bg-gray-50 rounded-xl shadow-xl p-6">
				<div className="flex items-center justify-between mb-6">
					<button
						onClick={() => navigate("/leads")}
						className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
					>
						← Back to Leads
					</button>
					<h2 className="text-2xl font-semibold text-gray-800">New Lead</h2>
				</div>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="text"
							name="name"
							placeholder="Full Name"
							value={form.name}
							onChange={handleChange}
							required
							disabled={isSubmitting}
							className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					
					<div>
						<input
							type="email"
							name="email"
							placeholder="Email Address"
							value={form.email}
							onChange={handleChange}
							required
							disabled={isSubmitting}
							className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					
					<div>
						<input
							type="tel"
							name="phone"
							placeholder="Phone Number"
							value={form.phone}
							onChange={handleChange}
							required
							disabled={isSubmitting}
							className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					
					<div>
						<textarea
							name="message"
							placeholder="Message or Requirements"
							rows="4"
							value={form.message}
							onChange={handleChange}
							required
							disabled={isSubmitting}
							className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					
					<button
						type="submit"
						disabled={isSubmitting || !form.name || !form.email || !form.phone || !form.message}
						className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							<span className="flex items-center justify-center">
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Submitting...
							</span>
						) : (
							"Submit Lead"
						)}
					</button>
				</form>
				
				<div className="mt-4 text-center">
					<p className="text-sm text-gray-500">
						All fields are required
					</p>
				</div>
			</div>
		</div>
	);
}