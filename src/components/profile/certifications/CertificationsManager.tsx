import { useState } from "react";
import { Plus } from "lucide-react";
import type { Coach } from "@/types/auth";
import { AddCertCard } from "./AddCertCard";
import { ExistingCertCard } from "./ExistingCertCard";

interface CertificationsManagerProps {
    existingCertifications: Coach["certifications"];
    onRefreshProfile: () => Promise<void>;
    description?: string;
}

export function CertificationsManager({
    existingCertifications,
    onRefreshProfile,
    description,
}: CertificationsManagerProps) {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Credentials & pricing</h2>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                {!showAddForm && (
                    <button type="button" onClick={() => setShowAddForm(true)}
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition border rounded-xl border-border hover:bg-muted">
                        <Plus className="w-4 h-4" /> Add certification
                    </button>
                )}
            </div>

            {existingCertifications && existingCertifications.length > 0 && (
                <div className="mt-4 space-y-3">
                    {existingCertifications.map((cert) => (
                        <ExistingCertCard
                            key={cert.id ?? cert.name}
                            cert={cert}
                            onRemoved={onRefreshProfile}
                        />
                    ))}
                </div>
            )}

            {showAddForm && (
                <div className="mt-4">
                    <AddCertCard onAdded={async () => { setShowAddForm(false); await onRefreshProfile(); }} />
                    <button type="button" onClick={() => setShowAddForm(false)}
                        className="mt-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                        Cancel
                    </button>
                </div>
            )}

            {!existingCertifications?.length && !showAddForm && (
                <p className="mt-4 px-4 py-3 text-sm rounded-xl bg-muted text-muted-foreground">
                    No certifications added yet.
                </p>
            )}
        </div>
    );
}