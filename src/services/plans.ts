import { api } from "@/lib/api";
import type {
    CreateClientProgramPayload,
    ClientProgramDraft,
    ClientProgramTree,
} from "@/types/plans";

export async function createClientProgramDraft(
    payload: CreateClientProgramPayload,
): Promise<ClientProgramDraft> {
    const { data } = await api.post<ClientProgramDraft>("/plans/training/client-programs", payload);
    return data;
}

export async function getClientPrograms(): Promise<ClientProgramDraft[]> {
    const { data } = await api.get<ClientProgramDraft[]>("/plans/training/client-programs");
    return data;
}

export async function getClientProgram(programId: string): Promise<ClientProgramTree> {
    const { data } = await api.get<ClientProgramTree>(
        `/plans/training/client-programs/${programId}`,
    );
    return data;
}
