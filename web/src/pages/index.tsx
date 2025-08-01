import { useState } from "react";
import { api } from "~/utils/api";

export default function HomePage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const submitCV = api.cv.submitCV.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessage("✅ Validation successful!");
      } else {
        setMessage(
          `❌ Validation failed. Mismatches: ${data.mismatches.join(", ")}`,
        );
      }
    },
    onError: (err) => {
      setMessage("Error submitting CV: " + err.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf) {
      setMessage("Please upload a PDF file.");
      return;
    }

    const base64 = await pdf
      .arrayBuffer()
      .then((buf) => Buffer.from(buf).toString("base64"));

    submitCV.mutate({ ...form, pdfBase64: base64 });
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Upload CV</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={value}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />
        ))}

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          className="w-full"
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {message && (
        <div className="mt-4 rounded border p-2 text-sm">{message}</div>
      )}
    </main>
  );
}
