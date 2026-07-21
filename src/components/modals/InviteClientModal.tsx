import React, { useState } from "react";
import { X, Plus, Mail, User } from "lucide-react";
import { createInvitation } from "@/services/clients";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function InviteClientModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createInvitation({
        name: name.trim(),
        email: email.trim(),
      });
      toast.success("Invitation sent successfully!");
      // Reset form states
      setName("");
      setEmail("");
      onSuccess();
      onClose();
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Failed to send invitation. Please try again.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 duration-200 shadow-2xl rounded-3xl bg-background border border-border animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Invite Client
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Send an invitation link to a client via email.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-muted border-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
            <div className="flex gap-3 items-center px-4 border bg-muted/40 border-border rounded-2xl focus-within:border-brand transition-colors h-14">
              <User className="text-muted-foreground w-5 h-5 shrink-0" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <div className="flex gap-3 items-center px-4 border bg-muted/40 border-border rounded-2xl focus-within:border-brand transition-colors h-14">
              <Mail className="text-muted-foreground w-5 h-5 shrink-0" />
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="p-3.5 text-xs font-medium rounded-xl bg-destructive/10 text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer flex items-center justify-center w-full gap-2 font-semibold bg-ink text-ink-foreground h-14 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md mt-2"
          >
            <Plus size={18} />
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}
