const Toast = ({ message, type }: { message: string; type: "success" | "error" }) => {
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-md text-white shadow-lg transition-all ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;